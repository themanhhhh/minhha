import { describe, expect, it } from 'vitest';
import { normalizePagination, paginationMeta } from './pagination';

describe('pagination', () => {
  it('normalizes defaults and clamps page size', () => {
    expect(normalizePagination({})).toMatchObject({ page: 1, pageSize: 20, skip: 0, take: 20 });
    expect(normalizePagination({ page: 2, pageSize: 500 })).toMatchObject({ page: 2, pageSize: 100, skip: 100, take: 100 });
  });

  it('calculates total pages', () => {
    expect(paginationMeta(1, 20, 41)).toEqual({ page: 1, pageSize: 20, total: 41, totalPages: 3 });
  });
});
