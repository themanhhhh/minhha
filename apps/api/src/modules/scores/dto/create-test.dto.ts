import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';
import { TestType } from '@prisma/client';
export class CreateTestDto { @IsString() classId!: string; @IsString() @MinLength(2) @MaxLength(100) name!: string; @IsEnum(TestType) type!: TestType; @IsOptional() @Type(() => Number) @IsNumber() @Min(0.01) maxScore = 10; @IsOptional() @IsDateString() testDate?: string; }
