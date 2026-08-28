import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { AttendanceEntryDto } from './attendance-entry.dto';
export class UpdateAttendanceDto { @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => AttendanceEntryDto) entries!: AttendanceEntryDto[]; }
