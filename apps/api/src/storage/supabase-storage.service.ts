import { Injectable, InternalServerErrorException, ServiceUnavailableException } from '@nestjs/common';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseStorageService {
  private readonly bucket = process.env.SUPABASE_STORAGE_BUCKET ?? 'student-submissions';
  private readonly client: SupabaseClient | null;

  constructor() {
    const url = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    this.client = url && serviceRoleKey
      ? createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } })
      : null;
  }

  async upload(path: string, file: Express.Multer.File) {
    const client = this.getClient();
    const { error } = await client.storage.from(this.bucket).upload(path, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });
    if (error) throw new InternalServerErrorException(`Unable to upload ${file.originalname}: ${error.message}`);
  }

  async remove(paths: string[]) {
    if (!paths.length) return;
    const { error } = await this.getClient().storage.from(this.bucket).remove(paths);
    if (error) throw new InternalServerErrorException(`Unable to remove submitted files: ${error.message}`);
  }

  async createSignedUrl(path: string, expiresIn = 3600) {
    const { data, error } = await this.getClient().storage.from(this.bucket).createSignedUrl(path, expiresIn);
    if (error) throw new InternalServerErrorException(`Unable to create file URL: ${error.message}`);
    return data.signedUrl;
  }

  private getClient() {
    if (!this.client) throw new ServiceUnavailableException('Supabase Storage is not configured');
    return this.client;
  }
}
