import { IsEnum, IsOptional } from 'class-validator';
import { TestType } from '@prisma/client';
import { PaginationDto } from '../../../common/pagination.dto';
export class ListTestDto extends PaginationDto { @IsOptional() @IsEnum(TestType) type?: TestType; }
