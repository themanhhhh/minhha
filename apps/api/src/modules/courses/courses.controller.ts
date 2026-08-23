import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/roles.decorator';
import { CreateCourseDto } from './dto/create-course.dto';
import { ListCourseDto } from './dto/list-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CoursesService } from './courses.service';
@Controller('courses') @Roles(UserRole.ACADEMIC_STAFF, UserRole.DIRECTOR)
export class CoursesController { constructor(private readonly courses: CoursesService) {} @Get() findAll(@Query() query: ListCourseDto) { return this.courses.findAll(query); } @Get(':id') findOne(@Param('id') id: string) { return this.courses.findOne(id); } @Post() @Roles(UserRole.ACADEMIC_STAFF) create(@Body() dto: CreateCourseDto) { return this.courses.create(dto); } @Patch(':id') @Roles(UserRole.ACADEMIC_STAFF) update(@Param('id') id: string, @Body() dto: UpdateCourseDto) { return this.courses.update(id, dto); } }
