import { IsEnum, IsOptional, IsString } from 'class-validator';
import { UserStatus, JlptLevel } from '@prisma/client';
import { PaginationDto } from '../../../common/pagination.dto';
import { LearningStatus } from '../../../common/academic-rules';

export class ListStudentDto extends PaginationDto {
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsEnum(JlptLevel) level?: JlptLevel;
  @IsOptional() @IsEnum(LearningStatus) status?: LearningStatus;
  @IsOptional() @IsEnum(UserStatus) accountStatus?: UserStatus;
}
