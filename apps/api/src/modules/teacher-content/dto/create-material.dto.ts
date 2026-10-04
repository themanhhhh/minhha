import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateClassMaterialDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  lessonId?: string;
}
