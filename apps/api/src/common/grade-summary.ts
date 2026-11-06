export interface GradeTest {
  id: bigint; classId: bigint; type: string; maxScore: unknown;
  scores: { studentId: bigint; value: unknown }[];
}
export interface GradeWeight { code: string; weight: number | null; }

export function summarizeGrades(tests: GradeTest[], weights: GradeWeight[], studentId?: bigint) {
  const configured = weights.length > 0 && weights.every(w => w.weight !== null && Number.isFinite(w.weight) && w.weight >= 0 && w.weight <= 100) && Math.abs(weights.reduce((s, w) => s + (w.weight ?? 0), 0) - 100) < 0.000001;
  const groups = new Map<string, { studentId: string; classId: string; tests: GradeTest[] }>();
  for (const test of tests) {
    const students = studentId !== undefined ? [studentId] : test.scores.map(s => s.studentId);
    for (const student of students) {
      const key = `${student}:${test.classId}`;
      if (!groups.has(key)) groups.set(key, { studentId: String(student), classId: String(test.classId), tests: [] });
    }
  }
  for (const group of groups.values()) group.tests = tests.filter(t => String(t.classId) === group.classId);
  const results = [...groups.values()].map(group => {
    const byType = new Map<string, number[]>();
    let missing = false;
    for (const test of group.tests) {
      const score = test.scores.find(s => String(s.studentId) === group.studentId);
      if (!score) { if ((weights.find(w => w.code === test.type)?.weight ?? 1) > 0) missing = true; continue; }
      const max = Number(test.maxScore);
      if (!(max > 0)) { missing = true; continue; }
      const values = byType.get(test.type) ?? [];
      values.push(Number(score.value) * 10 / max);
      byType.set(test.type, values);
    }
    let provisional: number | null = null;
    if (configured) {
      let sum = 0; let totalWeight = 0;
      for (const weight of weights.filter(w => (w.weight ?? 0) > 0)) {
        const values = byType.get(weight.code);
        if (!values?.length) { missing = true; continue; }
        sum += values.reduce((s, n) => s + n, 0) / values.length * weight.weight!;
        totalWeight += weight.weight!;
      }
      if (totalWeight) provisional = sum / totalWeight;
    } else {
      const values = [...byType.values()].flat();
      if (values.length) provisional = values.reduce((s, n) => s + n, 0) / values.length;
    }
    return { studentId: group.studentId, classId: group.classId, provisional, final: configured && !missing ? provisional : null };
  });
  const available = results.filter(r => r.provisional !== null);
  const round = (v: number) => Math.round((v + Number.EPSILON) * 10) / 10;
  return {
    average: available.length ? round(available.reduce((s, r) => s + r.provisional!, 0) / available.length) : 0,
    finalAverage: results.length && results.every(r => r.final !== null) ? round(results.reduce((s, r) => s + r.final!, 0) / results.length) : null,
    method: configured ? 'WEIGHTED' as const : 'UNCONFIGURED' as const,
    provisional: results.length === 0 || results.some(r => r.final === null),
    groups: results.map(r => ({ ...r, provisional: r.provisional === null ? null : round(r.provisional), final: r.final === null ? null : round(r.final) })),
  };
}
