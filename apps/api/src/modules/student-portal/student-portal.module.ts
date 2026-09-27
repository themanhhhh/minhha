import { Module } from '@nestjs/common';
import { StudentPortalController } from './student-portal.controller';
import { StudentPortalService } from './student-portal.service';
import { StorageModule } from '../../storage/storage.module';
@Module({ imports: [StorageModule], controllers: [StudentPortalController], providers: [StudentPortalService], exports: [StudentPortalService] })
export class StudentPortalModule {}
