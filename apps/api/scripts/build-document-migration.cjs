// Rebuild the reviewed migration from the immutable pre-change Prisma schema.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../../..');
const prismaDir = path.join(root, 'apps/api/prisma');
let schema = fs.readFileSync(path.join(prismaDir, 'baseline.prisma'), 'utf8');
const tables = { Enrollment: ['DangKyLop', 'DangKyHoc'], ClassTransfer: ['LichSuChuyenLop', 'ChuyenLop'] };
const maps = {
  User: { id:'ma_nguoi_dung', fullName:'ho_ten', passwordHash:'mat_khau' },
  Student: { id:'ma_hoc_vien', userId:'ma_nguoi_dung', dateOfBirth:'ngay_sinh' },
  Teacher: { id:'ma_giao_vien', userId:'ma_nguoi_dung' },
  Course: { id:'ma_khoa_hoc', name:'ten_khoa_hoc', totalLessons:'so_buoi_hoc', tuition:'hoc_phi' },
  Class: { id:'ma_lop_hoc', teacherId:'ma_giao_vien', name:'ten_lop_hoc', startDate:'ngay_khai_giang', endDate:'ngay_ket_thuc', schedule:'lich_hoc', capacity:'si_so_toi_da' },
  Enrollment: { id:'ma_dang_ky', studentId:'ma_hoc_vien', classId:'ma_lop_hoc' },
  ClassTransfer: { id:'ma_chuyen_lop', studentId:'ma_hoc_vien', fromClassId:'ma_lop_hoc_cu', toClassId:'ma_lop_hoc_moi', reason:'ly_do_chuyen_lop' },
  StudyReservation: { id:'ma_bao_luu', studentId:'ma_hoc_vien', classId:'ma_lop_hoc', reason:'ly_do_bao_luu', startDate:'ngay_bao_luu' },
  Lesson: { id:'ma_buoi_hoc', classId:'ma_lop_hoc', title:'ten_buoi_hoc', content:'noi_dung_buoi_hoc', recordUrl:'link_record' },
  Attendance: { id:'ma_diem_danh', lessonId:'ma_buoi_hoc', studentId:'ma_hoc_vien', note:'ghi_chu' },
  Test: { id:'ma_bai_kiem_tra', classId:'ma_lop_hoc', name:'ten_bai_kiem_tra', testDate:'ngay_kiem_tra' },
  Score: { id:'ma_diem_so', testId:'ma_bai_kiem_tra', studentId:'ma_hoc_vien', value:'so_diem' },
};
const originals = {};
for (const match of schema.matchAll(/model (\w+) \{([\s\S]*?)\n\}/g)) {
  const [, model, body] = match;
  originals[model] = { table: body.match(/@@map\("([^"]+)"\)/)?.[1] ?? model, fields: {} };
  for (const line of body.split('\n')) {
    const m = line.trim().match(/^(\w+)\s+\w+[?\[\]]*\s*(.*)$/);
    if (m) originals[model].fields[m[1]] = m[2].match(/@map\("([^"]+)"\)/)?.[1] ?? m[1];
  }
}
const renameStatements = [];
schema = schema.replace(/model (\w+) \{([\s\S]*?)\n\}/g, (block, model, body) => {
  let updated = body;
  const old = originals[model];
  const table = tables[model]?.[1] ?? old.table;
  if (table !== old.table) {
    renameStatements.push(`ALTER TABLE "${old.table}" RENAME TO "${table}";`);
    updated = updated.replace(`@@map("${old.table}")`, `@@map("${table}")`);
  }
  for (const [field, column] of Object.entries(maps[model] ?? {})) {
    const oldColumn = old.fields[field];
    if (column !== oldColumn) renameStatements.push(`ALTER TABLE "${table}" RENAME COLUMN "${oldColumn}" TO "${column}";`);
    updated = updated.replace(new RegExp(`^(\\s*${field}\\s+[^\\n]+)$`, 'm'), line =>
      /@map\("/.test(line) ? line.replace(/@map\("[^"]+"\)/, `@map("${column}")`) : line + ` @map("${column}")`);
  }
  // Preserve existing constraint/index names after physical column/table renames.
  updated = updated.replace(/@id(?!\()/g, `@id(map: "${old.table}_pkey")`);
  updated = updated.replace(/^(\s*)(\w+)(\s+[^\n]*?)@unique(?!\()/gm, (_, space, field, rest) => `${space}${field}${rest}@unique(map: "${old.table}_${old.fields[field]}_key")`);
  updated = updated.replace(/@@(unique|index)\(\[([^\]]+)\]\)/g, (_, type, fields) => `@@${type}([${fields}], map: "${old.table}_${fields.split(',').map(f => old.fields[f.trim()]).join('_')}_${type === 'unique' ? 'key' : 'idx'}")`);
  updated = updated.replace(/@relation\(([^\n]+)\)/g, (relation, attrs) => {
    const fields = attrs.match(/fields: \[([^\]]+)\]/);
    if (!fields) return relation;
    const name = `${old.table}_${fields[1].split(',').map(f => old.fields[f.trim()]).join('_')}_fkey`;
    return `@relation(${attrs}, map: "${name}")`;
  });
  return `model ${model} {${updated}\n}`;
});
function edit(model, fn) { schema = schema.replace(new RegExp(`model ${model} \\{([\\s\\S]*?)\\n\\}`), (_, body) => `model ${model} {${fn(body)}\n}`); }
fs.mkdirSync(path.join(root, '.migration-work'), { recursive: true });
fs.writeFileSync(path.join(root, '.migration-work/renamed.prisma'), schema);
fs.writeFileSync(path.join(root, '.migration-work/column-mapping.json'), JSON.stringify({ originals, maps, tables }, null, 2));
function add(model, fields) { edit(model, body => `${body}\n${fields}`); }
edit('User', b => b.replace('@db.VarChar(320)', '@db.VarChar(255)').replace('@db.VarChar(200)', '@db.VarChar(100)'));
edit('Student', b => b.replace('dateOfBirth    DateTime?', 'dateOfBirth    DateTime '));
edit('Course', b => b.replace('@db.VarChar(200)', '@db.VarChar(100)').replace('@db.Decimal(12, 2)', '@db.Decimal(15, 2)'));
edit('Class', b => b.replaceAll('@db.VarChar(200)', '@db.VarChar(100)'));
edit('Lesson', b => b.replace('@db.VarChar(200)', '@db.VarChar(100)').replace('@db.Text', '@db.VarChar(255)').replace('@db.VarChar(500)', '@db.VarChar(255)'));
edit('Test', b => b.replace('@db.VarChar(200)', '@db.VarChar(100)'));
edit('Score', b => b.replace(/value\s+Decimal @db.Decimal\(5, 2\)/, 'value     Float'));
edit('Attendance', b => b.replace('@db.VarChar(500)', '@db.VarChar(255)'));
for (const m of ['ClassTransfer','StudyReservation']) edit(m, b => b.replace('@db.VarChar(500)', '@db.VarChar(255)'));
schema = schema.replace('enum LessonStatus {\n', 'enum LessonStatus {\n  IN_PROGRESS\n  POSTPONED\n');
add('User', `  phone String? @unique @map("sdt") @db.VarChar(12)
  roleId Int @default(dbgenerated()) @map("ma_vai_tro_nguoi_dung")
  statusId Int @default(dbgenerated()) @map("ma_trang_thai")
  roleDefinition RoleDefinition @relation(fields: [roleId], references: [id])
  statusDefinition UserStatusDefinition @relation(fields: [statusId], references: [id])`);
add('Student', `  goal String? @map("muc_tieu") @db.VarChar(255)
  emergencyContact String? @map("lien_he_khan_cap") @db.VarChar(255)
  currentLevelId Int? @map("ma_trinh_do_hien_tai")
  targetLevelId Int? @map("ma_trinh_do_muc_tieu")
  currentLevelDefinition JlptDefinition? @relation("StudentCurrentLevel", fields: [currentLevelId], references: [id])
  targetLevelDefinition JlptDefinition? @relation("StudentTargetLevel", fields: [targetLevelId], references: [id])`);
add('Teacher', `  jlptLevelId Int? @map("ma_trinh_do_jlpt")
  levelDefinition JlptDefinition? @relation(fields: [jlptLevelId], references: [id])
  substituteLessons Lesson[]`);
add('Course', `  description String? @map("mo_ta") @db.VarChar(255)
  levelId Int @default(dbgenerated()) @map("ma_trinh_do_jlpt")
  levelDefinition JlptDefinition @relation(fields: [levelId], references: [id])`);
add('Class', `  session String? @map("ca_hoc") @db.VarChar(50)
  studentCount Int @default(0) @map("si_so_hien_tai")
  meetingUrl String? @map("link_vao_hoc") @db.VarChar(255)`);
add('Enrollment', '  joinedOn DateTime @default(dbgenerated()) @map("ngay_tham_gia") @db.Date');
add('ClassTransfer', '  transferredOn DateTime? @map("ngay_chuyen_lop") @db.Date');
add('StudyReservation', `  durationMonths Int? @map("thoi_han_bao_luu")
  isActive Boolean @default(false) @map("trang_thai_bao_luu")`);
add('Lesson', `  startsAt DateTime @default(dbgenerated()) @map("thoi_gian_bat_dau") @db.Timestamptz(0)
  endsAt DateTime @default(dbgenerated()) @map("thoi_gian_ket_thuc") @db.Timestamptz(0)
  substituteTeacherId BigInt? @map("ma_giao_vien_day_thay")
  substituteTeacher Teacher? @relation(fields: [substituteTeacherId], references: [id])`);
add('Attendance', `  statusId Int @default(dbgenerated()) @map("ma_trang_thai_diem_danh")
  statusDefinition AttendanceDefinition @relation(fields: [statusId], references: [id])`);
add('Test', `  typeId Int @default(dbgenerated()) @map("ma_loai_bai_kiem_tra")
  typeDefinition TestTypeDefinition @relation(fields: [typeId], references: [id])`);
schema += `
// Stable codes are retained for API compatibility. Database triggers enforce
// bidirectional agreement with numeric foreign keys, including direct SQL writes.
model RoleDefinition {
  id Int @id @map("ma_vai_tro")
  code UserRole @unique
  name String @map("ten_vai_tro") @db.VarChar(50)
  users User[]
  @@map("VaiTroNguoiDung")
}
model UserStatusDefinition {
  id Int @id @map("ma_trang_thai")
  code UserStatus @unique
  name String @map("ten_trang_thai") @db.VarChar(50)
  users User[]
  @@map("TrangThaiNguoiDung")
}
model JlptDefinition {
  id Int @id @map("ma_trinh_do_jlpt")
  code JlptLevel @unique
  name String @map("ten_trinh_do") @db.VarChar(10)
  currentStudents Student[] @relation("StudentCurrentLevel")
  targetStudents Student[] @relation("StudentTargetLevel")
  teachers Teacher[]
  courses Course[]
  @@map("TrinhDoJLPT")
}
model AttendanceDefinition {
  id Int @id @map("ma_trang_thai_diem_danh")
  code AttendanceStatus @unique
  name String @map("ten_trang_thai") @db.VarChar(50)
  entries Attendance[]
  @@map("TrangThaiDiemDanh")
}
model TestTypeDefinition {
  id Int @id @map("ma_loai_bai_kiem_tra")
  code TestType @unique
  name String @map("ten_loai_bai") @db.VarChar(50)
  weight Float? @map("trong_so")
  tests Test[]
  @@map("LoaiBaiKiemTra")
}
`;
fs.writeFileSync(path.join(prismaDir, 'schema.prisma'), schema);
fs.mkdirSync(path.join(prismaDir, 'migrations/202611060001_document_schema'), { recursive:true });
fs.writeFileSync(path.join(prismaDir, 'migrations/202611060001_document_schema/renames.sql'), renameStatements.join('\n') + '\n');
console.log('Prepared 26-table schema and non-destructive physical renames.');
