import { Global, Module } from '@nestjs/common';
import { GradeService } from './grade.service';
import { AcademicDataController } from './academic-data.controller';
import { AcademicOperationsService } from './academic-operations.service';

@Global()
@Module({ providers: [GradeService, AcademicOperationsService], controllers: [AcademicDataController], exports: [GradeService] })
export class AcademicDataModule {}
