import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AttendanceStatus } from '@prisma/client';
export class AttendanceEntryDto { @IsString() studentId!: string; @IsEnum(AttendanceStatus) status!: AttendanceStatus; @IsOptional() @IsString() note?: string; }
