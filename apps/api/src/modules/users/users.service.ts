import { Injectable } from '@nestjs/common';
import { Prisma, UserRole, UserStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { normalizePagination, paginationMeta } from '../../common/pagination';
import { ListUserDto } from './dto/list-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListUserDto) {
    const pagination = normalizePagination(query);
    const where: Prisma.UserWhereInput = {
      ...(query.role ? { role: query.role } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.search ? { OR: [{ fullName: { contains: query.search, mode: 'insensitive' } }, { email: { contains: query.search, mode: 'insensitive' } }] } : {}),
    };
    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({ where, orderBy: { createdAt: 'desc' }, skip: pagination.skip, take: pagination.take }),
      this.prisma.user.count({ where }),
    ]);
    return { data: users.map((user) => this.toResponse(user)), meta: paginationMeta(pagination.page, pagination.pageSize, total) };
  }

  private toResponse(user: { id: bigint; fullName: string; email: string; role: UserRole; status: UserStatus; lastLoginAt: Date | null }) {
    return { id: user.id.toString(), fullName: user.fullName, email: user.email, role: user.role, status: user.status, lastLogin: user.lastLoginAt };
  }
}
