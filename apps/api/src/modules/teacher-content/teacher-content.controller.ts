import { Body, Controller, Delete, Get, Param, Post, Req, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Roles } from '../auth/roles.decorator';
import type { AuthenticatedRequest } from '../auth/auth.types';
import { CreateTeacherAssignmentDto } from './dto/create-assignment.dto';
import { CreateClassMaterialDto } from './dto/create-material.dto';
import { TeacherContentService } from './teacher-content.service';

@Controller('teacher/classes')
@Roles(UserRole.TEACHER, UserRole.ACADEMIC_STAFF, UserRole.DIRECTOR)
export class TeacherClassContentController {
  constructor(private readonly content: TeacherContentService) {}

  @Get()
  getClasses(@Req() request: AuthenticatedRequest) {
    return this.content.getTeacherClasses(request.user!);
  }

  @Get(':classId')
  getClass(@Param('classId') classId: string, @Req() request: AuthenticatedRequest) {
    return this.content.getTeacherClass(classId, request.user!);
  }

  @Get(':classId/students')
  getStudents(@Param('classId') classId: string, @Req() request: AuthenticatedRequest) {
    return this.content.getClassStudents(classId, request.user!);
  }

  @Get(':classId/content')
  getContent(@Param('classId') classId: string, @Req() request: AuthenticatedRequest) {
    return this.content.getClassContent(classId, request.user!);
  }

  @Post(':classId/assignments')
  @Roles(UserRole.TEACHER, UserRole.ACADEMIC_STAFF)
  @UseInterceptors(FilesInterceptor('files', 5))
  createAssignment(
    @Param('classId') classId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: CreateTeacherAssignmentDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.content.createAssignment(classId, files ?? [], dto, request.user!);
  }

  @Post(':classId/materials')
  @Roles(UserRole.TEACHER, UserRole.ACADEMIC_STAFF)
  @UseInterceptors(FilesInterceptor('files', 1))
  createMaterial(
    @Param('classId') classId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: CreateClassMaterialDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.content.createMaterial(classId, files ?? [], dto, request.user!);
  }
}

@Controller('teacher/assignments')
@Roles(UserRole.TEACHER, UserRole.ACADEMIC_STAFF)
export class TeacherAssignmentsController {
  constructor(private readonly content: TeacherContentService) {}

  @Delete(':assignmentId')
  deleteAssignment(@Param('assignmentId') assignmentId: string, @Req() request: AuthenticatedRequest) {
    return this.content.deleteAssignment(assignmentId, request.user!);
  }
}

@Controller('teacher/materials')
@Roles(UserRole.TEACHER, UserRole.ACADEMIC_STAFF)
export class TeacherMaterialsController {
  constructor(private readonly content: TeacherContentService) {}

  @Delete(':materialId')
  deleteMaterial(@Param('materialId') materialId: string, @Req() request: AuthenticatedRequest) {
    return this.content.deleteMaterial(materialId, request.user!);
  }
}
