import {
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common'
import type {
	PaginatedResult,
	PaginationDto,
} from '../common/dto/pagination.dto'
import { type category, Prisma } from '../generated/prisma/client'
import type { PrismaService } from '../prisma/prisma.service'
import type { BulkDeleteCategoryDto } from './dto/bulk-delete-category.dto'
import type { CreateCategoryDto } from './dto/create-category.dto'
import type { UpdateCategoryDto } from './dto/update-category.dto'

@Injectable()
/**
 * Service responsible for handling business logic related to categories.
 * Provides methods for creating, retrieving, updating, and deleting categories.
 */
export class CategoryService {
	constructor(private prisma: PrismaService) {}

	/**
	 * Create a new category.
	 * @param createCategoryDto Data transfer object containing category details.
	 * @returns The created category entity.
	 */
	async create(createCategoryDto: CreateCategoryDto): Promise<category> {
		try {
			return await this.prisma.category.create({
				data: createCategoryDto,
			})
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === 'P2002') {
					throw new ConflictException(
						`Category with name '${createCategoryDto.name}' already exists.`
					)
				}
			}
			throw error
		}
	}

	/**
	 * Retrieve all categories with pagination.
	 * @param paginationDto Pagination parameters.
	 * @returns Paginated list of categories.
	 */
	async findAll(
		paginationDto: PaginationDto
	): Promise<PaginatedResult<category>> {
		const { page = 1, limit = 10 } = paginationDto
		const skip = (page - 1) * limit

		const [data, total] = await Promise.all([
			this.prisma.category.findMany({
				skip,
				take: limit,
				orderBy: { category_id: 'desc' },
			}),
			this.prisma.category.count(),
		])

		const totalPages = Math.ceil(total / limit)

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
		}
	}

	/**
	 * Retrieve a category by its ID.
	 * @param id Category ID.
	 * @returns The category entity or null if not found.
	 */
	async findOne(id: number): Promise<category | null> {
		const category = await this.prisma.category.findUnique({
			where: { category_id: id },
		})
		if (!category) {
			throw new NotFoundException(`Category with ID ${id} not found`)
		}
		return category
	}

	/**
	 * Update an existing category.
	 * @param id Category ID.
	 * @param updateCategoryDto Data transfer object containing updated category details.
	 * @returns The updated category entity.
	 */
	async update(
		id: number,
		updateCategoryDto: UpdateCategoryDto
	): Promise<category> {
		try {
			return await this.prisma.category.update({
				where: { category_id: id },
				data: updateCategoryDto,
			})
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === 'P2025') {
					throw new NotFoundException(`Category with ID ${id} not found`)
				}
				if (error.code === 'P2002' && updateCategoryDto.name) {
					throw new ConflictException(
						`Category with name '${updateCategoryDto.name}' already exists.`
					)
				}
			}
			throw error
		}
	}

	/**
	 * Bulk delete categories.
	 * @param bulkDeleteDto Data transfer object containing list of category IDs to delete.
	 * @returns Result of bulk deletion including deleted and failed IDs.
	 */
	async bulkDelete(bulkDeleteDto: BulkDeleteCategoryDto): Promise<{
		deleted: number[]
		failed: { id: number; reason: string }[]
		summary: { total: number; success: number; failed: number }
	}> {
		const { ids } = bulkDeleteDto

		try {
			const _deleteResult = await this.prisma.category.deleteMany({
				where: { category_id: { in: ids } },
			})

			return {
				deleted: ids,
				failed: [],
				summary: {
					total: ids.length,
					success: ids.length,
					failed: 0,
				},
			}
		} catch (error) {
			return {
				deleted: [],
				failed: ids.map((id) => ({
					id,
					reason: `Error deleting category: ${error.message}`,
				})),
				summary: {
					total: ids.length,
					success: 0,
					failed: ids.length,
				},
			}
		}
	}

	/**
	 * Delete a category by its ID.
	 * @param id Category ID.
	 * @returns The deleted category entity.
	 */
	async remove(id: number): Promise<category> {
		try {
			return await this.prisma.category.delete({
				where: { category_id: id },
			})
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === 'P2025') {
					throw new NotFoundException(`Category with ID ${id} not found`)
				}
				if (error.code === 'P2003') {
					throw new ConflictException(
						`Category with ID ${id} cannot be deleted because it is associated with existing products.`
					)
				}
			}
			throw error
		}
	}
}
