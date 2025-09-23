import { Module } from '@nestjs/common'
import { AccountModule } from '../account/account.module'
import { PrismaModule } from '../prisma/prisma.module'
import { EmployeeController } from './employee.controller'
import { EmployeeService } from './employee.service'

@Module({
	imports: [PrismaModule, AccountModule],
	controllers: [EmployeeController],
	providers: [EmployeeService],
	exports: [EmployeeService],
})
export class EmployeeModule {}
