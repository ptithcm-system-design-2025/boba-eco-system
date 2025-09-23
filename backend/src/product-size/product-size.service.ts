import {
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common'
import type {
	PaginatedResult,
	PaginationDto,
} from '../common/dto/pagination.dto'
import {
	Prisma,
	type product_price,
	type product_size,
} from '../generated/prisma/client'
import type { PrismaService } from '../prisma/prisma.service'
import type { CreateProductSizeDto } from './dto/create-product-size.dto'
import type { UpdateProductSizeDto } from './dto/update-product-size.dto'

@Injectable()
export class ProductSizeService {
	constructor(private prisma: PrismaService) {}

	/**
	 * Creates a new product size.
	 * @param createProductSizeDto The data to create the product size.
	 * @returns The created product size.
	 * @throws {ConflictException} If a product size with the same name and unit already exists.
	 */
	async create(
		createProductSizeDto: CreateProductSizeDto
	): Promise<product_size> {
		try {
			return await this.prisma.product_size.create({
				data: createProductSizeDto,
			})
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === 'P2002') {
					throw new ConflictException(
						`Product size with name '${createProductSizeDto.name}' and unit '${createProductSizeDto.unit}' already exists.`
					)
				}
			}
			throw error
		}
	}

	/**
	 * Retrieves a paginated list of product sizes.
	 * @param paginationDto The pagination options.
	 * @returns A paginated list of product sizes.
	 */
	async findAll(
		paginationDto: PaginationDto
	): Promise<PaginatedResult<product_size>> {
		const { page = 1, limit = 10 } = paginationDto
		const skip = (page - 1) * limit

		const [data, total] = await Promise.all([
			this.prisma.product_size.findMany({
				skip,
				take: limit,
				orderBy: { size_id: 'desc' },
			}),
			this.prisma.product_size.count(),
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
	 * Retrieves a single product size by its ID.
	 * @param size_id The ID of the product size to retrieve.
	 * @returns The product size, or null if not found.
	 * @throws {NotFoundException} If the product size with the given ID is not found.
	 */
	async findOne(size_id: number): Promise<product_size | null> {
		const productSize = await this.prisma.product_size.findUnique({
			where: { size_id },
		})
		if (!productSize) {
			throw new NotFoundException(`Product size with ID ${size_id} not found`)
		}
		return productSize
	}

	/**
	 * Updates a product size.
	 * @param size_id The ID of the product size to update.
	 * @param updateProductSizeDto The data to update the product size with.
	 * @returns The updated product size.
	 * @throws {NotFoundException} If the product size with the given ID is not found.
	 * @throws {ConflictException} If a product size with the same name and unit already exists.
	 */
	async update(
		size_id: number,
		updateProductSizeDto: UpdateProductSizeDto
	): Promise<product_size> {
		try {
			return await this.prisma.product_size.update({
				where: { size_id },
				data: updateProductSizeDto,
			})
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === 'P2025') {
					throw new NotFoundException(
						`Product size with ID ${size_id} not found`
					)
				}
				if (error.code === 'P2002') {
					throw new ConflictException(
						`Product size with name '${updateProductSizeDto.name}' and unit '${updateProductSizeDto.unit}' already exists.`
					)
				}
			}
			throw error
		}
	}

	/**
	 * Deletes a product size.
	 * @param size_id The ID of the product size to delete.
	 * @returns The deleted product size.
	 * @throws {NotFoundException} If the product size with the given ID is not found.
	 * @throws {ConflictException} If the product size is still in use by product prices.
	 */
	async remove(size_id: number): Promise<product_size> {
		try {
			return await this.prisma.product_size.delete({
				where: { size_id },
			})
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === 'P2025') {
					throw new NotFoundException(
						`Product size with ID ${size_id} not found`
					)
				}
				if (error.code === 'P2003') {
					throw new ConflictException(
						`Product size with ID ${size_id} cannot be deleted as it is currently in use by product prices.`
					)
				}
			}
			throw error
		}
	}

	/**
	 * Retrieves a paginated list of product prices for a given product size.
	 * @param size_id The ID of the product size.
	 * @param paginationDto The pagination options.
	 * @returns A paginated list of product prices.
	 * @throws {NotFoundException} If the product size with the given ID is not found.
	 */
	async getProductPricesBySize(
		size_id: number,
		paginationDto: PaginationDto
	): Promise<PaginatedResult<product_price>> {
		const { page = 1, limit = 10 } = paginationDto
		const skip = (page - 1) * limit
		await this.findOne(size_id)
		const [data, total] = await Promise.all([
			this.prisma.product_price.findMany({
				where: { size_id },
				skip,
				take: limit,
				orderBy: { product_price_id: 'desc' },
			}),
			this.prisma.product_price.count({
				where: { size_id },
			}),
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
}
