const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../../..');
const dir = path.join(root, 'apps/api/prisma');
let additions = fs.readFileSync(path.join(root, '.migration-work/additions.sql'), 'utf8');
const required = [];
additions = additions.replace(/ALTER TABLE "([^"]+)" ([\s\S]*?);/g, (statement, table, body) => {
  const altered = body.replace(/ADD COLUMN\s+"([^"]+)" ([A-Z]+(?:\(\d+\))?) NOT NULL(?! DEFAULT)/g, (_, column, type) => {
    required.push(`ALTER TABLE "${table}" ALTER COLUMN "${column}" SET NOT NULL;`);
    return `ADD COLUMN "${column}" ${type}`;
  });
  return `ALTER TABLE "${table}" ${altered};`;
});
const foreignKeys = [];
additions = additions.replace(/ALTER TABLE "[^"]+" ADD CONSTRAINT [^;]+;/g, statement => { foreignKeys.push(statement); return ''; });
const sql = [
  '-- Preserve numeric IDs, password hashes, all historical records, and file paths.',
  '-- Code columns and local date/time mirrors are retained deliberately for API compatibility.',
  '-- Their agreement with the documented numeric FK/full timestamp fields is enforced by triggers.',
  fs.readFileSync(path.join(dir, 'migrations/202611060001_document_schema/renames.sql'), 'utf8'),
  additions,
  fs.readFileSync(path.join(dir, 'document-seed.sql'), 'utf8'),
  required.join('\n'),
  foreignKeys.join('\n'),
  fs.readFileSync(path.join(dir, 'document-integrity.sql'), 'utf8'),
].join('\n\n');
fs.writeFileSync(path.join(dir, 'migrations/202611060001_document_schema/migration.sql'), sql);
fs.writeFileSync(path.join(dir, 'migrations/migration_lock.toml'), 'provider = "postgresql"\n');
console.log('Assembled data-preserving SQL migration.');
