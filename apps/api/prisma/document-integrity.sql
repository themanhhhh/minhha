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
