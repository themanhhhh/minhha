import { IsOptional, IsString } from 'class-validator';
export class RecordLessonDto { @IsOptional() @IsString() recordUrl?: string; }
