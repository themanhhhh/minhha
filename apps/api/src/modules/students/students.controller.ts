import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/roles.decorator';
import { CreateStudentDto } from './dto/create-student.dto';
import { ListStudentDto } from './dto/list-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentsService } from './students.service';

@Controller('students')
@Roles(UserRole.ACADEMIC_STAFF, UserRole.DIRECTOR)
export class StudentsController {
  constructor(private readonly students: StudentsService) {}
  @Get() findAll(@Query() query: ListStudentDto) { return this.students.findAll(query); }
  @Get(':id') findOne(@Param('id') id: string) { return this.students.findOne(id); }
  @Post() @Roles(UserRole.ACADEMIC_STAFF) create(@Body() dto: CreateStudentDto) { return this.students.create(dto); }
  @Patch(':id') @Roles(UserRole.ACADEMIC_STAFF) update(@Param('id') id: string, @Body() dto: UpdateStudentDto) { return this.students.update(id, dto); }
}
