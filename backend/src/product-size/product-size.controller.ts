import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	Query,
	UseGuards,
} from '@nestjs/common';
import type { ProductSizeService } from './product-size.service';
import { CreateProductSizeDto } from './dto/create-product-size.dto';
import { UpdateProductSizeDto } from './dto/update-product-size.dto';
import {
	type PaginatedResult,
	type PaginationDto,
	PaginationMetadata,
} from '../common/dto/pagination.dto';
import type { product_price, product_size } from '../generated/prisma/client';
import {
	ApiBearerAuth,
	ApiBody,
	ApiExtraModels,
	ApiOperation,
	ApiParam,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLES } from '../auth/constants/roles.constant';

@ApiTags('product-sizes')
@Controller('product-sizes')
@ApiBearerAuth()
@ApiExtraModels(PaginationMetadata)
export class ProductSizeController {
	constructor(private readonly productSizeService: ProductSizeService) {}

	/**
	 * Creates a new product size.
	 * @param createProductSizeDto The data to create the product size.
	 * @returns The created product size.
	 */
	@Post()
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER)
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({ summary: 'Create a new product size (MANAGER only)' })
	@ApiBody({ type: CreateProductSizeDto })
	@ApiResponse({
		status: 201,
		description: 'The product size has been successfully created.',
	})
	@ApiResponse({ status: 400, description: 'Bad Request' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Insufficient permissions',
	})
	@ApiResponse({
		status: 409,
		description: 'Conflict - Product size already exists',
	})
	async create(
		@Body() createProductSizeDto: CreateProductSizeDto
	): Promise<product_size> {
		return this.productSizeService.create(createProductSizeDto);
	}

	/**
	 * Retrieves a paginated list of product sizes.
	 * @param paginationDto The pagination options.
	 * @returns A paginated list of product sizes.
	 */
	@Get()
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.STAFF, ROLES.MANAGER, ROLES.CUSTOMER)
	@ApiOperation({
		summary: 'Get a paginated list of product sizes (All roles)',
	})
	@ApiResponse({
		status: 200,
		description: 'A paginated list of product sizes',
		schema: {
			type: 'object',
			properties: {
				data: {
					type: 'array',
					items: { type: 'object' },
				},
				pagination: {
					$ref: '#/components/schemas/PaginationMetadata',
				},
			},
		},
	})
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Insufficient permissions',
	})
	async findAll(
		@Query() paginationDto: PaginationDto
	): Promise<PaginatedResult<product_size>> {
		return this.productSizeService.findAll(paginationDto);
	}

	/**
	 * Retrieves a single product size by its ID.
	 * @param id The ID of the product size to retrieve.
	 * @returns The product size, or null if not found.
	 */
	@Get(':id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.STAFF, ROLES.MANAGER, ROLES.CUSTOMER)
	@ApiOperation({ summary: 'Get a product size by ID (All roles)' })
	@ApiParam({ name: 'id', description: 'Product Size ID', type: Number })
	@ApiResponse({ status: 200, description: 'The product size details' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Insufficient permissions',
	})
	@ApiResponse({
		status: 404,
		description: 'Product size not found',
	})
	async findOne(
		@Param('id', ParseIntPipe) id: number
	): Promise<product_size | null> {
		return this.productSizeService.findOne(id);
	}

	/**
	 * Updates a product size.
	 * @param id The ID of the product size to update.
	 * @param updateProductSizeDto The data to update the product size with.
	 * @returns The updated product size.
	 */
	@Patch(':id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER)
	@ApiOperation({ summary: 'Update a product size (MANAGER only)' })
	@ApiParam({ name: 'id', description: 'Product Size ID', type: Number })
	@ApiBody({ type: UpdateProductSizeDto })
	@ApiResponse({
		status: 200,
		description: 'The product size has been successfully updated.',
	})
	@ApiResponse({ status: 400, description: 'Bad Request' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Insufficient permissions',
	})
	@ApiResponse({
		status: 404,
		description: 'Product size not found',
	})
	@ApiResponse({
		status: 409,
		description: 'Conflict - Product size already exists',
	})
	async update(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateProductSizeDto: UpdateProductSizeDto
	): Promise<product_size> {
		return this.productSizeService.update(id, updateProductSizeDto);
	}

	/**
	 * Deletes a product size.
	 * @param id The ID of the product size to delete.
	 * @returns A promise that resolves when the product size is deleted.
	 */
	@Delete(':id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER)
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: 'Delete a product size (MANAGER only)' })
	@ApiParam({ name: 'id', description: 'Product Size ID', type: Number })
	@ApiResponse({
		status: 204,
		description: 'The product size has been successfully deleted.',
	})
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Insufficient permissions',
	})
	@ApiResponse({
		status: 404,
		description: 'Product size not found',
	})
	@ApiResponse({
		status: 409,
		description: 'Conflict - The product size is currently in use.',
	})
	async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
		await this.productSizeService.remove(id);
	}

	/**
	 * Retrieves a paginated list of product prices for a given product size.
	 * @param id The ID of the product size.
	 * @param paginationDto The pagination options.
	 * @returns A paginated list of product prices.
	 */
	@Get(':id/product-prices')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.STAFF, ROLES.MANAGER, ROLES.CUSTOMER)
	@ApiOperation({
		summary: 'Get product prices by size with pagination (All roles)',
	})
	@ApiParam({ name: 'id', description: 'Product Size ID', type: Number })
	@ApiResponse({
		status: 200,
		description: 'A paginated list of product prices for the given size',
		schema: {
			type: 'object',
			properties: {
				data: {
					type: 'array',
					items: { type: 'object' },
				},
				pagination: {
					$ref: '#/components/schemas/PaginationMetadata',
				},
			},
		},
	})
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Insufficient permissions',
	})
	@ApiResponse({
		status: 404,
		description: 'Product size not found',
	})
	async getProductPricesBySize(
		@Param('id', ParseIntPipe) id: number,
		@Query() paginationDto: PaginationDto
	): Promise<PaginatedResult<product_price>> {
		return this.productSizeService.getProductPricesBySize(id, paginationDto);
	}

	/**
	 * A test endpoint to check if the controller is working.
	 * @returns A success message.
	 */
	@Get('test/ping')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER)
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Test product size controller (MANAGER only)' })
	@ApiResponse({ status: 200, description: 'Test successful' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Insufficient permissions',
	})
	async test(): Promise<{ message: string }> {
		return { message: 'Product Size controller is working!' };
	}
}
