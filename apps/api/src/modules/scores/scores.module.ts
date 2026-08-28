import { Module } from '@nestjs/common';
import { ScoresController } from './scores.controller';
import { ScoresService } from './scores.service';
import { TeachingAccessService } from '../teaching/teaching-access.service';
@Module({ controllers: [ScoresController], providers: [ScoresService, TeachingAccessService], exports: [ScoresService] })
export class ScoresModule {}
