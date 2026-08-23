export interface Teacher { id: number; code: string; fullName: string; email: string; phone?: string; jlptLevel: string; classCount: number; status: 'ACTIVE' | 'INACTIVE'; }
export interface Course { id: number; name: string; level: string; lessons: number; classCount: number; tuition?: string; status: 'ACTIVE' | 'INACTIVE'; }
export interface ClassRoom { id: number; code: string; name: string; courseName: string; teacherName: string; studentCount: number; capacity: number; status: 'ACTIVE' | 'UPCOMING' | 'COMPLETED'; }
export interface Lesson { id: number; classId: number; className?: string; title: string; date: string; startTime: string; endTime: string; status: 'UPCOMING' | 'COMPLETED'; recordUrl?: string; }
export interface Attendance { studentId: number; lessonId: number; status: 'PRESENT' | 'ABSENT' | 'LATE'; note?: string; }
export interface Score { studentId: number; testId: number; value: number; note?: string; }
