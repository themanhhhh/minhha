import { z } from 'zod';
export const studentSchema = z.object({ fullName: z.string().min(1, 'Họ tên là bắt buộc').max(100), email: z.string().email('Email không hợp lệ').max(255), dateOfBirth: z.string().min(1, 'Ngày sinh là bắt buộc'), phone: z.string().max(12).optional(), goal: z.string().max(255).optional(), emergencyContact: z.string().max(255).optional(), currentLevel: z.enum(['N5', 'N4', 'N3', 'N2', 'N1']), targetLevel: z.enum(['N5', 'N4', 'N3', 'N2', 'N1']) });
export type StudentFormValues = z.infer<typeof studentSchema>;
