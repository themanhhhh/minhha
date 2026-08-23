import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/roles.decorator';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { EnrollStudentDto } from './dto/enroll-student.dto';
import { ListClassDto } from './dto/list-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
@Controller('classes') @Roles(UserRole.ACADEMIC_STAFF, UserRole.DIRECTOR)
export class ClassesController { constructor(private readonly classes: ClassesService) {} @Get() findAll(@Query() query: ListClassDto) { return this.classes.findAll(query); } @Get(':id') findOne(@Param('id') id: string) { return this.classes.findOne(id); } @Post() @Roles(UserRole.ACADEMIC_STAFF) create(@Body() dto: CreateClassDto) { return this.classes.create(dto); } @Patch(':id') @Roles(UserRole.ACADEMIC_STAFF) update(@Param('id') id: string, @Body() dto: UpdateClassDto) { return this.classes.update(id, dto); } @Post(':id/students') @Roles(UserRole.ACADEMIC_STAFF) enroll(@Param('id') classId: string, @Body() dto: EnrollStudentDto) { return this.classes.enroll(classId, dto.studentId); } @Delete(':id/students/:studentId') @Roles(UserRole.ACADEMIC_STAFF) removeEnrollment(@Param('id') classId: string, @Param('studentId') studentId: string) { return this.classes.removeEnrollment(classId, studentId); } }
