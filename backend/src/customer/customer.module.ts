import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AccountModule } from '../account/account.module';

/**
 * @module CustomerModule
 * @description This module encapsulates all the logic for customer management.
 * @imports {PrismaModule} - Provides database access through Prisma.
 * @imports {AccountModule} - Provides account management services.
 * @controllers {CustomerController} - Handles incoming requests for customer-related endpoints.
 * @providers {CustomerService} - Contains the business logic for customer operations.
 * @exports {CustomerService} - Makes the CustomerService available to other modules.
 */
@Module({
	imports: [PrismaModule, AccountModule],
	controllers: [CustomerController],
	providers: [CustomerService],
	exports: [CustomerService],
})
export class CustomerModule {}
