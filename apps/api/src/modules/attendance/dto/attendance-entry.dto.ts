import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { AttendanceStatus } from '@prisma/client';
export class AttendanceEntryDto { @IsString() studentId!: string; @IsEnum(AttendanceStatus) status!: AttendanceStatus; @IsOptional() @IsString() @MaxLength(255) note?: string; }
