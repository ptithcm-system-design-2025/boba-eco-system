import { Module } from '@nestjs/common';
import { AccountModule } from '../account/account.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ManagerController } from './manager.controller';
import { ManagerService } from './manager.service';

@Module({
	imports: [PrismaModule, AccountModule],
	controllers: [ManagerController],
	providers: [ManagerService],
	exports: [ManagerService],
})
export class ManagerModule {}
