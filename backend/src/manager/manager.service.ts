import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service';
import type { AccountService } from '../account/account.service';
import { type manager, Prisma } from '../generated/prisma/client';
import type { CreateManagerDto } from './dto/create-manager.dto';
import type { UpdateManagerDto } from './dto/update-manager.dto';
import type { BulkDeleteManagerDto } from './dto/bulk-delete-manager.dto';
import type { PaginatedResult, PaginationDto } from '../common/dto/pagination.dto';
import { ROLES } from '../auth/constants/roles.constant';

@Injectable()
export class ManagerService {
	constructor(
		private prisma: PrismaService,
		private accountService: AccountService
	) {}

	async create(createManagerDto: CreateManagerDto): Promise<manager> {
		const { email, username, ...managerData } = createManagerDto;

		const existingManagerByEmail = await this.prisma.manager.findUnique({
			where: { email },
		});
		if (existingManagerByEmail) {
			throw new ConflictException(
				`Manager with email '${email}' already exists.`
			);
		}

		try {
			return await this.prisma.$transaction(async (tx) => {
				const account = await this.accountService.create({
					username,
					password: '12345678',
					role_id: await this.getManagerRoleId(),
					is_active: true,
				});

				const data: Prisma.managerCreateInput = {
					...managerData,
					email,
					account: {
						connect: { account_id: account.account_id },
					},
				};

				return await tx.manager.create({
					data,
					include: { account: true },
				});
			});
		} catch (error) {
			throw this.handleCreateError(error, email);
		}
	}

	/**
	 * Handles errors that occur during the manager creation process.
	 * @param error The error object thrown.
	 * @param email The email of the manager that was being created.
	 * @throws {ConflictException} If a manager with the same email already exists.
	 * @throws {BadRequestException} For other database-related errors.
	 */
	private handleCreateError(error: any, email: string): never {
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			switch (error.code) {
				case 'P2002': {
					const fieldDescription = this.getUniqueConstraintField(error, email);
					throw new ConflictException(
						`Manager already exists with ${fieldDescription}.`
					);
				}
				default:
					throw new BadRequestException(`Database error: ${error.message}`);
			}
		}
		throw error;
	}

	/**
	 * Determines the field that caused a unique constraint violation.
	 * @param error The Prisma error object.
	 * @param email The email that may have caused the violation.
	 * @returns A user-friendly string describing the conflicting field.
	 */
	private getUniqueConstraintField(
		error: Prisma.PrismaClientKnownRequestError,
		email: string
	): string {
		if (error.meta && error.meta.target) {
			const target = error.meta.target as string[];
			if (target.includes('email')) return `email '${email}'`;
		}
		return 'the provided unique information';
	}

	/**
	 * Retrieves the ID for the 'MANAGER' role from the database.
	 * @returns The role ID for the 'MANAGER' role.
	 * @throws {BadRequestException} If the 'MANAGER' role is not found in the system.
	 */
	private async getManagerRoleId(): Promise<number> {
		const managerRole = await this.prisma.role.findFirst({
			where: { name: ROLES.MANAGER },
		});
		if (!managerRole) {
			throw new BadRequestException('MANAGER role not found in the system.');
		}
		return managerRole.role_id;
	}

	/**
	 * Retrieves a paginated list of all managers.
	 * @param paginationDto DTO containing pagination parameters.
	 * @returns A paginated result object containing the list of managers and pagination metadata.
	 */
	async findAll(
		paginationDto: PaginationDto
	): Promise<PaginatedResult<manager>> {
		const { page = 1, limit = 10 } = paginationDto;
		const skip = (page - 1) * limit;

		const [data, total] = await Promise.all([
			this.prisma.manager.findMany({
				skip,
				take: limit,
				orderBy: { manager_id: 'desc' },
			}),
			this.prisma.manager.count(),
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
	 * Finds a single manager by their unique ID.
	 * @param manager_id The ID of the manager to find.
	 * @returns The manager object, including account details.
	 * @throws {NotFoundException} If no manager is found with the given ID.
	 */
	async findOne(manager_id: number): Promise<manager | null> {
		const mgr = await this.prisma.manager.findUnique({
			where: { manager_id },
			include: {
				account: {
					select: {
						account_id: true,
						role_id: true,
						username: true,
						is_active: true,
						is_locked: true,
						last_login: true,
						created_at: true,
						updated_at: true,
						role: true,
					},
				},
			},
		});
		if (!mgr) {
			throw new NotFoundException(`Manager with ID ${manager_id} not found`);
		}
		return mgr;
	}

	/**
	 * Finds a single manager by their email address.
	 * @param email The email of the manager to find.
	 * @returns The manager object, including account details, or null if not found.
	 */
	async findByEmail(email: string): Promise<manager | null> {
		return this.prisma.manager.findUnique({
			where: { email },
			include: { account: true },
		});
	}

	/**
	 * Updates the details of a specific manager.
	 * This method only updates manager-specific fields, not account-related information.
	 * @param manager_id The ID of the manager to update.
	 * @param updateManagerDto The data to update the manager with.
	 * @returns The updated manager object, including account details.
	 * @throws {NotFoundException} If the manager with the given ID is not found.
	 * @throws {ConflictException} If the update violates a unique constraint, such as a duplicate email.
	 */
	async update(
		manager_id: number,
		updateManagerDto: UpdateManagerDto
	): Promise<manager> {
		const { ...managerData } = updateManagerDto;

		const data: Prisma.managerUpdateInput = { ...managerData };

		try {
			return await this.prisma.manager.update({
				where: { manager_id },
				data,
				include: { account: true },
			});
		} catch (error) {
			throw this.handleUpdateError(error, manager_id);
		}
	}

	/**
	 * Handles errors that occur during the manager update process.
	 * @param error The error object thrown.
	 * @param manager_id The ID of the manager that was being updated.
	 * @throws {NotFoundException} If the manager to be updated is not found.
	 * @throws {ConflictException} If the update violates a unique constraint.
	 * @throws {BadRequestException} For other database-related errors.
	 */
	private handleUpdateError(error: any, manager_id: number): never {
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			switch (error.code) {
				case 'P2025':
					throw new NotFoundException(
						`Manager with ID ${manager_id} not found`
					);
				case 'P2002':
					throw new ConflictException(
						'Could not update manager, unique constraint violation (e.g., email already exists).'
					);
				default:
					throw new BadRequestException(`Database error: ${error.message}`);
			}
		}
		throw error;
	}

	/**
	 * Deletes a manager and their associated account.
	 * This operation is performed within a transaction to ensure data integrity.
	 * @param manager_id The ID of the manager to delete.
	 * @returns The deleted manager object.
	 * @throws {NotFoundException} If the manager with the given ID is not found.
	 */
	async remove(manager_id: number): Promise<manager> {
		try {
			return await this.prisma.$transaction(async (tx) => {
				const managerWithAccount = await tx.manager.findUnique({
					where: { manager_id },
					include: { account: true },
				});

				if (!managerWithAccount) {
					throw new NotFoundException(
						`Manager with ID ${manager_id} not found`
					);
				}

				const deletedManager = await tx.manager.delete({
					where: { manager_id },
				});

				if (managerWithAccount.account) {
					await this.accountService.remove(
						managerWithAccount.account.account_id
					);
				}

				return deletedManager;
			});
		} catch (error) {
			throw this.handleDeleteError(error, manager_id);
		}
	}

	/**
	 * Handles errors that occur during the manager deletion process.
	 * @param error The error object thrown.
	 * @param manager_id The ID of the manager that was being deleted.
	 * @throws {NotFoundException} If the manager to be deleted is not found.
	 * @throws {ConflictException} If the manager cannot be deleted due to foreign key constraints.
	 * @throws {BadRequestException} For other database-related errors.
	 */
	private handleDeleteError(error: any, manager_id: number): never {
		if (error instanceof NotFoundException) {
			throw error; // Re-throw already handled NotFoundException
		}

		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			switch (error.code) {
				case 'P2025':
					throw new NotFoundException(
						`Manager with ID ${manager_id} not found`
					);
				case 'P2003':
					throw new ConflictException(
						`Cannot delete manager with ID ${manager_id} due to related data.`
					);
				default:
					throw new BadRequestException(`Database error: ${error.message}`);
			}
		}
		throw error;
	}

	/**
	 * Deletes multiple managers in a bulk operation based on a list of IDs.
	 * @param bulkDeleteDto DTO containing the list of manager IDs to delete.
	 * @returns An object containing lists of successfully deleted and failed IDs, along with a summary.
	 */
	async bulkDelete(bulkDeleteDto: BulkDeleteManagerDto): Promise<{
		deleted: number[];
		failed: { id: number; reason: string }[];
		summary: { total: number; success: number; failed: number };
	}> {
		const { ids } = bulkDeleteDto;

		try {
			return await this.prisma.$transaction(async (tx) => {
				const managersWithAccounts = await tx.manager.findMany({
					where: { manager_id: { in: ids } },
					include: { account: true },
				});

				const foundIds = managersWithAccounts.map((m) => m.manager_id);
				const notFoundIds = ids.filter((id) => !foundIds.includes(id));
				const accountIds = managersWithAccounts
					.filter((m) => m.account)
					.map((m) => m.account.account_id);

				await tx.manager.deleteMany({
					where: { manager_id: { in: foundIds } },
				});

				if (accountIds.length > 0) {
					await tx.account.deleteMany({
						where: { account_id: { in: accountIds } },
					});
				}

				const failed: { id: number; reason: string }[] = notFoundIds.map(
					(id) => ({
						id,
						reason: `Manager with ID ${id} not found`,
					})
				);

				return {
					deleted: foundIds,
					failed,
					summary: {
						total: ids.length,
						success: foundIds.length,
						failed: failed.length,
					},
				};
			});
		} catch (error) {
			const failed: { id: number; reason: string }[] = ids.map((id) => ({
				id,
				reason: error instanceof Error ? error.message : 'Unknown error',
			}));

			return {
				deleted: [],
				failed,
				summary: {
					total: ids.length,
					success: 0,
					failed: ids.length,
				},
			};
		}
	}

	/**
	 * Locks or unlocks a manager's associated account.
	 * @param managerId The ID of the manager whose account will be modified.
	 * @param isLocked The lock status to set on the account.
	 * @returns The updated account object.
	 * @throws {NotFoundException} If the manager with the given ID is not found.
	 */
	async lockManagerAccount(managerId: number, isLocked: boolean) {
		const manager = await this.prisma.manager.findUnique({
			where: { manager_id: managerId },
			include: { account: true },
		});

		if (!manager) {
			throw new NotFoundException(`Manager with ID ${managerId} not found`);
		}

		return this.accountService.update(manager.account.account_id, {
			is_locked: isLocked,
		});
	}

	/**
	 * Updates the details of a manager's associated account.
	 * @param managerId The ID of the manager.
	 * @param accountId The ID of the account to update.
	 * @param updateData The data to update the account with.
	 * @returns The updated account object.
	 * @throws {NotFoundException} If the manager with the given ID is not found.
	 * @throws {BadRequestException} If the provided account ID does not belong to the specified manager.
	 */
	async updateManagerAccount(
		managerId: number,
		accountId: number,
		updateData: any
	) {
		const manager = await this.prisma.manager.findUnique({
			where: { manager_id: managerId },
			include: { account: true },
		});

		if (!manager) {
			throw new NotFoundException(`Manager with ID ${managerId} not found`);
		}

		if (manager.account.account_id !== accountId) {
			throw new BadRequestException(
				`Account with ID ${accountId} does not belong to Manager with ID ${managerId}`
			);
		}

		return this.accountService.update(accountId, updateData);
	}
}
