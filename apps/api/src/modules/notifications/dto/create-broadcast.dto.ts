import { Transform } from 'class-transformer';
import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateBroadcastDto {
  @IsString()
  @Transform(({ value }) => String(value))
  classId!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(5000)
  body!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Matches(/^\/(?!\/)/, { message: 'actionUrl must be an internal path' })
  actionUrl?: string;
}
