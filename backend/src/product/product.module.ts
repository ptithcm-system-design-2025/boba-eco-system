import { Module } from '@nestjs/common'
import { FirebaseStorageModule } from '../firebase-storage/firebase-storage.module'
import { PrismaModule } from '../prisma/prisma.module'
import { ProductController } from './product.controller'
import { ProductService } from './product.service'

@Module({
	imports: [PrismaModule, FirebaseStorageModule],
	controllers: [ProductController],
	providers: [ProductService],
})
export class ProductModule {}
