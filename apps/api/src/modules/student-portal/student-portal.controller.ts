import { Body, Controller, Get, Param, Post, Query, Req, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Roles } from '../auth/roles.decorator';
import type { AuthenticatedRequest } from '../auth/auth.types';
import { ScheduleQueryDto } from './dto/schedule-query.dto';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';
import { StudentPortalService } from './student-portal.service';

@Controller('me') @Roles(UserRole.STUDENT)
export class StudentPortalController {
  constructor(private readonly portal: StudentPortalService) {}
  @Get('profile') profile(@Req() request: AuthenticatedRequest) { return this.portal.getProfile(request.user!); }
  @Get('classes') classes(@Req() request: AuthenticatedRequest) { return this.portal.getClasses(request.user!); }
  @Get('classes/:classId') classDetail(@Param('classId') classId: string, @Req() request: AuthenticatedRequest) { return this.portal.getClass(classId, request.user!); }
  @Get('classes/:classId/assignments') assignments(@Param('classId') classId: string, @Req() request: AuthenticatedRequest) { return this.portal.getAssignments(classId, request.user!); }
  @Post('assignments/:assignmentId/submission')
  @UseInterceptors(FilesInterceptor('files', 5))
  submitAssignment(@Param('assignmentId') assignmentId: string, @UploadedFiles() files: Express.Multer.File[], @Body() dto: SubmitAssignmentDto, @Req() request: AuthenticatedRequest) { return this.portal.submitAssignment(assignmentId, files ?? [], dto, request.user!); }
  @Get('schedule') schedule(@Query() query: ScheduleQueryDto, @Req() request: AuthenticatedRequest) { return this.portal.getSchedule(query, request.user!); }
  @Get('attendance') attendance(@Req() request: AuthenticatedRequest) { return this.portal.getAttendance(request.user!); }
  @Get('scores') scores(@Req() request: AuthenticatedRequest) { return this.portal.getScores(request.user!); }
  @Get('progress') progress(@Req() request: AuthenticatedRequest) { return this.portal.getProgress(request.user!); }
}
