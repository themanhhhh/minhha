import { Controller, Get, Query } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/roles.decorator';
import { AuditService } from './audit.service';
import { ListAuditDto } from './dto/list-audit.dto';
@Controller('audit-logs') @Roles(UserRole.ACADEMIC_STAFF, UserRole.DIRECTOR)
export class AuditController { constructor(private readonly audit: AuditService) {} @Get() findAll(@Query() query: ListAuditDto) { return this.audit.findAll(query); } }
