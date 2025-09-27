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
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import { ROLES } from '../auth/constants/roles.constant';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import {
	type PaginatedResult,
	type PaginationDto,
	PaginationMetadata,
} from '../common/dto/pagination.dto';
import type { store } from '../generated/prisma/client';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import type { StoreService } from './store.service';

@ApiTags('stores')
@Controller('stores')
@ApiBearerAuth()
@ApiExtraModels(PaginationMetadata)
export class StoreController {
	constructor(private readonly storeService: StoreService) {}

	/**
	 * Creates a new store.
	 * This endpoint is restricted to users with the MANAGER role.
	 * @param createStoreDto - The data for creating the new store.
	 * @returns The newly created store.
	 */
	@Post()
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER)
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({ summary: 'Create a new store (Manager only)' })
	@ApiBody({ type: CreateStoreDto })
	@ApiResponse({
		status: 201,
		description: 'The store has been successfully created.',
	})
	@ApiResponse({
		status: 400,
		description: 'Bad Request (e.g., validation error)',
	})
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Insufficient permissions',
	})
	@ApiResponse({
		status: 409,
		description: 'Conflict (e.g., email or name already exists)',
	})
	async create(@Body() createStoreDto: CreateStoreDto): Promise<store> {
		return this.storeService.create(createStoreDto);
	}

	/**
	 * Retrieves a paginated list of all stores.
	 * This endpoint is restricted to users with MANAGER or STAFF roles.
	 * @param paginationDto - The pagination parameters.
	 * @returns A paginated result of stores.
	 */
	@Get()
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER, ROLES.STAFF)
	@ApiOperation({
		summary: 'Get all stores with pagination (Manager and Staff only)',
	})
	@ApiResponse({
		status: 200,
		description: 'Paginated list of stores',
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
	): Promise<PaginatedResult<store>> {
		return this.storeService.findAll(paginationDto);
	}

	/**
	 * Retrieves the default store information.
	 * This endpoint is accessible to all authenticated users.
	 * @returns The default store.
	 */
	@Get('default')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER, ROLES.STAFF, ROLES.CUSTOMER)
	@ApiOperation({ summary: 'Get default store information (All roles)' })
	@ApiResponse({ status: 200, description: 'Default store information' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Insufficient permissions',
	})
	@ApiResponse({ status: 404, description: 'No store found' })
	async getDefaultStore(): Promise<store | null> {
		return this.storeService.getDefaultStore();
	}

	/**
	 * Retrieves a specific store by its ID.
	 * This endpoint is restricted to users with MANAGER or STAFF roles.
	 * @param id - The ID of the store to retrieve.
	 * @returns The store with the specified ID.
	 */
	@Get(':id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER, ROLES.STAFF)
	@ApiOperation({ summary: 'Get a store by ID (Manager and Staff only)' })
	@ApiParam({ name: 'id', description: 'Store ID', type: Number })
	@ApiResponse({ status: 200, description: 'The store' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Insufficient permissions',
	})
	@ApiResponse({ status: 404, description: 'Store not found' })
	async findOne(
		@Param('id', ParseIntPipe) id: number
	): Promise<store | null> {
		return this.storeService.findOne(id);
	}

	/**
	 * Updates an existing store.
	 * This endpoint is restricted to users with the MANAGER role.
	 * @param id - The ID of the store to update.
	 * @param updateStoreDto - The data to update the store with.
	 * @returns The updated store.
	 */
	@Patch(':id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER)
	@ApiOperation({ summary: 'Update a store by ID (Manager only)' })
	@ApiParam({ name: 'id', description: 'Store ID', type: Number })
	@ApiBody({ type: UpdateStoreDto })
	@ApiResponse({
		status: 200,
		description: 'The store has been successfully updated.',
	})
	@ApiResponse({ status: 400, description: 'Bad Request' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Insufficient permissions',
	})
	@ApiResponse({ status: 404, description: 'Store not found' })
	@ApiResponse({
		status: 409,
		description: 'Conflict (e.g., email or name already exists)',
	})
	async update(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateStoreDto: UpdateStoreDto
	): Promise<store> {
		return this.storeService.update(id, updateStoreDto);
	}

	/**
	 * Deletes a store by its ID.
	 * This endpoint is restricted to users with the MANAGER role.
	 * @param id - The ID of the store to delete.
	 */
	@Delete(':id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER)
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: 'Delete a store by ID (Manager only)' })
	@ApiParam({ name: 'id', description: 'Store ID', type: Number })
	@ApiResponse({
		status: 204,
		description: 'The store has been successfully deleted.',
	})
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Insufficient permissions',
	})
	@ApiResponse({ status: 404, description: 'Store not found' })
	@ApiResponse({
		status: 409,
		description: 'Conflict (e.g., due to foreign key constraints)',
	})
	async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
		await this.storeService.remove(id);
	}
}
