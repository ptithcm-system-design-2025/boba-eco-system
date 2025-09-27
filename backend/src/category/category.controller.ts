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
import {
	ApiBearerAuth,
	ApiBody,
	ApiExtraModels,
	ApiOperation,
	ApiParam,
	ApiQuery,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import { ROLES } from '../auth/constants/roles.constant';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import {
	ConflictErrorDto,
	ForbiddenErrorDto,
	JSendPaginatedSuccessDto,
	JSendSuccessDto,
	NotFoundErrorDto,
	UnauthorizedErrorDto,
	ValidationErrorDto,
} from '../common/dto/jsend-response.dto';
import {
	type PaginatedResult,
	type PaginationDto,
	PaginationMetadata,
} from '../common/dto/pagination.dto';
import type { category } from '../generated/prisma/client';
import type { CategoryService } from './category.service';
import { BulkDeleteCategoryDto } from './dto/bulk-delete-category.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

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
		description:
			'Create a new product category with a name and description',
	})
	@ApiBody({ type: CreateCategoryDto })
	@ApiResponse({
		status: 201,
		description: 'Category created successfully',
		type: JSendSuccessDto,
	})
	@ApiResponse({
		status: 400,
		description: 'Bad Request - Invalid input data format',
		type: ValidationErrorDto,
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized - Invalid token',
		type: UnauthorizedErrorDto,
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Only MANAGER and STAFF can create categories',
		type: ForbiddenErrorDto,
	})
	@ApiResponse({
		status: 409,
		description: 'Conflict - Category name already exists',
		type: ConflictErrorDto,
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
		type: JSendPaginatedSuccessDto,
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized - Invalid token',
		type: UnauthorizedErrorDto,
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
		description:
			'Get detailed information of a specific category by its ID',
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
		type: JSendSuccessDto,
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized - Invalid token',
		type: UnauthorizedErrorDto,
	})
	@ApiResponse({
		status: 404,
		description: 'Category with the provided ID not found',
		type: NotFoundErrorDto,
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
		type: JSendSuccessDto,
	})
	@ApiResponse({
		status: 400,
		description: 'Bad Request - Invalid input data format',
		type: ValidationErrorDto,
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized - Invalid token',
		type: UnauthorizedErrorDto,
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Only MANAGER and STAFF can update categories',
		type: ForbiddenErrorDto,
	})
	@ApiResponse({
		status: 404,
		description: 'Category with the provided ID not found',
		type: NotFoundErrorDto,
	})
	@ApiResponse({
		status: 409,
		description: 'Conflict - Category name already exists',
		type: ConflictErrorDto,
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
		type: JSendSuccessDto,
	})
	@ApiResponse({
		status: 400,
		description: 'Bad Request - Invalid ID list format',
		type: ValidationErrorDto,
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized - Invalid token',
		type: UnauthorizedErrorDto,
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Only MANAGER can delete categories',
		type: ForbiddenErrorDto,
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
		type: JSendSuccessDto,
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized - Invalid token',
		type: UnauthorizedErrorDto,
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Only MANAGER can delete categories',
		type: ForbiddenErrorDto,
	})
	@ApiResponse({
		status: 404,
		description: 'Category with the provided ID not found',
		type: NotFoundErrorDto,
	})
	@ApiResponse({
		status: 409,
		description: 'Conflict - The category is being used by other products',
		type: ConflictErrorDto,
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
		type: JSendSuccessDto,
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized - Invalid token',
		type: UnauthorizedErrorDto,
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Only MANAGER can perform this test',
		type: ForbiddenErrorDto,
	})
	/**
	 * Smoke test endpoint for CategoryController.
	 * @returns Confirmation message that the controller is working.
	 */
	adminTest(): { message: string } {
		return { message: 'Category controller is working!' };
	}
}
