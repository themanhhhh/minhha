const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { Client } = require('pg');
const root = path.resolve(__dirname, '../../..');
for (const file of [path.join(root, 'apps/api/.env'), path.join(root, '.env')]) if (fs.existsSync(file)) process.loadEnvFile(file);
const quote = name => `"${name.replaceAll('"', '""')}"`;
async function snapshot(client) {
  const tables = (await client.query("SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename <> '_prisma_migrations' ORDER BY tablename")).rows;
  const result = { createdAt: new Date().toISOString(), tables: {}, sequences: [], catalog: {} };
  for (const { tablename } of tables) {
    const rows = await client.query(`SELECT row_to_json(t)::text AS json FROM public.${quote(tablename)} t ORDER BY 1`);
    const data = `[${rows.rows.map(r => r.json).join(',')}]`;
    result.tables[tablename] = { count: rows.rowCount, sha256: crypto.createHash('sha256').update(data).digest('hex'), data };
  }
  result.catalog.columns = (await client.query("SELECT * FROM information_schema.columns WHERE table_schema='public' ORDER BY table_name,ordinal_position")).rows;
  result.catalog.constraints = (await client.query("SELECT t.relname, c.conname, pg_get_constraintdef(c.oid) definition FROM pg_constraint c JOIN pg_class t ON t.oid=c.conrelid JOIN pg_namespace n ON n.oid=t.relnamespace WHERE n.nspname='public'")).rows;
  result.catalog.triggers = (await client.query("SELECT pg_get_triggerdef(t.oid) definition FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND NOT t.tgisinternal")).rows;
  result.catalog.policies = (await client.query("SELECT * FROM pg_policies WHERE schemaname='public'")).rows;
  result.catalog.functions = (await client.query("SELECT pg_get_functiondef(p.oid) definition FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.prokind IN ('f','p')")).rows;
  const sequences = (await client.query("SELECT sequencename FROM pg_sequences WHERE schemaname='public'")).rows;
  for (const { sequencename } of sequences) result.sequences.push({ name: sequencename, ...(await client.query(`SELECT last_value::text, is_called FROM public.${quote(sequencename)}`)).rows[0] });
  return result;
}
async function saveSnapshot() {
  const client = new Client({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const result = await snapshot(client);
    await client.query('COMMIT');
    const directory = path.join(root, '.backups');
    fs.mkdirSync(directory, { recursive: true });
    const file = path.join(directory, `before-document-migration-${Date.now()}.json`);
    fs.writeFileSync(file, JSON.stringify(result), { mode: 0o600 });
    fs.writeFileSync(path.join(root, '.migration-work/snapshot-path.txt'), file);
    console.log(JSON.stringify({ backupFile: file, tables: Object.fromEntries(Object.entries(result.tables).map(([name, table]) => [name, table.count])), triggers: result.catalog.triggers.length, policies: result.catalog.policies.length, functions: result.catalog.functions.length }));
  } finally { await client.end(); }
}
module.exports = { snapshot, quote, root };
if (require.main === module) saveSnapshot().catch(e => { console.error(e.code ?? e.name); process.exitCode = 1; });
