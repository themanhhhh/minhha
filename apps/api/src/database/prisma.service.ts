import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) throw new Error('DATABASE_URL is required');
    const url = new URL(databaseUrl);
    if (process.env.DATABASE_POOL_MODE === 'session' && url.hostname.endsWith('.pooler.supabase.com')) {
      url.port = '5432';
      url.searchParams.delete('pgbouncer');
    }
    // A bounded pool avoids exhausting the shared Supabase pooler on list/report requests.
    if (!url.searchParams.has('connection_limit')) url.searchParams.set('connection_limit', '5');
    if (!url.searchParams.has('pool_timeout')) url.searchParams.set('pool_timeout', '30');
    if (!url.searchParams.has('connect_timeout')) url.searchParams.set('connect_timeout', '30');
    super({ datasources: { db: { url: url.toString() } } });
  }
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
