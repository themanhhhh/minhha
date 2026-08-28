import { Module } from '@nestjs/common';
import { ClassLessonsController, LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';
@Module({ controllers: [ClassLessonsController, LessonsController], providers: [LessonsService], exports: [LessonsService] })
export class LessonsModule {}
