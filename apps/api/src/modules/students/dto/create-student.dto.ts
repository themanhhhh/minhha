import { IsDateString, IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { JlptLevel } from '@prisma/client';

export class CreateStudentDto {
  @IsEmail() email!: string;
  @IsString() @MinLength(2) fullName!: string;
  @IsString() studentCode!: string;
  @IsOptional() @IsString() @MinLength(8) password?: string;
  @IsOptional() @IsString() gender?: string;
  @IsOptional() @IsDateString() dateOfBirth?: string;
  @IsOptional() @IsEnum(JlptLevel) currentLevel?: JlptLevel;
  @IsOptional() @IsEnum(JlptLevel) targetLevel?: JlptLevel;
}
