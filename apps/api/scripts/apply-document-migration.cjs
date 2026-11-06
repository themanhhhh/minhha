// Transactional, data-preserving cutover. Requires successful restore and API rehearsals.
const fs=require('node:fs');const path=require('node:path');const crypto=require('node:crypto');
const { Client }=require('pg');
const { snapshot,quote,root }=require('./database-snapshot.cjs');
const { verifyPreservation }=require('./rehearse-document-migration.cjs');
const migrationName='202611060001_document_schema';
const sql=fs.readFileSync(path.join(root,`apps/api/prisma/migrations/${migrationName}/migration.sql`),'utf8');
const checksum=crypto.createHash('sha256').update(sql).digest('hex');
for(const file of ['database-migration-rehearsal.json','database-api-smoke.json']){
 const result=JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
 if(result.migrationSha256!==checksum)throw new Error(`Rehearsal is missing or out of date: ${file}`);
}
(async()=>{
 const client=new Client({connectionString:process.env.DIRECT_URL??process.env.DATABASE_URL});await client.connect();
 let backupFile;
 try{
  await client.query('BEGIN');
  await client.query("SET LOCAL lock_timeout='10s'; SET LOCAL statement_timeout='120s';");
  const tables=(await client.query("SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename<>'_prisma_migrations' ORDER BY tablename")).rows;
  if(tables.length!==21)throw new Error('Expected the audited 21-table baseline. Re-audit before applying.');
  await client.query(`LOCK TABLE ${tables.map(t=>`public.${quote(t.tablename)}`).join(',')} IN ACCESS EXCLUSIVE MODE`);
  const backup=await snapshot(client);
  if(backup.catalog.triggers.length||backup.catalog.policies.length||backup.catalog.functions.length)throw new Error('Unreviewed functions/triggers/policies found; cutover stopped.');
  backupFile=path.join(root,'.backups',`cutover-${Date.now()}.json`);fs.mkdirSync(path.dirname(backupFile),{recursive:true});fs.writeFileSync(backupFile,JSON.stringify(backup),{mode:0o600});
  const expected=JSON.parse(fs.readFileSync(fs.readFileSync(path.join(root,'.migration-work/snapshot-path.txt'),'utf8').trim(),'utf8'));
  for(const [name,table]of Object.entries(backup.tables))if(expected.tables[name]?.sha256!==table.sha256)throw new Error(`Live data changed since rehearsal: ${name}. Rehearse a fresh snapshot first.`);
  const before=Date.now();
  await client.query(sql);
  // Adapt node-postgres to the read-only verifier. This happens BEFORE COMMIT.
  const preserved=await verifyPreservation({query:(query,params)=>client.query(query,params)},backup);
  const mismatch=(await client.query('SELECT count(*)::int AS count FROM "LopHoc" l WHERE si_so_hien_tai<>(SELECT count(*) FROM "DangKyHoc" e WHERE e.ma_lop_hoc=l.ma_lop_hoc AND e.status=\'ACTIVE\')')).rows[0].count;
  if(mismatch)throw new Error('Occupancy verification failed');
  await client.query(`CREATE TABLE IF NOT EXISTS "_prisma_migrations" (id VARCHAR(36) PRIMARY KEY, checksum VARCHAR(64) NOT NULL, finished_at TIMESTAMPTZ, migration_name VARCHAR(255) NOT NULL, logs TEXT, rolled_back_at TIMESTAMPTZ, started_at TIMESTAMPTZ NOT NULL DEFAULT now(), applied_steps_count INTEGER NOT NULL DEFAULT 0)`);
  for(const name of ['0_baseline',migrationName]){
   const file=fs.readFileSync(path.join(root,`apps/api/prisma/migrations/${name}/migration.sql`));
   await client.query('INSERT INTO "_prisma_migrations" (id,checksum,finished_at,migration_name,applied_steps_count) VALUES ($1,$2,now(),$3,1)',[crypto.randomUUID(),crypto.createHash('sha256').update(file).digest('hex'),name]);
  }
  await client.query('COMMIT');
  const manifest={appliedAt:new Date().toISOString(),migration:migrationName,migrationSha256:checksum,backupFile,tableCount:26,transactionMs:Date.now()-before,preserved,occupancyMismatches:0};
  fs.writeFileSync(path.join(root,'database-migration-applied.json'),JSON.stringify(manifest,null,2));
  console.log(JSON.stringify(manifest,null,2));
 }catch(error){await client.query('ROLLBACK');console.error(JSON.stringify({rolledBack:true,message:error.message,backupFile}));process.exitCode=1;}finally{await client.end();}
})().catch(error=>{console.error(error.code??error.name);process.exitCode=1;});
