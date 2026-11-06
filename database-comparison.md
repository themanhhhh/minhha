# Đối chiếu cơ sở dữ liệu Riki LMS

Ngày kiểm tra: 06/11/2026.

Nguồn tài liệu: https://docs.google.com/document/d/1YhzTA_TmljkbPkn9ic07Zvcy_-uZYfH1W24DVUsScsg, mục 3.3.2 trong tab “Chương 1”; tham chiếu thêm yêu cầu nghiệp vụ chương 1 và 3. Đối chiếu phần mô tả bảng bằng văn bản; chưa kiểm tra trực quan các đường nối trong ảnh ERD.

Nguồn dự án: `apps/api/prisma/schema.prisma`, các service NestJS và metadata đọc trực tiếp từ PostgreSQL được cấu hình trong môi trường dự án. Không sửa dữ liệu hoặc cấu trúc database.

## 1. Kết quả kiểm tra trực tiếp

- Kết nối thành công qua DIRECT_URL trên cổng 5432 sau khi database được khởi chạy lại.
- Schema `public` có 21 bảng, 169 cột và 13 kiểu enum (49 giá trị).
- Đã đọc 21 khóa chính và 30 khóa ngoại từ PostgreSQL.
- Đối chiếu schema Prisma với database: không phát hiện khác biệt về tên bảng/cột, kiểu dữ liệu, độ dài VARCHAR, precision/scale của DECIMAL, tính nullable và danh sách giá trị enum.
- Kết quả này xác minh cấu trúc database ở địa chỉ cấu hình của dự án; không xác minh dữ liệu từng bản ghi, toàn bộ trigger, RLS, quyền truy cập hay chất lượng dữ liệu.

Tài liệu có 17 bảng được đặc tả ở mục 3.3.2. Trong triển khai, 12 bảng có đối tượng tương ứng, 5 bảng danh mục được thay bằng enum và 9 bảng được bổ sung, tạo thành 21 bảng.

## 2. Công nghệ và quy ước tên

Tài liệu chưa thống nhất: tiêu đề công cụ ghi MySQL, phần giải thích ghi Microsoft SQL Server, lời kết ghi MySQL. Dự án và database đang dùng PostgreSQL trên Supabase, truy cập qua Prisma. Cần thống nhất lại chương 2, chương 3 và lời kết.

Prisma dùng tên model tiếng Anh, tên bảng vật lý phần lớn là tiếng Việt không dấu qua `@@map`, còn cột vật lý dùng tiếng Anh. Ví dụ:

| Tài liệu | Prisma | PostgreSQL |
| --- | --- | --- |
| NguoiDung.ma_nguoi_dung | User.id | NguoiDung.id |
| NguoiDung.ho_ten | User.fullName | NguoiDung.full_name |
| NguoiDung.mat_khau | User.passwordHash | NguoiDung.password_hash |
| HocVien.ma_nguoi_dung | Student.userId | HocVien.user_id |
| LopHoc.ma_giao_vien | Class.teacherId | LopHoc.teacher_id |
| DiemSo.so_diem | Score.value | DiemSo.value |

Đây là đổi quy ước tên; không nên tính các trường này là bị thiếu. Các bảng dữ liệu trong tài liệu cần ghi tên vật lý nếu dùng để mô tả database đã triển khai.

## 3. Đối chiếu đầy đủ 17 bảng trong tài liệu

| Bảng trong tài liệu | Đối tượng triển khai | Khác biệt chính |
| --- | --- | --- |
| NguoiDung | User → NguoiDung | Giữ thông tin tên, email, mật khẩu băm. Vai trò và trạng thái dùng enum trực tiếp. Không có `sdt` chung cho người dùng. Thêm ngày đăng nhập, ngày tạo/cập nhật. |
| TrangThaiNguoiDung | enum UserStatus | ACTIVE, INACTIVE, LOCKED; không có bảng riêng. |
| VaiTroNguoiDung | enum UserRole | STUDENT, TEACHER, ACADEMIC_STAFF, DIRECTOR; không có bảng riêng. |
| HocVien | Student → HocVien | `ngay_sinh` thành `date_of_birth`, cho phép NULL thay vì bắt buộc. `muc_tieu` dạng văn bản tự do thành `target_level` enum JLPT. Không có `lien_he_khan_cap`. Thêm mã học viên duy nhất, giới tính, trình độ hiện tại và timestamps. |
| GiaoVien | Teacher → GiaoVien | Giữ liên kết người dùng. Trình độ dùng enum `jlpt_level`. Thêm mã giáo viên duy nhất, số điện thoại và timestamps. |
| TrinhDoJLPT | enum JlptLevel | N5, N4, N3, N2, N1; không có bảng riêng. |
| KhoaHoc | Course → KhoaHoc | Có tên, tổng số buổi và học phí. Không có `mo_ta`. Thêm mã khóa học, cấp độ, trạng thái và timestamps. Học phí DECIMAL(15,2) thành numeric(12,2). |
| LopHoc | Class → LopHoc | Có giáo viên, ngày bắt đầu/kết thúc, lịch và sức chứa. Thêm FK `course_id` tới KhoaHoc, mã lớp, phòng, trạng thái và timestamps. Không có cột riêng `ca_hoc`, `si_so_hien_tai`, `link_vao_hoc`. |
| DangKyHoc | Enrollment → DangKyLop | Đổi tên bảng. Có học viên, lớp và thời điểm đăng ký. Thêm trạng thái, thời điểm rời lớp và unique(student_id, class_id). |
| DiemSo | Score → DiemSo | Giữ liên kết bài kiểm tra và học viên. FLOAT thành numeric(5,2), thêm ghi chú và unique(test_id, student_id). |
| ChuyenLop | ClassTransfer → LichSuChuyenLop | Đổi tên bảng. Có học viên, lớp cũ/mới và lý do. Lớp cũ cho phép NULL. Có trạng thái yêu cầu và created_at, không có ngày thực hiện chuyển lớp riêng. |
| BaoLuu | StudyReservation → BaoLuu | Thay thời hạn số tháng bằng start_date/end_date, cả hai cho phép NULL. BOOLEAN thành enum PENDING/APPROVED/CANCELLED. Giữ học viên, lớp và lý do. |
| BuoiHoc | Lesson → BuoiHoc | Giữ lớp, tên, nội dung và record. Hai DATETIME bắt đầu/kết thúc thành lesson_date DATE + start_time/end_time TIME(0). Thêm trạng thái và timestamps; nội dung thành TEXT, record tăng lên VARCHAR(500). |
| DiemDanh | Attendance → DiemDanh | Giữ buổi học, học viên và ghi chú. Trạng thái dùng enum thay FK danh mục. Thêm unique(lesson_id, student_id). |
| TrangThaiDiemDanh | enum AttendanceStatus | PRESENT, ABSENT, LATE; không có bảng riêng. Có thêm trạng thái đi muộn so với mô tả điểm danh hai trạng thái trong yêu cầu. |
| BaiKiemTra | Test → BaiKiemTra | Giữ lớp, tên và ngày kiểm tra; loại bài dùng enum. Thêm max_score numeric(5,2), mặc định 10. Ngày kiểm tra cho phép NULL. |
| LoaiBaiKiemTra | enum TestType | QUIZ, MIDTERM, FINAL, JLPT. Không còn bảng tên loại bài và không có trường trọng số tương ứng. |

## 4. Chín bảng bổ sung chưa có đặc tả trong mục 3.3.2

| Bảng PostgreSQL | Mục đích và quan hệ |
| --- | --- |
| RefreshToken | Phiên làm việc dài hạn, token băm, hạn dùng và thu hồi; FK tới NguoiDung. |
| PasswordResetToken | Khôi phục mật khẩu, token băm, hạn dùng và thời điểm sử dụng; FK tới NguoiDung. |
| BaiTap | Bài tập theo lớp, mô tả và hạn nộp; FK tới LopHoc. |
| TepBaiTap | File đính kèm đề bài; FK tới BaiTap. |
| NopBai | Lượt nộp bài của học viên, thời gian và trạng thái; FK tới BaiTap/HocVien, unique(assignment_id, student_id). |
| TepNopBai | File của lượt nộp; FK tới NopBai. |
| TaiLieuLop | Tài liệu của lớp, có thể gắn buổi học và người tải lên; FK tới LopHoc/BuoiHoc/NguoiDung. |
| AuditLog | Nhật ký người thực hiện, đối tượng, dữ liệu trước/sau và thời gian; FK tới NguoiDung. |
| ThongBao | Thông báo theo người nhận, người tạo, loại, nội dung, thời điểm đọc và metadata; FK tới NguoiDung. |

Thông báo đã xuất hiện ở phần yêu cầu nhưng chưa có bảng đặc tả ở mục 3.3.2. Các bảng file lưu đường dẫn Storage và metadata (tên, MIME, kích thước), không lưu trực tiếp nội dung file trong cột database.

## 5. Những khác biệt ảnh hưởng nghiệp vụ

### 5.1. Thiếu trọng số bài kiểm tra

Tài liệu có `LoaiBaiKiemTra.trong_so`. Triển khai chỉ có enum TestType; Test và Score không có trường trọng số. Service báo cáo và cổng học viên hiện tính trung bình cộng các điểm, không tính theo trọng số.

Đây là khác biệt nghiệp vụ cần chốt. Nếu giữ yêu cầu trong tài liệu, cần thiết kế nơi cấu hình trọng số và sửa cách tổng hợp điểm. Nếu giữ triển khai hiện tại, tài liệu phải mô tả trung bình cộng. `max_score` hiện có thể khác 10; cần xác định cách quy đổi trước khi tổng hợp các bài khác thang điểm.

### 5.2. Thiếu liên kết vào lớp trực tuyến

Tài liệu có `LopHoc.link_vao_hoc`; bảng LopHoc thực tế không có cột tương ứng. `room` là thông tin phòng, không mặc nhiên tương đương URL. `BuoiHoc.record_url` phục vụ xem lại, khác với liên kết tham gia buổi học.

### 5.3. Thiếu thông tin liên hệ và mô tả

- Không có `HocVien.lien_he_khan_cap`.
- Không có số điện thoại chung ở NguoiDung hoặc số điện thoại riêng của HocVien; chỉ GiaoVien có `phone`, không unique như `NguoiDung.sdt` trong tài liệu.
- Không có `KhoaHoc.mo_ta`.
- Mục tiêu học viên hiện chỉ biểu diễn cấp độ JLPT, không lưu được mục tiêu tự do như thời hạn thi hoặc điểm mong muốn.

### 5.4. Sĩ số được tính thay vì lưu cột

Không có `si_so_hien_tai`; API tính từ bản ghi DangKyLop. Cách này tránh lưu dữ liệu dư thừa nhưng phải thống nhất cách đếm: một số đường API dùng `_count.enrollments` không lọc trạng thái, trong khi một số báo cáo lọc ACTIVE. Bản ghi bảo lưu/hủy/hoàn thành có thể khiến sĩ số hiển thị khác nhau giữa màn hình.

### 5.5. Bảo lưu và chuyển lớp thay đổi ý nghĩa dữ liệu

- Bảo lưu dùng khoảng ngày và quy trình duyệt thay cho số tháng và cờ Boolean. PENDING/APPROVED/CANCELLED chưa trực tiếp thể hiện “đã quay lại học” như mô tả trong tài liệu.
- Chuyển lớp chỉ có created_at của yêu cầu, chưa có executed_at/approved_at để phân biệt ngày gửi và ngày thực sự chuyển.
- Đã có model/bảng BaoLuu và LichSuChuyenLop, nhưng chưa tìm thấy service/API thao tác các model này trong mã backend đã kiểm tra. Có bảng chưa đủ để kết luận nghiệp vụ đã triển khai hoàn chỉnh.

### 5.6. Giáo viên dạy thay và trạng thái buổi học

Phần dữ liệu đầu vào của tài liệu nêu giáo viên dạy thay theo buổi. Bảng BuoiHoc thực tế không có teacher_id/giáo viên thay; giáo viên được suy ra từ LopHoc.teacher_id. Bảng BuoiHoc trong chính mục 3.3.2 của tài liệu cũng chưa đặc tả trường này.

Yêu cầu mô tả trạng thái Chưa diễn ra/Đang học/Hoàn thành/Hoãn, trong khi enum LessonStatus hiện chỉ có UPCOMING/COMPLETED/CANCELLED. Cần thống nhất cách biểu diễn buổi đang diễn ra và buổi hoãn.

## 6. Quan hệ và ràng buộc

Database thực tế có các quan hệ cốt lõi: NguoiDung–HocVien/GiaoVien; KhoaHoc–LopHoc; GiaoVien–LopHoc; HocVien–DangKyLop–LopHoc; LopHoc–BuoiHoc; BuoiHoc–DiemDanh–HocVien; LopHoc–BaiKiemTra–DiemSo–HocVien.

Điểm cần bổ sung trong tài liệu:

- LopHoc thực tế có FK `course_id` tới KhoaHoc; bảng LopHoc trong mục 3.3.2 tài liệu đang thiếu trường khóa ngoại này.
- HocVien.user_id và GiaoVien.user_id là UNIQUE, tạo quan hệ tối đa một hồ sơ mỗi loại trên một tài khoản.
- Unique ghép chống ghi danh, điểm danh và điểm số trùng như phần đối chiếu.
- Hành vi xóa khác nhau theo quan hệ: có CASCADE, RESTRICT và SET NULL; không nên mô tả chung tất cả là xóa dây chuyền.
- Tài liệu dùng `ma_vai_tro_nguoi_dung` ở NguoiDung nhưng bảng danh mục ghi `ma_vai_tro`; cần thống nhất nếu vẫn giữ thiết kế danh mục trong bản tài liệu.

## 7. Thứ tự đồng bộ đề xuất

1. Chốt các yêu cầu nghiệp vụ còn thiếu: trọng số điểm, link vào học, liên hệ khẩn cấp, mô tả khóa học, dạy thay và trạng thái buổi học. Đây là các mục cần quyết định sửa triển khai hay sửa phạm vi tài liệu.
2. Cập nhật tài liệu theo PostgreSQL, 21 bảng hiện có, tên cột vật lý, 13 enum và các ràng buộc thực tế. Việc chuyển bảng danh mục sang enum tự nó không phải lỗi nếu phù hợp nhu cầu cấu hình.
3. Bổ sung 9 bảng mở rộng, cập nhật ERD và đánh lại số bảng/hình.
4. Tách rõ các bảng đã tồn tại với nghiệp vụ/API đã hoàn thiện, đặc biệt bảo lưu và chuyển lớp.
5. Thiết lập migration history/baseline cho các thay đổi tiếp theo. Repository hiện chưa có thư mục migration; README đang hướng dẫn khởi tạo bằng prisma db push.

Metadata bằng chứng: `database-live-metadata.json`. File chỉ chứa cấu trúc bảng, enum, khóa và chỉ mục; không chứa bản ghi nghiệp vụ hoặc chuỗi kết nối.
