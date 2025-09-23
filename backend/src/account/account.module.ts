import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'
import { AccountController } from './account.controller'
import { AccountService } from './account.service'

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
