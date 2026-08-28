import { Body, Controller, Get, Param, Put, Req } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/roles.decorator';
import type { AuthenticatedRequest } from '../auth/auth.types';
import { AttendanceService } from './attendance.service';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
@Controller('lessons/:lessonId/attendance') @Roles(UserRole.STUDENT, UserRole.TEACHER, UserRole.ACADEMIC_STAFF, UserRole.DIRECTOR)
export class AttendanceController { constructor(private readonly attendance: AttendanceService) {} @Get() findByLesson(@Param('lessonId') lessonId: string, @Req() request: AuthenticatedRequest) { return this.attendance.findByLesson(lessonId, request.user!); } @Put() @Roles(UserRole.TEACHER, UserRole.ACADEMIC_STAFF) update(@Param('lessonId') lessonId: string, @Body() dto: UpdateAttendanceDto, @Req() request: AuthenticatedRequest) { return this.attendance.update(lessonId, dto, request.user!); } }
