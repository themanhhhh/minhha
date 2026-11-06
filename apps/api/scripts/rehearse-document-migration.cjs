const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { PGlite } = require('@electric-sql/pglite');
const root = path.resolve(__dirname, '../../..');
const quote = value => `"${value.replaceAll('"', '""')}"`;
async function restore(db, backup) {
  await db.exec(fs.readFileSync(path.join(root, 'apps/api/prisma/migrations/0_baseline/migration.sql'), 'utf8'));
  await db.exec("SET TIME ZONE 'UTC'; SET session_replication_role=replica;");
  for (const [name, table] of Object.entries(backup.tables)) {
    if (table.count) await db.query(`INSERT INTO ${quote(name)} SELECT * FROM json_populate_recordset(NULL::${quote(name)},$1::json)`, [table.data]);
  }
  for (const sequence of backup.sequences) await db.query('SELECT setval($1::regclass,$2::bigint,$3)', [quote(sequence.name), sequence.last_value, sequence.is_called]);
  await db.exec('SET session_replication_role=origin;');
}
async function verifyPreservation(db, backup) {
  const mapping = JSON.parse(fs.readFileSync(path.join(root, '.migration-work/column-mapping.json'), 'utf8'));
  const checked = {};
  for (const [model, source] of Object.entries(mapping.originals)) {
    const tableName = mapping.tables[model]?.[1] ?? source.table;
    const columns = backup.catalog.columns.filter(c => c.table_name === source.table);
    const selection = columns.map(column => {
      const field = Object.keys(source.fields).find(key => source.fields[key] === column.column_name);
      const newName = mapping.maps[model]?.[field] ?? column.column_name;
      const cast = model === 'Score' && field === 'value' ? '::numeric(5,2)' : '';
      return `${quote(newName)}${cast} AS ${quote(column.column_name)}`;
    }).join(',');
    const rows = (await db.query(`SELECT row_to_json(t)::text AS json FROM (SELECT ${selection} FROM ${quote(tableName)}) t ORDER BY 1`)).rows;
    const data = `[${rows.map(r => r.json).join(',')}]`;
    assert.equal(rows.length, backup.tables[source.table].count, `Count ${source.table}`);
    assert.equal(crypto.createHash('sha256').update(data).digest('hex'), backup.tables[source.table].sha256, `Contents ${source.table}`);
    checked[tableName] = rows.length;
  }
  return checked;
}
async function run() {
  const backupPath = fs.readFileSync(path.join(root, '.migration-work/snapshot-path.txt'), 'utf8').trim();
  const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
  const db = new PGlite();
  const tests = [];
  try {
    await restore(db, backup);
    // Prove restoration before testing any migration, not just after.
    for (const [name, table] of Object.entries(backup.tables)) {
      const projection = backup.catalog.columns.filter(c => c.table_name===name).map(c=>quote(c.column_name)).join(',');
      const result = await db.query(`SELECT row_to_json(t)::text AS json FROM (SELECT ${projection} FROM ${quote(name)}) t ORDER BY 1`);
      assert.equal(crypto.createHash('sha256').update(`[${result.rows.map(r => r.json).join(',')}]`).digest('hex'), table.sha256, `Restore ${name}`);
    }
    tests.push('21-table backup restored with exact row checksums');
    await db.exec('BEGIN;');
    await db.exec(fs.readFileSync(path.join(root, 'apps/api/prisma/migrations/202611060001_document_schema/migration.sql'), 'utf8'));
    await db.exec('COMMIT;');
    const preserved = await verifyPreservation(db, backup);
    tests.push('All original rows, hashes, files, tokens and IDs preserved');
    const tableCount = (await db.query("SELECT count(*)::int AS count FROM pg_tables WHERE schemaname='public'")).rows[0].count;
    assert.equal(tableCount, 26);
    assert.equal((await db.query('SELECT count(*)::int AS count FROM "BuoiHoc" WHERE thoi_gian_bat_dau<>(lesson_date+start_time) AT TIME ZONE \'Asia/Ho_Chi_Minh\' OR thoi_gian_ket_thuc<>(lesson_date+end_time) AT TIME ZONE \'Asia/Ho_Chi_Minh\'')).rows[0].count, 0);
    tests.push('26 tables and UTC+7 wall-clock preservation');
    assert.equal((await db.query('SELECT count(*)::int AS count FROM "LopHoc" l WHERE si_so_hien_tai<>(SELECT count(*) FROM "DangKyHoc" e WHERE e.ma_lop_hoc=l.ma_lop_hoc AND e.status=\'ACTIVE\')')).rows[0].count, 0);
    tests.push('Stored occupancy equals ACTIVE enrollments');
    async function rejects(sql, description) {
      await db.exec('BEGIN;');
      try { await assert.rejects(() => db.exec(sql), description); } finally { await db.exec('ROLLBACK;'); }
      tests.push(description);
    }
    await rejects('UPDATE "NguoiDung" SET ma_vai_tro_nguoi_dung=999 WHERE ma_nguoi_dung=(SELECT min(ma_nguoi_dung) FROM "NguoiDung")', 'Invalid lookup FK rejected');
    await rejects('UPDATE "NguoiDung" SET role=\'STUDENT\',ma_vai_tro_nguoi_dung=2 WHERE role=\'DIRECTOR\'', 'Contradictory code and numeric FK rejected');
    await rejects('UPDATE "LopHoc" SET si_so_hien_tai=0', 'Manual occupancy corruption rejected');
    await rejects('UPDATE "LopHoc" SET si_so_toi_da=0 WHERE si_so_hien_tai>0', 'Capacity below current enrollment rejected');
    await rejects('UPDATE "LoaiBaiKiemTra" SET trong_so=-1', 'Invalid weight rejected');
    await rejects('UPDATE "VaiTroNguoiDung" SET code=\'STUDENT\' WHERE code=\'DIRECTOR\'', 'System role identity mutation rejected');
    await db.exec('BEGIN;');
    const before = (await db.query('SELECT ma_nguoi_dung AS id FROM "NguoiDung" WHERE role=\'DIRECTOR\'')).rows[0];
    await db.query('UPDATE "NguoiDung" SET ma_vai_tro_nguoi_dung=3 WHERE ma_nguoi_dung=$1', [before.id]);
    assert.equal((await db.query('SELECT role FROM "NguoiDung" WHERE ma_nguoi_dung=$1',[before.id])).rows[0].role,'ACADEMIC_STAFF');
    await db.exec('ROLLBACK;');
    tests.push('Numeric-FK updates preserve API role-code compatibility');
    await db.exec('BEGIN;');
    await db.exec('UPDATE "BuoiHoc" SET thoi_gian_bat_dau=thoi_gian_bat_dau+interval \'1 hour\',thoi_gian_ket_thuc=thoi_gian_ket_thuc+interval \'1 hour\' WHERE ma_buoi_hoc=(SELECT min(ma_buoi_hoc) FROM "BuoiHoc")');
    assert.equal((await db.query('SELECT count(*)::int AS count FROM "BuoiHoc" WHERE start_time<>(thoi_gian_bat_dau AT TIME ZONE \'Asia/Ho_Chi_Minh\')::time')).rows[0].count,0);
    await db.exec('ROLLBACK;');
    tests.push('Full timestamp writes update legacy wall-clock representation');
    const manifest = { rehearsedAt: new Date().toISOString(), sourceSnapshot: path.basename(backupPath), migrationSha256: crypto.createHash('sha256').update(fs.readFileSync(path.join(root, 'apps/api/prisma/migrations/202611060001_document_schema/migration.sql'))).digest('hex'), tableCount, preserved, tests };
    fs.writeFileSync(path.join(root, 'database-migration-rehearsal.json'), JSON.stringify(manifest,null,2));
    console.log(JSON.stringify(manifest,null,2));
  } finally { await db.close(); }
}
module.exports = { restore, verifyPreservation };
if (require.main === module) run().catch(error => { console.error(error.message); process.exitCode=1; });
