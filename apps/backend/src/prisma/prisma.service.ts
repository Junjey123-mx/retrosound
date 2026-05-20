import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  // Prisma manages connections lazily — explicit $connect() on init causes
  // timeouts in serverless cold starts when the DB pool is at capacity.
}
