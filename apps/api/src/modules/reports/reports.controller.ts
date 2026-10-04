import { Controller, Get, Query, Req } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/roles.decorator';
import { ReportFilterDto } from './dto/report-filter.dto';
import { ReportsService } from './reports.service';
import type { AuthenticatedRequest } from '../auth/auth.types';
@Controller() @Roles(UserRole.DIRECTOR, UserRole.ACADEMIC_STAFF)
export class ReportsController { constructor(private readonly reports: ReportsService) {} @Get('dashboard/me') @Roles(UserRole.STUDENT, UserRole.TEACHER, UserRole.ACADEMIC_STAFF, UserRole.DIRECTOR) dashboardMe(@Req() request: AuthenticatedRequest) { return this.reports.getDashboard(request.user!); } @Get('dashboard/director') dashboard() { return this.reports.getDirectorDashboard(); } @Get('reports/filters') filters() { return this.reports.getFilters(); } @Get('reports/teacher-performance') teacherPerformance(@Query() filter: ReportFilterDto) { return this.reports.getTeacherPerformance(filter); } @Get('reports/students') students(@Query() filter: ReportFilterDto) { return this.reports.getReports(filter); } @Get('reports/teachers') teachers(@Query() filter: ReportFilterDto) { return this.reports.getReports(filter); } @Get('reports/classes') classes(@Query() filter: ReportFilterDto) { return this.reports.getReports(filter); } @Get('reports/attendance') attendance(@Query() filter: ReportFilterDto) { return this.reports.getReports(filter); } @Get('reports/scores') scores(@Query() filter: ReportFilterDto) { return this.reports.getReports(filter); } }
