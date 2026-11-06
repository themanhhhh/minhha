import { describe, expect, it } from 'vitest';
import { summarizeGrades, type GradeTest } from './grade-summary';
const weights = [{ code: 'QUIZ', weight: 10 }, { code: 'MIDTERM', weight: 40 }, { code: 'FINAL', weight: 50 }, { code: 'JLPT', weight: 0 }];
const test = (id: number, type: string, value?: number, classId = 1): GradeTest => ({ id: BigInt(id), classId: BigInt(classId), type, maxScore: 10, scores: value === undefined ? [] : [{ studentId: 1n, value }] });
describe('grade summaries', () => {
  it('averages tests within each category before applying the selected 10/40/50 weights', () => {
    const result = summarizeGrades([test(1,'QUIZ',6),test(2,'QUIZ',8),test(3,'MIDTERM',8),test(4,'FINAL',9)],weights,1n);
    expect(result.average).toBe(8.4);
    expect(result.finalAverage).toBe(8.4);
    expect(result.provisional).toBe(false);
  });
  it('never publishes a final result when an expected test is missing', () => {
    const result = summarizeGrades([test(1,'QUIZ',7),test(2,'MIDTERM',8),test(3,'FINAL')],weights,1n);
    expect(result.finalAverage).toBeNull();
    expect(result.provisional).toBe(true);
  });
  it('retains zero as a valid score and ignores the reference-only JLPT category', () => {
    expect(summarizeGrades([test(1,'QUIZ',0),test(2,'MIDTERM',0),test(3,'FINAL',0),test(4,'JLPT')],weights,1n).finalAverage).toBe(0);
  });
  it('normalizes different scales and does not combine raw tests across classes', () => {
    const exam = test(1,'QUIZ',80); exam.maxScore = 100;
    const result = summarizeGrades([exam,test(2,'MIDTERM',8),test(3,'FINAL',8),test(4,'QUIZ',6,2),test(5,'MIDTERM',6,2),test(6,'FINAL',6,2)],weights,1n);
    expect(result.groups.map(g => g.final)).toEqual([8,6]);
    expect(result.average).toBe(7);
  });
  it('labels unconfigured weights and missing grades instead of fabricating a final grade', () => {
    const result = summarizeGrades([test(1,'FINAL',7)],weights.map(w=>({...w,weight:null})),1n);
    expect(result.method).toBe('UNCONFIGURED');
    expect(result.finalAverage).toBeNull();
  });
});
