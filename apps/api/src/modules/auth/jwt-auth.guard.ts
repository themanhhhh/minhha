import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public.decorator';
import type { AuthenticatedRequest, AuthPayload } from './auth.types';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService, private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);
    if (isPublic) return true;
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.getToken(request);
    if (!token) throw new UnauthorizedException('Authentication required');
    try {
      const payload = await this.jwt.verifyAsync<AuthPayload>(token, { secret: this.accessSecret() });
      if (payload.type && payload.type !== 'access') throw new UnauthorizedException('Invalid access token');
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }

  private getToken(request: AuthenticatedRequest) { const authorization = request.headers.authorization; if (authorization?.startsWith('Bearer ')) return authorization.slice(7); return request.cookies?.access_token; }
  private accessSecret() { const secret = process.env.JWT_ACCESS_SECRET; if (!secret) throw new Error('JWT_ACCESS_SECRET is not configured'); return secret; }
}
