-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'TEACHER', 'ACADEMIC_STAFF', 'DIRECTOR');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'LOCKED');

-- CreateEnum
CREATE TYPE "JlptLevel" AS ENUM ('N5', 'N4', 'N3', 'N2', 'N1');

-- CreateEnum
CREATE TYPE "CourseStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ClassStatus" AS ENUM ('ACTIVE', 'UPCOMING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('ACTIVE', 'RESERVED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LessonStatus" AS ENUM ('UPCOMING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE');

-- CreateEnum
CREATE TYPE "TestType" AS ENUM ('QUIZ', 'MIDTERM', 'FINAL', 'JLPT');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('PENDING', 'APPROVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('REQUESTED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('SUBMITTED', 'LATE');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ASSIGNMENT_CREATED', 'MATERIAL_PUBLISHED', 'LESSON_CREATED', 'LESSON_UPDATED', 'SCORE_PUBLISHED', 'ATTENDANCE_ALERT', 'CLASS_ENROLLED', 'BROADCAST', 'SYSTEM');

-- CreateTable
CREATE TABLE "NguoiDung" (
    "id" BIGSERIAL NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "full_name" VARCHAR(200) NOT NULL,
    "role" "UserRole" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "last_login_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "NguoiDung_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "token_id" VARCHAR(36) NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "revoked_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "token_id" VARCHAR(36) NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "used_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HocVien" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "student_code" VARCHAR(30) NOT NULL,
    "gender" VARCHAR(20),
    "date_of_birth" DATE,
    "current_level" "JlptLevel",
    "target_level" "JlptLevel",
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "HocVien_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GiaoVien" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "teacher_code" VARCHAR(30) NOT NULL,
    "phone" VARCHAR(30),
    "jlpt_level" "JlptLevel",
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "GiaoVien_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KhoaHoc" (
    "id" BIGSERIAL NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "level" "JlptLevel" NOT NULL,
    "total_lessons" INTEGER NOT NULL,
    "tuition" DECIMAL(12,2) NOT NULL,
    "status" "CourseStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "KhoaHoc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LopHoc" (
    "id" BIGSERIAL NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "course_id" BIGINT NOT NULL,
    "teacher_id" BIGINT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "schedule" VARCHAR(200) NOT NULL,
    "room" VARCHAR(100),
    "capacity" INTEGER NOT NULL DEFAULT 20,
    "status" "ClassStatus" NOT NULL DEFAULT 'UPCOMING',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "LopHoc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DangKyLop" (
    "id" BIGSERIAL NOT NULL,
    "student_id" BIGINT NOT NULL,
    "class_id" BIGINT NOT NULL,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "enrolled_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "left_at" TIMESTAMPTZ(3),

    CONSTRAINT "DangKyLop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LichSuChuyenLop" (
    "id" BIGSERIAL NOT NULL,
    "student_id" BIGINT NOT NULL,
    "from_class_id" BIGINT,
    "to_class_id" BIGINT NOT NULL,
    "reason" VARCHAR(500),
    "status" "TransferStatus" NOT NULL DEFAULT 'REQUESTED',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LichSuChuyenLop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BaoLuu" (
    "id" BIGSERIAL NOT NULL,
    "student_id" BIGINT NOT NULL,
    "class_id" BIGINT NOT NULL,
    "reason" VARCHAR(500),
    "status" "ReservationStatus" NOT NULL DEFAULT 'PENDING',
    "start_date" DATE,
    "end_date" DATE,

    CONSTRAINT "BaoLuu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuoiHoc" (
    "id" BIGSERIAL NOT NULL,
    "class_id" BIGINT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "lesson_date" DATE NOT NULL,
    "start_time" TIME(0) NOT NULL,
    "end_time" TIME(0) NOT NULL,
    "content" TEXT,
    "record_url" VARCHAR(500),
    "status" "LessonStatus" NOT NULL DEFAULT 'UPCOMING',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "BuoiHoc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiemDanh" (
    "id" BIGSERIAL NOT NULL,
    "lesson_id" BIGINT NOT NULL,
    "student_id" BIGINT NOT NULL,
    "status" "AttendanceStatus" NOT NULL,
    "note" VARCHAR(500),

    CONSTRAINT "DiemDanh_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BaiKiemTra" (
    "id" BIGSERIAL NOT NULL,
    "class_id" BIGINT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "type" "TestType" NOT NULL,
    "max_score" DECIMAL(5,2) NOT NULL DEFAULT 10,
    "test_date" DATE,

    CONSTRAINT "BaiKiemTra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiemSo" (
    "id" BIGSERIAL NOT NULL,
    "test_id" BIGINT NOT NULL,
    "student_id" BIGINT NOT NULL,
    "value" DECIMAL(5,2) NOT NULL,
    "note" VARCHAR(500),

    CONSTRAINT "DiemSo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BaiTap" (
    "id" BIGSERIAL NOT NULL,
    "class_id" BIGINT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "due_at" TIMESTAMPTZ(3) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "BaiTap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TepBaiTap" (
    "id" BIGSERIAL NOT NULL,
    "assignment_id" BIGINT NOT NULL,
    "storage_path" VARCHAR(500) NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(120) NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TepBaiTap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaiLieuLop" (
    "id" BIGSERIAL NOT NULL,
    "class_id" BIGINT NOT NULL,
    "lesson_id" BIGINT,
    "created_by" BIGINT,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "storage_path" VARCHAR(500) NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(120) NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaiLieuLop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NopBai" (
    "id" BIGSERIAL NOT NULL,
    "assignment_id" BIGINT NOT NULL,
    "student_id" BIGINT NOT NULL,
    "note" TEXT,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'SUBMITTED',
    "submitted_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NopBai_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TepNopBai" (
    "id" BIGSERIAL NOT NULL,
    "submission_id" BIGINT NOT NULL,
    "storage_path" VARCHAR(500) NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(120) NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TepNopBai_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" BIGSERIAL NOT NULL,
    "actor_id" BIGINT,
    "action" VARCHAR(100) NOT NULL,
    "entity" VARCHAR(100) NOT NULL,
    "entity_id" VARCHAR(100),
    "old_value" JSONB,
    "new_value" JSONB,
    "ip_address" VARCHAR(64),
    "user_agent" VARCHAR(500),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThongBao" (
    "id" BIGSERIAL NOT NULL,
    "recipient_id" BIGINT NOT NULL,
    "created_by_id" BIGINT,
    "type" "NotificationType" NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "body" TEXT NOT NULL,
    "action_url" VARCHAR(500),
    "entity" VARCHAR(100),
    "entity_id" VARCHAR(100),
    "metadata" JSONB,
    "dedupe_key" VARCHAR(255),
    "read_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ThongBao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NguoiDung_email_key" ON "NguoiDung"("email");

-- CreateIndex
CREATE INDEX "NguoiDung_role_status_idx" ON "NguoiDung"("role", "status");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_id_key" ON "RefreshToken"("token_id");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_hash_key" ON "RefreshToken"("token_hash");

-- CreateIndex
CREATE INDEX "RefreshToken_user_id_revoked_at_idx" ON "RefreshToken"("user_id", "revoked_at");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_id_key" ON "PasswordResetToken"("token_id");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_hash_key" ON "PasswordResetToken"("token_hash");

-- CreateIndex
CREATE INDEX "PasswordResetToken_user_id_used_at_idx" ON "PasswordResetToken"("user_id", "used_at");

-- CreateIndex
CREATE UNIQUE INDEX "HocVien_user_id_key" ON "HocVien"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "HocVien_student_code_key" ON "HocVien"("student_code");

-- CreateIndex
CREATE INDEX "HocVien_current_level_idx" ON "HocVien"("current_level");

-- CreateIndex
CREATE UNIQUE INDEX "GiaoVien_user_id_key" ON "GiaoVien"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "GiaoVien_teacher_code_key" ON "GiaoVien"("teacher_code");

-- CreateIndex
CREATE UNIQUE INDEX "KhoaHoc_code_key" ON "KhoaHoc"("code");

-- CreateIndex
CREATE INDEX "KhoaHoc_level_status_idx" ON "KhoaHoc"("level", "status");

-- CreateIndex
CREATE UNIQUE INDEX "LopHoc_code_key" ON "LopHoc"("code");

-- CreateIndex
CREATE INDEX "LopHoc_course_id_status_idx" ON "LopHoc"("course_id", "status");

-- CreateIndex
CREATE INDEX "LopHoc_teacher_id_status_idx" ON "LopHoc"("teacher_id", "status");

-- CreateIndex
CREATE INDEX "DangKyLop_class_id_status_idx" ON "DangKyLop"("class_id", "status");

-- CreateIndex
CREATE INDEX "DangKyLop_student_id_status_idx" ON "DangKyLop"("student_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "DangKyLop_student_id_class_id_key" ON "DangKyLop"("student_id", "class_id");

-- CreateIndex
CREATE INDEX "LichSuChuyenLop_student_id_status_idx" ON "LichSuChuyenLop"("student_id", "status");

-- CreateIndex
CREATE INDEX "BaoLuu_student_id_status_idx" ON "BaoLuu"("student_id", "status");

-- CreateIndex
CREATE INDEX "BuoiHoc_class_id_lesson_date_idx" ON "BuoiHoc"("class_id", "lesson_date");

-- CreateIndex
CREATE INDEX "DiemDanh_student_id_status_idx" ON "DiemDanh"("student_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "DiemDanh_lesson_id_student_id_key" ON "DiemDanh"("lesson_id", "student_id");

-- CreateIndex
CREATE INDEX "BaiKiemTra_class_id_test_date_idx" ON "BaiKiemTra"("class_id", "test_date");

-- CreateIndex
CREATE INDEX "DiemSo_student_id_idx" ON "DiemSo"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "DiemSo_test_id_student_id_key" ON "DiemSo"("test_id", "student_id");

-- CreateIndex
CREATE INDEX "BaiTap_class_id_due_at_idx" ON "BaiTap"("class_id", "due_at");

-- CreateIndex
CREATE INDEX "TepBaiTap_assignment_id_idx" ON "TepBaiTap"("assignment_id");

-- CreateIndex
CREATE INDEX "TaiLieuLop_class_id_created_at_idx" ON "TaiLieuLop"("class_id", "created_at");

-- CreateIndex
CREATE INDEX "TaiLieuLop_lesson_id_idx" ON "TaiLieuLop"("lesson_id");

-- CreateIndex
CREATE INDEX "NopBai_student_id_submitted_at_idx" ON "NopBai"("student_id", "submitted_at");

-- CreateIndex
CREATE UNIQUE INDEX "NopBai_assignment_id_student_id_key" ON "NopBai"("assignment_id", "student_id");

-- CreateIndex
CREATE INDEX "TepNopBai_submission_id_idx" ON "TepNopBai"("submission_id");

-- CreateIndex
CREATE INDEX "AuditLog_entity_entity_id_idx" ON "AuditLog"("entity", "entity_id");

-- CreateIndex
CREATE INDEX "AuditLog_actor_id_created_at_idx" ON "AuditLog"("actor_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "ThongBao_dedupe_key_key" ON "ThongBao"("dedupe_key");

-- CreateIndex
CREATE INDEX "ThongBao_recipient_id_read_at_created_at_idx" ON "ThongBao"("recipient_id", "read_at", "created_at");

-- CreateIndex
CREATE INDEX "ThongBao_recipient_id_created_at_idx" ON "ThongBao"("recipient_id", "created_at");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "NguoiDung"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "NguoiDung"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HocVien" ADD CONSTRAINT "HocVien_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "NguoiDung"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiaoVien" ADD CONSTRAINT "GiaoVien_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "NguoiDung"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LopHoc" ADD CONSTRAINT "LopHoc_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "KhoaHoc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LopHoc" ADD CONSTRAINT "LopHoc_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "GiaoVien"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DangKyLop" ADD CONSTRAINT "DangKyLop_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "HocVien"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DangKyLop" ADD CONSTRAINT "DangKyLop_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "LopHoc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LichSuChuyenLop" ADD CONSTRAINT "LichSuChuyenLop_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "HocVien"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LichSuChuyenLop" ADD CONSTRAINT "LichSuChuyenLop_from_class_id_fkey" FOREIGN KEY ("from_class_id") REFERENCES "LopHoc"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LichSuChuyenLop" ADD CONSTRAINT "LichSuChuyenLop_to_class_id_fkey" FOREIGN KEY ("to_class_id") REFERENCES "LopHoc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BaoLuu" ADD CONSTRAINT "BaoLuu_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "HocVien"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BaoLuu" ADD CONSTRAINT "BaoLuu_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "LopHoc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuoiHoc" ADD CONSTRAINT "BuoiHoc_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "LopHoc"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiemDanh" ADD CONSTRAINT "DiemDanh_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "BuoiHoc"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiemDanh" ADD CONSTRAINT "DiemDanh_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "HocVien"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BaiKiemTra" ADD CONSTRAINT "BaiKiemTra_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "LopHoc"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiemSo" ADD CONSTRAINT "DiemSo_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "BaiKiemTra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiemSo" ADD CONSTRAINT "DiemSo_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "HocVien"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BaiTap" ADD CONSTRAINT "BaiTap_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "LopHoc"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TepBaiTap" ADD CONSTRAINT "TepBaiTap_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "BaiTap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaiLieuLop" ADD CONSTRAINT "TaiLieuLop_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "LopHoc"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaiLieuLop" ADD CONSTRAINT "TaiLieuLop_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "BuoiHoc"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaiLieuLop" ADD CONSTRAINT "TaiLieuLop_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "NguoiDung"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NopBai" ADD CONSTRAINT "NopBai_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "BaiTap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NopBai" ADD CONSTRAINT "NopBai_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "HocVien"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TepNopBai" ADD CONSTRAINT "TepNopBai_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "NopBai"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "NguoiDung"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThongBao" ADD CONSTRAINT "ThongBao_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "NguoiDung"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThongBao" ADD CONSTRAINT "ThongBao_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "NguoiDung"("id") ON DELETE SET NULL ON UPDATE CASCADE;
