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
	type PaginatedResult,
	type PaginationDto,
	PaginationMetadata,
} from '../common/dto/pagination.dto'
import type {
	account,
	customer,
	employee,
	manager,
	role,
} from '../generated/prisma/client'
import type { AccountService } from './account.service'
import { CreateAccountDto } from './dto/create-account.dto'
import { UpdateAccountDto } from './dto/update-account.dto'

@ApiTags('accounts')
@Controller('accounts')
@ApiBearerAuth('JWT-auth')
@ApiExtraModels(PaginationMetadata)
/**
 * Controller responsible for handling account-related requests.
 * Provides endpoints for creating, retrieving, updating, and deleting accounts.
 * Access is restricted based on user roles.
 */
export class AccountController {
	constructor(private readonly accountService: AccountService) {}

	@Post()
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER)
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({
		summary: 'Create a new account - MANAGER only',
		description:
			'Creates a new account in the system with specified credentials and permissions.',
	})
	@ApiBody({ type: CreateAccountDto })
	@ApiResponse({
		status: 201,
		description: 'Account created successfully.',
		schema: {
			type: 'object',
			properties: {
				account_id: { type: 'number', description: 'Account ID' },
				username: { type: 'string', description: 'Username' },
				email: { type: 'string', description: 'Email' },
				phone: { type: 'string', description: 'Phone number' },
				role_id: { type: 'number', description: 'Role ID' },
				is_active: { type: 'boolean', description: 'Active status' },
				created_at: {
					type: 'string',
					format: 'date-time',
					description: 'Creation timestamp',
				},
				updated_at: {
					type: 'string',
					format: 'date-time',
					description: 'Update timestamp',
				},
			},
		},
	})
	@ApiResponse({
		status: 400,
		description:
			'Bad Request - Invalid input data format or missing required fields.',
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized - Invalid or missing token.',
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Only MANAGER can create accounts.',
	})
	@ApiResponse({
		status: 409,
		description: 'Conflict - Username, email, or phone number already exists.',
	})
	/**
	 * Creates a new account.
	 * Accessible only by users with the MANAGER role.
	 * @param createAccountDto Data to create the account with
	 * @returns Newly created account object
	 */
	async create(@Body() createAccountDto: CreateAccountDto): Promise<account> {
		return this.accountService.create(createAccountDto)
	}

	@Get()
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER)
	@ApiOperation({
		summary: 'Get paginated list of accounts - MANAGER only',
		description: 'Returns a paginated list of all accounts in the system.',
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
		description: 'Paginated list of accounts retrieved successfully.',
		schema: {
			type: 'object',
			properties: {
				data: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							account_id: { type: 'number' },
							username: { type: 'string' },
							email: { type: 'string' },
							phone: { type: 'string' },
							role_id: { type: 'number' },
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
		description: 'Unauthorized - Invalid token.',
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Only MANAGER can view the account list.',
	})
	/**
	 * Retrieves a paginated list of all accounts.
	 * Accessible only by users with the MANAGER role.
	 * @param paginationDto Pagination options (page, limit)
	 * @returns Paginated result containing the list of accounts
	 */
	async findAll(
		@Query() paginationDto: PaginationDto
	): Promise<PaginatedResult<Omit<account, 'password_hash'>>> {
		return this.accountService.findAll(paginationDto)
	}

	@Get(':id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER, ROLES.STAFF)
	@ApiOperation({
		summary: 'Get account information by ID - MANAGER and STAFF',
		description:
			'Retrieves detailed information for a specific account by its ID.',
	})
	@ApiParam({
		name: 'id',
		description: 'ID of the account to retrieve',
		type: Number,
		example: 1,
	})
	@ApiResponse({
		status: 200,
		description: 'Account details.',
		schema: {
			type: 'object',
			properties: {
				account_id: { type: 'number', description: 'Account ID' },
				username: { type: 'string', description: 'Username' },
				email: { type: 'string', description: 'Email' },
				phone: { type: 'string', description: 'Phone number' },
				role_id: { type: 'number', description: 'Role ID' },
				is_active: { type: 'boolean', description: 'Active status' },
				created_at: {
					type: 'string',
					format: 'date-time',
					description: 'Creation timestamp',
				},
				updated_at: {
					type: 'string',
					format: 'date-time',
					description: 'Update timestamp',
				},
			},
		},
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized - Invalid token.',
	})
	@ApiResponse({
		status: 403,
		description:
			'Forbidden - Only MANAGER and STAFF can view account information.',
	})
	@ApiResponse({
		status: 404,
		description: 'Account with the provided ID not found.',
	})
	/**
	 * Retrieves a single account by its ID.
	 * Accessible by users with MANAGER or STAFF roles.
	 * @param id ID of the account to retrieve
	 * @returns Account object if found
	 */
	async findOne(@Param('id', ParseIntPipe) id: number): Promise<
		Omit<account, 'password_hash'> & {
			role?: role
			customer?: customer[]
			employee?: employee | null
			manager?: manager | null
		}
	> {
		return this.accountService.findOne(id)
	}

	@Patch(':id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER)
	@ApiOperation({
		summary: 'Update account information - MANAGER only',
		description:
			'Updates a specific account. Can update personal information, password, or account status.',
	})
	@ApiParam({
		name: 'id',
		description: 'ID of the account to update',
		type: Number,
		example: 1,
	})
	@ApiBody({ type: UpdateAccountDto })
	@ApiResponse({
		status: 200,
		description: 'Account updated successfully.',
		schema: {
			type: 'object',
			properties: {
				account_id: { type: 'number', description: 'Account ID' },
				username: { type: 'string', description: 'Username' },
				email: { type: 'string', description: 'Email' },
				phone: { type: 'string', description: 'Phone number' },
				role_id: { type: 'number', description: 'Role ID' },
				is_active: { type: 'boolean', description: 'Active status' },
				updated_at: {
					type: 'string',
					format: 'date-time',
					description: 'Update timestamp',
				},
			},
		},
	})
	@ApiResponse({
		status: 400,
		description: 'Bad Request - Invalid input data format.',
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized - Invalid token.',
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Only MANAGER can update accounts.',
	})
	@ApiResponse({
		status: 404,
		description: 'Account with the provided ID not found.',
	})
	@ApiResponse({
		status: 409,
		description: 'Conflict - Username, email, or phone number already exists.',
	})
	/**
	 * Updates an existing account.
	 * Accessible only by users with the MANAGER role.
	 * @param id ID of the account to update
	 * @param updateAccountDto Data to update the account with
	 * @returns Updated account object
	 */
	async update(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateAccountDto: UpdateAccountDto
	): Promise<account> {
		return this.accountService.update(id, updateAccountDto)
	}

	@Delete(':id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER)
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'Delete account - MANAGER only',
		description:
			'Permanently deletes an account from the system. Note: This action cannot be undone.',
	})
	@ApiParam({
		name: 'id',
		description: 'ID of the account to delete',
		type: Number,
		example: 1,
	})
	@ApiResponse({
		status: 200,
		description: 'Account deleted successfully.',
		schema: {
			type: 'object',
			properties: {
				account_id: {
					type: 'number',
					description: 'ID of the deleted account',
				},
				username: {
					type: 'string',
					description: 'Username of the deleted account',
				},
				message: {
					type: 'string',
					description: 'Confirmation message',
				},
			},
		},
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized - Invalid token.',
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Only MANAGER can delete accounts.',
	})
	@ApiResponse({
		status: 404,
		description: 'Account with the provided ID not found.',
	})
	async remove(@Param('id', ParseIntPipe) id: number): Promise<account> {
		return this.accountService.remove(id)
	}

	@Get('admin/test')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER)
	@ApiOperation({
		summary: 'Smoke test for Account Controller - MANAGER only',
		description:
			'Endpoint to check if the Account Controller is working correctly (smoke test).',
	})
	@ApiResponse({
		status: 200,
		description: 'Test successful.',
		schema: {
			type: 'object',
			properties: {
				message: {
					type: 'string',
					description: 'Confirmation message that the controller is working.',
					example: 'Account controller is working!',
				},
			},
		},
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized - Invalid token.',
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Only MANAGER can perform this test.',
	})
	/**
	 * Smoke test endpoint to verify that the controller is working.
	 * Accessible only by users with the MANAGER role.
	 * @returns Confirmation message
	 */
	adminTest(): { message: string } {
		return { message: 'Account controller is working!' }
	}
}
