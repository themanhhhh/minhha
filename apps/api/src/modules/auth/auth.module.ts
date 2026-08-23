import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RolesGuard } from './roles.guard';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, RolesGuard],
  exports: [AuthService, RolesGuard],
})
export class AuthModule {}
