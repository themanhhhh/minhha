const fs=require('node:fs');const path=require('node:path');const assert=require('node:assert/strict');
const {Client}=require('pg');const {JwtService}=require('@nestjs/jwt');
const {root}=require('./database-snapshot.cjs');const {verifyPreservation}=require('./rehearse-document-migration.cjs');
(async()=>{
 const applied=JSON.parse(fs.readFileSync(path.join(root,'database-migration-applied.json'),'utf8'));
 const backup=JSON.parse(fs.readFileSync(applied.backupFile,'utf8'));const users=JSON.parse(backup.tables.NguoiDung.data);
 const client=new Client({connectionString:process.env.DIRECT_URL??process.env.DATABASE_URL,connectionTimeoutMillis:15000,query_timeout:30000,application_name:'riki-migration-verification'});await client.connect();
 try{
  await client.query("BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY; SET LOCAL TIME ZONE 'UTC';");
  const preserved=await verifyPreservation({query:(query,params)=>client.query(query,params)},backup);
  console.log('Verified all 21 original table checksums on the live database.');
  const columns=(await client.query("SELECT table_name,column_name,data_type,udt_name,is_nullable,column_default,character_maximum_length,numeric_precision,numeric_scale FROM information_schema.columns WHERE table_schema='public' AND table_name<>'_prisma_migrations' ORDER BY table_name,ordinal_position")).rows;
  const constraints=(await client.query("SELECT t.relname AS table_name,c.conname AS constraint_name,c.contype AS type,pg_get_constraintdef(c.oid) AS definition FROM pg_constraint c JOIN pg_class t ON t.oid=c.conrelid JOIN pg_namespace n ON n.oid=t.relnamespace WHERE n.nspname='public' AND t.relname<>'_prisma_migrations' ORDER BY t.relname,c.conname")).rows;
  const weights=(await client.query('SELECT code::text,trong_so AS weight FROM "LoaiBaiKiemTra" ORDER BY ma_loai_bai_kiem_tra')).rows;
  const tables=[...new Set(columns.map(c=>c.table_name))];assert.equal(tables.length,26);assert.deepEqual(weights.map(w=>w.weight),[10,40,50,0]);
  await client.query('COMMIT');
  fs.writeFileSync(path.join(root,'database-after-metadata.json'),JSON.stringify({capturedAt:new Date().toISOString(),columns,constraints,weights},null,2));
  const checks=[];
  for(const role of ['ACADEMIC_STAFF','DIRECTOR','TEACHER','STUDENT']){
   const account=users.find(u=>u.role===role);
   const token=new JwtService().sign({sub:String(account.id),email:account.email,role,type:'access'},{secret:process.env.JWT_ACCESS_SECRET,expiresIn:'10m'});
   const routes=role==='STUDENT'?['/auth/me','/dashboard/me','/me/profile','/me/classes','/me/scores','/me/progress']:role==='TEACHER'?['/auth/me','/dashboard/me','/teacher/classes']:role==='DIRECTOR'?['/auth/me','/dashboard/me','/reports/classes?period=year']:['/auth/me','/dashboard/me','/lookups','/students?pageSize=100','/academic/operations'];
   for(const route of routes){const start=Date.now();const response=await fetch(`http://127.0.0.1:4000/api/v1${route}`,{headers:{authorization:`Bearer ${token}`},signal:AbortSignal.timeout(60000)});await response.arrayBuffer();assert.equal(response.status,200,`${role} GET ${route}`);checks.push({role,route,status:response.status,ms:Date.now()-start});}
   console.log(`Live read-only API checks passed for ${role}.`);
  }
  const result={checkedAt:new Date().toISOString(),readOnly:true,tableCount:tables.length,columnCount:columns.length,foreignKeys:constraints.filter(c=>c.type==='f').length,weights,preserved,checks};
  fs.writeFileSync(path.join(root,'database-live-verification.json'),JSON.stringify(result,null,2));console.log(JSON.stringify({tableCount:result.tableCount,columnCount:result.columnCount,foreignKeys:result.foreignKeys,weights,originalTablesPreserved:Object.keys(preserved).length,apiChecks:checks.length,slowestMs:Math.max(...checks.map(c=>c.ms))},null,2));
 }finally{await client.end();}
})().catch(error=>{console.error(error.message);process.exitCode=1;});
