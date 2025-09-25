import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as bcrypt from 'bcrypt';
import type {
	PaginatedResult,
	PaginationDto,
} from '../common/dto/pagination.dto';
import type {
	account,
	customer,
	employee,
	manager,
	Prisma,
	role,
} from '../generated/prisma/client';
import type { PrismaService } from '../prisma/prisma.service';
import type { CreateAccountDto } from './dto/create-account.dto';
import type { UpdateAccountDto } from './dto/update-account.dto';

type AccountResponse = Omit<account, 'password_hash'> & {
	role?: role;
	customer?: customer[];
	employee?: employee | null;
	manager?: manager | null;
};

/**
 * Service responsible for handling account-related business logic.
 * Interacts with the Prisma service to perform database operations.
 */
@Injectable()
export class AccountService {
	constructor(private prisma: PrismaService) {}

	/**
	 * Creates a new account.
	 * @param createAccountDto - The data for creating the new account.
	 * @returns The created account.
	 * @throws {ConflictException} If the username already exists.
	 * @throws {NotFoundException} If the specified role does not exist.
	 */
	async create(createAccountDto: CreateAccountDto): Promise<account> {
		const { username, password, role_id, is_active } = createAccountDto;

		const existingUser = await this.prisma.account.findUnique({
			where: { username },
		});
		if (existingUser) {
			throw new ConflictException('Username already exists');
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		try {
			return this.prisma.account.create({
				data: {
					username,
					password_hash: hashedPassword,
					role_id,
					is_active: is_active ?? false,
					is_locked: false,
				},
			});
		} catch (error) {
			if (error instanceof PrismaClientKnownRequestError) {
				if (error.code === 'P2003') {
					throw new NotFoundException(
						`Role with ID ${role_id} does not exist.`
					);
				}
			}
			throw error;
		}
	}

	/**
	 * Retrieves a paginated list of accounts.
	 * @param paginationDto - Pagination options (page, limit).
	 * @returns A paginated result of accounts.
	 */
	async findAll(
		paginationDto: PaginationDto
	): Promise<PaginatedResult<AccountResponse>> {
		const { page = 1, limit = 10 } = paginationDto;
		const skip = (page - 1) * limit;

		const [data, total] = await Promise.all([
			this.prisma.account.findMany({
				skip,
				take: limit,
				select: {
					account_id: true,
					username: true,
					role_id: true,
					is_active: true,
					is_locked: true,
					last_login: true,
					created_at: true,
					updated_at: true,
				},
				orderBy: { account_id: 'desc' },
			}),
			this.prisma.account.count(),
		]);

		const totalPages = Math.ceil(total / limit);

		return {
			data,
			pagination: {
				page,
				limit,
				total,
				totalPages,
				hasNext: page < totalPages,
				hasPrev: page > 1,
			},
		};
	}

	/**
	 * Finds a single account by its ID.
	 * @param id - The ID of the account to find.
	 * @returns The account object or null if not found.
	 * @throws {NotFoundException} If the account with the specified ID does not exist.
	 */
	async findOne(id: number): Promise<AccountResponse> {
		const acc = await this.prisma.account.findUnique({
			where: { account_id: id },
			select: {
				account_id: true,
				username: true,
				role_id: true,
				is_active: true,
				is_locked: true,
				last_login: true,
				created_at: true,
				updated_at: true,
				role: true,
				customer: true,
				employee: true,
				manager: true,
			},
		});
		if (!acc) {
			throw new NotFoundException(`Account with ID ${id} does not exist`);
		}
		return acc;
	}

	/**
	 * Finds a single account by its username.
	 * @param username - The username of the account to find.
	 * @returns The account object or null if not found.
	 */
	async findByUsername(username: string): Promise<account | null> {
		const acc = await this.prisma.account.findUnique({
			where: { username },
			include: {
				role: true,
			},
		});
		return acc;
	}

	/**
	 * Updates an existing account.
	 * @param id - The ID of the account to update.
	 * @param updateAccountDto - The data to update the account with.
	 * @returns The updated account.
	 * @throws {BadRequestException} If attempting to update the role.
	 * @throws {NotFoundException} If the account does not exist.
	 * @throws {ConflictException} If the new username is already taken.
	 */
	async update(
		id: number,
		updateAccountDto: UpdateAccountDto
	): Promise<account> {
		const { password, role_id, ...otherData } = updateAccountDto;

		if (role_id !== undefined) {
			throw new BadRequestException(
				'Updating the account role is not allowed'
			);
		}

		const existingAccount = await this.prisma.account.findUnique({
			where: { account_id: id },
		});
		if (!existingAccount) {
			throw new NotFoundException(`Account with ID ${id} does not exist`);
		}

		if (
			updateAccountDto.username &&
			updateAccountDto.username !== existingAccount.username
		) {
			const conflictingUser = await this.prisma.account.findUnique({
				where: { username: updateAccountDto.username },
			});
			if (conflictingUser) {
				throw new ConflictException(
					`Username '${updateAccountDto.username}' already exists.`
				);
			}
		}

		const dataToUpdate: Prisma.accountUpdateInput = { ...otherData };

		if (password) {
			dataToUpdate.password_hash = await bcrypt.hash(password, 10);
		}

		try {
			return await this.prisma.account.update({
				where: { account_id: id },
				data: dataToUpdate,
				include: {
					role: true,
				},
			});
		} catch (error) {
			if (error instanceof PrismaClientKnownRequestError) {
				if (error.code === 'P2025') {
					throw new NotFoundException(
						`Account with ID ${id} not found for update.`
					);
				}
				if (error.code === 'P2003' && updateAccountDto.role_id) {
					throw new NotFoundException(
						`Role with ID ${updateAccountDto.role_id} does not exist.`
					);
				}
			}
			throw error;
		}
	}

	/**
	 * Removes an account by its ID.
	 * @param id - The ID of the account to remove.
	 * @returns The removed account.
	 * @throws {NotFoundException} If the account with the specified ID does not exist.
	 */
	async remove(id: number): Promise<account> {
		try {
			return await this.prisma.account.delete({
				where: { account_id: id },
			});
		} catch (error) {
			if (error instanceof PrismaClientKnownRequestError) {
				if (error.code === 'P2025') {
					throw new NotFoundException(
						`Account with ID ${id} not found`
					);
				}
			}
			throw error;
		}
	}
}
