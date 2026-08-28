import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthController } from './modules/health/health.controller';
import { StudentsModule } from './modules/students/students.module';
import { TeachersModule } from './modules/teachers/teachers.module';
import { CoursesModule } from './modules/courses/courses.module';
import { ClassesModule } from './modules/classes/classes.module';
import { LessonsModule } from './modules/lessons/lessons.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { ScoresModule } from './modules/scores/scores.module';
import { StudentPortalModule } from './modules/student-portal/student-portal.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AuditModule } from './modules/audit/audit.module';

@Module({ imports: [DatabaseModule, AuthModule, StudentsModule, TeachersModule, CoursesModule, ClassesModule, LessonsModule, AttendanceModule, ScoresModule, StudentPortalModule, ReportsModule, AuditModule], controllers: [HealthController] })
export class AppModule {}
