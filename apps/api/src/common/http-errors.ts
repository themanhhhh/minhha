import { NotFoundException } from '@nestjs/common';

export function notFound(entity: string, id: string | number): never {
  throw new NotFoundException(`${entity} ${id} not found`);
}
