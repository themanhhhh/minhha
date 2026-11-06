import { IsDateString, IsEmail, IsEnum, IsOptional, IsString, MaxLength, Matches, MinLength } from 'class-validator';
import { JlptLevel } from '@prisma/client';

export class CreateStudentDto {
  @IsEmail() @MaxLength(255) email!: string;
  @IsString() @MinLength(2) @MaxLength(100) fullName!: string;
  @IsString() studentCode!: string;
  @IsOptional() @IsString() @MinLength(8) password?: string;
  @IsOptional() @IsString() gender?: string;
  @IsDateString({ strict: true }) dateOfBirth!: string;
  @IsOptional() @IsString() @Matches(/^\+?\d{8,11}$/) @MaxLength(12) phone?: string;
  @IsOptional() @IsString() @MaxLength(255) goal?: string;
  @IsOptional() @IsString() @MaxLength(255) emergencyContact?: string;
  @IsOptional() @IsEnum(JlptLevel) currentLevel?: JlptLevel;
  @IsOptional() @IsEnum(JlptLevel) targetLevel?: JlptLevel;
}
