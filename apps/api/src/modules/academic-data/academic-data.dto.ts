import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsDateString, IsEnum, IsInt, IsNumber, IsNumberString, IsOptional, IsString, Max, MaxLength, Min, ValidateNested } from 'class-validator';
import { TestType } from '@prisma/client';

export class WeightEntryDto {
  @IsEnum(TestType) code!: TestType;
  @IsNumber({ allowNaN: false, allowInfinity: false }) @Min(0) @Max(100) weight!: number;
}
export class UpdateWeightsDto {
  @IsArray() @ArrayMinSize(4) @ArrayMaxSize(4) @ValidateNested({ each: true }) @Type(() => WeightEntryDto) entries!: WeightEntryDto[];
}
export class TransferDto {
  @IsNumberString() studentId!: string;
  @IsNumberString() fromClassId!: string;
  @IsNumberString() toClassId!: string;
  @IsOptional() @IsString() @MaxLength(255) reason?: string;
}
export class ReservationDto {
  @IsNumberString() studentId!: string;
  @IsNumberString() classId!: string;
  @IsDateString({ strict: true }) startDate!: string;
  @IsInt() @Min(1) @Max(24) durationMonths!: number;
  @IsString() @MaxLength(255) reason!: string;
}
