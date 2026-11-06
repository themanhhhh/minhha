import type { Prisma } from '@prisma/client';

export const LearningStatus = { ACTIVE: 'ACTIVE', RESERVED: 'RESERVED', COMPLETED: 'COMPLETED', WAITING: 'WAITING' } as const;
export type LearningStatus = typeof LearningStatus[keyof typeof LearningStatus];

export function learningStatus(enrollments: { status: string }[]): LearningStatus {
  if (enrollments.some(e => e.status === 'ACTIVE')) return 'ACTIVE';
  if (enrollments.some(e => e.status === 'RESERVED')) return 'RESERVED';
  if (enrollments.some(e => e.status === 'COMPLETED')) return 'COMPLETED';
  return 'WAITING';
}

export function learningStatusWhere(status?: LearningStatus): Prisma.StudentWhereInput {
  if (!status) return {};
  if (status === 'ACTIVE') return { enrollments: { some: { status: 'ACTIVE' } } };
  const noActive: Prisma.StudentWhereInput = { enrollments: { none: { status: 'ACTIVE' } } };
  if (status === 'RESERVED') return { AND: [noActive, { enrollments: { some: { status: 'RESERVED' } } }] };
  const noReserved: Prisma.StudentWhereInput = { enrollments: { none: { status: 'RESERVED' } } };
  if (status === 'COMPLETED') return { AND: [noActive, noReserved, { enrollments: { some: { status: 'COMPLETED' } } }] };
  return { enrollments: { none: { status: { in: ['ACTIVE', 'RESERVED', 'COMPLETED'] } } } };
}

export function addCalendarMonths(date: Date, months: number): Date {
  const result = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
  const last = new Date(Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)).getUTCDate();
  result.setUTCDate(Math.min(date.getUTCDate(), last));
  return result;
}

export function localToday(): Date {
  return new Date(`${new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10)}T00:00:00.000Z`);
}
