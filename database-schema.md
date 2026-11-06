# Cấu trúc database đã triển khai

PostgreSQL / Prisma. 26 bảng ứng dụng, chưa tính _prisma_migrations. Các trường code và thời gian tương thích API được trigger đồng bộ với FK số và thời điểm theo tài liệu.

## NguoiDung (User)

| Cột PostgreSQL | Thuộc tính Prisma | Kiểu | NULL | Ràng buộc |
| --- | --- | --- | --- | --- |
| ma_nguoi_dung | id | BigInt | Không | PK, DEFAULT / trigger |
| email | email | VarChar(255) | Không | UNIQUE |
| mat_khau | passwordHash | VarChar(255) | Không |  |
| ho_ten | fullName | VarChar(100) | Không |  |
| role | role | UserRole | Không |  |
| status | status | UserStatus | Không | DEFAULT / trigger |
| last_login_at | lastLoginAt | Timestamptz(3) | Có |  |
| created_at | createdAt | Timestamptz(3) | Không | DEFAULT / trigger |
| updated_at | updatedAt | Timestamptz(3) | Không |  |
| sdt | phone | VarChar(12) | Có | UNIQUE |
| ma_vai_tro_nguoi_dung | roleId | Int | Không | DEFAULT / trigger |
| ma_trang_thai | statusId | Int | Không | DEFAULT / trigger |

- roleDefinition RoleDefinition @relation(fields: [roleId], references: [id])
- statusDefinition UserStatusDefinition @relation(fields: [statusId], references: [id])

## RefreshToken (RefreshToken)

| Cột PostgreSQL | Thuộc tính Prisma | Kiểu | NULL | Ràng buộc |
| --- | --- | --- | --- | --- |
| id | id | BigInt | Không | PK, DEFAULT / trigger |
| user_id | userId | BigInt | Không |  |
| token_id | tokenId | VarChar(36) | Không | UNIQUE |
| token_hash | tokenHash | VarChar(255) | Không | UNIQUE |
| expires_at | expiresAt | Timestamptz(3) | Không |  |
| revoked_at | revokedAt | Timestamptz(3) | Có |  |
| created_at | createdAt | Timestamptz(3) | Không | DEFAULT / trigger |

- user      User      @relation(fields: [userId], references: [id], onDelete: Cascade, map: "RefreshToken_user_id_fkey")

## PasswordResetToken (PasswordResetToken)

| Cột PostgreSQL | Thuộc tính Prisma | Kiểu | NULL | Ràng buộc |
| --- | --- | --- | --- | --- |
| id | id | BigInt | Không | PK, DEFAULT / trigger |
| user_id | userId | BigInt | Không |  |
| token_id | tokenId | VarChar(36) | Không | UNIQUE |
| token_hash | tokenHash | VarChar(255) | Không | UNIQUE |
| expires_at | expiresAt | Timestamptz(3) | Không |  |
| used_at | usedAt | Timestamptz(3) | Có |  |
| created_at | createdAt | Timestamptz(3) | Không | DEFAULT / trigger |

- user      User      @relation(fields: [userId], references: [id], onDelete: Cascade, map: "PasswordResetToken_user_id_fkey")

## HocVien (Student)

| Cột PostgreSQL | Thuộc tính Prisma | Kiểu | NULL | Ràng buộc |
| --- | --- | --- | --- | --- |
| ma_hoc_vien | id | BigInt | Không | PK, DEFAULT / trigger |
| ma_nguoi_dung | userId | BigInt | Không | UNIQUE |
| student_code | studentCode | VarChar(30) | Không | UNIQUE |
| gender | gender | VarChar(20) | Có |  |
| ngay_sinh | dateOfBirth | Date | Không |  |
| current_level | currentLevel | JlptLevel | Có |  |
| target_level | targetLevel | JlptLevel | Có |  |
| created_at | createdAt | Timestamptz(3) | Không | DEFAULT / trigger |
| updated_at | updatedAt | Timestamptz(3) | Không |  |
| muc_tieu | goal | VarChar(255) | Có |  |
| lien_he_khan_cap | emergencyContact | VarChar(255) | Có |  |
| ma_trinh_do_hien_tai | currentLevelId | Int | Có |  |
| ma_trinh_do_muc_tieu | targetLevelId | Int | Có |  |

- user           User                @relation(fields: [userId], references: [id], onDelete: Cascade, map: "HocVien_user_id_fkey")
- currentLevelDefinition JlptDefinition? @relation("StudentCurrentLevel", fields: [currentLevelId], references: [id])
- targetLevelDefinition JlptDefinition? @relation("StudentTargetLevel", fields: [targetLevelId], references: [id])

## GiaoVien (Teacher)

| Cột PostgreSQL | Thuộc tính Prisma | Kiểu | NULL | Ràng buộc |
| --- | --- | --- | --- | --- |
| ma_giao_vien | id | BigInt | Không | PK, DEFAULT / trigger |
| ma_nguoi_dung | userId | BigInt | Không | UNIQUE |
| teacher_code | teacherCode | VarChar(30) | Không | UNIQUE |
| phone | phone | VarChar(30) | Có |  |
| jlpt_level | jlptLevel | JlptLevel | Có |  |
| created_at | createdAt | Timestamptz(3) | Không | DEFAULT / trigger |
| updated_at | updatedAt | Timestamptz(3) | Không |  |
| ma_trinh_do_jlpt | jlptLevelId | Int | Có |  |

- user           User           @relation(fields: [userId], references: [id], onDelete: Cascade, map: "GiaoVien_user_id_fkey")
- levelDefinition JlptDefinition? @relation(fields: [jlptLevelId], references: [id])

## KhoaHoc (Course)

| Cột PostgreSQL | Thuộc tính Prisma | Kiểu | NULL | Ràng buộc |
| --- | --- | --- | --- | --- |
| ma_khoa_hoc | id | BigInt | Không | PK, DEFAULT / trigger |
| code | code | VarChar(30) | Không | UNIQUE |
| ten_khoa_hoc | name | VarChar(100) | Không |  |
| level | level | JlptLevel | Không |  |
| so_buoi_hoc | totalLessons | Int | Không |  |
| hoc_phi | tuition | Decimal(15, 2) | Không |  |
| status | status | CourseStatus | Không | DEFAULT / trigger |
| created_at | createdAt | Timestamptz(3) | Không | DEFAULT / trigger |
| updated_at | updatedAt | Timestamptz(3) | Không |  |
| mo_ta | description | VarChar(255) | Có |  |
| ma_trinh_do_jlpt | levelId | Int | Không | DEFAULT / trigger |

- levelDefinition JlptDefinition @relation(fields: [levelId], references: [id])

## LopHoc (Class)

| Cột PostgreSQL | Thuộc tính Prisma | Kiểu | NULL | Ràng buộc |
| --- | --- | --- | --- | --- |
| ma_lop_hoc | id | BigInt | Không | PK, DEFAULT / trigger |
| code | code | VarChar(30) | Không | UNIQUE |
| ten_lop_hoc | name | VarChar(100) | Không |  |
| course_id | courseId | BigInt | Không |  |
| ma_giao_vien | teacherId | BigInt | Không |  |
| ngay_khai_giang | startDate | Date | Không |  |
| ngay_ket_thuc | endDate | Date | Có |  |
| lich_hoc | schedule | VarChar(100) | Không |  |
| room | room | VarChar(100) | Có |  |
| si_so_toi_da | capacity | Int | Không | DEFAULT / trigger |
| status | status | ClassStatus | Không | DEFAULT / trigger |
| created_at | createdAt | Timestamptz(3) | Không | DEFAULT / trigger |
| updated_at | updatedAt | Timestamptz(3) | Không |  |
| ca_hoc | session | VarChar(50) | Có |  |
| si_so_hien_tai | studentCount | Int | Không | DEFAULT / trigger |
| link_vao_hoc | meetingUrl | VarChar(255) | Có |  |

- course            Course              @relation(fields: [courseId], references: [id], map: "LopHoc_course_id_fkey")
- teacher           Teacher             @relation("TeacherClasses", fields: [teacherId], references: [id], map: "LopHoc_teacher_id_fkey")

## DangKyHoc (Enrollment)

| Cột PostgreSQL | Thuộc tính Prisma | Kiểu | NULL | Ràng buộc |
| --- | --- | --- | --- | --- |
| ma_dang_ky | id | BigInt | Không | PK, DEFAULT / trigger |
| ma_hoc_vien | studentId | BigInt | Không |  |
| ma_lop_hoc | classId | BigInt | Không |  |
| status | status | EnrollmentStatus | Không | DEFAULT / trigger |
| enrolled_at | enrolledAt | Timestamptz(3) | Không | DEFAULT / trigger |
| left_at | leftAt | Timestamptz(3) | Có |  |
| ngay_tham_gia | joinedOn | Date | Không | DEFAULT / trigger |

- student    Student          @relation(fields: [studentId], references: [id], map: "DangKyLop_student_id_fkey")
- class      Class            @relation(fields: [classId], references: [id], map: "DangKyLop_class_id_fkey")

## ChuyenLop (ClassTransfer)

| Cột PostgreSQL | Thuộc tính Prisma | Kiểu | NULL | Ràng buộc |
| --- | --- | --- | --- | --- |
| ma_chuyen_lop | id | BigInt | Không | PK, DEFAULT / trigger |
| ma_hoc_vien | studentId | BigInt | Không |  |
| ma_lop_hoc_cu | fromClassId | BigInt | Có |  |
| ma_lop_hoc_moi | toClassId | BigInt | Không |  |
| ly_do_chuyen_lop | reason | VarChar(255) | Có |  |
| status | status | TransferStatus | Không | DEFAULT / trigger |
| created_at | createdAt | Timestamptz(3) | Không | DEFAULT / trigger |
| ngay_chuyen_lop | transferredOn | Date | Có |  |

- student     Student        @relation(fields: [studentId], references: [id], map: "LichSuChuyenLop_student_id_fkey")
- fromClass   Class?         @relation("FromClassTransfers", fields: [fromClassId], references: [id], map: "LichSuChuyenLop_from_class_id_fkey")
- toClass     Class          @relation("ToClassTransfers", fields: [toClassId], references: [id], map: "LichSuChuyenLop_to_class_id_fkey")

## BaoLuu (StudyReservation)

| Cột PostgreSQL | Thuộc tính Prisma | Kiểu | NULL | Ràng buộc |
| --- | --- | --- | --- | --- |
| ma_bao_luu | id | BigInt | Không | PK, DEFAULT / trigger |
| ma_hoc_vien | studentId | BigInt | Không |  |
| ma_lop_hoc | classId | BigInt | Không |  |
| ly_do_bao_luu | reason | VarChar(255) | Có |  |
| status | status | ReservationStatus | Không | DEFAULT / trigger |
| ngay_bao_luu | startDate | Date | Có |  |
| end_date | endDate | Date | Có |  |
| thoi_han_bao_luu | durationMonths | Int | Có |  |
| trang_thai_bao_luu | isActive | Boolean | Không | DEFAULT / trigger |

- student   Student           @relation(fields: [studentId], references: [id], map: "BaoLuu_student_id_fkey")
- class     Class             @relation(fields: [classId], references: [id], map: "BaoLuu_class_id_fkey")

## BuoiHoc (Lesson)

| Cột PostgreSQL | Thuộc tính Prisma | Kiểu | NULL | Ràng buộc |
| --- | --- | --- | --- | --- |
| ma_buoi_hoc | id | BigInt | Không | PK, DEFAULT / trigger |
| ma_lop_hoc | classId | BigInt | Không |  |
| ten_buoi_hoc | title | VarChar(100) | Không |  |
| lesson_date | lessonDate | Date | Không |  |
| start_time | startTime | Time(0) | Không |  |
| end_time | endTime | Time(0) | Không |  |
| noi_dung_buoi_hoc | content | VarChar(255) | Có |  |
| link_record | recordUrl | VarChar(255) | Có |  |
| status | status | LessonStatus | Không | DEFAULT / trigger |
| created_at | createdAt | Timestamptz(3) | Không | DEFAULT / trigger |
| updated_at | updatedAt | Timestamptz(3) | Không |  |
| thoi_gian_bat_dau | startsAt | Timestamptz(0) | Không | DEFAULT / trigger |
| thoi_gian_ket_thuc | endsAt | Timestamptz(0) | Không | DEFAULT / trigger |
| ma_giao_vien_day_thay | substituteTeacherId | BigInt | Có |  |

- class       Class          @relation(fields: [classId], references: [id], onDelete: Cascade, map: "BuoiHoc_class_id_fkey")
- substituteTeacher Teacher? @relation(fields: [substituteTeacherId], references: [id])

## DiemDanh (Attendance)

| Cột PostgreSQL | Thuộc tính Prisma | Kiểu | NULL | Ràng buộc |
| --- | --- | --- | --- | --- |
| ma_diem_danh | id | BigInt | Không | PK, DEFAULT / trigger |
| ma_buoi_hoc | lessonId | BigInt | Không |  |
| ma_hoc_vien | studentId | BigInt | Không |  |
| status | status | AttendanceStatus | Không |  |
| ghi_chu | note | VarChar(255) | Có |  |
| ma_trang_thai_diem_danh | statusId | Int | Không | DEFAULT / trigger |

- lesson    Lesson           @relation(fields: [lessonId], references: [id], onDelete: Cascade, map: "DiemDanh_lesson_id_fkey")
- student   Student          @relation(fields: [studentId], references: [id], map: "DiemDanh_student_id_fkey")
- statusDefinition AttendanceDefinition @relation(fields: [statusId], references: [id])

## BaiKiemTra (Test)

| Cột PostgreSQL | Thuộc tính Prisma | Kiểu | NULL | Ràng buộc |
| --- | --- | --- | --- | --- |
| ma_bai_kiem_tra | id | BigInt | Không | PK, DEFAULT / trigger |
| ma_lop_hoc | classId | BigInt | Không |  |
| ten_bai_kiem_tra | name | VarChar(100) | Không |  |
| type | type | TestType | Không |  |
| max_score | maxScore | Decimal(5, 2) | Không | DEFAULT / trigger |
| ngay_kiem_tra | testDate | Date | Có |  |
| ma_loai_bai_kiem_tra | typeId | Int | Không | DEFAULT / trigger |

- class     Class     @relation(fields: [classId], references: [id], onDelete: Cascade, map: "BaiKiemTra_class_id_fkey")
- typeDefinition TestTypeDefinition @relation(fields: [typeId], references: [id])

## DiemSo (Score)

| Cột PostgreSQL | Thuộc tính Prisma | Kiểu | NULL | Ràng buộc |
| --- | --- | --- | --- | --- |
| ma_diem_so | id | BigInt | Không | PK, DEFAULT / trigger |
| ma_bai_kiem_tra | testId | BigInt | Không |  |
| ma_hoc_vien | studentId | BigInt | Không |  |
| so_diem | value | Float | Không |  |
| note | note | VarChar(500) | Có |  |

- test      Test    @relation(fields: [testId], references: [id], onDelete: Cascade, map: "DiemSo_test_id_fkey")
- student   Student @relation(fields: [studentId], references: [id], map: "DiemSo_student_id_fkey")

## BaiTap (Assignment)

| Cột PostgreSQL | Thuộc tính Prisma | Kiểu | NULL | Ràng buộc |
| --- | --- | --- | --- | --- |
| id | id | BigInt | Không | PK, DEFAULT / trigger |
| class_id | classId | BigInt | Không |  |
| title | title | VarChar(200) | Không |  |
| description | description | Text | Có |  |
| due_at | dueAt | Timestamptz(3) | Không |  |
| created_at | createdAt | Timestamptz(3) | Không | DEFAULT / trigger |
| updated_at | updatedAt | Timestamptz(3) | Không |  |

- class       Class        @relation(fields: [classId], references: [id], onDelete: Cascade, map: "BaiTap_class_id_fkey")

## TepBaiTap (AssignmentAttachment)

| Cột PostgreSQL | Thuộc tính Prisma | Kiểu | NULL | Ràng buộc |
| --- | --- | --- | --- | --- |
| id | id | BigInt | Không | PK, DEFAULT / trigger |
| assignment_id | assignmentId | BigInt | Không |  |
| storage_path | storagePath | VarChar(500) | Không |  |
| file_name | fileName | VarChar(255) | Không |  |
| mime_type | mimeType | VarChar(120) | Không |  |
| size_bytes | sizeBytes | Int | Không |  |
| created_at | createdAt | Timestamptz(3) | Không | DEFAULT / trigger |

- assignment   Assignment @relation(fields: [assignmentId], references: [id], onDelete: Cascade, map: "TepBaiTap_assignment_id_fkey")

## TaiLieuLop (ClassMaterial)

| Cột PostgreSQL | Thuộc tính Prisma | Kiểu | NULL | Ràng buộc |
| --- | --- | --- | --- | --- |
| id | id | BigInt | Không | PK, DEFAULT / trigger |
| class_id | classId | BigInt | Không |  |
| lesson_id | lessonId | BigInt | Có |  |
| created_by | createdBy | BigInt | Có |  |
| title | title | VarChar(200) | Không |  |
| description | description | Text | Có |  |
| storage_path | storagePath | VarChar(500) | Không |  |
| file_name | fileName | VarChar(255) | Không |  |
| mime_type | mimeType | VarChar(120) | Không |  |
| size_bytes | sizeBytes | Int | Không |  |
| created_at | createdAt | Timestamptz(3) | Không | DEFAULT / trigger |

- class        Class     @relation(fields: [classId], references: [id], onDelete: Cascade, map: "TaiLieuLop_class_id_fkey")
- lesson       Lesson?   @relation(fields: [lessonId], references: [id], onDelete: SetNull, map: "TaiLieuLop_lesson_id_fkey")
- uploader     User?     @relation(fields: [createdBy], references: [id], onDelete: SetNull, map: "TaiLieuLop_created_by_fkey")

## NopBai (AssignmentSubmission)

| Cột PostgreSQL | Thuộc tính Prisma | Kiểu | NULL | Ràng buộc |
| --- | --- | --- | --- | --- |
| id | id | BigInt | Không | PK, DEFAULT / trigger |
| assignment_id | assignmentId | BigInt | Không |  |
| student_id | studentId | BigInt | Không |  |
| note | note | Text | Có |  |
| status | status | SubmissionStatus | Không | DEFAULT / trigger |
| submitted_at | submittedAt | Timestamptz(3) | Không | DEFAULT / trigger |

- assignment   Assignment       @relation(fields: [assignmentId], references: [id], onDelete: Cascade, map: "NopBai_assignment_id_fkey")
- student      Student          @relation(fields: [studentId], references: [id], onDelete: Cascade, map: "NopBai_student_id_fkey")

## TepNopBai (AssignmentFile)

| Cột PostgreSQL | Thuộc tính Prisma | Kiểu | NULL | Ràng buộc |
| --- | --- | --- | --- | --- |
| id | id | BigInt | Không | PK, DEFAULT / trigger |
| submission_id | submissionId | BigInt | Không |  |
| storage_path | storagePath | VarChar(500) | Không |  |
| file_name | fileName | VarChar(255) | Không |  |
| mime_type | mimeType | VarChar(120) | Không |  |
| size_bytes | sizeBytes | Int | Không |  |
| created_at | createdAt | Timestamptz(3) | Không | DEFAULT / trigger |

- submission   AssignmentSubmission @relation(fields: [submissionId], references: [id], onDelete: Cascade, map: "TepNopBai_submission_id_fkey")

## AuditLog (AuditLog)

| Cột PostgreSQL | Thuộc tính Prisma | Kiểu | NULL | Ràng buộc |
| --- | --- | --- | --- | --- |
| id | id | BigInt | Không | PK, DEFAULT / trigger |
| actor_id | actorId | BigInt | Có |  |
| action | action | VarChar(100) | Không |  |
| entity | entity | VarChar(100) | Không |  |
| entity_id | entityId | VarChar(100) | Có |  |
| old_value | oldValue | Json | Có |  |
| new_value | newValue | Json | Có |  |
| ip_address | ipAddress | VarChar(64) | Có |  |
| user_agent | userAgent | VarChar(500) | Có |  |
| created_at | createdAt | Timestamptz(3) | Không | DEFAULT / trigger |

- actor     User?    @relation(fields: [actorId], references: [id], onDelete: SetNull, map: "AuditLog_actor_id_fkey")

## ThongBao (Notification)

| Cột PostgreSQL | Thuộc tính Prisma | Kiểu | NULL | Ràng buộc |
| --- | --- | --- | --- | --- |
| id | id | BigInt | Không | PK, DEFAULT / trigger |
| recipient_id | recipientId | BigInt | Không |  |
| created_by_id | createdById | BigInt | Có |  |
| type | type | NotificationType | Không |  |
| title | title | VarChar(200) | Không |  |
| body | body | Text | Không |  |
| action_url | actionUrl | VarChar(500) | Có |  |
| entity | entity | VarChar(100) | Có |  |
| entity_id | entityId | VarChar(100) | Có |  |
| metadata | metadata | Json | Có |  |
| dedupe_key | dedupeKey | VarChar(255) | Có | UNIQUE |
| read_at | readAt | Timestamptz(3) | Có |  |
| created_at | createdAt | Timestamptz(3) | Không | DEFAULT / trigger |

- recipient   User             @relation("NotificationRecipient", fields: [recipientId], references: [id], onDelete: Cascade, map: "ThongBao_recipient_id_fkey")
- createdBy   User?            @relation("NotificationCreator", fields: [createdById], references: [id], onDelete: SetNull, map: "ThongBao_created_by_id_fkey")

## VaiTroNguoiDung (RoleDefinition)

| Cột PostgreSQL | Thuộc tính Prisma | Kiểu | NULL | Ràng buộc |
| --- | --- | --- | --- | --- |
| ma_vai_tro | id | Int | Không | PK |
| code | code | UserRole | Không | UNIQUE |
| ten_vai_tro | name | VarChar(50) | Không |  |


## TrangThaiNguoiDung (UserStatusDefinition)

| Cột PostgreSQL | Thuộc tính Prisma | Kiểu | NULL | Ràng buộc |
| --- | --- | --- | --- | --- |
| ma_trang_thai | id | Int | Không | PK |
| code | code | UserStatus | Không | UNIQUE |
| ten_trang_thai | name | VarChar(50) | Không |  |


## TrinhDoJLPT (JlptDefinition)

| Cột PostgreSQL | Thuộc tính Prisma | Kiểu | NULL | Ràng buộc |
| --- | --- | --- | --- | --- |
| ma_trinh_do_jlpt | id | Int | Không | PK |
| code | code | JlptLevel | Không | UNIQUE |
| ten_trinh_do | name | VarChar(10) | Không |  |


## TrangThaiDiemDanh (AttendanceDefinition)

| Cột PostgreSQL | Thuộc tính Prisma | Kiểu | NULL | Ràng buộc |
| --- | --- | --- | --- | --- |
| ma_trang_thai_diem_danh | id | Int | Không | PK |
| code | code | AttendanceStatus | Không | UNIQUE |
| ten_trang_thai | name | VarChar(50) | Không |  |


## LoaiBaiKiemTra (TestTypeDefinition)

| Cột PostgreSQL | Thuộc tính Prisma | Kiểu | NULL | Ràng buộc |
| --- | --- | --- | --- | --- |
| ma_loai_bai_kiem_tra | id | Int | Không | PK |
| code | code | TestType | Không | UNIQUE |
| ten_loai_bai | name | VarChar(50) | Không |  |
| trong_so | weight | Float | Có |  |


