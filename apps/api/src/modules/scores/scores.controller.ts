import { Body, Controller, Get, Param, Post, Put, Query, Req } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/roles.decorator';
import type { AuthenticatedRequest } from '../auth/auth.types';
import { CreateTestDto } from './dto/create-test.dto';
import { ListTestDto } from './dto/list-test.dto';
import { UpdateScoresDto } from './dto/update-scores.dto';
import { ScoresService } from './scores.service';

@Controller()
export class ScoresController {
  constructor(private readonly scores: ScoresService) {}
  @Get('classes/:classId/tests') @Roles(UserRole.STUDENT, UserRole.TEACHER, UserRole.ACADEMIC_STAFF, UserRole.DIRECTOR) findTests(@Param('classId') classId: string, @Query() query: ListTestDto, @Req() request: AuthenticatedRequest) { return this.scores.findTestsByClass(classId, query, request.user!); }
  @Post('tests') @Roles(UserRole.TEACHER, UserRole.ACADEMIC_STAFF) createTest(@Body() dto: CreateTestDto, @Req() request: AuthenticatedRequest) { return this.scores.createTest(dto, request.user!); }
  @Get('tests/:testId/scores') @Roles(UserRole.STUDENT, UserRole.TEACHER, UserRole.ACADEMIC_STAFF, UserRole.DIRECTOR) findScores(@Param('testId') testId: string, @Req() request: AuthenticatedRequest) { return this.scores.findScores(testId, request.user!); }
  @Put('tests/:testId/scores') @Roles(UserRole.TEACHER, UserRole.ACADEMIC_STAFF) updateScores(@Param('testId') testId: string, @Body() dto: UpdateScoresDto, @Req() request: AuthenticatedRequest) { return this.scores.updateScores(testId, dto, request.user!); }
}
