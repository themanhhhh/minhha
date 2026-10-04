import { IsDateString, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateTeacherAssignmentDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  dueAt!: string;
}
