import type { UserRole } from '@prisma/client';
import type { Request } from 'express';

export interface AuthPayload {
  sub: string;
  role: UserRole;
  email: string;
  type?: 'access' | 'refresh' | 'password-reset';
  jti?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthPayload;
}
