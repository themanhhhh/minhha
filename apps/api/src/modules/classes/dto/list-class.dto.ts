import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ClassStatus } from '@prisma/client';
import { PaginationDto } from '../../../common/pagination.dto';
export class ListClassDto extends PaginationDto { @IsOptional() @IsString() search?: string; @IsOptional() @IsEnum(ClassStatus) status?: ClassStatus; @IsOptional() @IsString() courseId?: string; @IsOptional() @IsString() teacherId?: string; }
