import { Injectable } from '@nestjs/common';
import type {
	PaginatedResult,
	PaginationDto,
} from '../common/dto/pagination.dto';
import type { role } from '../generated/prisma/client';
import type { PrismaService } from '../prisma/prisma.service';
import type { CreateRoleDto } from './dto/create-role.dto';
import type { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
/**
 * Service for handling role-related business logic.
 */
export class RoleService {
	constructor(private prisma: PrismaService) {}

	/**
	 * Creates a new role.
	 * @param createRoleDto The data for creating the role.
	 * @returns The created role.
	 */
	async create(createRoleDto: CreateRoleDto): Promise<role> {
		return this.prisma.role.create({
			data: createRoleDto,
		});
	}

	/**
	 * Retrieves all roles with pagination.
	 * @param paginationDto The pagination options.
	 * @returns A paginated list of roles.
	 */
	async findAll(
		paginationDto: PaginationDto
	): Promise<PaginatedResult<role>> {
		const { page = 1, limit = 10 } = paginationDto;
		const skip = (page - 1) * limit;

		const [data, total] = await Promise.all([
			this.prisma.role.findMany({
				skip,
				take: limit,
				orderBy: { role_id: 'asc' },
			}),
			this.prisma.role.count(),
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
	 * Retrieves a role by its ID.
	 * @param id The ID of the role to retrieve.
	 * @returns The role with the specified ID, or null if not found.
	 */
	async findOne(id: number): Promise<role | null> {
		return this.prisma.role.findUnique({
			where: { role_id: id },
		});
	}

	/**
	 * Updates a role.
	 * @param id The ID of the role to update.
	 * @param updateRoleDto The data for updating the role.
	 * @returns The updated role.
	 */
	async update(id: number, updateRoleDto: UpdateRoleDto): Promise<role> {
		return this.prisma.role.update({
			where: { role_id: id },
			data: updateRoleDto,
		});
	}

	/**
	 * Deletes a role.
	 * @param id The ID of the role to delete.
	 * @returns The deleted role.
	 */
	async remove(id: number): Promise<role> {
		return this.prisma.role.delete({
			where: { role_id: id },
		});
	}
}
