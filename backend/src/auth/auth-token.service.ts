import { Injectable, UnauthorizedException } from '@nestjs/common'
import type { JwtService } from '@nestjs/jwt'
import type { account, role } from '../generated/prisma/client'
import type { PrismaService } from '../prisma/prisma.service'
import type { JwtPayload } from './interfaces/jwt-payload.interface'

/**
 * Service responsible for generating and refreshing authentication tokens.
 */
@Injectable()
export class AuthTokenService {
	constructor(
		private prisma: PrismaService,
		private jwtService: JwtService
	) {}

	/**
	 * Generate access and refresh tokens for a given account.
	 * @param account The account object containing account_id, username, and role.
	 * @returns An object with access_token and refresh_token.
	 */
	async generateTokens(
		account: account & { role: role }
	): Promise<{ access_token: string; refresh_token: string }> {
		const payload: JwtPayload = {
			sub: account.account_id,
			username: account.username,
			role_id: account.role_id,
			role_name: account.role.name,
		}

		const access_token = this.jwtService.sign(payload)
		const refresh_token = this.jwtService.sign(payload, {
			expiresIn: '7d',
		})

		return {
			access_token,
			refresh_token,
		}
	}

	/**
	 * Refresh access and refresh tokens using a valid refresh token.
	 * @param refresh_token The refresh token to validate and exchange.
	 * @throws UnauthorizedException if the refresh token is invalid or the account is inactive/locked.
	 * @returns A new set of access_token and refresh_token.
	 */
	async refreshToken(
		refresh_token: string
	): Promise<{ access_token: string; refresh_token: string }> {
		try {
			const payload = this.jwtService.verify(refresh_token)
			const account = await this.prisma.account.findFirst({
				where: {
					account_id: payload.sub,
					is_active: true,
					is_locked: false,
				},
				include: {
					role: true,
				},
			})

			if (!account) {
				throw new UnauthorizedException(
					'Invalid account or account has been locked'
				)
			}

			return this.generateTokens(account)
		} catch (_error) {
			throw new UnauthorizedException('Invalid or expired refresh token')
		}
	}
}
