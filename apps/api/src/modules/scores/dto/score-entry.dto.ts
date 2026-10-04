import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
export class ScoreEntryDto { @IsString() studentId!: string; @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(100) value?: number | null; @IsOptional() @IsString() note?: string; }
