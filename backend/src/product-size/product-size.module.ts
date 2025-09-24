import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'
import { ProductSizeController } from './product-size.controller'
import { ProductSizeService } from './product-size.service'

@Module({
	imports: [PrismaModule],
	controllers: [ProductSizeController],
	providers: [ProductSizeService],
	exports: [ProductSizeService],
})
export class ProductSizeModule {}
