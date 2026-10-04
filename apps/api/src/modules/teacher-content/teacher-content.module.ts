import { Module } from '@nestjs/common';
import { TeachingAccessService } from '../teaching/teaching-access.service';
import { TeacherAssignmentsController, TeacherClassContentController, TeacherMaterialsController } from './teacher-content.controller';
import { TeacherContentService } from './teacher-content.service';

@Module({
  controllers: [TeacherClassContentController, TeacherAssignmentsController, TeacherMaterialsController],
  providers: [TeacherContentService, TeachingAccessService],
})
export class TeacherContentModule {}
