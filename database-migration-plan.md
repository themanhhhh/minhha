# Kế hoạch đồng bộ database và chức năng Riki LMS theo tài liệu

Ngày lập: 06/11/2026. Bản kế hoạch gốc được giữ để đối chiếu. **Migration đã được áp dụng ngày 06/11/2026; xem [kết quả triển khai](database-implementation.md) để biết trạng thái hiện tại và các quyết định thiết kế khi thực hiện.**

Phạm vi đã được người dùng chọn: **khôi phục 17 bảng trong tài liệu, giữ chức năng và các bảng mở rộng đang có**.

Nguồn: [tài liệu đề án](https://docs.google.com/document/d/1YhzTA_TmljkbPkn9ic07Zvcy_-uZYfH1W24DVUsScsg), đặc biệt mục 3.3.2; schema Prisma; backend/frontend hiện tại; metadata và kết quả truy vấn tổng hợp từ database đang chạy. Tham khảo `database-comparison.md`, `database-live-metadata.json`, `database-migration-preflight.json` trong thư mục gốc dự án.

## 1. Thiết kế đích và nguyên tắc

1. Tiếp tục dùng PostgreSQL/Supabase. Tài liệu đang mâu thuẫn MySQL/SQL Server nên không lấy đó làm yêu cầu đổi hệ quản trị. Đồng bộ thiết kế bảng, trường và quan hệ trong môi trường hiện tại.
2. Tạo lại 5 bảng danh mục đang được triển khai bằng enum; khôi phục tên và trường vật lý theo tài liệu; giữ ID của dữ liệu hiện hữu.
3. Giữ 9 bảng mở rộng: RefreshToken, PasswordResetToken, BaiTap, TepBaiTap, NopBai, TepNopBai, TaiLieuLop, AuditLog, ThongBao. Dự kiến đích có **26 bảng ứng dụng** trong public, chưa tính bảng lịch sử migration.
4. Giữ các cột mở rộng cần cho chức năng hiện tại: mã học viên/giáo viên/khóa học/lớp, timestamps, trạng thái ghi danh, trạng thái yêu cầu, maxScore, ghi chú, liên kết khóa học–lớp, dữ liệu tài liệu/file. Không xóa chúng chỉ vì chưa có trong bảng đặc tả.
5. Dùng `@map`/`@@map` để tên cột/bảng vật lý khớp tài liệu nhưng giữ tên thuộc tính và model TypeScript khi phù hợp. Giữ API trả về mã ổn định như STUDENT, ACTIVE, N5, PRESENT; ID danh mục là chi tiết lưu trữ.
6. Không dùng `prisma db push --accept-data-loss`, reset database hoặc chạy lại seed xóa dữ liệu để chuyển đổi. Dùng SQL migration có kiểm soát, backfill và kiểm tra tính toàn vẹn.
7. Chỉ loại bỏ cột/enum cũ khi phiên bản ứng dụng mới đã vận hành và kiểm tra đầy đủ. Không cam kết không gián đoạn: đổi tên vật lý cần một lần chuyển ứng dụng và database có kiểm soát.

## 2. Dữ liệu hiện tại đã kiểm tra

Snapshot truy vấn tổng hợp lúc 16:31 ngày 06/11/2026, UTC+7. Các số liệu có thể thay đổi trước thời điểm migration và phải đo lại.

| Chỉ số | Kết quả | Ý nghĩa cho migration |
| --- | ---: | --- |
| Người dùng / học viên | 46 / 36 | Giữ nguyên ID, mật khẩu băm và liên kết hồ sơ |
| Học viên thiếu ngày sinh | 0 | Hiện có thể chuyển ngày sinh sang NOT NULL; vẫn đo lại trước khi áp dụng |
| Tài khoản đang hoạt động | 46 | Seed trạng thái khác vẫn cần dù hiện chưa có bản ghi sử dụng |
| Số điện thoại giáo viên hiện có | 8 | Chuyển sang NguoiDung.sdt theo FK người dùng |
| Nhóm số điện thoại giáo viên trùng, trước chuẩn hóa | 0 | Cần kiểm tra lại sau chuẩn hóa và trên toàn bộ dữ liệu |
| Buổi học | 156 | Ghép ngày và giờ thành thời điểm đầy đủ, giữ lịch hiển thị |
| Điểm danh LATE | 228 | Phải giữ trạng thái đi muộn khi tạo danh mục |
| Bài kiểm tra khác thang 10 / điểm ngoài 0–10 | 0 / 0 | Dữ liệu hiện tại phù hợp thang điểm trong Use Case |
| Ghi danh ACTIVE / COMPLETED | 169 / 14 | Sĩ số đang học phải đếm ACTIVE, không đếm cả 183 lượt |
| Bảo lưu / chuyển lớp | 0 / 0 | Hiện chưa có dữ liệu cần chuyển; vẫn thiết kế đầy đủ nghiệp vụ |
| Bài tập / thông báo | 27 / 19 | Bắt buộc giữ bảng và liên kết |
| Lượt nộp / tài liệu lớp | 0 / 0 | Giữ tính năng; không suy ra bảng không cần thiết từ việc đang trống |
| Vượt độ dài tài liệu ở các nhóm đã đo | 0 | Đã đo tên/email người dùng, điện thoại giáo viên, tên/lịch lớp, tên/nội dung/record buổi học; chưa thay thế kiểm tra toàn bộ cột trước migration |

## 3. Khôi phục 5 bảng danh mục

Thêm trường `code` UNIQUE bên cạnh ID và tên trong tài liệu. Đây là phần mở rộng để ứng dụng nhận diện nghiệp vụ ổn định, không phụ thuộc số ID hay tên tiếng Việt có thể đổi.

| Bảng mới | Cột theo tài liệu | Mã cần chuyển từ enum | Các FK sử dụng |
| --- | --- | --- | --- |
| TrangThaiNguoiDung | ma_trang_thai INT PK; ten_trang_thai VARCHAR(50) NOT NULL | ACTIVE, INACTIVE, LOCKED | NguoiDung.ma_trang_thai |
| VaiTroNguoiDung | ma_vai_tro INT PK; ten_vai_tro VARCHAR(50) NOT NULL | STUDENT, TEACHER, ACADEMIC_STAFF, DIRECTOR | NguoiDung.ma_vai_tro_nguoi_dung |
| TrinhDoJLPT | ma_trinh_do_jlpt INT PK; ten_trinh_do VARCHAR(10) NOT NULL | N5, N4, N3, N2, N1 | GiaoVien; mở rộng tới trình độ hiện tại/mục tiêu của HocVien và cấp độ KhoaHoc |
| TrangThaiDiemDanh | ma_trang_thai_diem_danh INT PK; ten_trang_thai VARCHAR(50) NOT NULL | PRESENT, ABSENT, LATE | DiemDanh.ma_trang_thai_diem_danh |
| LoaiBaiKiemTra | ma_loai_bai_kiem_tra INT PK; ten_loai_bai VARCHAR(50) NOT NULL; trong_so FLOAT | QUIZ, MIDTERM, FINAL, JLPT | BaiKiemTra.ma_loai_bai_kiem_tra |

NguoiDung dùng tên FK `ma_vai_tro_nguoi_dung` như bảng NguoiDung trong tài liệu, tham chiếu PK `VaiTroNguoiDung.ma_vai_tro`; hai cột không bắt buộc cùng tên. Không coi khác tên FK/PK là lỗi quan hệ.

Backfill theo `code`, kiểm tra mỗi mã cũ có đúng một mã đích, sau đó mới thêm NOT NULL/FK và bỏ cột enum cũ. Enum khác như trạng thái lớp/ghi danh và thông báo được giữ vì vẫn phục vụ phần mở rộng.

Chuyển các hằng nghiệp vụ đang import từ enum Prisma sắp bị bỏ sang module hằng/type miền nghiệp vụ. `@Roles`, JWT và frontend vẫn dùng role code; query Prisma chuyển từ `role: 'STUDENT'` sang FK hoặc relation filter. Không cho đổi code của các vai trò hệ thống qua màn hình cấu hình danh mục.

## 4. Thay đổi 12 bảng nghiệp vụ tương ứng

Tên vật lý theo tài liệu là mục tiêu cuối cùng; các tên tiếng Anh dưới đây là thuộc tính hiện có để đối chiếu. Danh sách cột chi tiết cuối cùng phải xuất thành data dictionary trước khi tạo migration.

| Bảng đích | Thay đổi database | Cách chuyển dữ liệu và lưu ý |
| --- | --- | --- |
| NguoiDung | id → ma_nguoi_dung; full_name → ho_ten VARCHAR(100); password_hash → mat_khau; thêm sdt VARCHAR(12) UNIQUE nullable; role/status → hai FK danh mục; email VARCHAR(255) UNIQUE NOT NULL | Giữ password hash nguyên trạng. Chuyển GiaoVien.phone sang sdt theo user_id. Không sinh điện thoại giả cho tài khoản chưa có. Kiểm tra độ dài, chuẩn hóa số điện thoại, trùng lặp trước UNIQUE. Giữ last_login_at, created_at, updated_at. |
| HocVien | id/user_id/date_of_birth → ma_hoc_vien/ma_nguoi_dung/ngay_sinh; ngay_sinh NOT NULL; thêm muc_tieu VARCHAR(255), lien_he_khan_cap VARCHAR(255) | Khởi tạo muc_tieu từ targetLevel có sẵn dưới dạng văn bản có nguồn gốc; vẫn giữ targetLevel có cấu trúc dưới dạng FK để lọc/báo cáo. Liên hệ khẩn cấp NULL nếu chưa có. Giữ mã, giới tính và trình độ hiện tại. |
| GiaoVien | id/user_id → ma_giao_vien/ma_nguoi_dung; jlpt_level → FK ma_trinh_do_jlpt | Giữ mã giáo viên và timestamps. Đọc điện thoại từ người dùng; chỉ bỏ phone cũ sau đối soát. Giữ UNIQUE trên FK người dùng. |
| KhoaHoc | id/name/total_lessons/tuition → ma_khoa_hoc/ten_khoa_hoc/so_buoi_hoc/hoc_phi; hoc_phi numeric(15,2); thêm mo_ta VARCHAR(255) | Mô tả ban đầu NULL. Giữ mã khóa học, trạng thái và cấp độ; cấp độ liên kết TrinhDoJLPT. Kiểm tra tên quá 100 ký tự trước thu hẹp. |
| LopHoc | id/teacher_id/name/start_date/end_date → các trường ma_lop_hoc/ma_giao_vien/ten_lop_hoc/ngay_khai_giang/ngay_ket_thuc; schedule → lich_hoc; capacity → si_so_toi_da; thêm ca_hoc, si_so_hien_tai, link_vao_hoc | Giữ FK khóa học dù bảng đặc tả thiếu. Không tự tách lịch chuỗi nếu không chắc định dạng; sinh danh sách lịch cần hoàn thiện. Không dùng record_url thay link vào học và không tự coi room là URL. Backfill sĩ số từ ghi danh ACTIVE. |
| DangKyHoc | Đổi tên DangKyLop; id/student_id/class_id/enrolled_at → ma_dang_ky/ma_hoc_vien/ma_lop_hoc/ngay_tham_gia DATE | Giữ ID, unique học viên–lớp, trạng thái và left_at. Giữ thêm timestamp đăng ký gốc để không mất thời gian chi tiết khi chuyển sang DATE. |
| DiemSo | id/test_id/student_id/value → ma_diem_so/ma_bai_kiem_tra/ma_hoc_vien/so_diem; FLOAT theo tài liệu, ánh xạ PostgreSQL double precision | Sao chép giá trị numeric hiện tại; kiểm tra sai số trong ngưỡng làm tròn nghiệp vụ. Giữ unique học viên–bài kiểm tra và ghi chú. Dùng số học chính xác khi tổng hợp/làm tròn hiển thị; không so sánh float bằng tuyệt đối. |
| ChuyenLop | Đổi tên LichSuChuyenLop; các FK/lý do theo tài liệu; thêm ngay_chuyen_lop DATE | Không đồng nhất thời điểm tạo yêu cầu với ngày thực sự chuyển. Ngày chuyển chỉ được điền khi thực hiện thành công; giữ trạng thái yêu cầu và timestamps như phần mở rộng. Không ép NOT NULL dữ liệu chưa được thực hiện. |
| BaoLuu | Đổi tên trường theo tài liệu; thêm ngay_bao_luu DATE, thoi_han_bao_luu INT (tháng), trang_thai_bao_luu BOOLEAN | Giữ trạng thái duyệt và end_date mở rộng. Boolean biểu diễn bảo lưu đang hiệu lực; cập nhật đồng bộ khi duyệt, hết hạn, hủy, quay lại học. Hiện bảng trống; nếu phát sinh dữ liệu trước migration thì phải xử lý khoảng ngày không tương ứng tháng tròn, không làm tròn ngầm. |
| BuoiHoc | id/class_id/title/content/record_url → ma_buoi_hoc/ma_lop_hoc/ten_buoi_hoc/noi_dung_buoi_hoc/link_record; ghép lesson_date+start_time/end_time → thoi_gian_bat_dau/thoi_gian_ket_thuc | PostgreSQL không có DATETIME: đề xuất timestamptz(0), lưu thời điểm đầy đủ, diễn giải lịch gốc ở Asia/Ho_Chi_Minh (UTC+7). Phải kiểm tra mẫu lịch thật trước khi chốt quy tắc; API tiếp tục trả ngày/giờ địa phương. Giữ trạng thái và timestamps. |
| DiemDanh | id/lesson_id/student_id/note → ma_diem_danh/ma_buoi_hoc/ma_hoc_vien/ghi_chu; status → FK danh mục | Giữ cả 228 bản ghi LATE; không gộp thành vắng/có mặt để vừa mô tả hai trạng thái. Giữ unique học viên–buổi. |
| BaiKiemTra | id/class_id/name/test_date → ma_bai_kiem_tra/ma_lop_hoc/ten_bai_kiem_tra/ngay_kiem_tra; type → FK LoaiBaiKiemTra | Giữ maxScore để không làm hỏng hợp đồng hiện tại; mọi bài hiện có đều thang 10. Cập nhật query lấy tên loại và trọng số. |

Mọi FK từ 9 bảng mở rộng phải được chuyển sang tên PK vật lý mới nhưng giữ giá trị ID. Giữ chính sách CASCADE/RESTRICT/SET NULL hiện có trừ khi có yêu cầu nghiệp vụ cụ thể thay đổi. Các sequence của PK phải tiếp tục sinh ID lớn hơn ID hiện có.

## 5. Những chỗ tài liệu chưa đủ để áp dụng máy móc

Đây là quyết định thiết kế cần được ghi rõ trong bản đặc tả đích, không mặc định là yêu cầu đã có trong tài liệu:

- **Trọng số:** tài liệu có cột nhưng không có giá trị seed hoặc công thức cho nhiều bài cùng loại. Đề xuất lấy trung bình từng loại trong từng lớp rồi áp dụng trọng số; không tự điền QUIZ/MIDTERM/FINAL thành một tỷ lệ bất kỳ.
- **Bảo lưu:** có Boolean và thời hạn tháng nhưng chưa có quy trình duyệt/quay lại. Giữ trạng thái duyệt của dự án, đồng bộ Boolean từ nghiệp vụ. Dùng tháng lịch, quy định rõ ngày cuối tháng, ngày kết thúc và lịch chạy cập nhật hết hạn.
- **Ca học:** tài liệu chưa định nghĩa định dạng ca. Cần chọn chuỗi giờ/nhãn ca và quy tắc cho lớp học nhiều ca, không dùng một giờ đầu tiên đại diện cho mọi buổi nếu lịch khác nhau.
- **Trạng thái buổi học và dạy thay:** yêu cầu văn bản có Đang học/Hoãn và giáo viên thay, nhưng bảng BuoiHoc không có các cột này. Giữ trạng thái hiện có; bổ sung IN_PROGRESS/POSTPONED và FK giáo viên theo buổi như phần mở rộng để đáp ứng yêu cầu, kèm sửa phân quyền dạy thay. Không ánh xạ CANCELLED sang POSTPONED vì khác ý nghĩa.
- **Sĩ số:** tài liệu yêu cầu lưu cột; chọn ACTIVE là tiêu chí đếm người đang học. Một học viên bảo lưu không chiếm chỗ trong phương án đề xuất; nếu trung tâm muốn giữ chỗ thì phải đổi quy tắc trước triển khai.
- **Doanh thu:** dữ liệu học phí khóa học không chứng minh đã thu tiền. Giữ báo cáo học tập/vận hành; không thêm thu chi hoặc gọi tổng học phí dự kiến là doanh thu thực thu trong migration này.

## 6. Ma trận ảnh hưởng chức năng

| Nhóm chức năng | Backend/API phải sửa | Frontend phải sửa/kiểm tra | Điều kiện hoàn tất |
| --- | --- | --- | --- |
| Đăng nhập, refresh, đăng xuất, khôi phục mật khẩu | auth.service.ts: include/map role và status từ danh mục; createSession/toSafeUser nhận role code; token FK cập nhật theo PK mới; không đổi hash/token đang lưu | auth.service.ts, các trang login/forgot/reset, app-sidebar và navigation giữ role code | Bốn vai trò đăng nhập và refresh đúng, token cũ còn hiệu lực đúng chính sách; không mất phiên do đổi tên bảng |
| Phân quyền toàn hệ thống | auth.types.ts, roles.decorator.ts, roles.guard.ts; mọi @Roles và import enum Prisma; TeachingAccessService và check quyền riêng trong lessons/teacher-content/notifications | config/navigation.ts, dashboard shell, sidebar và điều hướng theo vai trò | Mỗi vai trò vẫn chỉ đọc/ghi đúng phạm vi; danh mục mới không cấp nhầm quyền |
| Quản lý tài khoản | users.service.ts và list-user.dto.ts đổi filter/select role/status sang relation; expose phone và mã trạng thái | academic/users, user-account.service.ts, types/user-account.ts, nhãn/bộ lọc ResourceTable | Lọc theo mã vai trò/trạng thái trả đúng dữ liệu |
| Hồ sơ, quản lý học viên | students service/DTO: ngày sinh bắt buộc, mục tiêu văn bản, liên hệ khẩn cấp, phone từ User; query trình độ theo FK; tách accountStatus khỏi learningStatus | student.schema.ts; student-management/profile; student.service.ts và student-profile.service.ts; các type và form | Thêm/sửa/đọc được trường mới; lọc bảo lưu/hoàn thành không gửi nhầm UserStatus |
| Hồ sơ, quản lý giáo viên | teachers service/DTO lấy phone từ User, resolve FK trình độ | academic/teachers, teacher-profile, teacher.service.ts và teacher-profile.service.ts | Điện thoại/trình độ không mất sau chuyển đổi; báo cáo giáo viên vẫn đúng |
| Danh mục | Module/API lookup mới cho 5 bảng; cập nhật trọng số chỉ dành học vụ, validate mã hệ thống/đang được tham chiếu | Dropdown loại bài, trình độ, điểm danh; phần cấu hình trọng số dành học vụ | Không hardcode ID; không xóa danh mục đang được dùng; chưa có trọng số hợp lệ thì không công bố điểm tổng kết |
| Khóa học | courses service/DTO thêm mô tả, đổi relation cấp độ và precision học phí | academic/courses, course.service.ts, types/resources.ts; form/chi tiết nếu hiện chỉ là nút placeholder | CRUD thực sự lưu được mô tả; học phí không đổi giá trị |
| Lớp học, lịch lớp, link vào học | classes service/DTO thêm ca và meetingUrl; select FK mới; duy trì sĩ số; API chi tiết lớp trả link đúng quyền | academic/classes, teacher-classes/detail, student-classes/detail; class/teacher-class/student-class services và types | Học viên/giáo viên đúng lớp có nút vào học; link record vẫn tách riêng |
| Ghi danh, hủy ghi danh | enrollment đổi tên bảng; transaction khóa lớp/cập nhật sĩ số; quy tắc active/completed; upsert tái ghi danh | Danh sách thành viên lớp và các service đọc sĩ số | Không vượt sức chứa khi hai yêu cầu đồng thời; không đếm COMPLETED vào sĩ số đang học |
| Chuyển lớp | Module/API mới; transaction cập nhật ghi danh lớp cũ/mới, lịch sử chuyển, ngày chuyển, sĩ số hai lớp, kiểm tra capacity và quyền học vụ | Luồng chọn lớp đích, lý do và lịch sử tại hồ sơ/lớp học vụ; invalidation cache hai lớp | Chuyển đúng một lần; lỗi bất kỳ rollback toàn bộ; điểm/điểm danh cũ giữ ở lớp cũ |
| Bảo lưu, quay lại học | Module/API mới; trạng thái yêu cầu, Boolean, thời hạn tháng, ghi danh và sĩ số cập nhật một transaction; xử lý hết hạn có thể chạy lại an toàn | Form bảo lưu/duyệt/quay lại, lịch sử tại hồ sơ; nhãn/bộ lọc learningStatus | Duyệt/hủy/hết hạn/quay lại nhất quán; chỗ trống kiểm tra lại khi quay lại lớp |
| Buổi học, lịch, record | lessons service/DTO đổi lọc/sort/xung đột lịch từ date+time sang full datetime; trả DTO ngày/giờ tương thích; nếu thêm dạy thay thì sửa access theo buổi | academic/lessons; lịch học viên, lịch dashboard; lesson.service.ts; teacher-assessment.service.ts; nút record | Không lệch ngày/giờ UTC+7; giữ 156 buổi; trùng lịch và quyền dạy thay được kiểm tra |
| Điểm danh | Attendance service/DTO resolve status code ↔ FK; query danh mục; giữ NULL chưa điểm danh; cập nhật notifications và audit | teacher-attendance.tsx, teacher-assessment.service.ts, student-progress, types/resources/teacher-assessment | PRESENT/ABSENT/LATE giữ nguyên ý nghĩa; chưa điểm danh không tự thành ABSENT |
| Bài kiểm tra, nhập điểm | Scores service/DTO và API loại bài; lấy trọng số; field mapping Score/Test | teacher-scores.tsx, teacher-assessment.service.ts, score.service.ts; hiển thị loại/trọng số/thang điểm | Bảng điểm vẫn lưu/xóa điểm rỗng đúng; trường ghi chú giữ nguyên |
| Tiến độ, điểm trung bình | Hàm tổng hợp dùng chung cho students, student-portal và reports; công thức ở mục 7 | student-progress, dashboard và biểu đồ director; phân biệt trung bình một bài với tổng kết có trọng số | Các nơi hiển thị tổng kết của cùng học viên/lớp cho cùng kết quả |
| Dashboard, báo cáo, xuất dữ liệu | reports.service.ts: role/status/level lookup; enrollment ACTIVE, lịch mới, công thức điểm; rà toàn bộ filter | director dashboard/reports, dashboard-overview, report/director/dashboard services; đầu xuất file nếu có | Lọc không kéo dữ liệu lớp khác; điểm và sĩ số nhất quán giữa bảng/biểu đồ/file |
| Bài tập, tài liệu, nộp bài | Giữ model/service/storage; sửa FK và các query lồng class/user/lesson khi cần | teacher-class-content, student-assignment-detail, student-class-detail | Giữ 27 bài tập; upload/download/signed URL và quyền lớp vẫn hoạt động |
| Thông báo, nhật ký | notifications/audit giữ cấu trúc; sửa resolve role/enrollment và tham chiếu ID; entity name mapping nếu cần | student notifications, class-broadcast-form, header unread badge | Giữ 19 thông báo, không phát lại toàn bộ thông báo khi backfill |
| Seed, môi trường dev | prisma/seed.ts tạo lookup trước dữ liệu; baseline và migration; sửa tài liệu chạy dự án | Mock/types/fixtures cùng hợp đồng API; chạy xác nhận bằng API thật | Seed dev hoạt động với schema mới và không được dùng thay migration dữ liệu thật |

Những phần CRUD còn là nút hoặc tab placeholder phải được tính là hạng mục bổ sung giao diện, không chỉ đổi type rồi coi chức năng đã hoàn tất. Bảo lưu/chuyển lớp hiện có bảng nhưng chưa tìm thấy API backend tương ứng.

## 7. Quy tắc nghiệp vụ cần triển khai đồng bộ

### 7.1. Điểm có trọng số

Đề xuất công thức trên mỗi học viên, mỗi lớp:

1. Quy đổi điểm từng bài về thang 10 nếu maxScore khác 10.
2. Tính trung bình các bài của cùng loại.
3. Điểm tổng kết = tổng(trung bình loại × trọng số loại) / tổng trọng số các loại bắt buộc; trọng số biểu diễn thống nhất theo phần trăm và tổng bằng 100 cho cấu hình áp dụng.
4. Điểm chưa nhập là thiếu dữ liệu, không phải 0. Tổng kết chính thức chỉ có khi đủ bài/loại bắt buộc. Có thể hiển thị trung bình tạm tính của các loại đã chấm, nhưng phải gắn nhãn và không dùng làm kết quả hoàn thành.
5. Chốt cách loại JLPT tham gia tổng kết trước khi seed trọng số. Các loại dùng để tham khảo không được vô tình làm tổng trọng số vượt 100.
6. Khi sửa trọng số đang áp dụng, hiển thị tác động tới các lớp/bảng điểm. Đề xuất khóa cấu hình với lớp đã chốt điểm; nếu cần nhiều cấu hình theo khóa/lớp hoặc lịch sử trọng số thì cần thiết kế mở rộng riêng, không giả định tài liệu đã cung cấp.
7. Backend dùng một hàm tổng hợp có kiểm thử; chỉ làm tròn ở bước cuối theo quy tắc công bố. Không gộp điểm thô của nhiều lớp thành một kết quả nếu chưa có định nghĩa nghiệp vụ.

### 7.2. Sĩ số lưu trong LopHoc

Đề xuất dùng trigger PostgreSQL duy trì `si_so_hien_tai` từ các bản ghi ghi danh ACTIVE, do tài liệu yêu cầu cột này. Trigger xử lý INSERT/UPDATE/DELETE, đổi lớp và thay trạng thái; không đồng thời tăng/giảm bằng code ứng dụng để tránh cộng hai lần.

Các lệnh ghi danh/chuyển lớp/bảo lưu/quay lại khóa hàng lớp có liên quan trong transaction; khóa hai lớp theo thứ tự ID để hạn chế deadlock. Khi kích hoạt một ghi danh phải kiểm tra sức chứa ngay trong cùng transaction. Thêm CHECK 0 ≤ sĩ số hiện tại ≤ sĩ số tối đa; quy định giảm sức chứa dưới sĩ số hiện tại là thao tác không hợp lệ.

Có truy vấn đối soát `si_so_hien_tai` với COUNT ghi danh ACTIVE; lệch bất kỳ lớp nào phải ngăn nghiệm thu migration. Toàn bộ API trả studentCount từ cùng một nguồn và cùng tiêu chí.

### 7.3. Trạng thái và quyền truy cập

- `accountStatus` là hoạt động/khóa tài khoản; `enrollmentStatus` là trạng thái tham gia từng lớp; `learningStatus` là trạng thái học tập tổng hợp. Không dùng một chuỗi `status` để thay cả ba.
- Đề xuất learningStatus: ACTIVE khi có lớp ACTIVE; nếu không, RESERVED khi có bảo lưu hiệu lực; nếu không, COMPLETED khi có lịch sử hoàn thành; còn lại WAITING. Trả thêm trạng thái từng lớp để không mất chi tiết khi học nhiều lớp.
- Phiên đăng nhập giữ role code, không chuyển JWT hoặc localStorage sang role ID. Khi một người bị khóa/đổi quyền, xác định thời điểm quyền mới có hiệu lực và bảo đảm không tiếp tục cho phép ghi bằng token cũ quá chính sách hiện tại.
- Với dạy thay: quyền ghi theo buổi được giao; không mặc nhiên cho giáo viên dạy thay quyền sửa toàn bộ lớp hoặc điểm kiểm tra.

## 8. Các vấn đề đã thấy trong code cần sửa cùng đợt

| Vị trí | Hiện trạng | Hạng mục sửa |
| --- | --- | --- |
| apps/api/src/modules/students/dto/list-student.dto.ts | Bộ lọc status nhận UserStatus, trong khi UI gửi RESERVED/WAITING/COMPLETED | Tách bộ lọc tài khoản và học tập; query qua ghi danh/bảo lưu |
| apps/web/src/services/student.service.ts và student-profile.service.ts | Ánh xạ mọi trạng thái khác ACTIVE thành WAITING; trình độ NULL thành N5 | Ánh xạ đúng learningStatus; giữ thiếu dữ liệu là thiếu, không gán trình độ giả |
| apps/api/src/modules/classes/classes.service.ts | Có nơi đếm mọi enrollment để hiển thị/kiểm tra capacity | Dùng sĩ số ACTIVE nhất quán và kiểm soát cạnh tranh ghi danh |
| apps/api/src/modules/students/students.service.ts | Tỷ lệ chuyên cần chỉ đếm PRESENT | Thống nhất LATE có được tính tham dự với cổng học viên/báo cáo; đề xuất có, đồng thời báo số đi muộn riêng |
| apps/api/src/modules/reports/reports.service.ts | Nhiều trung bình cộng rải rác; một số tập attendance/score chưa áp toàn bộ bộ lọc lớp/giáo viên | Dùng hàm tổng hợp chung; đưa mọi bộ lọc vào cùng tập dữ liệu báo cáo |
| apps/web/src/services/teacher-assessment.service.ts | Điểm danh chưa có mặc định thành ABSENT | Giữ trạng thái chưa điểm danh; không tự tạo vắng khi lưu cả bảng |
| apps/web/src/services/lesson.service.ts | CANCELLED bị chuyển thành UPCOMING | Giữ đúng trạng thái và nhãn; bổ sung hoãn/đang diễn ra khi triển khai phần mở rộng |
| apps/web/src/features/teachers/components/teacher-scores.tsx | UI giới hạn cứng 0–10 trong khi backend có maxScore | Thống nhất thang 10 theo tài liệu, hoặc lấy maxScore từ API; không để hai phía tự quy định khác nhau |
| Các service frontend chuyển BigInt ID sang Number | Có thể mất chính xác với ID lớn | Với đợt này giữ ID hiện có và kiểm tra hợp đồng; nếu mở rộng quy mô ID thì chuyển ID sang chuỗi đồng bộ, không đổi nửa chừng một module |

## 9. Thứ tự thực hiện và đầu ra

| Giai đoạn | Công việc | Đầu ra và điều kiện chuyển tiếp |
| --- | --- | --- |
| 0. Chốt đặc tả | Chốt data dictionary 26 bảng, tên/cỡ cột, FK, ca học, trọng số, bảo lưu, lịch UTC+7 và phần mở rộng | Schema đích + bảng mapping từng trường + danh sách dữ liệu chưa thể suy ra |
| 1. Bảo toàn và baseline | Backup database; thử restore vào môi trường tách biệt; ghi nhận số lượng, ID/FK, giá trị điểm và file metadata; baseline migration cho schema thực tế | Backup phục hồi được; baseline khớp database hiện tại. Không chạy migrate dev trực tiếp trên database đang dùng |
| 2. Mở rộng và chuyển dữ liệu | Tạo 5 lookup, thêm cột mới dạng nullable khi cần, backfill, chuyển phone, ghép lịch, tính sĩ số; giữ dữ liệu nguồn | Migration SQL có thể thử trên bản sao; báo cáo thiếu mapping/trùng/quá dài/FK hỏng đều bằng 0 trước ràng buộc |
| 3. Backend | Sửa lookup query/domain constants/auth; module tài khoản/hồ sơ/khóa/lớp/buổi; điểm và báo cáo; giữ API DTO tương thích; thêm nghiệp vụ bảo lưu/chuyển lớp | API và test tích hợp trên bản sao database; transaction sĩ số và quyền truy cập đúng |
| 4. Frontend | Cập nhật service/type/schema/form/dropdown; link vào học; trọng số/learningStatus; màn hình bảo lưu/chuyển lớp; sửa mapper trạng thái | Các luồng UI hoạt động bằng API thật, không chỉ dữ liệu mock; cache được invalidation sau thay đổi |
| 5. Diễn tập | Chạy migration từ backup mới nhất; build/typecheck/tests; đối soát dữ liệu; thử rollback và đo thời gian | Có biên bản số liệu trước/sau và thời gian dừng ghi dự kiến, không ước lượng trước khi đo |
| 6. Chuyển sang schema mới | Dừng ghi từ API/job; backup/delta cuối; chạy SQL đổi tên vật lý và ràng buộc; triển khai API/web cùng phiên bản; generate Prisma Client trong bản build | Smoke test bốn vai trò, CRUD, lịch, điểm, sĩ số và file đạt; mở ghi lại sau khi kiểm tra |
| 7. Dọn dẹp sau ổn định | Xóa cột/enum tạm và đường tương thích cũ bằng migration riêng; cập nhật ERD/tài liệu/README/seed | Không còn client cũ cần schema cũ; mọi dữ liệu nguồn đã bảo toàn hoặc có mapping kiểm chứng |

Thứ tự phụ thuộc: lookup/auth → người dùng/hồ sơ → khóa/lớp/ghi danh → buổi/điểm danh/điểm → báo cáo/cổng học viên. Frontend cập nhật sau khi chốt hợp đồng API của từng nhóm, không chờ đổi tên xong mới rà tác động.

Thay đổi vật lý có thể làm bản ứng dụng cũ không đọc được schema mới. Phương án mặc định là một cửa sổ bảo trì ngắn sau diễn tập; chưa hứa hỗ trợ đồng thời hai phiên bản. Nếu cần triển khai không dừng, phải thêm thiết kế ghi song song và đồng bộ cột cũ/mới trước bước đổi tên, kèm kiểm thử riêng.

## 10. Kiểm thử và tiêu chí nghiệm thu

Không chỉ chạy typecheck. Các kiểm thử tập trung vào lỗi có thể mất dữ liệu, sai quyền, sai lịch hoặc sai báo cáo.

| Nhóm kiểm thử | Trường hợp bắt buộc |
| --- | --- |
| Migration | Giữ đủ bản ghi, tập ID, FK, chuỗi mật khẩu băm, điểm, URL record, 228 LATE, 27 bài tập, 19 thông báo tại snapshot; đo lại số thực tế trước cutover; lookup có mapping duy nhất; lần chạy backfill lại không nhân bản dữ liệu |
| Lookup/FK | Mã không tồn tại bị từ chối; danh mục đang dùng không xóa được; unique user/hồ sơ và học viên/lớp/buổi/bài kiểm tra còn hiệu lực |
| Auth/quyền | Bốn vai trò; tài khoản bị khóa; refresh/logout/reset; không lộ phone/liên hệ khẩn cấp cho người ngoài phạm vi; học viên không đọc lớp khác |
| Lịch | Mẫu trước/sau nửa đêm UTC+7, lọc ngày, thứ tự, trùng giờ giáo viên; ngày bắt đầu/kết thúc; hoãn/hủy; dạy thay theo đúng quyền |
| Sĩ số | Ghi danh mới, hủy, tái ghi danh, hoàn thành, bảo lưu, quay lại, chuyển hai lớp; hai yêu cầu tranh chỗ cuối; rollback lỗi giữa chừng; đối soát COUNT ACTIVE |
| Điểm danh | Chưa điểm danh/PRESENT/ABSENT/LATE, lưu lại không trùng, không tự chuyển chưa điểm danh thành vắng, chuyên cần giống nhau mọi nơi |
| Điểm | Ví dụ QUIZ hai bài 6 và 8, MIDTERM 8, FINAL 9; trọng số mẫu kiểm thử 20/30/50 cho kết quả 8.3. Đây chỉ là fixture, không phải cấu hình thật. Kiểm tra thiếu bài, trọng số lỗi, bài khác thang, làm tròn và lớp đã chốt |
| Bảo lưu/chuyển lớp | Ngày cuối tháng, hết hạn, chưa duyệt, hủy, quay lại lớp đầy, chuyển lớp khác cấp độ theo chính sách, yêu cầu lặp; lịch sử/điểm cũ không mất |
| Báo cáo | Cùng bộ lọc lớp/giáo viên/thời gian có cùng số liệu trên bảng, biểu đồ, API và đầu xuất nếu có; không đếm COMPLETED vào sĩ số đang học |
| Chức năng mở rộng | Tạo bài tập, nộp file, tài liệu, signed URL, thông báo đã đọc/chưa đọc, audit actor và file metadata vẫn liên kết đúng sau đổi PK/FK |

Chạy các script typecheck/build hiện có của API và web, Vitest của API, kiểm tra schema Prisma và kiểm thử tích hợp trên database tách biệt. Xác minh lệnh lint frontend tương thích phiên bản Next.js hiện có trước khi đưa vào cổng nghiệm thu; không coi một script lint chưa chạy được là đã đạt.

Với file kế hoạch hiện tại chỉ kiểm tra nguồn và dữ liệu tổng hợp; các kiểm thử ứng dụng/migration ở bảng trên là công việc sẽ thực hiện khi triển khai, chưa được chạy.

## 11. Rollback

1. Mỗi bản migration gắn với phiên bản API/web, schema và manifest số liệu trước/sau. Sao lưu trước bước đổi tên/thu hẹp cột và giữ định nghĩa enum cũ tới khi hết giai đoạn ổn định.
2. Trước khi mở lại ghi, nếu kiểm tra thất bại: giữ ứng dụng ở trạng thái bảo trì, đảo các bước chuyển có thể đảo hoặc phục hồi snapshot, sau đó chạy bản ứng dụng cũ và đối soát lại.
3. Sau khi đã phát sinh ghi ở schema mới, không phục hồi snapshot cũ một cách đơn giản vì sẽ mất dữ liệu mới. Đóng ghi, xuất phần phát sinh, đánh giá migration ngược có bảo toàn được hay không; ưu tiên sửa tiến nếu dữ liệu mới không biểu diễn được ở schema cũ.
4. File trong Supabase Storage không tự phục hồi theo backup PostgreSQL. Giữ storagePath, file metadata và đối chiếu đường dẫn; không đổi/xóa file trong migration schema.

## 12. Phân biệt việc đã làm và việc sẽ làm

Đã làm: kiểm tra database thật, đối chiếu schema/tài liệu, đọc các dependency backend/frontend, đo một số ràng buộc dữ liệu và lập kế hoạch này.

Chưa làm: tạo schema đích, viết/chạy migration, sửa code, đổi bảng/cột, chuyển dữ liệu hoặc triển khai ứng dụng. Các quyết định còn thiếu trong tài liệu được ghi ở mục 5; bước 0 sẽ hoàn thiện chúng trước khi tạo migration áp dụng.
