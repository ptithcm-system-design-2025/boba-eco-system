import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';
import { AccountModule } from './account/account.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { CustomerModule } from './customer/customer.module';
import { DiscountModule } from './discount/discount.module';
import { EmployeeModule } from './employee/employee.module';
import { FirebaseStorageModule } from './firebase-storage/firebase-storage.module';
import { InvoiceModule } from './invoice/invoice.module';
import { ManagerModule } from './manager/manager.module';
import { MembershipTypeModule } from './membership-type/membership-type.module';
import { OrderModule } from './order/order.module';
import { PaymentModule } from './payment/payment.module';
import { PaymentMethodModule } from './payment-method/payment-method.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductModule } from './product/product.module';
import { ProductSizeModule } from './product-size/product-size.module';
import { ReportsModule } from './reports/reports.module';
import { RoleModule } from './role/role.module';
import { StoreModule } from './store/store.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: ['.env', '.env.development'],
			validationSchema: Joi.object({
				NODE_ENV: Joi.string()
					.valid('development', 'production')
					.required(),
				PORT: Joi.number().default(3000),
				DATABASE_URL: Joi.string().required(),
				DATABASE_HOST: Joi.string().required(),
				DATABASE_PORT: Joi.number().required(),
				DATABASE_USER: Joi.string().required(),
				DATABASE_PASSWORD: Joi.string().required(),
				DATABASE_NAME: Joi.string().required(),
				DATABASE_SCHEMA: Joi.string().required(),
				STRIPE_SECRET_KEY: Joi.string().required(),
				STRIPE_PUBLISHABLE_KEY: Joi.string().required(),
				STRIPE_WEBHOOK_SECRET: Joi.string().required(),
				JWT_SECRET: Joi.string().required(),
				JWT_EXPIRES_IN: Joi.string().default('24h'),
			}),
		}),

		PrismaModule,
		AuthModule,
		AccountModule,
		CategoryModule,
		CustomerModule,
		DiscountModule,
		EmployeeModule,
		ManagerModule,
		MembershipTypeModule,
		OrderModule,
		PaymentModule,
		PaymentMethodModule,
		ProductModule,
		ProductSizeModule,
		RoleModule,
		StoreModule,
		ReportsModule,
		InvoiceModule,
		FirebaseStorageModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
