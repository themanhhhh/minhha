// Local-only migrated copy used by Prisma/Nest integration tests. Never touches live data.
const fs = require('node:fs');
const path = require('node:path');
const { PGlite } = require('@electric-sql/pglite');
const { PGLiteSocketServer } = require('@electric-sql/pglite-socket');
const { restore, verifyPreservation } = require('./rehearse-document-migration.cjs');
const root = path.resolve(__dirname, '../../..');
(async () => {
  const backup = JSON.parse(fs.readFileSync(fs.readFileSync(path.join(root, '.migration-work/snapshot-path.txt'), 'utf8').trim(), 'utf8'));
  const db = new PGlite();
  await restore(db, backup);
  await db.exec('BEGIN;');
  await db.exec(fs.readFileSync(path.join(root, 'apps/api/prisma/migrations/202611060001_document_schema/migration.sql'), 'utf8'));
  await db.exec('COMMIT;');
  await verifyPreservation(db, backup);
  const server = new PGLiteSocketServer({ db, host: '127.0.0.1', port: 55432, maxConnections: 1 });
  await server.start();
  console.log('Migrated staging PostgreSQL ready on 127.0.0.1:55432.');
  const close = async () => { await server.stop(); await db.close(); process.exit(0); };
  process.on('SIGINT', close); process.on('SIGTERM', close);
})().catch(e => { console.error(e.message); process.exitCode=1; });
