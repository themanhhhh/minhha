import { CanActivate, ExecutionContext, Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public.decorator';
import type { AuthenticatedRequest, AuthPayload } from './auth.types';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService, private readonly reflector: Reflector, private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);
    if (isPublic) return true;
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.getToken(request);
    if (!token) throw new UnauthorizedException('Authentication required');
    try {
      const payload = await this.jwt.verifyAsync<AuthPayload>(token, { secret: this.accessSecret() });
      if (payload.type && payload.type !== 'access') throw new UnauthorizedException('Invalid access token');
      if (!/^\d+$/.test(payload.sub)) throw new UnauthorizedException('Invalid user');
      const user = await this.prisma.user.findUnique({ where: { id: BigInt(payload.sub) }, select: { role: true, status: true } });
      if (!user || user.status !== 'ACTIVE' || user.role !== payload.role) throw new UnauthorizedException('Account status or role changed; sign in again');
      request.user = payload;
      return true;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError || error instanceof Prisma.PrismaClientInitializationError) throw new ServiceUnavailableException('Database is temporarily unavailable. Please try again.');
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }

  private getToken(request: AuthenticatedRequest) { const authorization = request.headers.authorization; if (authorization?.startsWith('Bearer ')) return authorization.slice(7); return request.cookies?.access_token; }
  private accessSecret() { const secret = process.env.JWT_ACCESS_SECRET; if (!secret) throw new Error('JWT_ACCESS_SECRET is not configured'); return secret; }
}
