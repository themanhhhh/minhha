import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { LessonStatus } from '@prisma/client';
import { PaginationDto } from '../../../common/pagination.dto';
export class ListLessonDto extends PaginationDto { @IsOptional() @IsEnum(LessonStatus) status?: LessonStatus; @IsOptional() @IsDateString() fromDate?: string; @IsOptional() @IsDateString() toDate?: string; }
