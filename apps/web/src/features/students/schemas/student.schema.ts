import { z } from 'zod';
export const studentSchema = z.object({ fullName: z.string().min(1, 'Họ tên là bắt buộc'), email: z.string().email('Email không hợp lệ'), phone: z.string().optional(), currentLevel: z.enum(['N5', 'N4', 'N3', 'N2', 'N1']), targetLevel: z.enum(['N5', 'N4', 'N3', 'N2', 'N1']) });
export type StudentFormValues = z.infer<typeof studentSchema>;
