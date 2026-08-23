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
pnpm --filter @riki/api prisma:migrate
pnpm --filter @riki/api prisma:seed
pnpm dev
```

API health check: `http://localhost:4000/api/v1/health`

Sao chép `.env.example` thành `.env`, điền connection string từ Supabase Dashboard → Connect. Dùng `DATABASE_URL` cho pooled runtime connection và `DIRECT_URL` cho Prisma migration. Supabase thay thế database local nên không cần chạy container SQL Server.

Khởi động API và web bằng Docker sau khi tạo `.env`:

```bash
docker compose up --build
```

Prisma migration và seed nên chạy từ máy phát triển hoặc CI có quyền truy cập `DIRECT_URL`.

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
