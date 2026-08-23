import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthController } from './modules/health/health.controller';
import { StudentsModule } from './modules/students/students.module';
import { TeachersModule } from './modules/teachers/teachers.module';
import { CoursesModule } from './modules/courses/courses.module';
import { ClassesModule } from './modules/classes/classes.module';

@Module({ imports: [DatabaseModule, AuthModule, StudentsModule, TeachersModule, CoursesModule, ClassesModule], controllers: [HealthController] })
export class AppModule {}
