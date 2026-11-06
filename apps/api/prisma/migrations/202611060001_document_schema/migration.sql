-- Preserve numeric IDs, password hashes, all historical records, and file paths.

-- Code columns and local date/time mirrors are retained deliberately for API compatibility.

-- Their agreement with the documented numeric FK/full timestamp fields is enforced by triggers.

ALTER TABLE "NguoiDung" RENAME COLUMN "id" TO "ma_nguoi_dung";
ALTER TABLE "NguoiDung" RENAME COLUMN "full_name" TO "ho_ten";
ALTER TABLE "NguoiDung" RENAME COLUMN "password_hash" TO "mat_khau";
ALTER TABLE "HocVien" RENAME COLUMN "id" TO "ma_hoc_vien";
ALTER TABLE "HocVien" RENAME COLUMN "user_id" TO "ma_nguoi_dung";
ALTER TABLE "HocVien" RENAME COLUMN "date_of_birth" TO "ngay_sinh";
ALTER TABLE "GiaoVien" RENAME COLUMN "id" TO "ma_giao_vien";
ALTER TABLE "GiaoVien" RENAME COLUMN "user_id" TO "ma_nguoi_dung";
ALTER TABLE "KhoaHoc" RENAME COLUMN "id" TO "ma_khoa_hoc";
ALTER TABLE "KhoaHoc" RENAME COLUMN "name" TO "ten_khoa_hoc";
ALTER TABLE "KhoaHoc" RENAME COLUMN "total_lessons" TO "so_buoi_hoc";
ALTER TABLE "KhoaHoc" RENAME COLUMN "tuition" TO "hoc_phi";
ALTER TABLE "LopHoc" RENAME COLUMN "id" TO "ma_lop_hoc";
ALTER TABLE "LopHoc" RENAME COLUMN "teacher_id" TO "ma_giao_vien";
ALTER TABLE "LopHoc" RENAME COLUMN "name" TO "ten_lop_hoc";
ALTER TABLE "LopHoc" RENAME COLUMN "start_date" TO "ngay_khai_giang";
ALTER TABLE "LopHoc" RENAME COLUMN "end_date" TO "ngay_ket_thuc";
ALTER TABLE "LopHoc" RENAME COLUMN "schedule" TO "lich_hoc";
ALTER TABLE "LopHoc" RENAME COLUMN "capacity" TO "si_so_toi_da";
ALTER TABLE "DangKyLop" RENAME TO "DangKyHoc";
ALTER TABLE "DangKyHoc" RENAME COLUMN "id" TO "ma_dang_ky";
ALTER TABLE "DangKyHoc" RENAME COLUMN "student_id" TO "ma_hoc_vien";
ALTER TABLE "DangKyHoc" RENAME COLUMN "class_id" TO "ma_lop_hoc";
ALTER TABLE "LichSuChuyenLop" RENAME TO "ChuyenLop";
ALTER TABLE "ChuyenLop" RENAME COLUMN "id" TO "ma_chuyen_lop";
ALTER TABLE "ChuyenLop" RENAME COLUMN "student_id" TO "ma_hoc_vien";
ALTER TABLE "ChuyenLop" RENAME COLUMN "from_class_id" TO "ma_lop_hoc_cu";
ALTER TABLE "ChuyenLop" RENAME COLUMN "to_class_id" TO "ma_lop_hoc_moi";
ALTER TABLE "ChuyenLop" RENAME COLUMN "reason" TO "ly_do_chuyen_lop";
ALTER TABLE "BaoLuu" RENAME COLUMN "id" TO "ma_bao_luu";
ALTER TABLE "BaoLuu" RENAME COLUMN "student_id" TO "ma_hoc_vien";
ALTER TABLE "BaoLuu" RENAME COLUMN "class_id" TO "ma_lop_hoc";
ALTER TABLE "BaoLuu" RENAME COLUMN "reason" TO "ly_do_bao_luu";
ALTER TABLE "BaoLuu" RENAME COLUMN "start_date" TO "ngay_bao_luu";
ALTER TABLE "BuoiHoc" RENAME COLUMN "id" TO "ma_buoi_hoc";
ALTER TABLE "BuoiHoc" RENAME COLUMN "class_id" TO "ma_lop_hoc";
ALTER TABLE "BuoiHoc" RENAME COLUMN "title" TO "ten_buoi_hoc";
ALTER TABLE "BuoiHoc" RENAME COLUMN "content" TO "noi_dung_buoi_hoc";
ALTER TABLE "BuoiHoc" RENAME COLUMN "record_url" TO "link_record";
ALTER TABLE "DiemDanh" RENAME COLUMN "id" TO "ma_diem_danh";
ALTER TABLE "DiemDanh" RENAME COLUMN "lesson_id" TO "ma_buoi_hoc";
ALTER TABLE "DiemDanh" RENAME COLUMN "student_id" TO "ma_hoc_vien";
ALTER TABLE "DiemDanh" RENAME COLUMN "note" TO "ghi_chu";
ALTER TABLE "BaiKiemTra" RENAME COLUMN "id" TO "ma_bai_kiem_tra";
ALTER TABLE "BaiKiemTra" RENAME COLUMN "class_id" TO "ma_lop_hoc";
ALTER TABLE "BaiKiemTra" RENAME COLUMN "name" TO "ten_bai_kiem_tra";
ALTER TABLE "BaiKiemTra" RENAME COLUMN "test_date" TO "ngay_kiem_tra";
ALTER TABLE "DiemSo" RENAME COLUMN "id" TO "ma_diem_so";
ALTER TABLE "DiemSo" RENAME COLUMN "test_id" TO "ma_bai_kiem_tra";
ALTER TABLE "DiemSo" RENAME COLUMN "student_id" TO "ma_hoc_vien";
ALTER TABLE "DiemSo" RENAME COLUMN "value" TO "so_diem";


-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "LessonStatus" ADD VALUE 'IN_PROGRESS';
ALTER TYPE "LessonStatus" ADD VALUE 'POSTPONED';

-- AlterTable
ALTER TABLE "NguoiDung" ADD COLUMN "ma_trang_thai" INTEGER,
ADD COLUMN "ma_vai_tro_nguoi_dung" INTEGER,
ADD COLUMN     "sdt" VARCHAR(12),
ALTER COLUMN "email" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "ho_ten" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "HocVien" ADD COLUMN     "lien_he_khan_cap" VARCHAR(255),
ADD COLUMN     "ma_trinh_do_hien_tai" INTEGER,
ADD COLUMN     "ma_trinh_do_muc_tieu" INTEGER,
ADD COLUMN     "muc_tieu" VARCHAR(255),
ALTER COLUMN "ngay_sinh" SET NOT NULL;

-- AlterTable
ALTER TABLE "GiaoVien" ADD COLUMN     "ma_trinh_do_jlpt" INTEGER;

-- AlterTable
ALTER TABLE "KhoaHoc" ADD COLUMN "ma_trinh_do_jlpt" INTEGER,
ADD COLUMN     "mo_ta" VARCHAR(255),
ALTER COLUMN "ten_khoa_hoc" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "hoc_phi" SET DATA TYPE DECIMAL(15,2);

-- AlterTable
ALTER TABLE "LopHoc" ADD COLUMN     "ca_hoc" VARCHAR(50),
ADD COLUMN     "link_vao_hoc" VARCHAR(255),
ADD COLUMN     "si_so_hien_tai" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "ten_lop_hoc" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "lich_hoc" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "DangKyHoc" ADD COLUMN "ngay_tham_gia" DATE;

-- AlterTable
ALTER TABLE "ChuyenLop" ADD COLUMN     "ngay_chuyen_lop" DATE,
ALTER COLUMN "ly_do_chuyen_lop" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "BaoLuu" ADD COLUMN     "thoi_han_bao_luu" INTEGER,
ADD COLUMN     "trang_thai_bao_luu" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "ly_do_bao_luu" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "BuoiHoc" ADD COLUMN     "ma_giao_vien_day_thay" BIGINT,
ADD COLUMN "thoi_gian_bat_dau" TIMESTAMPTZ(0),
ADD COLUMN "thoi_gian_ket_thuc" TIMESTAMPTZ(0),
ALTER COLUMN "ten_buoi_hoc" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "noi_dung_buoi_hoc" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "link_record" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "DiemDanh" ADD COLUMN "ma_trang_thai_diem_danh" INTEGER,
ALTER COLUMN "ghi_chu" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "BaiKiemTra" ADD COLUMN "ma_loai_bai_kiem_tra" INTEGER,
ALTER COLUMN "ten_bai_kiem_tra" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "DiemSo" ALTER COLUMN "so_diem" SET DATA TYPE DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "VaiTroNguoiDung" (
    "ma_vai_tro" INTEGER NOT NULL,
    "code" "UserRole" NOT NULL,
    "ten_vai_tro" VARCHAR(50) NOT NULL,

    CONSTRAINT "VaiTroNguoiDung_pkey" PRIMARY KEY ("ma_vai_tro")
);

-- CreateTable
CREATE TABLE "TrangThaiNguoiDung" (
    "ma_trang_thai" INTEGER NOT NULL,
    "code" "UserStatus" NOT NULL,
    "ten_trang_thai" VARCHAR(50) NOT NULL,

    CONSTRAINT "TrangThaiNguoiDung_pkey" PRIMARY KEY ("ma_trang_thai")
);

-- CreateTable
CREATE TABLE "TrinhDoJLPT" (
    "ma_trinh_do_jlpt" INTEGER NOT NULL,
    "code" "JlptLevel" NOT NULL,
    "ten_trinh_do" VARCHAR(10) NOT NULL,

    CONSTRAINT "TrinhDoJLPT_pkey" PRIMARY KEY ("ma_trinh_do_jlpt")
);

-- CreateTable
CREATE TABLE "TrangThaiDiemDanh" (
    "ma_trang_thai_diem_danh" INTEGER NOT NULL,
    "code" "AttendanceStatus" NOT NULL,
    "ten_trang_thai" VARCHAR(50) NOT NULL,

    CONSTRAINT "TrangThaiDiemDanh_pkey" PRIMARY KEY ("ma_trang_thai_diem_danh")
);

-- CreateTable
CREATE TABLE "LoaiBaiKiemTra" (
    "ma_loai_bai_kiem_tra" INTEGER NOT NULL,
    "code" "TestType" NOT NULL,
    "ten_loai_bai" VARCHAR(50) NOT NULL,
    "trong_so" DOUBLE PRECISION,

    CONSTRAINT "LoaiBaiKiemTra_pkey" PRIMARY KEY ("ma_loai_bai_kiem_tra")
);

-- CreateIndex
CREATE UNIQUE INDEX "VaiTroNguoiDung_code_key" ON "VaiTroNguoiDung"("code");

-- CreateIndex
CREATE UNIQUE INDEX "TrangThaiNguoiDung_code_key" ON "TrangThaiNguoiDung"("code");

-- CreateIndex
CREATE UNIQUE INDEX "TrinhDoJLPT_code_key" ON "TrinhDoJLPT"("code");

-- CreateIndex
CREATE UNIQUE INDEX "TrangThaiDiemDanh_code_key" ON "TrangThaiDiemDanh"("code");

-- CreateIndex
CREATE UNIQUE INDEX "LoaiBaiKiemTra_code_key" ON "LoaiBaiKiemTra"("code");

-- CreateIndex
CREATE UNIQUE INDEX "NguoiDung_sdt_key" ON "NguoiDung"("sdt");

-- AddForeignKey


-- AddForeignKey


-- AddForeignKey


-- AddForeignKey


-- AddForeignKey


-- AddForeignKey


-- AddForeignKey


-- AddForeignKey


-- AddForeignKey



INSERT INTO "VaiTroNguoiDung" VALUES (1,'STUDENT','Học viên'),(2,'TEACHER','Giáo viên'),(3,'ACADEMIC_STAFF','Học vụ'),(4,'DIRECTOR','Ban giám đốc');
INSERT INTO "TrangThaiNguoiDung" VALUES (1,'ACTIVE','Hoạt động'),(2,'INACTIVE','Ngừng hoạt động'),(3,'LOCKED','Đã khóa');
INSERT INTO "TrinhDoJLPT" VALUES (1,'N5','N5'),(2,'N4','N4'),(3,'N3','N3'),(4,'N2','N2'),(5,'N1','N1');
INSERT INTO "TrangThaiDiemDanh" VALUES (1,'PRESENT','Có mặt'),(2,'ABSENT','Vắng mặt'),(3,'LATE','Đi muộn');
-- Explicitly selected by the user on 2026-11-06: 10% / 40% / 50%; JLPT is reference-only.
INSERT INTO "LoaiBaiKiemTra" VALUES (1,'QUIZ','Kiểm tra thường xuyên',10),(2,'MIDTERM','Giữa kỳ',40),(3,'FINAL','Cuối kỳ',50),(4,'JLPT','JLPT',0);

UPDATE "NguoiDung" u SET ma_vai_tro_nguoi_dung=r.ma_vai_tro FROM "VaiTroNguoiDung" r WHERE u.role=r.code;
UPDATE "NguoiDung" u SET ma_trang_thai=s.ma_trang_thai FROM "TrangThaiNguoiDung" s WHERE u.status=s.code;
UPDATE "NguoiDung" u SET sdt=NULLIF(regexp_replace(g.phone, '[[:space:]().-]', '', 'g'),'') FROM "GiaoVien" g WHERE u.ma_nguoi_dung=g.ma_nguoi_dung;
UPDATE "HocVien" s SET ma_trinh_do_hien_tai=l.ma_trinh_do_jlpt FROM "TrinhDoJLPT" l WHERE s.current_level=l.code;
UPDATE "HocVien" s SET ma_trinh_do_muc_tieu=l.ma_trinh_do_jlpt, muc_tieu='Đạt trình độ '||l.code::text FROM "TrinhDoJLPT" l WHERE s.target_level=l.code;
UPDATE "GiaoVien" g SET ma_trinh_do_jlpt=l.ma_trinh_do_jlpt FROM "TrinhDoJLPT" l WHERE g.jlpt_level=l.code;
UPDATE "KhoaHoc" k SET ma_trinh_do_jlpt=l.ma_trinh_do_jlpt FROM "TrinhDoJLPT" l WHERE k.level=l.code;
UPDATE "DiemDanh" d SET ma_trang_thai_diem_danh=s.ma_trang_thai_diem_danh FROM "TrangThaiDiemDanh" s WHERE d.status=s.code;
UPDATE "BaiKiemTra" b SET ma_loai_bai_kiem_tra=t.ma_loai_bai_kiem_tra FROM "LoaiBaiKiemTra" t WHERE b.type=t.code;
UPDATE "DangKyHoc" SET ngay_tham_gia=(enrolled_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date;
UPDATE "LopHoc" l SET si_so_hien_tai=(SELECT count(*) FROM "DangKyHoc" d WHERE d.ma_lop_hoc=l.ma_lop_hoc AND d.status='ACTIVE');
-- Only derive a session for rows whose schedule has one unambiguous HH:mm token.
UPDATE "LopHoc" SET ca_hoc=substring(lich_hoc FROM '\m([0-2][0-9]:[0-5][0-9])\M') WHERE lich_hoc ~ '\m[0-2][0-9]:[0-5][0-9]\M' AND array_length(regexp_split_to_array(lich_hoc,'[0-2][0-9]:[0-5][0-9]'),1)=2;
UPDATE "BuoiHoc" SET thoi_gian_bat_dau=(lesson_date+start_time) AT TIME ZONE 'Asia/Ho_Chi_Minh', thoi_gian_ket_thuc=(lesson_date+end_time) AT TIME ZONE 'Asia/Ho_Chi_Minh';

-- Historical requests must not be assigned fabricated execution dates/durations.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM "BaoLuu") OR EXISTS (SELECT 1 FROM "ChuyenLop") THEN
    RAISE EXCEPTION 'Reservation/transfer data appeared since planning; review historical mappings before migration';
  END IF;
END $$;


ALTER TABLE "NguoiDung" ALTER COLUMN "ma_trang_thai" SET NOT NULL;
ALTER TABLE "NguoiDung" ALTER COLUMN "ma_vai_tro_nguoi_dung" SET NOT NULL;
ALTER TABLE "KhoaHoc" ALTER COLUMN "ma_trinh_do_jlpt" SET NOT NULL;
ALTER TABLE "DangKyHoc" ALTER COLUMN "ngay_tham_gia" SET NOT NULL;
ALTER TABLE "BuoiHoc" ALTER COLUMN "thoi_gian_bat_dau" SET NOT NULL;
ALTER TABLE "BuoiHoc" ALTER COLUMN "thoi_gian_ket_thuc" SET NOT NULL;
ALTER TABLE "DiemDanh" ALTER COLUMN "ma_trang_thai_diem_danh" SET NOT NULL;
ALTER TABLE "BaiKiemTra" ALTER COLUMN "ma_loai_bai_kiem_tra" SET NOT NULL;

ALTER TABLE "NguoiDung" ADD CONSTRAINT "NguoiDung_ma_vai_tro_nguoi_dung_fkey" FOREIGN KEY ("ma_vai_tro_nguoi_dung") REFERENCES "VaiTroNguoiDung"("ma_vai_tro") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "NguoiDung" ADD CONSTRAINT "NguoiDung_ma_trang_thai_fkey" FOREIGN KEY ("ma_trang_thai") REFERENCES "TrangThaiNguoiDung"("ma_trang_thai") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "HocVien" ADD CONSTRAINT "HocVien_ma_trinh_do_hien_tai_fkey" FOREIGN KEY ("ma_trinh_do_hien_tai") REFERENCES "TrinhDoJLPT"("ma_trinh_do_jlpt") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "HocVien" ADD CONSTRAINT "HocVien_ma_trinh_do_muc_tieu_fkey" FOREIGN KEY ("ma_trinh_do_muc_tieu") REFERENCES "TrinhDoJLPT"("ma_trinh_do_jlpt") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "GiaoVien" ADD CONSTRAINT "GiaoVien_ma_trinh_do_jlpt_fkey" FOREIGN KEY ("ma_trinh_do_jlpt") REFERENCES "TrinhDoJLPT"("ma_trinh_do_jlpt") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "KhoaHoc" ADD CONSTRAINT "KhoaHoc_ma_trinh_do_jlpt_fkey" FOREIGN KEY ("ma_trinh_do_jlpt") REFERENCES "TrinhDoJLPT"("ma_trinh_do_jlpt") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BuoiHoc" ADD CONSTRAINT "BuoiHoc_ma_giao_vien_day_thay_fkey" FOREIGN KEY ("ma_giao_vien_day_thay") REFERENCES "GiaoVien"("ma_giao_vien") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DiemDanh" ADD CONSTRAINT "DiemDanh_ma_trang_thai_diem_danh_fkey" FOREIGN KEY ("ma_trang_thai_diem_danh") REFERENCES "TrangThaiDiemDanh"("ma_trang_thai_diem_danh") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BaiKiemTra" ADD CONSTRAINT "BaiKiemTra_ma_loai_bai_kiem_tra_fkey" FOREIGN KEY ("ma_loai_bai_kiem_tra") REFERENCES "LoaiBaiKiemTra"("ma_loai_bai_kiem_tra") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Codes are API-compatible mirrors of documented numeric FKs. Either representation
-- can be written; contradictory writes are rejected. Never silently diverge.
CREATE FUNCTION public.riki_sync_lookup() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE doc jsonb := to_jsonb(NEW); old_doc jsonb; code_value text; id_value integer; found_id integer; found_code text;
BEGIN
  code_value := doc->>TG_ARGV[0]; id_value := (doc->>TG_ARGV[1])::integer;
  IF TG_OP='UPDATE' THEN
    old_doc := to_jsonb(OLD);
    IF doc->TG_ARGV[0] IS DISTINCT FROM old_doc->TG_ARGV[0] AND doc->TG_ARGV[1] IS NOT DISTINCT FROM old_doc->TG_ARGV[1] THEN id_value:=NULL;
    ELSIF doc->TG_ARGV[1] IS DISTINCT FROM old_doc->TG_ARGV[1] AND doc->TG_ARGV[0] IS NOT DISTINCT FROM old_doc->TG_ARGV[0] THEN code_value:=NULL;
    END IF;
  END IF;
  IF code_value IS NULL AND id_value IS NULL THEN
    NEW := jsonb_populate_record(NEW,jsonb_build_object(TG_ARGV[0],NULL,TG_ARGV[1],NULL)); RETURN NEW;
  END IF;
  IF id_value IS NOT NULL THEN
    EXECUTE format('SELECT %I, code::text FROM public.%I WHERE %I=$1',TG_ARGV[3],TG_ARGV[2],TG_ARGV[3]) INTO found_id,found_code USING id_value;
  ELSE
    EXECUTE format('SELECT %I, code::text FROM public.%I WHERE code::text=$1',TG_ARGV[3],TG_ARGV[2]) INTO found_id,found_code USING code_value;
  END IF;
  IF found_id IS NULL OR (code_value IS NOT NULL AND code_value<>found_code) THEN RAISE EXCEPTION 'Invalid or contradictory lookup: %.%',TG_TABLE_NAME,TG_ARGV[0] USING ERRCODE='23514'; END IF;
  NEW := jsonb_populate_record(NEW,jsonb_build_object(TG_ARGV[0],found_code,TG_ARGV[1],found_id)); RETURN NEW;
END $$;

CREATE TRIGGER riki_user_role BEFORE INSERT OR UPDATE ON "NguoiDung" FOR EACH ROW EXECUTE FUNCTION riki_sync_lookup('role','ma_vai_tro_nguoi_dung','VaiTroNguoiDung','ma_vai_tro');
CREATE TRIGGER riki_user_status BEFORE INSERT OR UPDATE ON "NguoiDung" FOR EACH ROW EXECUTE FUNCTION riki_sync_lookup('status','ma_trang_thai','TrangThaiNguoiDung','ma_trang_thai');
CREATE TRIGGER riki_student_current BEFORE INSERT OR UPDATE ON "HocVien" FOR EACH ROW EXECUTE FUNCTION riki_sync_lookup('current_level','ma_trinh_do_hien_tai','TrinhDoJLPT','ma_trinh_do_jlpt');
CREATE TRIGGER riki_student_target BEFORE INSERT OR UPDATE ON "HocVien" FOR EACH ROW EXECUTE FUNCTION riki_sync_lookup('target_level','ma_trinh_do_muc_tieu','TrinhDoJLPT','ma_trinh_do_jlpt');
CREATE TRIGGER riki_teacher_level BEFORE INSERT OR UPDATE ON "GiaoVien" FOR EACH ROW EXECUTE FUNCTION riki_sync_lookup('jlpt_level','ma_trinh_do_jlpt','TrinhDoJLPT','ma_trinh_do_jlpt');
CREATE TRIGGER riki_course_level BEFORE INSERT OR UPDATE ON "KhoaHoc" FOR EACH ROW EXECUTE FUNCTION riki_sync_lookup('level','ma_trinh_do_jlpt','TrinhDoJLPT','ma_trinh_do_jlpt');
CREATE TRIGGER riki_attendance_status BEFORE INSERT OR UPDATE ON "DiemDanh" FOR EACH ROW EXECUTE FUNCTION riki_sync_lookup('status','ma_trang_thai_diem_danh','TrangThaiDiemDanh','ma_trang_thai_diem_danh');
CREATE TRIGGER riki_test_type BEFORE INSERT OR UPDATE ON "BaiKiemTra" FOR EACH ROW EXECUTE FUNCTION riki_sync_lookup('type','ma_loai_bai_kiem_tra','LoaiBaiKiemTra','ma_loai_bai_kiem_tra');

CREATE FUNCTION public.riki_sync_lesson_clock() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP='INSERT' THEN
    IF NEW.thoi_gian_bat_dau IS NULL THEN NEW.thoi_gian_bat_dau:=(NEW.lesson_date+NEW.start_time) AT TIME ZONE 'Asia/Ho_Chi_Minh';
    ELSE NEW.lesson_date:=(NEW.thoi_gian_bat_dau AT TIME ZONE 'Asia/Ho_Chi_Minh')::date; NEW.start_time:=(NEW.thoi_gian_bat_dau AT TIME ZONE 'Asia/Ho_Chi_Minh')::time; END IF;
    IF NEW.thoi_gian_ket_thuc IS NULL THEN NEW.thoi_gian_ket_thuc:=(NEW.lesson_date+NEW.end_time) AT TIME ZONE 'Asia/Ho_Chi_Minh';
    ELSE NEW.end_time:=(NEW.thoi_gian_ket_thuc AT TIME ZONE 'Asia/Ho_Chi_Minh')::time; END IF;
  ELSE
    IF (NEW.lesson_date,NEW.start_time,NEW.end_time) IS DISTINCT FROM (OLD.lesson_date,OLD.start_time,OLD.end_time) THEN
      IF NEW.thoi_gian_bat_dau IS DISTINCT FROM OLD.thoi_gian_bat_dau OR NEW.thoi_gian_ket_thuc IS DISTINCT FROM OLD.thoi_gian_ket_thuc THEN RAISE EXCEPTION 'Write either lesson wall-clock or full timestamps, not both'; END IF;
      NEW.thoi_gian_bat_dau:=(NEW.lesson_date+NEW.start_time) AT TIME ZONE 'Asia/Ho_Chi_Minh'; NEW.thoi_gian_ket_thuc:=(NEW.lesson_date+NEW.end_time) AT TIME ZONE 'Asia/Ho_Chi_Minh';
    ELSE
      NEW.lesson_date:=(NEW.thoi_gian_bat_dau AT TIME ZONE 'Asia/Ho_Chi_Minh')::date;
      NEW.start_time:=(NEW.thoi_gian_bat_dau AT TIME ZONE 'Asia/Ho_Chi_Minh')::time;
      NEW.end_time:=(NEW.thoi_gian_ket_thuc AT TIME ZONE 'Asia/Ho_Chi_Minh')::time;
    END IF;
  END IF;
  IF NEW.thoi_gian_ket_thuc<=NEW.thoi_gian_bat_dau OR (NEW.thoi_gian_ket_thuc AT TIME ZONE 'Asia/Ho_Chi_Minh')::date<>NEW.lesson_date THEN RAISE EXCEPTION 'Lesson must end after start on the same local day' USING ERRCODE='23514'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER riki_lesson_clock BEFORE INSERT OR UPDATE ON "BuoiHoc" FOR EACH ROW EXECUTE FUNCTION riki_sync_lesson_clock();

CREATE FUNCTION public.riki_joined_on() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.ngay_tham_gia:=(NEW.enrolled_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date; RETURN NEW; END $$;
CREATE TRIGGER riki_joined_on BEFORE INSERT OR UPDATE OF enrolled_at ON "DangKyHoc" FOR EACH ROW EXECUTE FUNCTION riki_joined_on();

CREATE FUNCTION public.riki_enrollment_capacity() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE old_class bigint; new_class bigint; old_active boolean:=false; new_active boolean:=false;
BEGIN
  IF TG_OP<>'INSERT' THEN old_class:=OLD.ma_lop_hoc; old_active:=OLD.status='ACTIVE'; END IF;
  IF TG_OP<>'DELETE' THEN new_class:=NEW.ma_lop_hoc; new_active:=NEW.status='ACTIVE'; END IF;
  PERFORM 1 FROM "LopHoc" WHERE ma_lop_hoc IN (old_class,new_class) ORDER BY ma_lop_hoc FOR UPDATE;
  IF old_active AND (NOT new_active OR old_class IS DISTINCT FROM new_class) THEN UPDATE "LopHoc" SET si_so_hien_tai=si_so_hien_tai-1 WHERE ma_lop_hoc=old_class; END IF;
  IF new_active AND (NOT old_active OR old_class IS DISTINCT FROM new_class) THEN
    UPDATE "LopHoc" SET si_so_hien_tai=si_so_hien_tai+1 WHERE ma_lop_hoc=new_class AND si_so_hien_tai<si_so_toi_da;
    IF NOT FOUND THEN RAISE EXCEPTION 'Class is full' USING ERRCODE='23514'; END IF;
  END IF;
  IF TG_OP='DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END $$;
CREATE TRIGGER riki_enrollment_capacity BEFORE INSERT OR UPDATE OR DELETE ON "DangKyHoc" FOR EACH ROW EXECUTE FUNCTION riki_enrollment_capacity();

CREATE FUNCTION public.riki_protect_occupancy() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.si_so_hien_tai IS DISTINCT FROM OLD.si_so_hien_tai AND pg_trigger_depth()<2 THEN RAISE EXCEPTION 'Occupancy is maintained by enrollment changes' USING ERRCODE='23514'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER riki_protect_occupancy BEFORE UPDATE OF si_so_hien_tai ON "LopHoc" FOR EACH ROW EXECUTE FUNCTION riki_protect_occupancy();
ALTER TABLE "LopHoc" ADD CONSTRAINT riki_class_capacity CHECK (si_so_hien_tai>=0 AND si_so_toi_da>=si_so_hien_tai);
ALTER TABLE "LoaiBaiKiemTra" ADD CONSTRAINT riki_weight_range CHECK (trong_so IS NULL OR (trong_so>=0 AND trong_so<=100 AND trong_so<>'NaN'::float8));
ALTER TABLE "DiemSo" ADD CONSTRAINT riki_score_range CHECK (so_diem>=0 AND so_diem<=999.99 AND so_diem<>'NaN'::float8);
ALTER TABLE "BaoLuu" ADD CONSTRAINT riki_reservation_duration CHECK (thoi_han_bao_luu IS NULL OR thoi_han_bao_luu>0);

CREATE FUNCTION public.riki_phone_from_teacher() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP='INSERT' OR NEW.phone IS DISTINCT FROM OLD.phone THEN
    UPDATE "NguoiDung" SET sdt=NULLIF(regexp_replace(NEW.phone,'[[:space:]().-]','','g'),'') WHERE ma_nguoi_dung=NEW.ma_nguoi_dung AND sdt IS DISTINCT FROM NULLIF(regexp_replace(NEW.phone,'[[:space:]().-]','','g'),'');
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER riki_phone_teacher AFTER INSERT OR UPDATE OF phone ON "GiaoVien" FOR EACH ROW EXECUTE FUNCTION riki_phone_from_teacher();
CREATE FUNCTION public.riki_phone_from_user() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN UPDATE "GiaoVien" SET phone=NEW.sdt WHERE ma_nguoi_dung=NEW.ma_nguoi_dung AND phone IS DISTINCT FROM NEW.sdt; RETURN NEW; END $$;
CREATE TRIGGER riki_phone_user AFTER UPDATE OF sdt ON "NguoiDung" FOR EACH ROW EXECUTE FUNCTION riki_phone_from_user();

CREATE FUNCTION public.riki_lock_lookup_identity() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN IF NEW.code IS DISTINCT FROM OLD.code OR to_jsonb(NEW)->TG_ARGV[0] IS DISTINCT FROM to_jsonb(OLD)->TG_ARGV[0] THEN RAISE EXCEPTION 'System lookup identities are immutable'; END IF; RETURN NEW; END $$;
CREATE TRIGGER riki_lock_role BEFORE UPDATE ON "VaiTroNguoiDung" FOR EACH ROW EXECUTE FUNCTION riki_lock_lookup_identity('ma_vai_tro');
CREATE TRIGGER riki_lock_user_status BEFORE UPDATE ON "TrangThaiNguoiDung" FOR EACH ROW EXECUTE FUNCTION riki_lock_lookup_identity('ma_trang_thai');
CREATE TRIGGER riki_lock_level BEFORE UPDATE ON "TrinhDoJLPT" FOR EACH ROW EXECUTE FUNCTION riki_lock_lookup_identity('ma_trinh_do_jlpt');
CREATE TRIGGER riki_lock_attendance BEFORE UPDATE ON "TrangThaiDiemDanh" FOR EACH ROW EXECUTE FUNCTION riki_lock_lookup_identity('ma_trang_thai_diem_danh');
CREATE TRIGGER riki_lock_test_type BEFORE UPDATE ON "LoaiBaiKiemTra" FOR EACH ROW EXECUTE FUNCTION riki_lock_lookup_identity('ma_loai_bai_kiem_tra');
