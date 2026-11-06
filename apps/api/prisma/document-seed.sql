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
