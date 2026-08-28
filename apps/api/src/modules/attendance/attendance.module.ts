import { Module } from '@nestjs/common';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { TeachingAccessService } from '../teaching/teaching-access.service';
@Module({ controllers: [AttendanceController], providers: [AttendanceService, TeachingAccessService], exports: [AttendanceService] })
export class AttendanceModule {}
