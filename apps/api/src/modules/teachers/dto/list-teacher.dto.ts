import { IsEnum, IsOptional, IsString } from 'class-validator';
import { UserStatus } from '@prisma/client';
import { PaginationDto } from '../../../common/pagination.dto';
export class ListTeacherDto extends PaginationDto { @IsOptional() @IsString() search?: string; @IsOptional() @IsEnum(UserStatus) status?: UserStatus; }
