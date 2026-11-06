import { PartialType } from '@nestjs/mapped-types';
import { CreateClassDto } from './create-class.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { ClassStatus } from '@prisma/client';
export class UpdateClassDto extends PartialType(CreateClassDto) {
  @IsOptional() @IsEnum(ClassStatus) status?: ClassStatus;
}
