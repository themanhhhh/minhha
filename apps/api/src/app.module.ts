import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { resolve } from 'node:path';
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
import { StorageModule } from './storage/storage.module';
import { TeacherContentModule } from './modules/teacher-content/teacher-content.module';
import { UsersModule } from './modules/users/users.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AcademicDataModule } from './modules/academic-data/academic-data.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: [resolve(__dirname, '../.env'), resolve(__dirname, '../../../.env')],
      validate: (config: Record<string, string | undefined>) => {
        const required = ['DATABASE_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
        const missing = required.filter((key) => !config[key]);
        if (missing.length > 0) {
          throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
        }
        return config;
      },
    }),
    StorageModule,
    TeacherContentModule,
    UsersModule,
    NotificationsModule,
    DatabaseModule,
    AcademicDataModule,
    AuthModule,
    StudentsModule,
    TeachersModule,
    CoursesModule,
    ClassesModule,
    LessonsModule,
    AttendanceModule,
    ScoresModule,
    StudentPortalModule,
    ReportsModule,
    AuditModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
