import { Body, Controller, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/roles.decorator';
import type { AuthenticatedRequest } from '../auth/auth.types';
import { CreateBroadcastDto } from './dto/create-broadcast.dto';
import { ListNotificationDto } from './dto/list-notification.dto';
import { NotificationsService } from './notifications.service';

@Controller()
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get('me/notifications')
  @Roles(UserRole.STUDENT)
  list(@Req() request: AuthenticatedRequest, @Query() query: ListNotificationDto) {
    return this.notifications.listForUser(request.user!.sub, query);
  }

  @Get('me/notifications/unread-count')
  @Roles(UserRole.STUDENT)
  unreadCount(@Req() request: AuthenticatedRequest) {
    return this.notifications.unreadCount(request.user!.sub);
  }

  @Patch('me/notifications/:id/read')
  @Roles(UserRole.STUDENT)
  markRead(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.notifications.markRead(request.user!.sub, id);
  }

  @Patch('me/notifications/read-all')
  @Roles(UserRole.STUDENT)
  markAllRead(@Req() request: AuthenticatedRequest) {
    return this.notifications.markAllRead(request.user!.sub);
  }

  @Post('notifications/broadcast')
  @Roles(UserRole.TEACHER, UserRole.ACADEMIC_STAFF)
  broadcast(@Body() dto: CreateBroadcastDto, @Req() request: AuthenticatedRequest) {
    return this.notifications.broadcast(dto, request.user!);
  }
}
