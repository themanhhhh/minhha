import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { JlptLevel } from '@prisma/client';
export class ReportFilterDto { @IsOptional() @IsDateString() fromDate?: string; @IsOptional() @IsDateString() toDate?: string; @IsOptional() @IsEnum(JlptLevel) level?: JlptLevel; @IsOptional() @IsString() classId?: string; @IsOptional() @IsString() teacherId?: string; @IsOptional() @IsString() classCode?: string; @IsOptional() @IsString() teacherName?: string; @IsOptional() @IsString() period?: string; }
