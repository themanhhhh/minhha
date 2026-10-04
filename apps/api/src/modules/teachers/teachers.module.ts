import { Module } from '@nestjs/common';
import { TeacherProfileController, TeachersController } from './teachers.controller';
import { TeachersService } from './teachers.service';
@Module({ controllers: [TeachersController, TeacherProfileController], providers: [TeachersService], exports: [TeachersService] })
export class TeachersModule {}
