import { Controller, Get, Query } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/roles.decorator';
import { ReportFilterDto } from './dto/report-filter.dto';
import { ReportsService } from './reports.service';
@Controller() @Roles(UserRole.DIRECTOR, UserRole.ACADEMIC_STAFF)
export class ReportsController { constructor(private readonly reports: ReportsService) {} @Get('dashboard/director') dashboard() { return this.reports.getDirectorDashboard(); } @Get('reports/students') students(@Query() filter: ReportFilterDto) { return this.reports.getReports(filter); } @Get('reports/teachers') teachers(@Query() filter: ReportFilterDto) { return this.reports.getReports(filter); } @Get('reports/classes') classes(@Query() filter: ReportFilterDto) { return this.reports.getReports(filter); } @Get('reports/attendance') attendance(@Query() filter: ReportFilterDto) { return this.reports.getReports(filter); } @Get('reports/scores') scores(@Query() filter: ReportFilterDto) { return this.reports.getReports(filter); } }
