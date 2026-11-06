import { IsEmail, IsEnum, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { JlptLevel } from '@prisma/client';

export class CreateTeacherDto {
  @IsEmail() @MaxLength(255) email!: string;
  @IsString() @MinLength(2) @MaxLength(100) fullName!: string;
  @IsString() teacherCode!: string;
  @IsOptional() @IsString() @MinLength(8) password?: string;
  @IsOptional() @IsString() @Matches(/^\+?\d{8,11}$/) @MaxLength(12) phone?: string;
  @IsOptional() @IsEnum(JlptLevel) jlptLevel?: JlptLevel;
}
