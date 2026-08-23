export interface PaginationInput { page?: number; pageSize?: number; }
export interface PaginationMeta { page: number; pageSize: number; total: number; totalPages: number; }

export function normalizePagination(input: PaginationInput) {
  const page = Math.max(1, Math.floor(input.page ?? 1));
  const pageSize = Math.min(100, Math.max(1, Math.floor(input.pageSize ?? 20)));
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
}

export function paginationMeta(page: number, pageSize: number, total: number): PaginationMeta {
  return { page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
}
