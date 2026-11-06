import { IsEnum, IsInt, IsNumber, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';
import { JlptLevel } from '@prisma/client';
export class CreateCourseDto { @IsOptional() @IsString() @MaxLength(255) description?: string; @IsString() code!: string; @IsString() @MinLength(2) @MaxLength(100) name!: string; @IsEnum(JlptLevel) level!: JlptLevel; @IsInt() @Min(1) totalLessons!: number; @IsNumber() @Min(0) tuition!: number; }
