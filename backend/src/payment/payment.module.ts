import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { InvoiceModule } from '../invoice/invoice.module'
import { PrismaModule } from '../prisma/prisma.module'
import { PaymentController } from './payment.controller'
import { PaymentService } from './payment.service'
import { StripeService } from './stripe.service'

@Module({
	imports: [PrismaModule, InvoiceModule, ConfigModule],
	controllers: [PaymentController],
	providers: [PaymentService, StripeService],
	exports: [PaymentService, StripeService],
})
export class PaymentModule {}
