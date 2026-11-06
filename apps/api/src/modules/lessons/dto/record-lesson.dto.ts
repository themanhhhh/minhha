import { IsOptional, IsUrl, MaxLength } from 'class-validator';
export class RecordLessonDto { @IsOptional() @IsUrl({ protocols: ['https'], require_protocol: true }) @MaxLength(255) recordUrl?: string; }
