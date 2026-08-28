import { Controller, Get, Param, Query, Req } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/roles.decorator';
import type { AuthenticatedRequest } from '../auth/auth.types';
import { ScheduleQueryDto } from './dto/schedule-query.dto';
import { StudentPortalService } from './student-portal.service';

@Controller('me') @Roles(UserRole.STUDENT)
export class StudentPortalController {
  constructor(private readonly portal: StudentPortalService) {}
  @Get('profile') profile(@Req() request: AuthenticatedRequest) { return this.portal.getProfile(request.user!); }
  @Get('classes') classes(@Req() request: AuthenticatedRequest) { return this.portal.getClasses(request.user!); }
  @Get('classes/:classId') classDetail(@Param('classId') classId: string, @Req() request: AuthenticatedRequest) { return this.portal.getClass(classId, request.user!); }
  @Get('schedule') schedule(@Query() query: ScheduleQueryDto, @Req() request: AuthenticatedRequest) { return this.portal.getSchedule(query, request.user!); }
  @Get('attendance') attendance(@Req() request: AuthenticatedRequest) { return this.portal.getAttendance(request.user!); }
  @Get('scores') scores(@Req() request: AuthenticatedRequest) { return this.portal.getScores(request.user!); }
  @Get('progress') progress(@Req() request: AuthenticatedRequest) { return this.portal.getProgress(request.user!); }
}
