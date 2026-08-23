import { IsEnum, IsInt, IsNumber, IsString, Min, MinLength } from 'class-validator';
import { JlptLevel } from '@prisma/client';
export class CreateCourseDto { @IsString() code!: string; @IsString() @MinLength(2) name!: string; @IsEnum(JlptLevel) level!: JlptLevel; @IsInt() @Min(1) totalLessons!: number; @IsNumber() @Min(0) tuition!: number; }
