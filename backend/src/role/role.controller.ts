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
import type { role } from '../generated/prisma/client';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import type { RoleService } from './role.service';

@ApiTags('roles')
@Controller('roles')
@ApiBearerAuth()
@ApiExtraModels(PaginationMetadata)
/**
 * Controller for handling role-related requests.
 * Requires authentication and specific roles for access.
 */
export class RoleController {
	constructor(private readonly roleService: RoleService) {}

	/**
	 * Creates a new role.
	 * Requires MANAGER role.
	 * @param createRoleDto - The data to create the role.
	 * @returns The created role.
	 */
	@Post()
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER)
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({ summary: 'Create a role' })
	@ApiBody({ type: CreateRoleDto })
	@ApiResponse({
		status: 201,
		description: 'The role has been successfully created.',
	})
	@ApiResponse({ status: 400, description: 'Bad Request.' })
	@ApiResponse({ status: 401, description: 'Unauthorized.' })
	@ApiResponse({
		status: 403,
		description: 'Forbidden.',
	})
	@ApiResponse({
		status: 409,
		description: 'Conflict. Role name already exists.',
	})
	async create(@Body() createRoleDto: CreateRoleDto): Promise<role> {
		return this.roleService.create(createRoleDto);
	}

	/**
	 * Retrieves all roles with pagination.
	 * Requires MANAGER or STAFF role.
	 * @param paginationDto - The pagination options.
	 * @returns A paginated list of roles.
	 */
	@Get()
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER, ROLES.STAFF)
	@ApiOperation({ summary: 'Find all roles' })
	@ApiResponse({
		status: 200,
		description: 'A paginated list of roles.',
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
	@ApiResponse({ status: 401, description: 'Unauthorized.' })
	@ApiResponse({
		status: 403,
		description: 'Forbidden.',
	})
	async findAll(
		@Query() paginationDto: PaginationDto
	): Promise<PaginatedResult<role>> {
		return this.roleService.findAll(paginationDto);
	}

	/**
	 * Retrieves a role by its ID.
	 * Requires MANAGER or STAFF role.
	 * @param id - The ID of the role to retrieve.
	 * @returns The role with the specified ID, or null if not found.
	 */
	@Get(':id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER, ROLES.STAFF)
	@ApiOperation({ summary: 'Find one role by ID' })
	@ApiParam({ name: 'id', description: 'Role ID', type: Number })
	@ApiResponse({ status: 200, description: 'The role details.' })
	@ApiResponse({ status: 401, description: 'Unauthorized.' })
	@ApiResponse({
		status: 403,
		description: 'Forbidden.',
	})
	@ApiResponse({
		status: 404,
		description: 'Not Found. Role with the given ID not found.',
	})
	async findOne(@Param('id', ParseIntPipe) id: number): Promise<role | null> {
		return this.roleService.findOne(id);
	}

	/**
	 * Updates a role.
	 * Requires MANAGER role.
	 * @param id - The ID of the role to update.
	 * @param updateRoleDto - The data to update the role with.
	 * @returns The updated role.
	 */
	@Patch(':id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER)
	@ApiOperation({ summary: 'Update a role' })
	@ApiParam({ name: 'id', description: 'Role ID', type: Number })
	@ApiBody({ type: UpdateRoleDto })
	@ApiResponse({
		status: 200,
		description: 'The role has been successfully updated.',
	})
	@ApiResponse({ status: 400, description: 'Bad Request.' })
	@ApiResponse({ status: 401, description: 'Unauthorized.' })
	@ApiResponse({
		status: 403,
		description: 'Forbidden.',
	})
	@ApiResponse({
		status: 404,
		description: 'Not Found. Role with the given ID not found.',
	})
	@ApiResponse({
		status: 409,
		description: 'Conflict. Role name already exists.',
	})
	async update(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateRoleDto: UpdateRoleDto
	): Promise<role> {
		return this.roleService.update(id, updateRoleDto);
	}

	/**
	 * Deletes a role.
	 * Requires MANAGER role.
	 * @param id - The ID of the role to delete.
	 * @returns A promise that resolves when the role is deleted.
	 */
	@Delete(':id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER)
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: 'Delete a role' })
	@ApiParam({ name: 'id', description: 'Role ID', type: Number })
	@ApiResponse({
		status: 204,
		description: 'The role has been successfully deleted.',
	})
	@ApiResponse({ status: 401, description: 'Unauthorized.' })
	@ApiResponse({
		status: 403,
		description: 'Forbidden.',
	})
	@ApiResponse({
		status: 404,
		description: 'Not Found. Role with the given ID not found.',
	})
	@ApiResponse({
		status: 409,
		description: 'Conflict. The role is associated with existing accounts.',
	})
	async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
		await this.roleService.remove(id);
	}
}
