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
import type { ManagerService } from './manager.service';
import { CreateManagerDto } from './dto/create-manager.dto';
import { UpdateManagerDto } from './dto/update-manager.dto';
import { BulkDeleteManagerDto } from './dto/bulk-delete-manager.dto';
import {
	type PaginatedResult,
	type PaginationDto,
	PaginationMetadata,
} from '../common/dto/pagination.dto';
import type { manager } from '../generated/prisma/client';
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
import { LockAccountDto } from '../account/dto/lock-account.dto';
import { UpdateAccountDto } from '../account/dto/update-account.dto';

@ApiTags('managers')
@Controller('managers')
@ApiBearerAuth()
@ApiExtraModels(PaginationMetadata)
export class ManagerController {
	constructor(private readonly managerService: ManagerService) {}

	/**
	 * Creates a new manager.
	 * Requires MANAGER role.
	 * @param createManagerDto - The data for creating a new manager.
	 * @returns The newly created manager.
	 */
	@Post()
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER)
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({ summary: 'Create a new manager' })
	@ApiBody({ type: CreateManagerDto })
	@ApiResponse({ status: 201, description: 'Manager created successfully' })
	@ApiResponse({ status: 400, description: 'Bad Request' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({
		status: 403,
		description: 'Forbidden',
	})
	@ApiResponse({ status: 409, description: 'Email already exists' })
	async create(@Body() createManagerDto: CreateManagerDto): Promise<manager> {
		return this.managerService.create(createManagerDto);
	}

	/**
	 * Retrieves a paginated list of all managers.
	 * Requires MANAGER role.
	 * @param paginationDto - Pagination query parameters.
	 * @returns A paginated result of managers.
	 */
	@Get()
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER)
	@ApiOperation({ summary: 'Get all managers with pagination' })
	@ApiResponse({
		status: 200,
		description: 'Paginated list of managers',
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
		description: 'Forbidden',
	})
	async findAll(
		@Query() paginationDto: PaginationDto
	): Promise<PaginatedResult<manager>> {
		return this.managerService.findAll(paginationDto);
	}

	/**
	 * Retrieves a single manager by their ID.
	 * Requires MANAGER role.
	 * @param id - The ID of the manager to retrieve.
	 * @returns The manager object or null if not found.
	 */
	@Get(':id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER)
	@ApiOperation({ summary: 'Get manager by ID' })
	@ApiParam({ name: 'id', description: 'Manager ID', type: Number })
	@ApiResponse({ status: 200, description: 'Manager details' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({
		status: 403,
		description: 'Forbidden',
	})
	@ApiResponse({ status: 404, description: 'Manager not found' })
	async findOne(
		@Param('id', ParseIntPipe) id: number
	): Promise<manager | null> {
		return this.managerService.findOne(id);
	}

	/**
	 * Finds a manager by their email address.
	 * Requires MANAGER role.
	 * @param email - The email of the manager to find.
	 * @returns The manager object or null if not found.
	 */
	@Get('email/:email')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER)
	@ApiOperation({ summary: 'Find manager by email' })
	@ApiParam({ name: 'email', description: 'Manager email', type: String })
	@ApiResponse({ status: 200, description: 'Manager details' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({
		status: 403,
		description: 'Forbidden',
	})
	@ApiResponse({ status: 404, description: 'Manager not found' })
	async findByEmail(@Param('email') email: string): Promise<manager | null> {
		return this.managerService.findByEmail(email);
	}

	/**
	 * Updates a manager's information.
	 * Requires MANAGER role.
	 * @param id - The ID of the manager to update.
	 * @param updateManagerDto - The data to update the manager with.
	 * @returns The updated manager.
	 */
	@Patch(':id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER)
	@ApiOperation({ summary: 'Update manager' })
	@ApiParam({ name: 'id', description: 'Manager ID', type: Number })
	@ApiBody({ type: UpdateManagerDto })
	@ApiResponse({ status: 200, description: 'Manager updated successfully' })
	@ApiResponse({ status: 400, description: 'Bad Request' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({
		status: 403,
		description: 'Forbidden',
	})
	@ApiResponse({ status: 404, description: 'Manager not found' })
	@ApiResponse({ status: 409, description: 'Email already exists' })
	async update(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateManagerDto: UpdateManagerDto
	): Promise<manager> {
		return this.managerService.update(id, updateManagerDto);
	}

	/**
	 * Locks or unlocks a manager's account.
	 * Requires MANAGER role.
	 * @param managerId - The ID of the manager whose account is to be locked/unlocked.
	 * @param lockAccountDto - DTO containing the lock status.
	 * @returns The result of the lock operation.
	 */
	@Patch(':id/account/lock')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER)
	@ApiOperation({
		summary: 'Lock/unlock a manager account',
		description: 'Changes the lock status of a manager account',
	})
	@ApiParam({ name: 'id', description: 'Manager ID', type: Number })
	@ApiBody({ type: LockAccountDto })
	@ApiResponse({
		status: 200,
		description: 'Account lock status changed successfully',
	})
	@ApiResponse({ status: 400, description: 'Bad Request' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({
		status: 403,
		description: 'Forbidden',
	})
	@ApiResponse({ status: 404, description: 'Manager not found' })
	async lockManagerAccount(
		@Param('id', ParseIntPipe) managerId: number,
		@Body() lockAccountDto: LockAccountDto
	) {
		return this.managerService.lockManagerAccount(
			managerId,
			lockAccountDto.is_locked
		);
	}

	/**
	 * Updates a manager's account information.
	 * Requires MANAGER role.
	 * @param managerId - The ID of the manager.
	 * @param accountId - The ID of the account to update.
	 * @param updateAccountDto - The data to update the account with.
	 * @returns The updated account.
	 */
	@Patch(':id/account/:accountId')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER)
	@ApiOperation({
		summary: 'Update manager account information',
		description:
			'Updates the username, password, and status of a manager account',
	})
	@ApiParam({ name: 'id', description: 'Manager ID', type: Number })
	@ApiParam({ name: 'accountId', description: 'Account ID', type: Number })
	@ApiBody({ type: UpdateAccountDto })
	@ApiResponse({
		status: 200,
		description: 'Account information updated successfully',
	})
	@ApiResponse({
		status: 400,
		description: 'Account does not belong to manager',
	})
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({
		status: 403,
		description: 'Forbidden',
	})
	@ApiResponse({ status: 404, description: 'Manager or account not found' })
	@ApiResponse({ status: 409, description: 'Username already exists' })
	async updateManagerAccount(
		@Param('id', ParseIntPipe) managerId: number,
		@Param('accountId', ParseIntPipe) accountId: number,
		@Body() updateAccountDto: UpdateAccountDto
	) {
		return this.managerService.updateManagerAccount(
			managerId,
			accountId,
			updateAccountDto
		);
	}

	@Delete('bulk')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER)
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Bulk delete managers' })
	@ApiBody({ type: BulkDeleteManagerDto })
	@ApiResponse({
		status: 200,
		description: 'Bulk delete completed with results',
	})
	@ApiResponse({ status: 400, description: 'Bad Request' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({
		status: 403,
		description: 'Forbidden',
	})
	async bulkDelete(@Body() bulkDeleteDto: BulkDeleteManagerDto): Promise<{
		deleted: number[];
		failed: { id: number; reason: string }[];
		summary: { total: number; success: number; failed: number };
	}> {
		return this.managerService.bulkDelete(bulkDeleteDto);
	}

	@Delete(':id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER)
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: 'Delete manager' })
	@ApiParam({ name: 'id', description: 'Manager ID', type: Number })
	@ApiResponse({ status: 204, description: 'Manager deleted successfully' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({
		status: 403,
		description: 'Forbidden',
	})
	@ApiResponse({ status: 404, description: 'Manager not found' })
	async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
		await this.managerService.remove(id);
	}

	@Get('test/ping')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER)
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Test manager controller' })
	@ApiResponse({ status: 200, description: 'Test successful' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({
		status: 403,
		description: 'Forbidden',
	})
	async test(): Promise<{ message: string }> {
		return { message: 'Manager controller is working!' };
	}
}
