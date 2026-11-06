import { IsDateString, IsEnum, IsNumberString, IsOptional, IsString, IsUrl, MaxLength, Matches, MinLength } from 'class-validator';
import { LessonStatus } from '@prisma/client';

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
export class CreateLessonDto {
  @IsString() classId!: string;
  @IsString() @MinLength(2) @MaxLength(100) title!: string;
  @IsOptional() @IsNumberString() substituteTeacherId?: string;
  @IsDateString() lessonDate!: string;
  @Matches(timePattern, { message: 'startTime must use HH:mm format' }) startTime!: string;
  @Matches(timePattern, { message: 'endTime must use HH:mm format' }) endTime!: string;
  @IsOptional() @IsString() @MaxLength(255) content?: string;
  @IsOptional() @IsUrl({ protocols: ['https'], require_protocol: true }) @MaxLength(255) recordUrl?: string;
  @IsOptional() @IsEnum(LessonStatus) status?: LessonStatus;
}
