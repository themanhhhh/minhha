import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly jwt: JwtService, private readonly prisma: PrismaService) {}

  async login(email: string, password: string) {
    if (!process.env.JWT_ACCESS_SECRET) throw new Error('JWT_ACCESS_SECRET is not configured');
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || user.status !== 'ACTIVE' || !(await argon2.verify(user.passwordHash, password))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return { accessToken: await this.issueAccessToken({ sub: user.id.toString(), role: user.role }) };
  }

  issueAccessToken(payload: { sub: string; role: string }) {
    return this.jwt.signAsync(payload, { secret: process.env.JWT_ACCESS_SECRET });
  }
}
