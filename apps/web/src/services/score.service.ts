import type { Score } from '@/types';
export const scoreService = { async getByClass(_classId: number): Promise<Score[]> { return []; }, async update(_testId: number, entries: Score[]) { return entries; } };
