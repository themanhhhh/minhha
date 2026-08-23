import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { JlptLevel } from '@prisma/client';

export class CreateTeacherDto {
  @IsEmail() email!: string;
  @IsString() @MinLength(2) fullName!: string;
  @IsString() teacherCode!: string;
  @IsOptional() @IsString() @MinLength(8) password?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsEnum(JlptLevel) jlptLevel?: JlptLevel;
}
