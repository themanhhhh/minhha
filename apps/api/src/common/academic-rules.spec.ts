import { describe, expect, it } from 'vitest';
import { addCalendarMonths, learningStatus } from './academic-rules';
describe('academic rules', () => {
  it('clamps month-end reservations to the last calendar day', () => {
    expect(addCalendarMonths(new Date('2026-01-31T00:00:00Z'),1).toISOString().slice(0,10)).toBe('2026-02-28');
    expect(addCalendarMonths(new Date('2028-01-31T00:00:00Z'),1).toISOString().slice(0,10)).toBe('2028-02-29');
  });
  it('derives learning status without using account activation status', () => {
    expect(learningStatus([])).toBe('WAITING');
    expect(learningStatus([{status:'RESERVED'}])).toBe('RESERVED');
    expect(learningStatus([{status:'COMPLETED'}])).toBe('COMPLETED');
    expect(learningStatus([{status:'RESERVED'},{status:'ACTIVE'}])).toBe('ACTIVE');
  });
});
