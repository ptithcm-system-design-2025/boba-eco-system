import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { customer, employee, manager } from '../generated/prisma/client';
import { Prisma } from '../generated/prisma/client';
import type { PrismaService } from '../prisma/prisma.service';
import type { AuthTokenService } from './auth-token.service';
import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';
import type { UpdateProfileDto } from './dto/update-profile.dto';

/**
 * AuthService handles user registration, login, validation, profile management,
 * and token generation using Prisma and AuthTokenService.
 */
@Injectable()
export class AuthService {
	constructor(
		private prisma: PrismaService,
		private authTokenService: AuthTokenService
	) {}

	/**
	 * Register a new user account.
	 * @param registerDto DTO containing username, password and role_id
	 * @throws ConflictException if username already exists
	 * @throws BadRequestException if role does not exist
	 * @returns User account with tokens
	 */
	async register(registerDto: RegisterDto) {
		const { username, password, role_id } = registerDto;

		const existingAccount = await this.prisma.account.findUnique({
			where: { username },
		});

		if (existingAccount) {
			throw new ConflictException('Username already exists');
		}

		const role = await this.prisma.role.findUnique({
			where: { role_id },
		});

		if (!role) {
			throw new BadRequestException('Role does not exist');
		}

		const saltRounds = 12;
		const password_hash = await bcrypt.hash(password, saltRounds);

		const account = await this.prisma.account.create({
			data: {
				username,
				password_hash,
				role_id,
				is_active: true,
				is_locked: false,
			},
			include: {
				role: true,
			},
		});

		const tokens = await this.authTokenService.generateTokens(account);

		return {
			...tokens,
			user: {
				account_id: account.account_id,
				username: account.username,
				role_id: account.role_id,
				role_name: account.role.name,
				is_active: account.is_active,
			},
		};
	}

	/**
	 * Authenticate user by validating credentials.
	 * @param loginDto DTO containing username and password
	 * @throws UnauthorizedException if login fails
	 * @returns User account with tokens
	 */
	async login(loginDto: LoginDto) {
		const { username, password } = loginDto;

		const account = await this.prisma.account.findUnique({
			where: { username },
			include: {
				role: true,
			},
		});

		if (!account) {
			throw new UnauthorizedException('Incorrect username or password');
		}

		if (!account.is_active) {
			throw new UnauthorizedException('Account is disabled');
		}

		if (account.is_locked) {
			throw new UnauthorizedException('Account is locked');
		}

		const isPasswordValid = await bcrypt.compare(
			password,
			account.password_hash
		);
		if (!isPasswordValid) {
			throw new UnauthorizedException('Incorrect username or password');
		}

		await this.prisma.account.update({
			where: { account_id: account.account_id },
			data: {
				last_login: new Date(),
			},
		});

		const tokens = await this.authTokenService.generateTokens(account);

		return {
			...tokens,
			user: {
				account_id: account.account_id,
				username: account.username,
				role_id: account.role_id,
				role_name: account.role.name,
				is_active: account.is_active,
			},
		};
	}
	/**
	 * Update profile information for a given account.
	 * @param account_id The account id
	 * @param updateProfileDto DTO containing profile data to update
	 * @throws NotFoundException if account not found
	 * @throws ConflictException if username/email/phone conflicts
	 * @returns Updated user profile
	 */
	async updateProfile(
		account_id: number,
		updateProfileDto: UpdateProfileDto
	) {
		const { username, password, ...profileData } = updateProfileDto;

		const currentAccount = await this.prisma.account.findUnique({
			where: { account_id },
			include: {
				role: true,
				manager: true,
				employee: true,
				customer: true,
			},
		});

		if (!currentAccount) {
			throw new NotFoundException('Account not found');
		}

		if (username && username !== currentAccount.username) {
			const existingAccount = await this.prisma.account.findUnique({
				where: { username },
			});
			if (existingAccount) {
				throw new ConflictException('Username already exists');
			}
		}

		const accountUpdateData: Prisma.accountUpdateInput = {};
		if (username) accountUpdateData.username = username;
		if (password) {
			accountUpdateData.password_hash = await bcrypt.hash(password, 12);
		}

		const roleName = currentAccount.role.name;
		let profileUpdateData: Record<string, unknown> = {};

		const { position, ...commonProfileData } = profileData;

		if (roleName === 'MANAGER' && currentAccount.manager) {
			profileUpdateData = {
				...commonProfileData,
			};
		} else if (roleName === 'STAFF' && currentAccount.employee) {
			profileUpdateData = {
				...commonProfileData,
				...(position && { position }),
			};
		} else if (roleName === 'CUSTOMER' && currentAccount.customer) {
			const { email: _email, ...customerData } = commonProfileData;
			profileUpdateData = customerData;
		}

		try {
			const result = await this.prisma.$transaction(async (prisma) => {
				let updatedAccount = currentAccount;
				if (Object.keys(accountUpdateData).length > 0) {
					updatedAccount = await prisma.account.update({
						where: { account_id },
						data: accountUpdateData,
						include: {
							role: true,
							manager: true,
							employee: true,
							customer: true,
						},
					});
				}

				if (Object.keys(profileUpdateData).length > 0) {
					if (roleName === 'MANAGER' && updatedAccount.manager) {
						await prisma.manager.update({
							where: {
								manager_id: updatedAccount.manager.manager_id,
							},
							data: profileUpdateData,
						});
					} else if (
						roleName === 'STAFF' &&
						updatedAccount.employee
					) {
						await prisma.employee.update({
							where: {
								employee_id:
									updatedAccount.employee.employee_id,
							},
							data: profileUpdateData,
						});
					} else if (
						roleName === 'CUSTOMER' &&
						updatedAccount.customer
					) {
						await prisma.customer.updateMany({
							where: { account_id },
							data: profileUpdateData,
						});
					}
				}

				return updatedAccount;
			});

			let profile: manager | employee | customer | null = null;
			if (roleName === 'MANAGER') {
				profile = result.manager;
			} else if (roleName === 'STAFF') {
				profile = result.employee;
			} else if (roleName === 'CUSTOMER') {
				profile = result.customer?.[0] || null;
			}

			return {
				account_id: result.account_id,
				username: result.username,
				role_id: result.role_id,
				role_name: result.role.name,
				is_active: result.is_active,
				profile,
			};
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === 'P2002') {
					const target = error.meta?.target as string[];
					if (target?.includes('username')) {
						throw new ConflictException('Username already exists');
					}
					if (target?.includes('email')) {
						throw new ConflictException('Email already exists');
					}
					if (target?.includes('phone')) {
						throw new ConflictException(
							'Phone number already exists'
						);
					}
				}
			}
			throw error;
		}
	}

	/**
	 * Get profile information for a given account.
	 * @param account_id The account id
	 * @throws NotFoundException if account not found
	 * @returns User profile with account details
	 */
	async getProfile(account_id: number) {
		const account = await this.prisma.account.findUnique({
			where: { account_id },
			include: {
				role: true,
				manager: true,
				employee: true,
				customer: true,
			},
		});

		if (!account) {
			throw new NotFoundException('Account not found');
		}

		const roleName = account.role.name;
		let profile: manager | employee | customer | null = null;

		if (roleName === 'MANAGER' && account.manager) {
			profile = account.manager;
		} else if (roleName === 'STAFF' && account.employee) {
			profile = account.employee;
		} else if (roleName === 'CUSTOMER' && account.customer) {
			profile = account.customer[0] || null;
		}

		return {
			account_id: account.account_id,
			username: account.username,
			role_id: account.role_id,
			role_name: account.role.name,
			is_active: account.is_active,
			is_locked: account.is_locked,
			last_login: account.last_login,
			created_at: account.created_at,
			profile,
		};
	}
}
