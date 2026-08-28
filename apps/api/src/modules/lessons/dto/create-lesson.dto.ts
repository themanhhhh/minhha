import { IsDateString, IsEnum, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { LessonStatus } from '@prisma/client';

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
export class CreateLessonDto {
  @IsString() classId!: string;
  @IsString() @MinLength(2) title!: string;
  @IsDateString() lessonDate!: string;
  @Matches(timePattern, { message: 'startTime must use HH:mm format' }) startTime!: string;
  @Matches(timePattern, { message: 'endTime must use HH:mm format' }) endTime!: string;
  @IsOptional() @IsString() content?: string;
  @IsOptional() @IsString() recordUrl?: string;
  @IsOptional() @IsEnum(LessonStatus) status?: LessonStatus;
}
