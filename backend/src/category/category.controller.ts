import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	ParseIntPipe,
	HttpCode,
	HttpStatus,
	UseGuards,
	Query,
} from '@nestjs/common';
import type { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { BulkDeleteCategoryDto } from './dto/bulk-delete-category.dto';
import {
	type PaginationDto,
	type PaginatedResult,
	PaginationMetadata,
} from '../common/dto/pagination.dto';
import type { category } from '../generated/prisma/client';
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiParam,
	ApiBody,
	ApiBearerAuth,
	ApiQuery,
	ApiExtraModels,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLES } from '../auth/constants/roles.constant';

@ApiTags('categories')
@Controller('categories')
@ApiBearerAuth()
@ApiExtraModels(PaginationMetadata)
/**
 * Controller responsible for handling category-related API endpoints.
 * Provides CRUD operations and bulk deletion for categories.
 */
export class CategoryController {
	constructor(private readonly categoryService: CategoryService) {}

	@Post()
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER, ROLES.STAFF)
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({
		summary: 'Create a new category - MANAGER and STAFF only',
		description: 'Create a new product category with a name and description',
	})
	@ApiBody({ type: CreateCategoryDto })
	@ApiResponse({
		status: 201,
		description: 'Category created successfully',
		schema: {
			type: 'object',
			properties: {
				category_id: { type: 'number', description: 'Category ID' },
				name: { type: 'string', description: 'Category name' },
				description: {
					type: 'string',
					description: 'Category description',
					nullable: true,
				},
				is_active: { type: 'boolean', description: 'Active status' },
				created_at: {
					type: 'string',
					format: 'date-time',
					description: 'Creation timestamp',
				},
				updated_at: {
					type: 'string',
					format: 'date-time',
					description: 'Last update timestamp',
				},
			},
		},
	})
	@ApiResponse({
		status: 400,
		description: 'Bad Request - Invalid input data format',
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized - Invalid token',
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Only MANAGER and STAFF can create categories',
	})
	@ApiResponse({
		status: 409,
		description: 'Conflict - Category name already exists',
	})
	/**
	 * Create a new category.
	 * @param createCategoryDto Data transfer object containing category details.
	 * @returns The created category entity.
	 */
	async create(
		@Body() createCategoryDto: CreateCategoryDto
	): Promise<category> {
		return this.categoryService.create(createCategoryDto);
	}

	@Get()
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER, ROLES.STAFF, ROLES.CUSTOMER)
	@ApiOperation({
		summary: 'Get a paginated list of categories - All roles',
		description:
			'Returns a list of all product categories with pagination support',
	})
	@ApiQuery({
		name: 'page',
		required: false,
		type: Number,
		description: 'Page number (default: 1)',
		example: 1,
	})
	@ApiQuery({
		name: 'limit',
		required: false,
		type: Number,
		description: 'Number of records per page (default: 10)',
		example: 10,
	})
	@ApiResponse({
		status: 200,
		description: 'Paginated list of categories retrieved successfully',
		schema: {
			type: 'object',
			properties: {
				data: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							category_id: { type: 'number' },
							name: { type: 'string' },
							description: { type: 'string', nullable: true },
							is_active: { type: 'boolean' },
							created_at: { type: 'string', format: 'date-time' },
							updated_at: { type: 'string', format: 'date-time' },
						},
					},
				},
				pagination: {
					$ref: '#/components/schemas/PaginationMetadata',
				},
			},
		},
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized - Invalid token',
	})
	/**
	 * Retrieve all categories with pagination.
	 * @param paginationDto Pagination parameters.
	 * @returns Paginated list of categories.
	 */
	async findAll(
		@Query() paginationDto: PaginationDto
	): Promise<PaginatedResult<category>> {
		return this.categoryService.findAll(paginationDto);
	}

	@Get(':id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER, ROLES.STAFF, ROLES.CUSTOMER)
	@ApiOperation({
		summary: 'Get category information by ID - All roles',
		description: 'Get detailed information of a specific category by its ID',
	})
	@ApiParam({
		name: 'id',
		description: 'ID of the category to retrieve',
		type: Number,
		example: 1,
	})
	@ApiResponse({
		status: 200,
		description: 'Detailed category information',
		schema: {
			type: 'object',
			properties: {
				category_id: { type: 'number', description: 'Category ID' },
				name: { type: 'string', description: 'Category name' },
				description: {
					type: 'string',
					description: 'Category description',
					nullable: true,
				},
				is_active: { type: 'boolean', description: 'Active status' },
				created_at: {
					type: 'string',
					format: 'date-time',
					description: 'Creation timestamp',
				},
				updated_at: {
					type: 'string',
					format: 'date-time',
					description: 'Last update timestamp',
				},
			},
		},
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized - Invalid token',
	})
	@ApiResponse({
		status: 404,
		description: 'Category with the provided ID not found',
	})
	/**
	 * Retrieve a category by its ID.
	 * @param id Category ID.
	 * @returns The category entity or null if not found.
	 */
	async findOne(
		@Param('id', ParseIntPipe) id: number
	): Promise<category | null> {
		return this.categoryService.findOne(id);
	}

	@Patch(':id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER, ROLES.STAFF)
	@ApiOperation({
		summary: 'Update category information - MANAGER and STAFF only',
		description:
			'Update the information of a specific category, such as name, description, or active status',
	})
	@ApiParam({
		name: 'id',
		description: 'ID of the category to update',
		type: Number,
		example: 1,
	})
	@ApiBody({ type: UpdateCategoryDto })
	@ApiResponse({
		status: 200,
		description: 'Category updated successfully',
		schema: {
			type: 'object',
			properties: {
				category_id: { type: 'number', description: 'Category ID' },
				name: { type: 'string', description: 'Updated category name' },
				description: {
					type: 'string',
					description: 'Updated category description',
					nullable: true,
				},
				is_active: {
					type: 'boolean',
					description: 'Updated active status',
				},
				updated_at: {
					type: 'string',
					format: 'date-time',
					description: 'Last update timestamp',
				},
			},
		},
	})
	@ApiResponse({
		status: 400,
		description: 'Bad Request - Invalid input data format',
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized - Invalid token',
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Only MANAGER and STAFF can update categories',
	})
	@ApiResponse({
		status: 404,
		description: 'Category with the provided ID not found',
	})
	@ApiResponse({
		status: 409,
		description: 'Conflict - Category name already exists',
	})
	/**
	 * Update an existing category.
	 * @param id Category ID.
	 * @param updateCategoryDto Data transfer object containing updated category details.
	 * @returns The updated category entity.
	 */
	async update(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateCategoryDto: UpdateCategoryDto
	): Promise<category> {
		return this.categoryService.update(id, updateCategoryDto);
	}

	@Delete('bulk')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER)
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'Bulk delete categories - MANAGER only',
		description:
			'Deletes multiple categories at once. Categories with associated products cannot be deleted and will be reported as errors.',
	})
	@ApiBody({ type: BulkDeleteCategoryDto })
	@ApiResponse({
		status: 200,
		description: 'Bulk deletion process completed with detailed results',
		schema: {
			type: 'object',
			properties: {
				deleted: {
					type: 'array',
					items: { type: 'number' },
					description: 'List of successfully deleted category IDs',
				},
				failed: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							id: {
								type: 'number',
								description: 'ID of the category that could not be deleted',
							},
							reason: {
								type: 'string',
								description: 'Reason for deletion failure',
							},
						},
					},
					description:
						'List of categories that could not be deleted and the reasons',
				},
				summary: {
					type: 'object',
					properties: {
						total: {
							type: 'number',
							description: 'Total number of categories requested for deletion',
						},
						success: {
							type: 'number',
							description: 'Number of successfully deleted categories',
						},
						failed: {
							type: 'number',
							description: 'Number of categories that failed to delete',
						},
					},
				},
			},
		},
	})
	@ApiResponse({
		status: 400,
		description: 'Bad Request - Invalid ID list format',
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized - Invalid token',
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Only MANAGER can delete categories',
	})
	/**
	 * Bulk delete categories.
	 * @param bulkDeleteDto Data transfer object containing list of category IDs to delete.
	 * @returns Result of bulk deletion including deleted and failed IDs.
	 */
	async bulkDelete(@Body() bulkDeleteDto: BulkDeleteCategoryDto): Promise<{
		deleted: number[];
		failed: { id: number; reason: string }[];
		summary: { total: number; success: number; failed: number };
	}> {
		return this.categoryService.bulkDelete(bulkDeleteDto);
	}

	@Delete(':id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER)
	@ApiOperation({
		summary: 'Delete a category by ID - MANAGER only',
		description:
			'Permanently deletes a category from the system. Note: A category with associated products cannot be deleted.',
	})
	@ApiParam({
		name: 'id',
		description: 'ID of the category to delete',
		type: Number,
		example: 1,
	})
	@ApiResponse({
		status: 200,
		description: 'Category deleted successfully',
		schema: {
			type: 'object',
			properties: {
				category_id: {
					type: 'number',
					description: 'ID of the deleted category',
				},
				name: { type: 'string', description: 'Name of the deleted category' },
				message: {
					type: 'string',
					description: 'Confirmation message for successful deletion',
				},
			},
		},
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized - Invalid token',
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Only MANAGER can delete categories',
	})
	@ApiResponse({
		status: 404,
		description: 'Category with the provided ID not found',
	})
	@ApiResponse({
		status: 409,
		description: 'Conflict - The category is being used by other products',
	})
	/**
	 * Delete a category by its ID.
	 * @param id Category ID.
	 * @returns The deleted category entity.
	 */
	async remove(@Param('id', ParseIntPipe) id: number): Promise<category> {
		return this.categoryService.remove(id);
	}

	@Get('admin/test')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER)
	@ApiOperation({
		summary: 'Smoke test for Category Controller - MANAGER only',
		description:
			'Endpoint to check if the Category Controller is working correctly (smoke test)',
	})
	@ApiResponse({
		status: 200,
		description: 'Test successful',
		schema: {
			type: 'object',
			properties: {
				message: {
					type: 'string',
					description: 'Confirmation message that the controller is working',
					example: 'Category controller is working!',
				},
			},
		},
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized - Invalid token',
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Only MANAGER can perform this test',
	})
	/**
	 * Smoke test endpoint for CategoryController.
	 * @returns Confirmation message that the controller is working.
	 */
	adminTest(): { message: string } {
		return { message: 'Category controller is working!' };
	}
}
