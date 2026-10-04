import { Controller, Get, Query } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/roles.decorator';
import { ListUserDto } from './dto/list-user.dto';
import { UsersService } from './users.service';

@Controller('users')
@Roles(UserRole.ACADEMIC_STAFF, UserRole.DIRECTOR)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  findAll(@Query() query: ListUserDto) {
    return this.users.findAll(query);
  }
}
