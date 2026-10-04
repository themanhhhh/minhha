import { IsEnum, IsOptional, IsString } from 'class-validator';
import { UserRole, UserStatus } from '@prisma/client';
import { PaginationDto } from '../../../common/pagination.dto';

export class ListUserDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}
