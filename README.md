# Riki LMS

Monorepo TypeScript cho hệ thống quản lý đào tạo Riki.

## Stack

- Node.js 24 LTS
- Next.js 16 App Router tại `apps/web`
- NestJS 11 tại `apps/api`
- Prisma với PostgreSQL trên Supabase
- pnpm workspace và Turborepo
- shadcn/ui source-owned components với Tailwind CSS v4

## Chạy local

```bash
pnpm install
pnpm --filter @riki/api prisma:generate
pnpm --filter @riki/api prisma:push
pnpm --filter @riki/api prisma:seed
pnpm dev
```

API health check: `http://localhost:4000/api/v1/health`

Sao chép `.env.example` thành `.env`, điền connection string từ Supabase Dashboard → Connect. Backend dùng Supabase PostgreSQL qua Prisma: `DATABASE_URL` là kết nối pooler cho runtime API, còn `DIRECT_URL` là kết nối trực tiếp để chạy migration. Không dùng `SUPABASE_ANON_KEY` thay cho chuỗi kết nối PostgreSQL. Supabase thay thế database local nên không cần chạy container SQL Server.

NestJS sẽ nạp `.env` ở thư mục gốc monorepo (hoặc `apps/api/.env`) và từ chối khởi động nếu thiếu `DATABASE_URL`, `JWT_ACCESS_SECRET` hoặc `JWT_REFRESH_SECRET`. `DIRECT_URL` chỉ bắt buộc khi chạy Prisma migration/seed.

## Student Assignment Uploads

Bài tập của học viên được lưu trong PostgreSQL với deadline; file nộp được lưu ở Supabase Storage bucket private `student-submissions`. Tạo bucket này trong Supabase Dashboard → Storage, sau đó thêm các biến server-only vào `apps/api/.env`:

```env
SUPABASE_URL="https://<project-ref>.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"
SUPABASE_STORAGE_BUCKET="student-submissions"
```

Không đưa `SUPABASE_SERVICE_ROLE_KEY` vào frontend hoặc biến `NEXT_PUBLIC_*`. Học viên có thể nộp tối đa 5 file, mỗi file tối đa 10 MB; hệ thống hỗ trợ PDF, Word, Excel, PowerPoint và ảnh. File được trả về bằng signed URL có thời hạn.

```text
GET  /api/v1/me/classes/:classId/assignments
POST /api/v1/me/assignments/:assignmentId/submission
```

Khởi động API và web bằng Docker sau khi tạo `.env`:

```bash
docker compose up --build
```

`prisma:push` dùng cho lần khởi tạo Supabase hiện tại vì repository chưa có migration history. Khi chuyển sang quy trình migration, tạo migration bằng `prisma:migrate` từ máy phát triển hoặc CI có quyền truy cập `DIRECT_URL`; không chạy migration dev trên database production chưa được baseline.

Frontend có thể chuyển từ mock sang API bằng biến:

```env
NEXT_PUBLIC_USE_MOCK="false"
```

Backend test foundation:

```bash
pnpm --filter @riki/api test
```

Authentication/RBAC đã có module scaffold; login thật và persistence refresh token sẽ được nối vào Prisma ở MVP Core tiếp theo.

## Backend Authentication

Authentication Phase 5 đã có:

```text
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
GET  /api/v1/auth/me
GET  /api/v1/auth/staff-check
```

Access token và refresh token được lưu trong HttpOnly cookies:

```text
access_token
refresh_token
```

Refresh token được hash và lưu trong Supabase qua Prisma. Mỗi lần refresh sẽ revoke token cũ và tạo token mới. `staff-check` là endpoint demo để xác nhận RBAC cho `ACADEMIC_STAFF` và `DIRECTOR`.

## Academic Staff API

Phase 6 đã có các module backend:

```text
GET   /api/v1/students
GET   /api/v1/students/:id
POST  /api/v1/students
PATCH /api/v1/students/:id

GET   /api/v1/teachers
GET   /api/v1/teachers/:id
POST  /api/v1/teachers
PATCH /api/v1/teachers/:id

GET   /api/v1/courses
GET   /api/v1/courses/:id
POST  /api/v1/courses
PATCH /api/v1/courses/:id

GET   /api/v1/classes
GET   /api/v1/classes/:id
POST  /api/v1/classes
PATCH /api/v1/classes/:id
POST  /api/v1/classes/:id/students
DELETE /api/v1/classes/:id/students/:studentId
```

Các API list hỗ trợ `page`, `pageSize`, `search` và filter theo domain. CRUD chỉ cho `ACADEMIC_STAFF`; `DIRECTOR` được phép đọc dữ liệu. Enrollment kiểm tra học viên tồn tại, lớp còn chỗ và không đăng ký trùng.

## Lesson Management API

Phase 7 đã có:

```text
GET   /api/v1/classes/:classId/lessons
GET   /api/v1/lessons/:id
POST  /api/v1/lessons
PATCH /api/v1/lessons/:id
PATCH /api/v1/lessons/:id/record
```

Lesson API kiểm tra quyền theo lớp: học viên chỉ xem lớp đã enrollment, giáo viên chỉ thao tác lớp mình phụ trách, học vụ có quyền quản lý và giám đốc chỉ đọc. Thời gian buổi học dùng `HH:mm`, ngày dùng ISO date; hệ thống chặn giờ kết thúc trước giờ bắt đầu và trùng lịch giáo viên/phòng học trong cùng ngày.

## Teaching Operations API

Phase 8 đã có:

```text
GET /api/v1/lessons/:lessonId/attendance
PUT /api/v1/lessons/:lessonId/attendance

GET  /api/v1/classes/:classId/tests
POST /api/v1/tests
GET  /api/v1/tests/:testId/scores
PUT  /api/v1/tests/:testId/scores
```

Giáo viên chỉ được cập nhật điểm danh/điểm số trong lớp mình phụ trách. Học viên chỉ xem bản ghi của chính mình; Academic Staff có quyền quản trị; Director chỉ đọc. Payload attendance và scores được validate trùng học viên, enrollment và giới hạn điểm theo `maxScore`.

## Student Portal API

Các API riêng cho tài khoản học viên:

```text
GET /api/v1/me/profile
GET /api/v1/me/classes
GET /api/v1/me/classes/:classId
GET /api/v1/me/schedule
GET /api/v1/me/attendance
GET /api/v1/me/scores
GET /api/v1/me/progress
```

## Director Reports API

```text
GET /api/v1/dashboard/director
GET /api/v1/reports/students
GET /api/v1/reports/teachers
GET /api/v1/reports/classes
GET /api/v1/reports/attendance
GET /api/v1/reports/scores
```

## Audit Logs

```text
GET /api/v1/audit-logs
```

Audit log hỗ trợ filter `entity`, `action`, pagination và lưu actor, entity, old/new value, thời gian thao tác. Các thao tác điểm danh và nhập điểm đã được ghi log; service sẵn sàng được gọi thêm trong các command CRUD còn lại.

## UI

Frontend dùng shadcn/ui tại `apps/web`. Component dùng chung đặt trong `apps/web/src/components/ui`, theme tokens đặt trong `apps/web/src/app/globals.css`. Thêm component mới bằng shadcn CLI từ thư mục `apps/web`.

Frontend hiện triển khai theo mô hình Frontend First:

- Mock authentication tại `src/mocks/auth.ts`
- Mock data tại `src/mocks/`
- Service layer tại `src/services/`
- Query hooks tại `src/features/*/hooks/`
- API client sẵn sàng chuyển sang NestJS tại `src/lib/api-client.ts`
- Route dashboard cho `STUDENT`, `TEACHER`, `ACADEMIC_STAFF`, `DIRECTOR`
- App shell responsive với sidebar theo role
- Module mẫu `Academic Staff → Students` có search, filter, loading, empty và error state
