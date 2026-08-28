import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { TestType } from '@prisma/client';
export class CreateTestDto { @IsString() classId!: string; @IsString() @MinLength(2) name!: string; @IsEnum(TestType) type!: TestType; @IsOptional() @Type(() => Number) @IsNumber() @Min(0) maxScore = 10; @IsOptional() @IsDateString() testDate?: string; }
