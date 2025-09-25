import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthTokenService } from './auth-token.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { JwtStrategy } from './strategies/jwt.strategy';

/**
 * AuthModule is responsible for providing authentication and authorization features.
 * It integrates JWT, Passport, Prisma, and provides related services, controllers, and guards.
 */
@Module({
	imports: [
		PassportModule.register({ defaultStrategy: 'jwt' }),
		JwtModule.register({
			secret: process.env.JWT_SECRET || 'your-secret-key',
			signOptions: {
				expiresIn: process.env.JWT_EXPIRES_IN || '24h',
			},
		}),
		PrismaModule,
	],
	controllers: [AuthController],
	providers: [
		AuthService,
		AuthTokenService,
		JwtStrategy,
		JwtAuthGuard,
		RolesGuard,
	],
	exports: [
		AuthService,
		AuthTokenService,
		JwtStrategy,
		JwtAuthGuard,
		RolesGuard,
		PassportModule,
	],
})
export class AuthModule {}
