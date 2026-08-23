# Riki LMS

Monorepo TypeScript cho hệ thống quản lý đào tạo Riki.

## Stack

- Node.js 24 LTS
- Next.js 16 App Router tại `apps/web`
- NestJS 11 tại `apps/api`
- Prisma với SQL Server
- pnpm workspace và Turborepo
- shadcn/ui source-owned components với Tailwind CSS v4

## Chạy local

```bash
pnpm install
pnpm --filter @riki/api prisma:generate
pnpm dev
```

API health check: `http://localhost:4000/api/v1/health`

Sao chép `.env.example` thành `.env` và điều chỉnh thông tin kết nối trước khi chạy database. Có thể khởi động SQL Server bằng `docker compose up sqlserver -d`.

Authentication/RBAC đã có module scaffold; login thật và persistence refresh token sẽ được nối vào Prisma ở MVP Core tiếp theo.

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
