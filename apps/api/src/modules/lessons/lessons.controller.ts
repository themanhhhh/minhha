import { Body, Controller, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/roles.decorator';
import type { AuthenticatedRequest } from '../auth/auth.types';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { ListLessonDto } from './dto/list-lesson.dto';
import { RecordLessonDto } from './dto/record-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { LessonsService } from './lessons.service';

@Controller('classes/:classId/lessons')
@Roles(UserRole.STUDENT, UserRole.TEACHER, UserRole.ACADEMIC_STAFF, UserRole.DIRECTOR)
export class ClassLessonsController { constructor(private readonly lessons: LessonsService) {} @Get() findByClass(@Param('classId') classId: string, @Query() query: ListLessonDto, @Req() request: AuthenticatedRequest) { return this.lessons.findByClass(classId, query, request.user!); } }

@Controller('lessons')
@Roles(UserRole.STUDENT, UserRole.TEACHER, UserRole.ACADEMIC_STAFF, UserRole.DIRECTOR)
export class LessonsController { constructor(private readonly lessons: LessonsService) {} @Get() findAll(@Query() query: ListLessonDto, @Req() request: AuthenticatedRequest) { return this.lessons.findAll(query, request.user!); } @Get(':id') findOne(@Param('id') id: string, @Req() request: AuthenticatedRequest) { return this.lessons.findOne(id, request.user!); } @Post() @Roles(UserRole.ACADEMIC_STAFF) create(@Body() dto: CreateLessonDto, @Req() request: AuthenticatedRequest) { return this.lessons.create(dto, request.user!); } @Patch(':id') @Roles(UserRole.ACADEMIC_STAFF, UserRole.TEACHER) update(@Param('id') id: string, @Body() dto: UpdateLessonDto, @Req() request: AuthenticatedRequest) { return this.lessons.update(id, dto, request.user!); } @Patch(':id/record') @Roles(UserRole.ACADEMIC_STAFF, UserRole.TEACHER) updateRecord(@Param('id') id: string, @Body() dto: RecordLessonDto, @Req() request: AuthenticatedRequest) { return this.lessons.updateRecord(id, dto, request.user!); } }
