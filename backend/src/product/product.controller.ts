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
} from '@nestjs/common'
import {
	ApiBearerAuth,
	ApiBody,
	ApiExtraModels,
	ApiOperation,
	ApiParam,
	ApiQuery,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger'
import { ROLES } from '../auth/constants/roles.constant'
import { Roles } from '../auth/decorators/roles.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import {
	ConflictErrorDto,
	ForbiddenErrorDto,
	JSendSuccessDto,
	NotFoundErrorDto,
	UnauthorizedErrorDto,
	ValidationErrorDto,
} from '../common/dto/jsend-response.dto'
import {
	type PaginatedResult,
	type PaginationDto,
	PaginationMetadata,
} from '../common/dto/pagination.dto'
import type { product, product_price } from '../generated/prisma/client'
import { BulkDeleteProductDto } from './dto/bulk-delete-product.dto'
import { BulkDeleteProductPriceDto } from './dto/bulk-delete-product-price.dto'
import type { CreateProductDto } from './dto/create-product.dto'
import { CreateProductPriceDto } from './dto/create-product-price.dto'
import type { UpdateProductDto } from './dto/update-product.dto'
import { UpdateProductPriceDto } from './dto/update-product-price.dto'
import type { ProductService } from './product.service'

@ApiTags('products')
@Controller('products')
@ApiBearerAuth()
@ApiExtraModels(PaginationMetadata)
export class ProductController {
	constructor(private readonly productService: ProductService) {}

	@Post()
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER, ROLES.STAFF)
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({
		summary:
			'Create a new product with prices and sizes - MANAGER and STAFF only',
	})
	@ApiResponse({
		status: 201,
		description: 'The product has been successfully created.',
		type: JSendSuccessDto,
	})
	@ApiResponse({
		status: 400,
		description: 'Bad Request (e.g., validation error, missing size info)',
		type: ValidationErrorDto,
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized',
		type: UnauthorizedErrorDto,
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Insufficient permissions',
		type: ForbiddenErrorDto,
	})
	@ApiResponse({
		status: 404,
		description: 'Category or ProductSize not found',
		type: NotFoundErrorDto,
	})
	@ApiResponse({
		status: 409,
		description:
			'Conflict (e.g., product name exists, duplicate price for same size)',
		type: ConflictErrorDto,
	})
	async create(@Body() createProductDto: CreateProductDto): Promise<product> {
		return this.productService.create(createProductDto)
	}

	@Get()
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER, ROLES.STAFF, ROLES.CUSTOMER)
	@ApiOperation({ summary: 'Get all products with pagination - All roles' })
	@ApiQuery({
		name: 'page',
		required: false,
		type: Number,
		description: 'Page number',
	})
	@ApiQuery({
		name: 'limit',
		required: false,
		type: Number,
		description: 'Items per page',
	})
	@ApiResponse({
		status: 200,
		description: 'Paginated list of products',
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
	async findAll(
		@Query() paginationDto: PaginationDto
	): Promise<PaginatedResult<product>> {
		return this.productService.findAll(paginationDto)
	}

	@Get(':id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER, ROLES.STAFF, ROLES.CUSTOMER)
	@ApiOperation({
		summary: 'Get a product by ID with its prices - All roles',
		description:
			'Retrieves product details including a list of prices (size information is not included)',
	})
	@ApiParam({
		name: 'id',
		description: 'The ID of the product',
		type: Number,
	})
	@ApiResponse({
		status: 200,
		description: 'Return the product with prices.',
	})
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({ status: 404, description: 'Product not found.' })
	async findOne(
		@Param('id', ParseIntPipe) id: number
	): Promise<product | null> {
		return this.productService.findOne(id)
	}

	@Patch(':id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER, ROLES.STAFF)
	@ApiOperation({
		summary: 'Update product information only - MANAGER and STAFF only',
		description:
			'Updates product information only. To manage product prices, use the dedicated price endpoints.',
	})
	@ApiParam({
		name: 'id',
		description: 'The ID of the product to update',
		type: Number,
	})
	@ApiResponse({
		status: 200,
		description: 'The product has been successfully updated.',
	})
	@ApiResponse({ status: 400, description: 'Bad Request' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Insufficient permissions',
	})
	@ApiResponse({ status: 404, description: 'Product or Category not found' })
	@ApiResponse({
		status: 409,
		description: 'Conflict (e.g., product name exists)',
	})
	async update(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateProductDto: UpdateProductDto
	): Promise<product> {
		return this.productService.update(id, updateProductDto)
	}

	@Delete('bulk')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER)
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'Bulk delete products - MANAGER only',
		description:
			'Deletes multiple products at once. Products with prices currently in use in orders cannot be deleted.',
	})
	@ApiBody({ type: BulkDeleteProductDto })
	@ApiResponse({
		status: 200,
		description: 'Bulk delete completed with detailed results',
	})
	@ApiResponse({ status: 400, description: 'Bad Request' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Insufficient permissions',
	})
	async bulkDeleteProducts(
		@Body() bulkDeleteDto: BulkDeleteProductDto
	): Promise<{
		deleted: number[]
		failed: { id: number; reason: string }[]
		summary: { total: number; success: number; failed: number }
	}> {
		return this.productService.bulkDelete(bulkDeleteDto)
	}

	@Delete(':id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER)
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: 'Delete a product by ID - MANAGER only' })
	@ApiParam({
		name: 'id',
		description: 'The ID of the product to delete',
		type: Number,
	})
	@ApiResponse({
		status: 204,
		description: 'The product has been successfully deleted.',
	})
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Insufficient permissions',
	})
	@ApiResponse({ status: 404, description: 'Product not found.' })
	@ApiResponse({
		status: 409,
		description: 'Conflict (e.g., product prices are in use in orders)',
	})
	async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
		await this.productService.remove(id)
	}

	@Get('category/:categoryId')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.STAFF, ROLES.MANAGER, ROLES.CUSTOMER)
	@ApiOperation({
		summary: 'Get products by category with pagination - ALL ROLES',
	})
	@ApiParam({ name: 'categoryId', description: 'Category ID', type: Number })
	@ApiResponse({
		status: 200,
		description: 'List of products in the category',
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
	async findByCategory(
		@Param('categoryId', ParseIntPipe) categoryId: number,
		@Query() paginationDto: PaginationDto
	): Promise<PaginatedResult<product>> {
		return this.productService.findByCategory(categoryId, paginationDto)
	}

	@Post('prices')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER, ROLES.STAFF)
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({
		summary: 'Create a new price for a product - MANAGER and STAFF only',
		description: 'Adds a new price for a product with a specific size',
	})
	@ApiBody({ type: CreateProductPriceDto })
	@ApiResponse({
		status: 201,
		description: 'Product price created successfully',
	})
	@ApiResponse({ status: 400, description: 'Bad Request' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Insufficient permissions',
	})
	@ApiResponse({
		status: 404,
		description: 'Product or ProductSize not found',
	})
	@ApiResponse({
		status: 409,
		description: 'Conflict (duplicate price for same size)',
	})
	async createProductPrice(
		@Body() createProductPriceDto: CreateProductPriceDto
	): Promise<product_price> {
		return this.productService.createProductPrice(createProductPriceDto)
	}

	@Patch('prices/:priceId')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER, ROLES.STAFF)
	@ApiOperation({
		summary: 'Update a product price - MANAGER and STAFF only',
		description: 'Updates the price or status of a specific product price',
	})
	@ApiParam({
		name: 'priceId',
		description: 'The ID of the product price',
		type: Number,
	})
	@ApiBody({ type: UpdateProductPriceDto })
	@ApiResponse({
		status: 200,
		description: 'Product price updated successfully',
	})
	@ApiResponse({ status: 400, description: 'Bad Request' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Insufficient permissions',
	})
	@ApiResponse({ status: 404, description: 'Product price not found' })
	async updateProductPrice(
		@Param('priceId', ParseIntPipe) priceId: number,
		@Body() updateProductPriceDto: UpdateProductPriceDto
	): Promise<product_price> {
		return this.productService.updateProductPrice(
			priceId,
			updateProductPriceDto
		)
	}

	@Delete('prices/:priceId')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER, ROLES.STAFF)
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({
		summary: 'Delete a product price - MANAGER and STAFF only',
		description: 'Deletes a specific product price',
	})
	@ApiParam({
		name: 'priceId',
		description: 'The ID of the product price',
		type: Number,
	})
	@ApiResponse({
		status: 204,
		description: 'Product price deleted successfully',
	})
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Insufficient permissions',
	})
	@ApiResponse({ status: 404, description: 'Product price not found' })
	@ApiResponse({
		status: 409,
		description: 'Conflict (price is in use in orders)',
	})
	async removeProductPrice(
		@Param('priceId', ParseIntPipe) priceId: number
	): Promise<void> {
		await this.productService.removeProductPrice(priceId)
	}

	@Delete('prices/bulk')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER, ROLES.STAFF)
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'Bulk delete product prices - MANAGER and STAFF only',
		description: 'Deletes multiple product prices at once',
	})
	@ApiBody({ type: BulkDeleteProductPriceDto })
	@ApiResponse({
		status: 200,
		description: 'Bulk delete completed with detailed results',
	})
	@ApiResponse({ status: 400, description: 'Bad Request' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Insufficient permissions',
	})
	async bulkDeleteProductPrices(
		@Body() bulkDeleteDto: BulkDeleteProductPriceDto
	): Promise<{
		deleted: number[]
		failed: { id: number; reason: string }[]
		summary: { total: number; success: number; failed: number }
	}> {
		return this.productService.bulkDeleteProductPrices(bulkDeleteDto)
	}

	@Get(':productId/prices')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER, ROLES.STAFF, ROLES.CUSTOMER)
	@ApiOperation({
		summary: 'Get all prices for a product - All roles',
		description:
			'Retrieves all prices (active and inactive) for a specific product',
	})
	@ApiParam({
		name: 'productId',
		description: 'The ID of the product',
		type: Number,
	})
	@ApiResponse({ status: 200, description: 'List of prices for the product' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({ status: 404, description: 'Product not found' })
	async getProductPrices(
		@Param('productId', ParseIntPipe) productId: number
	): Promise<product_price[]> {
		return this.productService.getProductPrices(productId)
	}
}
