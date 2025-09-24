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
import type { employee } from '../generated/prisma/client'
import { BulkDeleteEmployeeDto } from './dto/bulk-delete-employee.dto'
import { CreateEmployeeDto } from './dto/create-employee.dto'
import { UpdateEmployeeDto } from './dto/update-employee.dto'
import type { EmployeeService } from './employee.service'

@ApiTags('employees')
@Controller('employees')
@ApiBearerAuth('JWT-auth')
@ApiExtraModels(PaginationMetadata)
export class EmployeeController {
	constructor(private readonly employeeService: EmployeeService) {}

	@Post()
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER)
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({
		summary: 'Create a new employee - MANAGER only',
		description:
			'Creates a new employee in the system with personal information and an automatically generated login account.',
	})
	@ApiBody({ type: CreateEmployeeDto })
	@ApiResponse({
		status: 201,
		description: 'Employee created successfully.',
		type: JSendSuccessDto,
	})
	@ApiResponse({
		status: 400,
		description: 'Bad Request - Invalid input data format.',
		type: ValidationErrorDto,
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized - Invalid token.',
		type: UnauthorizedErrorDto,
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Only MANAGER can create employees.',
		type: ForbiddenErrorDto,
	})
	@ApiResponse({
		status: 409,
		description: 'Conflict - Email or phone number already exists.',
		type: ConflictErrorDto,
	})
	async create(
		@Body() createEmployeeDto: CreateEmployeeDto
	): Promise<employee> {
		return this.employeeService.create(createEmployeeDto)
	}

	@Get()
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER, ROLES.STAFF)
	@ApiOperation({
		summary: 'Get a paginated list of employees - MANAGER and STAFF',
		description:
			'Returns a list of all employees in the system with basic information and status.',
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
		description: 'Successfully retrieved paginated list of employees.',
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
			'Forbidden - Only MANAGER and STAFF can view the employee list.',
		type: ForbiddenErrorDto,
	})
	async findAll(
		@Query() paginationDto: PaginationDto
	): Promise<PaginatedResult<employee>> {
		return this.employeeService.findAll(paginationDto)
	}

	@Get('email/:email')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER)
	@ApiOperation({
		summary: 'Find an employee by email - MANAGER only',
		description:
			'Searches for employee information based on their email address to support HR management.',
	})
	@ApiParam({
		name: 'email',
		description: 'The email address of the employee to find',
		type: String,
		example: 'employee@example.com',
	})
	@ApiResponse({
		status: 200,
		description: 'Detailed employee information.',
		type: JSendSuccessDto,
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized - Invalid token.',
		type: UnauthorizedErrorDto,
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Only MANAGER can search for employees by email.',
		type: ForbiddenErrorDto,
	})
	@ApiResponse({
		status: 404,
		description: 'Not Found - No employee found with the provided email.',
		type: NotFoundErrorDto,
	})
	async findByEmail(@Param('email') email: string): Promise<employee | null> {
		return this.employeeService.findByEmail(email)
	}

	@Delete('bulk')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER)
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'Bulk delete employees - MANAGER only',
		description:
			'Deletes multiple employees at once. Employees with associated orders or data cannot be deleted and will be reported as failed.',
	})
	@ApiBody({ type: BulkDeleteEmployeeDto })
	@ApiResponse({
		status: 200,
		description: 'Bulk delete process completed with detailed results.',
		type: JSendSuccessDto,
	})
	@ApiResponse({
		status: 400,
		description: 'Bad Request - Invalid ID list format.',
		type: ValidationErrorDto,
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized - Invalid token.',
		type: UnauthorizedErrorDto,
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Only MANAGER can delete employees.',
		type: ForbiddenErrorDto,
	})
	async bulkDelete(@Body() bulkDeleteDto: BulkDeleteEmployeeDto): Promise<{
		deleted: number[]
		failed: { id: number; reason: string }[]
		summary: { total: number; success: number; failed: number }
	}> {
		return this.employeeService.bulkDelete(bulkDeleteDto)
	}

	@Get(':id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER, ROLES.STAFF)
	@ApiOperation({
		summary: 'Get employee information by ID - MANAGER and STAFF',
		description:
			'Retrieves detailed information for a specific employee, including personal and job-related data.',
	})
	@ApiParam({
		name: 'id',
		description: 'The ID of the employee to retrieve information for',
		type: Number,
		example: 1,
	})
	@ApiResponse({
		status: 200,
		description: 'Detailed employee information.',
		type: JSendSuccessDto,
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized - Invalid token.',
		type: UnauthorizedErrorDto,
	})
	@ApiResponse({
		status: 403,
		description:
			'Forbidden - Only MANAGER and STAFF can view employee information.',
		type: ForbiddenErrorDto,
	})
	@ApiResponse({
		status: 404,
		description: 'Not Found - No employee found with the provided ID.',
		type: NotFoundErrorDto,
	})
	async findOne(
		@Param('id', ParseIntPipe) id: number
	): Promise<employee | null> {
		return this.employeeService.findOne(id)
	}

	@Patch(':id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER)
	@ApiOperation({
		summary: 'Update employee information - MANAGER only',
		description:
			'Updates personal and job-related information for an employee, such as position, salary, address, etc.',
	})
	@ApiParam({
		name: 'id',
		description: 'The ID of the employee to update',
		type: Number,
		example: 1,
	})
	@ApiBody({ type: UpdateEmployeeDto })
	@ApiResponse({
		status: 200,
		description: 'Employee information updated successfully.',
		type: JSendSuccessDto,
	})
	@ApiResponse({
		status: 400,
		description: 'Bad Request - Invalid update data format.',
		type: ValidationErrorDto,
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized - Invalid token.',
		type: UnauthorizedErrorDto,
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Only MANAGER can update employee information.',
		type: ForbiddenErrorDto,
	})
	@ApiResponse({
		status: 404,
		description: 'Not Found - No employee found with the provided ID.',
		type: NotFoundErrorDto,
	})
	@ApiResponse({
		status: 409,
		description: 'Conflict - Email or phone number already exists.',
		type: ConflictErrorDto,
	})
	async update(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateEmployeeDto: UpdateEmployeeDto
	): Promise<employee> {
		return this.employeeService.update(id, updateEmployeeDto)
	}

	@Patch(':id/account/lock')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER)
	@ApiOperation({
		summary: 'Lock/unlock an employee account - MANAGER only',
		description:
			'Changes the lock status of an employee account to prevent or allow system login.',
	})
	@ApiParam({
		name: 'id',
		description: 'Employee ID',
		type: Number,
		example: 1,
	})
	@ApiBody({ type: LockAccountDto })
	@ApiResponse({
		status: 200,
		description: 'Account lock status changed successfully.',
		type: JSendSuccessDto,
	})
	@ApiResponse({
		status: 400,
		description: 'Bad Request - Invalid lock status format.',
		type: ValidationErrorDto,
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized - Invalid token.',
		type: UnauthorizedErrorDto,
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Only MANAGER can lock/unlock employee accounts.',
		type: ForbiddenErrorDto,
	})
	@ApiResponse({
		status: 404,
		description: 'Not Found - Employee not found or has no account.',
		type: NotFoundErrorDto,
	})
	async lockEmployeeAccount(
		@Param('id', ParseIntPipe) employeeId: number,
		@Body() lockAccountDto: LockAccountDto
	) {
		return this.employeeService.lockEmployeeAccount(
			employeeId,
			lockAccountDto.is_locked
		)
	}

	@Patch(':id/account/:accountId')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER)
	@ApiOperation({
		summary: 'Cập nhật thông tin tài khoản của nhân viên - Chỉ MANAGER',
		description:
			'Cập nhật tên đăng nhập, mật khẩu, và trạng thái tài khoản của nhân viên',
	})
	@ApiParam({
		name: 'id',
		description: 'ID nhân viên',
		type: Number,
		example: 1,
	})
	@ApiParam({
		name: 'accountId',
		description: 'ID tài khoản',
		type: Number,
		example: 1,
	})
	@ApiBody({ type: UpdateAccountDto })
	@ApiResponse({
		status: 200,
		description: 'Cập nhật thông tin tài khoản thành công',
		type: JSendSuccessDto,
	})
	@ApiResponse({
		status: 400,
		description:
			'Yêu cầu không hợp lệ - Dữ liệu tài khoản không đúng định dạng',
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
			'Không có quyền truy cập - Chỉ MANAGER mới có thể cập nhật tài khoản nhân viên',
		type: ForbiddenErrorDto,
	})
	@ApiResponse({
		status: 404,
		description: 'Không tìm thấy nhân viên hoặc tài khoản với ID được cung cấp',
		type: NotFoundErrorDto,
	})
	@ApiResponse({
		status: 409,
		description:
			'Xung đột dữ liệu - Tên đăng nhập, email hoặc số điện thoại đã tồn tại',
		type: ConflictErrorDto,
	})
	async updateEmployeeAccount(
		@Param('id', ParseIntPipe) employeeId: number,
		@Param('accountId', ParseIntPipe) accountId: number,
		@Body() updateAccountDto: UpdateAccountDto
	) {
		return this.employeeService.updateEmployeeAccount(
			employeeId,
			accountId,
			updateAccountDto
		)
	}

	@Delete(':id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER)
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({
		summary: 'Delete an employee - MANAGER only',
		description:
			'Permanently deletes an employee from the system. Note: Cannot delete employees with associated orders or other important data.',
	})
	@ApiParam({
		name: 'id',
		description: 'The ID of the employee to delete',
		type: Number,
		example: 1,
	})
	@ApiResponse({
		status: 204,
		description: 'Employee deleted successfully.',
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized - Invalid token.',
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Only MANAGER can delete employees.',
	})
	@ApiResponse({
		status: 404,
		description: 'Not Found - No employee found with the provided ID.',
	})
	@ApiResponse({
		status: 409,
		description:
			'Conflict - Cannot delete employee with associated orders or other important data.',
	})
	async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
		await this.employeeService.remove(id)
	}

	@Get('admin/test')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER)
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'Test Employee Controller - MANAGER only',
		description:
			'An endpoint to check if the Employee Controller is working correctly (smoke test).',
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
	async test(): Promise<{ message: string }> {
		return { message: 'Employee controller is working!' }
	}
}
