import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CourseStatus, JlptLevel } from '@prisma/client';
import { PaginationDto } from '../../../common/pagination.dto';
export class ListCourseDto extends PaginationDto { @IsOptional() @IsString() search?: string; @IsOptional() @IsEnum(JlptLevel) level?: JlptLevel; @IsOptional() @IsEnum(CourseStatus) status?: CourseStatus; }
