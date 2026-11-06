export interface Teacher { id: number; code: string; fullName: string; email: string; phone?: string; jlptLevel: string; classCount: number; status: 'ACTIVE' | 'INACTIVE'; }
export interface Course { description?: string | null; id: number; name: string; level: string; lessons: number; classCount: number; tuition?: string; status: 'ACTIVE' | 'INACTIVE'; }
export interface ClassRoom { session?: string | null; meetingUrl?: string | null; id: number; code: string; name: string; courseName: string; teacherName: string; studentCount: number; capacity: number; status: 'ACTIVE' | 'UPCOMING' | 'COMPLETED'; startDate?: string; endDate?: string | null; schedule?: string; room?: string | null; lessonCount?: number; }
export interface Lesson { id: number; classId: number; className?: string; title: string; date: string; startTime: string; endTime: string; status: 'UPCOMING' | 'IN_PROGRESS' | 'POSTPONED' | 'COMPLETED' | 'CANCELLED'; recordUrl?: string; room?: string | null; }
export interface Attendance { studentId: number; lessonId: number; status: 'PRESENT' | 'ABSENT' | 'LATE' | null; note?: string; }
export interface Score { studentId: number; testId: number; value: number; note?: string; }
