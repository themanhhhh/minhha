import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole, UserStatus } from '@prisma/client';
import * as argon2 from 'argon2';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../../database/prisma.service';
import type { AuthPayload } from './auth.types';

const ACCESS_EXPIRES_IN = '15m';
const REFRESH_EXPIRES_IN = '7d';
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const PASSWORD_RESET_TTL_MS = 15 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 5;
const FAILED_ATTEMPT_WINDOW_MS = 60 * 1000;

@Injectable()
export class AuthService {
  private readonly failedAttempts = new Map<string, { count: number; resetAt: number }>();

  constructor(private readonly jwt: JwtService, private readonly prisma: PrismaService) {}

  async login(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();
    this.assertNotRateLimited(normalizedEmail);
    const user = await this.prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user || user.status !== UserStatus.ACTIVE || !(await argon2.verify(user.passwordHash, password))) {
      this.recordFailedAttempt(normalizedEmail);
      throw new UnauthorizedException('Invalid email or password');
    }
    this.failedAttempts.delete(normalizedEmail);
    return this.createSession(user);
  }

  async refresh(refreshToken: string) {
    const payload = await this.verifyRefreshToken(refreshToken);
    if (!payload.jti) throw new UnauthorizedException('Invalid refresh token');
    const storedToken = await this.prisma.refreshToken.findUnique({ where: { tokenId: payload.jti } });
    if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date() || !(await argon2.verify(storedToken.tokenHash, refreshToken))) throw new UnauthorizedException('Invalid or expired refresh token');
    await this.prisma.refreshToken.update({ where: { id: storedToken.id }, data: { revokedAt: new Date() } });
    const user = await this.prisma.user.findUnique({ where: { id: storedToken.userId } });
    if (!user || user.status !== UserStatus.ACTIVE) throw new UnauthorizedException('User is not active');
    return this.createSession(user);
  }

  async logout(refreshToken?: string) {
    if (!refreshToken) return;
    try {
      const payload = await this.verifyRefreshToken(refreshToken);
      if (payload.jti) await this.prisma.refreshToken.updateMany({ where: { tokenId: payload.jti, revokedAt: null }, data: { revokedAt: new Date() } });
    } catch {
      // Logout is idempotent even when the refresh cookie has expired.
    }
  }

  async requestPasswordReset(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    let devToken: string | undefined;
    if (user && user.status === UserStatus.ACTIVE) {
      const tokenId = randomUUID();
      devToken = await this.jwt.signAsync({ sub: user.id.toString(), email: user.email, role: user.role, type: 'password-reset', jti: tokenId }, { secret: this.refreshSecret(), expiresIn: '15m' });
      await this.prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });
      await this.prisma.passwordResetToken.create({ data: { userId: user.id, tokenId, tokenHash: await argon2.hash(devToken), expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MS) } });
    }
    return { message: 'If the account exists, password reset instructions have been sent.', ...(process.env.NODE_ENV !== 'production' && devToken ? { devToken } : {}) };
  }

  async resetPassword(token: string, newPassword: string) {
    let payload: AuthPayload;
    try { payload = await this.jwt.verifyAsync<AuthPayload>(token, { secret: this.refreshSecret() }); } catch { throw new UnauthorizedException('Invalid or expired reset token'); }
    if (payload.type !== 'password-reset' || !payload.jti) throw new UnauthorizedException('Invalid reset token');
    const storedToken = await this.prisma.passwordResetToken.findUnique({ where: { tokenId: payload.jti } });
    if (!storedToken || storedToken.usedAt || storedToken.expiresAt < new Date() || !(await argon2.verify(storedToken.tokenHash, token))) throw new UnauthorizedException('Invalid or expired reset token');
    await this.prisma.$transaction([this.prisma.user.update({ where: { id: storedToken.userId }, data: { passwordHash: await argon2.hash(newPassword) } }), this.prisma.passwordResetToken.update({ where: { id: storedToken.id }, data: { usedAt: new Date() } }), this.prisma.refreshToken.updateMany({ where: { userId: storedToken.userId, revokedAt: null }, data: { revokedAt: new Date() } })]);
    return { message: 'Password has been reset successfully.' };
  }

  async getCurrentUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: BigInt(userId) }, include: { student: true, teacher: true } });
    if (!user || user.status !== UserStatus.ACTIVE) throw new UnauthorizedException('User is not active');
    return this.toSafeUser(user);
  }

  async issueAccessToken(payload: Omit<AuthPayload, 'type'>) { return this.jwt.signAsync({ ...payload, type: 'access' }, { secret: this.accessSecret(), expiresIn: ACCESS_EXPIRES_IN }); }

  private async createSession(user: { id: bigint; email: string; role: UserRole; fullName: string }) {
    const accessToken = await this.issueAccessToken({ sub: user.id.toString(), email: user.email, role: user.role });
    const tokenId = randomUUID();
    const refreshToken = await this.jwt.signAsync({ sub: user.id.toString(), email: user.email, role: user.role, type: 'refresh', jti: tokenId }, { secret: this.refreshSecret(), expiresIn: REFRESH_EXPIRES_IN });
    await this.prisma.refreshToken.create({ data: { userId: user.id, tokenId, tokenHash: await argon2.hash(refreshToken), expiresAt: new Date(Date.now() + REFRESH_TTL_MS) } });
    return { user: this.toSafeUser(user), accessToken, refreshToken };
  }

  private async verifyRefreshToken(token: string) { try { return await this.jwt.verifyAsync<AuthPayload>(token, { secret: this.refreshSecret() }); } catch { throw new UnauthorizedException('Invalid or expired refresh token'); } }
  private toSafeUser(user: { id: bigint; email: string; fullName: string; role: UserRole; student?: unknown; teacher?: unknown }) { return { id: user.id.toString(), email: user.email, fullName: user.fullName, role: user.role, student: user.student ?? null, teacher: user.teacher ?? null }; }
  private accessSecret() { const secret = process.env.JWT_ACCESS_SECRET; if (!secret) throw new Error('JWT_ACCESS_SECRET is not configured'); return secret; }
  private refreshSecret() { const secret = process.env.JWT_REFRESH_SECRET; if (!secret) throw new Error('JWT_REFRESH_SECRET is not configured'); return secret; }
  private assertNotRateLimited(email: string) { const attempt = this.failedAttempts.get(email); if (attempt && attempt.resetAt > Date.now() && attempt.count >= MAX_FAILED_ATTEMPTS) throw new HttpException('Too many login attempts. Try again later.', HttpStatus.TOO_MANY_REQUESTS); if (attempt && attempt.resetAt <= Date.now()) this.failedAttempts.delete(email); }
  private recordFailedAttempt(email: string) { const current = this.failedAttempts.get(email); const next = current && current.resetAt > Date.now() ? { count: current.count + 1, resetAt: current.resetAt } : { count: 1, resetAt: Date.now() + FAILED_ATTEMPT_WINDOW_MS }; this.failedAttempts.set(email, next); }
}
