import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../common/pagination.dto';
export class ListAuditDto extends PaginationDto { @IsOptional() @IsString() entity?: string; @IsOptional() @IsString() action?: string; }
