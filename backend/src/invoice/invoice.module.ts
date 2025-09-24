import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'
import { StoreModule } from '../store/store.module'
import { InvoiceController } from './invoice.controller'
import { InvoiceService } from './invoice.service'

@Module({
	imports: [PrismaModule, StoreModule],
	controllers: [InvoiceController],
	providers: [InvoiceService],
	exports: [InvoiceService],
})
export class InvoiceModule {}
