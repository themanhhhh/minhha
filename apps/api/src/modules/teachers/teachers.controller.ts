import { Body, Controller, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/roles.decorator';
import type { AuthenticatedRequest } from '../auth/auth.types';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { ListTeacherDto } from './dto/list-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { TeachersService } from './teachers.service';
@Controller('teachers') @Roles(UserRole.ACADEMIC_STAFF, UserRole.DIRECTOR)
export class TeachersController { constructor(private readonly teachers: TeachersService) {} @Get() findAll(@Query() query: ListTeacherDto) { return this.teachers.findAll(query); } @Get(':id') findOne(@Param('id') id: string) { return this.teachers.findOne(id); } @Post() @Roles(UserRole.ACADEMIC_STAFF) create(@Body() dto: CreateTeacherDto) { return this.teachers.create(dto); } @Patch(':id') @Roles(UserRole.ACADEMIC_STAFF) update(@Param('id') id: string, @Body() dto: UpdateTeacherDto) { return this.teachers.update(id, dto); } }

@Controller('me/teacher-profile')
@Roles(UserRole.TEACHER)
export class TeacherProfileController {
  constructor(private readonly teachers: TeachersService) {}

  @Get()
  getCurrent(@Req() request: AuthenticatedRequest) {
    return this.teachers.getCurrent(request.user!);
  }
}
