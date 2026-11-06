# Kết quả triển khai đồng bộ database Riki LMS

Ngày triển khai: 06/11/2026. Migration đã commit lên Supabase lúc **17:14 UTC+7**.

## Database

- 26 bảng ứng dụng, 207 cột và 39 khóa ngoại: 17 bảng trong tài liệu và 9 bảng mở rộng được giữ lại; thêm `_prisma_migrations` để quản lý lịch sử triển khai.
- Khôi phục VaiTroNguoiDung, TrangThaiNguoiDung, TrinhDoJLPT, TrangThaiDiemDanh, LoaiBaiKiemTra và các FK số tương ứng.
- Đổi tên bảng ghi danh/chuyển lớp và tên các cột nghiệp vụ theo tài liệu; thêm điện thoại người dùng, mục tiêu tự do, liên hệ khẩn cấp, mô tả khóa học, ca học, sĩ số, link vào học, ngày chuyển lớp và thời hạn bảo lưu.
- Bổ sung thời điểm bắt đầu/kết thúc đầy đủ theo UTC+7, trạng thái đang học/hoãn và giáo viên dạy thay theo buổi.
- Dữ liệu gốc được so sánh checksum trong transaction trước COMMIT. Có sai khác sẽ rollback.
- `prisma migrate status` báo đã cập nhật; `prisma migrate diff` từ database thật tới schema cho kết quả migration rỗng.

Chi tiết cột và quan hệ: [database-schema.md](database-schema.md). Dữ liệu cấu trúc trước/sau: [database-live-metadata.json](database-live-metadata.json) và [database-after-metadata.json](database-after-metadata.json). File đầu là snapshot trước migration, không phải cấu trúc hiện tại.

### Các trường tương thích được giữ có chủ đích

Khác với phương án loại bỏ toàn bộ enum trong bản kế hoạch ban đầu, triển khai giữ các mã ổn định của API (role, status, level, attendance, test type) bên cạnh FK số của tài liệu. Trigger đồng bộ hai chiều và từ chối mã/FK mâu thuẫn. Tương tự, ngày/giờ tách rời vẫn được giữ làm biểu diễn tương thích cho API lịch học, được đồng bộ với hai timestamp đầy đủ.

Đây là các trường mở rộng có ràng buộc, không phải trường tạm chưa backfill. Cách này giữ hợp đồng API, JWT và seed hiện có, đồng thời có các bảng/FK thật theo tài liệu. Không được bỏ trigger hoặc dùng db push để tạo schema thay migration.

### Dữ liệu được bảo toàn

| Nhóm | Số bản ghi tại cutover |
| --- | ---: |
| Người dùng / học viên / giáo viên | 46 / 36 / 8 |
| Khóa học / lớp học | 6 / 13 |
| Ghi danh | 183 |
| Buổi học | 156 |
| Điểm danh | 1.351, gồm 228 lượt đi muộn |
| Bài kiểm tra / điểm số | 39 / 338 |
| Bài tập / thông báo | 27 / 19 |
| Refresh token / nhật ký | 17 / 6 |

ID, mật khẩu băm, token băm, điểm lịch sử và đường dẫn file được giữ nguyên. Sĩ số lưu tại lớp khớp số ghi danh ACTIVE; không đếm các lượt đã hoàn thành.

## Chức năng ứng dụng

- Học vụ có màn hình **Đào tạo → Cập nhật đào tạo** tại `/academic/data`: thêm/sửa học viên, giáo viên, khóa học, lớp và buổi học; cấu hình các trường mới; ghi danh; bảo lưu/quay lại/hủy; chuyển lớp; xem danh mục và thay trọng số.
- Hồ sơ học viên hiển thị điện thoại, mục tiêu và liên hệ khẩn cấp. Ngày sinh bắt buộc khi tạo hồ sơ. Không thay trình độ thiếu bằng N5.
- Tách trạng thái tài khoản khỏi trạng thái học tập; bộ lọc WAITING/ACTIVE/RESERVED/COMPLETED dựa trên ghi danh.
- Lớp học của giáo viên/học viên có link vào học riêng với link xem lại bản ghi; URL chưa có được để trống, không sinh link giả.
- Giáo viên có màn hình `/teacher/substitutions` để xem, điểm danh và cập nhật bản ghi các buổi dạy thay được giao. Quyền này không cấp quyền sửa toàn lớp hoặc nhập điểm lớp khác.
- Điểm danh chưa nhập vẫn là chưa nhập. Đi muộn được giữ và tính là tham dự; số lượt đi muộn vẫn thống kê riêng.
- Trigger duy trì sĩ số; lệnh ghi danh/chuyển lớp/bảo lưu khóa hàng lớp trong transaction để tránh vượt sức chứa khi có nhiều yêu cầu đồng thời.
- API kiểm tra vai trò và trạng thái hiện tại của người dùng; sửa lỗi JSON BigInt trong trả hồ sơ đăng nhập.
- Truy vấn điểm của danh sách học viên được gom theo lô, không truy vấn riêng từng học viên. Pool runtime có giới hạn và timeout kết nối để tránh mở quá nhiều kết nối Supabase.
- Kết nối runtime đã chuyển sang session pooler cổng 5432 của cùng database, sau khi kiểm tra thấy transaction pooler 6543 phát sinh timeout. Hai file môi trường backend đã được cập nhật; bản cấu hình cũ nằm trong `.backups/`. Lỗi database tạm thời trả 503, không coi là token đăng nhập sai.

## Quy tắc điểm đã chốt

Người dùng chọn: **QUIZ 10%, MIDTERM 40%, FINAL 50%, JLPT 0%**.

Điểm mỗi bài được quy về thang 10, lấy trung bình trong từng loại trước khi áp dụng trọng số. Tính riêng từng học viên/lớp trước khi tổng hợp. Thiếu bài hoặc loại bắt buộc thì tổng kết chính thức là NULL, giao diện ghi tạm tính; không tự coi thiếu bài là 0. Ví dụ QUIZ 7, MIDTERM 8, FINAL 9 cho tổng kết 8,4.

Trọng số là cấu hình toàn hệ thống theo bảng loại bài trong tài liệu. Màn hình nêu rõ thay trọng số sẽ tính lại điểm tổng hợp, có ghi audit; chưa có quy trình đóng băng cấu hình riêng từng lớp.

## Quy tắc bảo lưu và chuyển lớp

- Học vụ thực hiện bảo lưu có hiệu lực ngay trong ngày, thời hạn 1–24 tháng lịch. Ngày cuối tháng được chặn ở ngày hợp lệ của tháng đích.
- Bảo lưu giải phóng chỗ; quay lại phải còn chỗ và bảo lưu chưa hết hạn. Hủy bảo lưu kết thúc ghi danh, không tự khôi phục chỗ.
- API kiểm tra bảo lưu hết hạn mỗi phút khi đang chạy. Có nút chạy lại thủ công, thao tác lặp không làm thay đổi sĩ số hai lần.
- Chuyển lớp giữa các lớp cùng cấp JLPT đang mở/còn chỗ, cập nhật hai ghi danh và lịch sử chuyển trong một transaction. Điểm/điểm danh cũ giữ tại lớp gốc.
- Chưa có luồng học viên gửi yêu cầu bảo lưu tương lai; chức năng hiện tại là thao tác trực tiếp của học vụ.

## Kiểm chứng và bằng chứng

- 9 kiểm thử đơn vị: công thức trọng số, thiếu điểm, thang điểm khác nhau, tách lớp, số 0, trạng thái học tập và tháng lịch.
- Phục hồi backup đầy đủ vào PostgreSQL thử nghiệm rồi chạy migration; đối soát checksum toàn bộ 21 bảng nguồn.
- Kiểm thử API trên bản sao: đăng nhập bốn vai trò, hồ sơ, cổng học viên, lookup/bộ lọc/báo cáo, CRUD các trường tài liệu, giới hạn sĩ số, bảo lưu/quay lại/hủy, chuyển lớp, dạy thay và quyền truy cập, record, điểm danh và điểm 10/40/50. Có kiểm tra hai yêu cầu tranh chỗ cuối.
- Build/typecheck backend và frontend thành công.
- Kiểm tra trình duyệt với database thật ở chế độ chỉ đọc: trường mới và trọng số đúng, màn hình bảo lưu/chuyển lớp, kích thước desktop và mobile 390px, không có lỗi runtime JavaScript hoặc tràn ngang.

Bằng chứng được ghi tại `database-migration-rehearsal.json`, `database-api-smoke.json`, `database-browser-check.json`, `database-migration-applied.json`. `database-live-verification.json` xác nhận lại checksum 21 bảng gốc và 17 API đọc trên database thật cho cả bốn vai trò. Sau khi lưu cấu hình và khởi động theo cách thông thường, kiểm tra trình duyệt đã chạy lại thành công, gồm cả màn hình dạy thay.

Không chạy thử upload/xóa file trên bucket Storage thật. Schema migration không đổi/xóa các file; metadata và đường dẫn được đối soát. Các lỗi hoặc placeholder có sẵn ngoài phạm vi migration, như luồng đổi mật khẩu tại giao diện hồ sơ và nút xuất báo cáo, không được coi là đã triển khai trong thay đổi này.

## Backup và vận hành tiếp

- Backup trước diễn tập và ngay trước cutover ở `.backups/`, được loại khỏi Git. Chứa thông tin riêng tư, không commit hoặc chia sẻ công khai.
- Backup public schema đã được phục hồi thử và đối soát dữ liệu; dựa trên baseline SQL cùng dữ liệu snapshot, sequence, constraints và catalog. Không thay thế backup toàn bộ Supabase auth/storage.
- Hai migration đã được ghi checksum trong `_prisma_migrations`. Không sửa nội dung SQL đã áp dụng; thay đổi tiếp theo dùng migration mới.
- README đã chuyển sang `prisma:deploy` và chặn `prisma:push` vì push bỏ qua trigger/backfill. Không chạy seed lên database đang dùng.
- Không phục hồi snapshot cũ sau khi có dữ liệu ghi mới mà chưa xuất/đối soát phần phát sinh. Ưu tiên sửa tiến hoặc migration ngược có kiểm chứng.
