import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, Req } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/roles.decorator';
import { AcademicOperationsService } from './academic-operations.service';
import { ReservationDto, TransferDto, UpdateWeightsDto } from './academic-data.dto';
import type { AuthenticatedRequest } from '../auth/auth.types';

@Controller()
@Roles(UserRole.ACADEMIC_STAFF, UserRole.DIRECTOR)
export class AcademicDataController {
  constructor(private readonly operations: AcademicOperationsService) {}
  @Get('lookups') @Roles(UserRole.ACADEMIC_STAFF, UserRole.DIRECTOR, UserRole.TEACHER, UserRole.STUDENT)
  lookups() { return this.operations.lookups(); }
  @Patch('lookups/test-weights') @Roles(UserRole.ACADEMIC_STAFF)
  weights(@Body() dto: UpdateWeightsDto, @Req() req: AuthenticatedRequest) { return this.operations.updateWeights(dto, req.user!); }
  @Get('academic/operations') history(@Query('studentId') studentId?: string) { return this.operations.history(studentId); }
  @Post('academic/transfers') @Roles(UserRole.ACADEMIC_STAFF)
  transfer(@Body() dto: TransferDto, @Req() req: AuthenticatedRequest) { return this.operations.transfer(dto, req.user!); }
  @Post('academic/reservations') @Roles(UserRole.ACADEMIC_STAFF)
  reserve(@Body() dto: ReservationDto, @Req() req: AuthenticatedRequest) { return this.operations.reserve(dto, req.user!); }
  @Post('academic/reservations/:id/resume') @Roles(UserRole.ACADEMIC_STAFF)
  resume(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest) { return this.operations.resume(String(id), req.user!); }
  @Post('academic/reservations/:id/cancel') @Roles(UserRole.ACADEMIC_STAFF)
  cancel(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest) { return this.operations.cancel(String(id), req.user!); }
  @Post('academic/reservations/expire') @Roles(UserRole.ACADEMIC_STAFF)
  expire(@Req() req: AuthenticatedRequest) { return this.operations.expire(req.user!); }
}
