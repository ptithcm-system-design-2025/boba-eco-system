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

import { CreateAccountDto } from '../account/dto/create-account.dto'
import { LockAccountDto } from '../account/dto/lock-account.dto'
import { UpdateAccountDto } from '../account/dto/update-account.dto'
import { ROLES } from '../auth/constants/roles.constant'
import { Roles } from '../auth/decorators/roles.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import {
	ConflictErrorDto,
	ForbiddenErrorDto,
	JSendSuccessDto,
	UnauthorizedErrorDto,
	ValidationErrorDto,
} from '../common/dto/jsend-response.dto'
import {
	type PaginatedResult,
	type PaginationDto,
	PaginationMetadata,
} from '../common/dto/pagination.dto'
import type { customer } from '../generated/prisma/client'
import type { CustomerService } from './customer.service'
import { BulkDeleteCustomerDto } from './dto/bulk-delete-customer.dto'
import { CreateCustomerDto } from './dto/create-customer.dto'
import { UpdateCustomerDto } from './dto/update-customer.dto'

@ApiTags('customers')
@Controller('customers')
@ApiBearerAuth('JWT-auth')
@ApiExtraModels(PaginationMetadata)
export class CustomerController {
	constructor(private readonly customerService: CustomerService) {}

	@Post()
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER, ROLES.STAFF)
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({
		summary: 'Create a new customer - MANAGER and STAFF only',
		description:
			'The system will automatically assign the membership type with the lowest required points and set the current points to that value.',
	})
	@ApiBody({ type: CreateCustomerDto })
	@ApiResponse({
		status: 201,
		description:
			'Customer created successfully with automatic membership type and points.',
		type: JSendSuccessDto,
	})
	@ApiResponse({
		status: 400,
		description: 'Invalid request - Input data is not in the correct format.',
		type: ValidationErrorDto,
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized - Invalid token.',
		type: UnauthorizedErrorDto,
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Only MANAGER and STAFF can create customers.',
		type: ForbiddenErrorDto,
	})
	@ApiResponse({
		status: 409,
		description: 'Conflict - Phone number already exists.',
		type: ConflictErrorDto,
	})
	async create(
		@Body() createCustomerDto: CreateCustomerDto
	): Promise<customer> {
		return this.customerService.create(createCustomerDto)
	}

	@Get()
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER, ROLES.STAFF)
	@ApiOperation({
		summary: 'Get a paginated list of customers - MANAGER and STAFF only',
		description:
			'Returns a list of all customers in the system with their membership type and loyalty points information.',
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
		description: 'Successfully retrieved paginated list of customers.',
		type: JSendPaginatedSuccessDto,
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized - Invalid token.',
		type: UnauthorizedErrorDto,
	})
	@ApiResponse({
		status: 403,
		description:
			'Forbidden - Only MANAGER and STAFF can view the customer list.',
		type: ForbiddenErrorDto,
	})
	async findAll(
		@Query() paginationDto: PaginationDto
	): Promise<PaginatedResult<customer>> {
		return this.customerService.findAll(paginationDto)
	}

	@Delete('bulk')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER)
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'Xóa nhiều khách hàng cùng lúc - Chỉ MANAGER',
		description:
			'Xóa nhiều khách hàng cùng lúc. Các khách hàng có đơn hàng liên quan sẽ không thể xóa và sẽ được báo lỗi',
	})
	@ApiBody({ type: BulkDeleteCustomerDto })
	@ApiResponse({
		status: 200,
		description: 'Quá trình xóa hàng loạt hoàn thành với kết quả chi tiết',
		type: JSendSuccessDto,
	})
	@ApiResponse({
		status: 400,
		description: 'Yêu cầu không hợp lệ - Danh sách ID không đúng định dạng',
		type: ValidationErrorDto,
	})
	@ApiResponse({
		status: 401,
		description: 'Chưa xác thực - Token không hợp lệ',
		type: UnauthorizedErrorDto,
	})
	@ApiResponse({
		status: 403,
		description:
			'Không có quyền truy cập - Chỉ MANAGER mới có thể xóa khách hàng',
		type: ForbiddenErrorDto,
	})
	async bulkDelete(@Body() bulkDeleteDto: BulkDeleteCustomerDto): Promise<{
		deleted: number[]
		failed: { id: number; reason: string }[]
		summary: { total: number; success: number; failed: number }
	}> {
		return this.customerService.bulkDelete(bulkDeleteDto)
	}

	@Get(':id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER, ROLES.STAFF, ROLES.CUSTOMER)
	@ApiOperation({
		summary:
			'Get customer information by ID - All roles (CUSTOMER can only view their own information)',
		description:
			'Retrieves detailed information for a specific customer, including membership type and loyalty points.',
	})
	@ApiParam({
		name: 'id',
		description: 'ID of the customer to retrieve information for',
		type: Number,
		example: 1,
	})
	@ApiResponse({
		status: 200,
		description: 'Detailed customer information.',
		type: JSendSuccessDto,
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized - Invalid token.',
		type: UnauthorizedErrorDto,
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden - CUSTOMER can only view their own information.',
		type: ForbiddenErrorDto,
	})
	@ApiResponse({
		status: 404,
		description: 'Customer with the provided ID not found.',
		type: NotFoundErrorDto,
	})
	async findOne(
		@Param('id', ParseIntPipe) id: number
	): Promise<customer | null> {
		return this.customerService.findOne(id)
	}

	@Get('phone/:phone')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER, ROLES.STAFF)
	@ApiOperation({
		summary: 'Find customer by phone number - MANAGER and STAFF only',
		description:
			'Searches for customer information based on their phone number to support the sales process.',
	})
	@ApiParam({
		name: 'phone',
		description: 'Phone number of the customer to find',
		type: String,
		example: '0987654321',
	})
	@ApiResponse({
		status: 200,
		description: 'Detailed customer information.',
		type: JSendSuccessDto,
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized - Invalid token.',
		type: UnauthorizedErrorDto,
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Only MANAGER and STAFF can search for customers.',
		type: ForbiddenErrorDto,
	})
	@ApiResponse({
		status: 404,
		description: 'Customer with the provided phone number not found.',
		type: NotFoundErrorDto,
	})
	async findByPhone(@Param('phone') phone: string): Promise<customer | null> {
		return this.customerService.findByPhone(phone)
	}

	@Get(':id/account')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER, ROLES.STAFF, ROLES.CUSTOMER)
	@ApiOperation({
		summary:
			"Get customer's account information - All roles (CUSTOMER can only view their own account)",
		description:
			'Returns the account information linked to this customer, including permissions and status.',
	})
	@ApiParam({
		name: 'id',
		description: 'Customer ID',
		type: Number,
		example: 1,
	})
	@ApiResponse({
		status: 200,
		description: "Customer's account information.",
		type: JSendSuccessDto,
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized - Invalid token.',
		type: UnauthorizedErrorDto,
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden - CUSTOMER can only view their own account.',
		type: ForbiddenErrorDto,
	})
	@ApiResponse({
		status: 404,
		description:
			'Customer not found or customer does not have a linked account.',
		type: NotFoundErrorDto,
	})
	async getCustomerAccount(@Param('id', ParseIntPipe) customerId: number) {
		return this.customerService.getCustomerAccount(customerId)
	}

	@Post(':id/account')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER, ROLES.STAFF)
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({
		summary: 'Create a new account for a customer - MANAGER and STAFF only',
		description:
			'Creates a new login account and links it to the existing customer so they can use the application.',
	})
	@ApiParam({
		name: 'id',
		description: 'Customer ID',
		type: Number,
		example: 1,
	})
	@ApiBody({ type: CreateAccountDto })
	@ApiResponse({
		status: 201,
		description: 'Successfully created an account for the customer.',
		type: JSendSuccessDto,
	})
	@ApiResponse({
		status: 400,
		description: 'Invalid request - Account data is not in the correct format.',
		type: ValidationErrorDto,
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized - Invalid token.',
		type: UnauthorizedErrorDto,
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Only MANAGER and STAFF can create accounts.',
		type: ForbiddenErrorDto,
	})
	@ApiResponse({
		status: 404,
		description: 'Customer with the provided ID not found.',
		type: NotFoundErrorDto,
	})
	@ApiResponse({
		status: 409,
		description:
			'Conflict - Username already exists or the customer already has an account.',
		type: ConflictErrorDto,
	})
	async createCustomerAccount(
		@Param('id', ParseIntPipe) customerId: number,
		@Body() createAccountDto: CreateAccountDto
	) {
		return this.customerService.createCustomerAccount(
			customerId,
			createAccountDto
		)
	}

	@Patch(':id/account')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER, ROLES.STAFF, ROLES.CUSTOMER)
	@ApiOperation({
		summary:
			"Update customer's account - All roles (CUSTOMER can only update their own account)",
		description:
			'Updates the account information linked to the customer, such as changing the password, email, or contact information.',
	})
	@ApiParam({
		name: 'id',
		description: 'Customer ID',
		type: Number,
		example: 1,
	})
	@ApiBody({ type: UpdateAccountDto })
	@ApiResponse({
		status: 200,
		description: 'Account updated successfully.',
		type: JSendSuccessDto,
	})
	@ApiResponse({
		status: 400,
		description: 'Invalid request - Update data is not in the correct format.',
		type: ValidationErrorDto,
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized - Invalid token.',
		type: UnauthorizedErrorDto,
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden - CUSTOMER can only update their own account.',
		type: ForbiddenErrorDto,
	})
	@ApiResponse({
		status: 404,
		description:
			'Customer not found or customer does not have a linked account.',
		type: NotFoundErrorDto,
	})
	@ApiResponse({
		status: 409,
		description: 'Conflict - Username already exists.',
		type: ConflictErrorDto,
	})
	async updateCustomerAccount(
		@Param('id', ParseIntPipe) customerId: number,
		@Body() updateAccountDto: UpdateAccountDto
	) {
		return this.customerService.updateCustomerAccount(
			customerId,
			updateAccountDto
		)
	}

	@Patch(':id/account/lock')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER)
	@ApiOperation({
		summary: "Lock/unlock a customer's account - MANAGER only",
		description:
			"Changes the lock status of a customer's account to prevent or allow login.",
	})
	@ApiParam({
		name: 'id',
		description: 'Customer ID',
		type: Number,
		example: 1,
	})
	@ApiBody({ type: LockAccountDto })
	@ApiResponse({
		status: 200,
		description: 'Successfully changed the account lock status.',
		type: JSendSuccessDto,
	})
	@ApiResponse({
		status: 400,
		description: 'Invalid request - Lock status is not in the correct format.',
		type: ValidationErrorDto,
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized - Invalid token.',
		type: UnauthorizedErrorDto,
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Only MANAGER can lock/unlock accounts.',
		type: ForbiddenErrorDto,
	})
	@ApiResponse({
		status: 404,
		description:
			'Customer not found or customer does not have a linked account.',
		type: NotFoundErrorDto,
	})
	async lockCustomerAccount(
		@Param('id', ParseIntPipe) customerId: number,
		@Body() lockAccountDto: LockAccountDto
	) {
		return this.customerService.lockCustomerAccount(
			customerId,
			lockAccountDto.is_locked
		)
	}

	@Patch(':id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER, ROLES.STAFF, ROLES.CUSTOMER)
	@ApiOperation({
		summary:
			'Update customer information - All roles (CUSTOMER can only update their own information)',
		description:
			"Updates a customer's personal information. Note: Membership type and loyalty points cannot be updated as they are managed automatically by the system.",
	})
	@ApiParam({
		name: 'id',
		description: 'Customer ID',
		type: Number,
		example: 1,
	})
	@ApiBody({ type: UpdateCustomerDto })
	@ApiResponse({
		status: 200,
		description: 'Customer information updated successfully.',
		type: JSendSuccessDto,
	})
	@ApiResponse({
		status: 400,
		description: 'Invalid request - Update data is not in the correct format.',
		type: ValidationErrorDto,
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized - Invalid token.',
		type: UnauthorizedErrorDto,
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden - CUSTOMER can only update their own information.',
		type: ForbiddenErrorDto,
	})
	@ApiResponse({
		status: 404,
		description: 'Customer with the provided ID not found.',
		type: NotFoundErrorDto,
	})
	@ApiResponse({
		status: 409,
		description: 'Conflict - Phone number already exists.',
		type: ConflictErrorDto,
	})
	async update(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateCustomerDto: UpdateCustomerDto
	): Promise<customer> {
		return this.customerService.update(id, updateCustomerDto)
	}

	@Delete(':id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER)
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({
		summary: 'Delete a customer - MANAGER only',
		description:
			'Permanently deletes a customer from the system. Note: Customers with associated orders or accounts cannot be deleted.',
	})
	@ApiParam({
		name: 'id',
		description: 'ID of the customer to delete',
		type: Number,
		example: 1,
	})
	@ApiResponse({
		status: 204,
		description: 'Customer deleted successfully.',
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized - Invalid token.',
		type: UnauthorizedErrorDto,
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Only MANAGER can delete customers.',
		type: ForbiddenErrorDto,
	})
	@ApiResponse({
		status: 404,
		description: 'Customer with the provided ID not found.',
		type: NotFoundErrorDto,
	})
	@ApiResponse({
		status: 409,
		description:
			'Conflict - Cannot delete a customer with associated orders or accounts.',
		type: ConflictErrorDto,
	})
	async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
		await this.customerService.remove(id)
	}

	@Get('test/ping')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER)
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'Test the Customer Controller - MANAGER only',
		description:
			'An endpoint to check if the Customer Controller is working correctly (smoke test).',
	})
	@ApiResponse({
		status: 200,
		description: 'Test successful.',
		type: JSendSuccessDto,
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized - Invalid token.',
		type: UnauthorizedErrorDto,
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Only MANAGER can perform this test.',
		type: ForbiddenErrorDto,
	})
	test(): Promise<{ message: string }> {
		return Promise.resolve({ message: 'Customer controller is working!' })
	}

	@Get('membership-type/:membershipTypeId')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.STAFF, ROLES.MANAGER)
	@ApiOperation({
		summary:
			'Get customers by membership type with pagination - STAFF/MANAGER only',
		description:
			'Returns a list of customers belonging to a specific membership type for analysis and loyalty program management.',
	})
	@ApiParam({
		name: 'membershipTypeId',
		description: 'Membership Type ID',
		type: Number,
		example: 1,
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
		description:
			'Successfully retrieved paginated list of customers by membership type.',
		type: JSendPaginatedSuccessDto,
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized - Invalid token.',
		type: UnauthorizedErrorDto,
	})
	@ApiResponse({
		status: 403,
		description:
			'Forbidden - Only STAFF and MANAGER can view customers by membership type.',
		type: ForbiddenErrorDto,
	})
	@ApiResponse({
		status: 404,
		description: 'Membership type with the provided ID not found.',
		type: NotFoundErrorDto,
	})
	async findByMembershipType(
		@Param('membershipTypeId', ParseIntPipe) membershipTypeId: number,
		@Query() paginationDto: PaginationDto
	): Promise<PaginatedResult<customer>> {
		return this.customerService.findByMembershipType(
			membershipTypeId,
			paginationDto
		)
	}
}
