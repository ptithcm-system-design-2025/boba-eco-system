import {
	Injectable,
	NotFoundException,
	ConflictException,
	BadRequestException,
	InternalServerErrorException,
} from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service';
import { Prisma, type product, type product_price } from '../generated/prisma/client';
import type { CreateProductDto } from './dto/create-product.dto';
import type { UpdateProductDto } from './dto/update-product.dto';
import type { CreateProductPriceDto } from './dto/create-product-price.dto';
import type { UpdateProductPriceDto } from './dto/update-product-price.dto';
import type { BulkDeleteProductPriceDto } from './dto/bulk-delete-product-price.dto';
import type { BulkDeleteProductDto } from './dto/bulk-delete-product.dto';
import type { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';

@Injectable()
export class ProductService {
	constructor(private prisma: PrismaService) {}

	/**
	 * Creates a new product along with its prices.
	 * It handles creating or connecting product sizes and ensures category existence.
	 * @param createProductDto - The data to create a new product.
	 * @returns The newly created product with its category and prices.
	 * @throws {NotFoundException} If the specified category_id does not exist.
	 * @throws {BadRequestException} If price data is invalid (e.g., missing size info).
	 * @throws {ConflictException} If a product with the same name already exists or if there's a duplicate price for the same size.
	 * @throws {InternalServerErrorException} If there's an unexpected error during product size upsertion.
	 */
	async create(createProductDto: CreateProductDto): Promise<product> {
		const { name, category_id, prices, ...restProductData } = createProductDto;

		if (category_id) {
			const categoryExists = await this.prisma.category.findUnique({
				where: { category_id },
			});
			if (!categoryExists) {
				throw new NotFoundException(
					`Category with ID ${category_id} does not exist.`
				);
			}
		}

		const productData: Prisma.productCreateInput = {
			name,
			...restProductData,
			category: { connect: { category_id } },
			product_price: {
				create: [],
			},
		};

		for (const priceDto of prices) {
			const { size_id, size_data, price, is_active } = priceDto;
			let productSizeId: number;

			if (!size_id && !size_data) {
				throw new BadRequestException(
					'Each price must have either a size_id or size_data.'
				);
			}
			if (size_id && size_data) {
				throw new BadRequestException(
					'Each price cannot have both size_id and size_data. Provide one.'
				);
			}

			if (size_data) {
				const {
					name: sizeName,
					unit: sizeUnit,
					quantity: sizeQuantity,
					description: sizeDescription,
				} = size_data;
				try {
					const upsertedSize = await this.prisma.product_size.upsert({
						where: { unit_name: { unit: sizeUnit, name: sizeName } },
						create: {
							name: sizeName,
							unit: sizeUnit,
							quantity: sizeQuantity,
							description: sizeDescription,
						},
						update: { quantity: sizeQuantity, description: sizeDescription },
					});
					productSizeId = upsertedSize.size_id;
				} catch (e) {
					if (
						e instanceof Prisma.PrismaClientKnownRequestError &&
						e.code === 'P2002'
					) {
						const existingSize = await this.prisma.product_size.findUnique({
							where: { unit_name: { unit: sizeUnit, name: sizeName } },
						});
						if (!existingSize) {
							throw new InternalServerErrorException(
								`Failed to create or find product size: ${sizeName} (${sizeUnit}) after upsert attempt.`
							);
						}
						productSizeId = existingSize.size_id;
					} else {
						console.error('Error upserting product size:', e);
						throw new InternalServerErrorException(
							'Error processing product size data.'
						);
					}
				}
			} else if (size_id) {
				const existingSize = await this.prisma.product_size.findUnique({
					where: { size_id },
				});
				if (!existingSize) {
					throw new NotFoundException(
						`Product size with ID ${size_id} does not exist.`
					);
				}
				productSizeId = existingSize.size_id;
			} else {
				throw new BadRequestException(
					'Missing size_id or size_data for price item.'
				);
			}

			(
				productData.product_price!
					.create as Prisma.product_priceCreateWithoutProductInput[]
			).push({
				price: price,
				is_active: is_active !== undefined ? is_active : true,
				product_size: {
					connect: { size_id: productSizeId },
				},
			});
		}

		try {
			return await this.prisma.product.create({
				data: productData,
				include: {
					category: true,
					product_price: { include: { product_size: true } },
				},
			});
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (
					error.code === 'P2002' &&
					(error.meta?.target as string[])?.includes('name')
				) {
					throw new ConflictException(
						`Product with name '${name}' already exists.`
					);
				}
				if (
					error.code === 'P2002' &&
					(error.meta?.target as string[])?.includes('product_id') &&
					(error.meta?.target as string[])?.includes('size_id')
				) {
					throw new ConflictException(
						'A product cannot have duplicate prices for the same size.'
					);
				}
			}
			console.error('Error creating product:', error);
			throw error;
		}
	}

	/**
	 * Retrieves a paginated list of all products.
	 * @param paginationDto - Pagination parameters (page, limit).
	 * @returns A paginated result object containing the list of products and pagination metadata.
	 */
	async findAll(
		paginationDto: PaginationDto
	): Promise<PaginatedResult<product>> {
		const { page = 1, limit = 10 } = paginationDto;
		const skip = (page - 1) * limit;

		const [data, total] = await Promise.all([
			this.prisma.product.findMany({
				skip,
				take: limit,
				orderBy: { product_id: 'desc' },
				include: {
					category: true,
					product_price: {
						orderBy: { price: 'asc' },
					},
				},
			}),
			this.prisma.product.count(),
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
	 * Finds a single product by its ID.
	 * @param product_id - The ID of the product to find.
	 * @returns The found product object or null if not found.
	 * @throws {NotFoundException} If the product with the specified ID does not exist.
	 */
	async findOne(product_id: number): Promise<product | null> {
		const product = await this.prisma.product.findUnique({
			where: { product_id },
			include: {
				category: true,
				product_price: true,
			},
		});
		if (!product) {
			throw new NotFoundException(
				`Product with ID ${product_id} does not exist`
			);
		}
		return product;
	}

	/**
	 * Updates an existing product's details.
	 * @param product_id - The ID of the product to update.
	 * @param updateProductDto - The data to update the product with.
	 * @returns The updated product object.
	 * @throws {NotFoundException} If the product or category with the specified ID does not exist.
	 * @throws {ConflictException} If a product with the new name already exists.
	 */
	async update(
		product_id: number,
		updateProductDto: UpdateProductDto
	): Promise<product> {
		const { name, category_id, ...restProductData } = updateProductDto;

		const existingProduct = await this.prisma.product.findUnique({
			where: { product_id },
		});
		if (!existingProduct) {
			throw new NotFoundException(
				`Product with ID ${product_id} does not exist.`
			);
		}

		if (category_id) {
			const categoryExists = await this.prisma.category.findUnique({
				where: { category_id },
			});
			if (!categoryExists) {
				throw new NotFoundException(
					`Category with ID ${category_id} does not exist.`
				);
			}
		}

		const productUpdateData: Prisma.productUpdateInput = {
			...restProductData,
			...(name && { name }),
			...(category_id && { category: { connect: { category_id } } }),
		};

		try {
			return await this.prisma.product.update({
				where: { product_id },
				data: productUpdateData,
				include: {
					category: true,
					product_price: { include: { product_size: true } },
				},
			});
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (
					error.code === 'P2002' &&
					(error.meta?.target as string[])?.includes('name')
				) {
					throw new ConflictException(
						`Product with name '${name}' already exists.`
					);
				}
				if (error.code === 'P2025') {
					throw new NotFoundException(
						`Product with ID ${product_id} not found during update operation.`
					);
				}
			}
			console.error(`Error updating product ${product_id}:`, error);
			throw error;
		}
	}

	/**
	 * Deletes multiple products in bulk.
	 * This operation is transactional, deleting associated product prices first.
	 * @param bulkDeleteDto - An object containing an array of product IDs to delete.
	 * @returns An object summarizing the deletion result.
	 */
	async bulkDelete(bulkDeleteDto: BulkDeleteProductDto): Promise<{
		deleted: number[];
		failed: { id: number; reason: string }[];
		summary: { total: number; success: number; failed: number };
	}> {
		const { ids } = bulkDeleteDto;

		try {
			await this.prisma.$transaction(async (tx) => {
				await tx.product_price.deleteMany({
					where: { product_id: { in: ids } },
				});

				await tx.product.deleteMany({
					where: { product_id: { in: ids } },
				});
			});

			return {
				deleted: ids,
				failed: [],
				summary: {
					total: ids.length,
					success: ids.length,
					failed: 0,
				},
			};
		} catch (error) {
			return {
				deleted: [],
				failed: ids.map((id) => ({
					id,
					reason: `Error deleting product: ${error.message}`,
				})),
				summary: {
					total: ids.length,
					success: 0,
					failed: ids.length,
				},
			};
		}
	}

	/**
	 * Removes a single product and its associated prices.
	 * This operation is transactional.
	 * @param product_id - The ID of the product to remove.
	 * @returns The deleted product object.
	 * @throws {NotFoundException} If the product with the specified ID does not exist.
	 * @throws {ConflictException} If the product cannot be deleted due to foreign key constraints (e.g., used in orders).
	 */
	async remove(product_id: number): Promise<product> {
		const product = await this.prisma.product.findUnique({
			where: { product_id },
		});
		if (!product) {
			throw new NotFoundException(
				`Product with ID ${product_id} does not exist.`
			);
		}

		try {
			return await this.prisma.$transaction(async (tx) => {
				await tx.product_price.deleteMany({ where: { product_id } });
				return tx.product.delete({
					where: { product_id },
					include: { product_price: true },
				});
			});
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === 'P2025') {
					throw new NotFoundException(
						`Product with ID ${product_id} not found during delete operation.`
					);
				}
				if (error.code === 'P2003') {
					throw new ConflictException(
						`Product with ID ${product_id} cannot be deleted as its associated prices might be in use (e.g., in orders).`
					);
				}
			}
			console.error(`Error removing product ${product_id}:`, error);
			throw error;
		}
	}

	/**
	 * Finds all products belonging to a specific category, with pagination.
	 * @param category_id - The ID of the category.
	 * @param paginationDto - Pagination parameters (page, limit).
	 * @returns A paginated result of products in the specified category.
	 */
	async findByCategory(
		category_id: number,
		paginationDto: PaginationDto
	): Promise<PaginatedResult<product>> {
		const { page = 1, limit = 10 } = paginationDto;
		const skip = (page - 1) * limit;

		const [data, total] = await Promise.all([
			this.prisma.product.findMany({
				where: { category_id },
				skip,
				take: limit,
				orderBy: { product_id: 'desc' },
				include: {
					category: true,
					product_price: {
						orderBy: { price: 'asc' },
					},
				},
			}),
			this.prisma.product.count({
				where: { category_id },
			}),
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
	 * Finds products in a category that have at least one active price.
	 * @param category_id - The ID of the category.
	 * @param paginationDto - Pagination parameters (page, limit).
	 * @returns A paginated result of products with active prices in the specified category.
	 */
	async findByCategoryWithActivePrices(
		category_id: number,
		paginationDto: PaginationDto
	): Promise<PaginatedResult<product>> {
		const { page = 1, limit = 10 } = paginationDto;
		const skip = (page - 1) * limit;

		const categoryCondition = { category_id: category_id };

		const [data, total] = await Promise.all([
			this.prisma.product.findMany({
				where: {
					...categoryCondition,
					product_price: {
						some: {
							is_active: true,
						},
					},
				},
				skip,
				take: limit,
				orderBy: { product_id: 'desc' },
			}),
			this.prisma.product.count({
				where: {
					...categoryCondition,
					product_price: {
						some: {
							is_active: true,
						},
					},
				},
			}),
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
	 * Creates a new price for an existing product.
	 * @param createProductPriceDto - The data for the new product price.
	 * @returns The newly created product price object.
	 * @throws {NotFoundException} If the product or product size does not exist.
	 * @throws {BadRequestException} If size information is invalid.
	 * @throws {ConflictException} If a price already exists for the given product and size.
	 * @throws {InternalServerErrorException} If there's an error processing size data.
	 */
	async createProductPrice(
		createProductPriceDto: CreateProductPriceDto
	): Promise<product_price> {
		const { product_id, size_id, size_data, price, is_active } =
			createProductPriceDto;

		const product = await this.prisma.product.findUnique({
			where: { product_id },
		});
		if (!product) {
			throw new NotFoundException(
				`Product with ID ${product_id} does not exist.`
			);
		}

		if (!size_id && !size_data) {
			throw new BadRequestException(
				'Either size_id or size_data must be provided.'
			);
		}
		if (size_id && size_data) {
			throw new BadRequestException(
				'Cannot provide both size_id and size_data.'
			);
		}

		let productSizeId: number;

		if (size_data) {
			const {
				name: sizeName,
				unit: sizeUnit,
				quantity: sizeQuantity,
				description: sizeDescription,
			} = size_data;
			try {
				const upsertedSize = await this.prisma.product_size.upsert({
					where: { unit_name: { unit: sizeUnit, name: sizeName } },
					create: {
						name: sizeName,
						unit: sizeUnit,
						quantity: sizeQuantity,
						description: sizeDescription,
					},
					update: { quantity: sizeQuantity, description: sizeDescription },
				});
				productSizeId = upsertedSize.size_id;
			} catch (e) {
				if (
					e instanceof Prisma.PrismaClientKnownRequestError &&
					e.code === 'P2002'
				) {
					const existingSize = await this.prisma.product_size.findUnique({
						where: { unit_name: { unit: sizeUnit, name: sizeName } },
					});
					if (!existingSize) {
						throw new InternalServerErrorException(
							`Failed to create or find product size: ${sizeName} (${sizeUnit}).`
						);
					}
					productSizeId = existingSize.size_id;
				} else {
					console.error('Error upserting product size:', e);
					throw new InternalServerErrorException(
						'Error processing product size data.'
					);
				}
			}
		} else if (size_id) {
			const existingSize = await this.prisma.product_size.findUnique({
				where: { size_id },
			});
			if (!existingSize) {
				throw new NotFoundException(
					`Product size with ID ${size_id} does not exist.`
				);
			}
			productSizeId = existingSize.size_id;
		} else {
			throw new BadRequestException('Missing size_id or size_data.');
		}

		try {
			return await this.prisma.product_price.create({
				data: {
					product_id,
					size_id: productSizeId,
					price,
					is_active: is_active !== undefined ? is_active : true,
				},
				include: {
					product: true,
					product_size: true,
				},
			});
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (
					error.code === 'P2002' &&
					(error.meta?.target as string[])?.includes('product_id') &&
					(error.meta?.target as string[])?.includes('size_id')
				) {
					throw new ConflictException(
						'This product already has a price for this size.'
					);
				}
			}
			console.error('Error creating product price:', error);
			throw error;
		}
	}

	/**
	 * Updates an existing product price.
	 * @param priceId - The ID of the product price to update.
	 * @param updateProductPriceDto - The data to update the price with.
	 * @returns The updated product price object.
	 * @throws {NotFoundException} If the product price with the specified ID does not exist.
	 */
	async updateProductPrice(
		priceId: number,
		updateProductPriceDto: UpdateProductPriceDto
	): Promise<product_price> {
		const existingPrice = await this.prisma.product_price.findUnique({
			where: { product_price_id: priceId },
		});

		if (!existingPrice) {
			throw new NotFoundException(
				`Product price with ID ${priceId} does not exist.`
			);
		}

		try {
			return await this.prisma.product_price.update({
				where: { product_price_id: priceId },
				data: updateProductPriceDto,
				include: {
					product: true,
					product_size: true,
				},
			});
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === 'P2025') {
					throw new NotFoundException(
						`Product price with ID ${priceId} does not exist.`
					);
				}
			}
			console.error(`Error updating product price ${priceId}:`, error);
			throw error;
		}
	}

	/**
	 * Removes a specific product price.
	 * @param priceId - The ID of the product price to remove.
	 * @returns The deleted product price object.
	 * @throws {NotFoundException} If the product price with the specified ID does not exist.
	 * @throws {ConflictException} If the price is in use and cannot be deleted.
	 */
	async removeProductPrice(priceId: number): Promise<product_price> {
		const existingPrice = await this.prisma.product_price.findUnique({
			where: { product_price_id: priceId },
		});

		if (!existingPrice) {
			throw new NotFoundException(
				`Product price with ID ${priceId} does not exist.`
			);
		}

		try {
			return await this.prisma.product_price.delete({
				where: { product_price_id: priceId },
				include: {
					product: true,
					product_size: true,
				},
			});
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === 'P2025') {
					throw new NotFoundException(
						`Product price with ID ${priceId} does not exist.`
					);
				}
				if (error.code === 'P2003') {
					throw new ConflictException(
						`Product price with ID ${priceId} cannot be deleted as it is currently in use (e.g., in an order).`
					);
				}
			}
			console.error(`Error removing product price ${priceId}:`, error);
			throw error;
		}
	}

	/**
	 * Deletes multiple product prices in bulk.
	 * @param bulkDeleteDto - An object containing an array of product price IDs to delete.
	 * @returns An object summarizing the deletion result.
	 */
	async bulkDeleteProductPrices(
		bulkDeleteDto: BulkDeleteProductPriceDto
	): Promise<{
		deleted: number[];
		failed: { id: number; reason: string }[];
		summary: { total: number; success: number; failed: number };
	}> {
		const { ids } = bulkDeleteDto;
		const deleted: number[] = [];
		const failed: { id: number; reason: string }[] = [];

		for (const priceId of ids) {
			try {
				await this.removeProductPrice(priceId);
				deleted.push(priceId);
			} catch (error) {
				const reason = error instanceof Error ? error.message : 'Unknown error';
				failed.push({ id: priceId, reason });
			}
		}

		return {
			deleted,
			failed,
			summary: {
				total: ids.length,
				success: deleted.length,
				failed: failed.length,
			},
		};
	}

	/**
	 * Retrieves all prices for a specific product.
	 * @param productId - The ID of the product.
	 * @returns A list of product prices for the given product.
	 * @throws {NotFoundException} If the product with the specified ID does not exist.
	 */
	async getProductPrices(productId: number): Promise<product_price[]> {
		const product = await this.prisma.product.findUnique({
			where: { product_id: productId },
		});

		if (!product) {
			throw new NotFoundException(
				`Product with ID ${productId} does not exist.`
			);
		}

		return this.prisma.product_price.findMany({
			where: { product_id: productId },
			include: {
				product_size: true,
			},
			orderBy: [{ is_active: 'desc' }, { product_size: { name: 'asc' } }],
		});
	}
}
