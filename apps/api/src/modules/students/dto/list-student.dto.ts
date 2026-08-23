import { IsEnum, IsOptional, IsString } from 'class-validator';
import { UserStatus, JlptLevel } from '@prisma/client';
import { PaginationDto } from '../../../common/pagination.dto';

export class ListStudentDto extends PaginationDto {
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsEnum(JlptLevel) level?: JlptLevel;
  @IsOptional() @IsEnum(UserStatus) status?: UserStatus;
}
