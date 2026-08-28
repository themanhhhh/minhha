import { IsDateString, IsOptional } from 'class-validator';
export class ScheduleQueryDto { @IsOptional() @IsDateString() fromDate?: string; @IsOptional() @IsDateString() toDate?: string; }
