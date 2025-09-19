import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * Module that encapsulates all components related to account management.
 * Includes the controller, service, and required imports.
 */
@Module({
	imports: [PrismaModule],
	controllers: [AccountController],
	providers: [AccountService],
	exports: [AccountService],
})
export class AccountModule {}
