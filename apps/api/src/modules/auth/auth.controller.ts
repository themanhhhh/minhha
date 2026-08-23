import { Body, Controller, Get, HttpCode, Post, Req, Res } from '@nestjs/common';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { UserRole } from '@prisma/client';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';
import { Roles } from './roles.decorator';
import type { AuthenticatedRequest } from './auth.types';

class LoginDto {
  @IsEmail() email!: string;
  @IsString() @MinLength(8) password!: string;
}

class ForgotPasswordDto {
  @IsEmail() email!: string;
}

class ResetPasswordDto {
  @IsString() token!: string;
  @IsString() @MinLength(8) newPassword!: string;
}

const accessCookie = 'access_token';
const refreshCookie = 'refresh_token';
const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/' };

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const session = await this.authService.login(dto.email, dto.password);
    this.setSessionCookies(response, session.accessToken, session.refreshToken);
    return { user: session.user };
  }

  @Public()
  @Post('refresh')
  async refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const session = await this.authService.refresh(request.cookies?.[refreshCookie]);
    this.setSessionCookies(response, session.accessToken, session.refreshToken);
    return { user: session.user };
  }

  @Public()
  @HttpCode(204)
  @Post('logout')
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    await this.authService.logout(request.cookies?.[refreshCookie]);
    response.clearCookie(accessCookie, cookieOptions);
    response.clearCookie(refreshCookie, cookieOptions);
  }

  @Public()
  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.requestPasswordReset(dto.email);
  }

  @Public()
  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @Get('me')
  me(@Req() request: AuthenticatedRequest) {
    return this.authService.getCurrentUser(request.user!.sub);
  }

  @Roles(UserRole.ACADEMIC_STAFF, UserRole.DIRECTOR)
  @Get('staff-check')
  staffCheck() {
    return { status: 'ok', scope: 'staff' };
  }

  private setSessionCookies(response: Response, accessToken: string, refreshToken: string) {
    response.cookie(accessCookie, accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
    response.cookie(refreshCookie, refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
  }
}
