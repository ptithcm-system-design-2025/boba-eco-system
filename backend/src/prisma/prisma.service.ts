import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client';

/**
 * PrismaService provides database access through Prisma ORM.
 * This service extends PrismaClient to provide database operations
 * throughout the application with dependency injection support.
 */
@Injectable()
export class PrismaService extends PrismaClient {}
