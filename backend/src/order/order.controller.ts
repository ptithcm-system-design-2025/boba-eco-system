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
import type { order_status_enum } from '../generated/prisma/client'
import { CreateOrderDto } from './dto/create-order.dto'
import { UpdateOrderDto } from './dto/update-order.dto'
import { ValidateDiscountDto } from './dto/validate-discount.dto'
import type { OrderService } from './order.service'

@ApiTags('orders')
@Controller('orders')
@ApiBearerAuth('JWT-auth')
@ApiExtraModels(PaginationMetadata)
export class OrderController {
	constructor(private readonly orderService: OrderService) {}

	@Post()
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER, ROLES.STAFF, ROLES.CUSTOMER)
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({ summary: 'Create a new order (All roles)' })
	@ApiBody({ type: CreateOrderDto })
	@ApiResponse({
		status: 201,
		description: 'Order created successfully.',
	})
	@ApiResponse({
		status: 400,
		description: 'Bad Request (e.g., validation error, no products)',
	})
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({
		status: 404,
		description:
			'Not Found (e.g., employee, customer, product_price, or discount not found)',
	})
	@ApiResponse({
		status: 422,
		description:
			'Unprocessable Entity (e.g., product not active, discount not valid)',
	})
	async create(@Body() createOrderDto: CreateOrderDto): Promise<order> {
		return this.orderService.create(createOrderDto)
	}

	@Get()
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER, ROLES.STAFF)
	@ApiOperation({
		summary:
			'Get all orders with pagination and filtering (MANAGER and STAFF only)',
	})
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
	@ApiQuery({
		name: 'customerId',
		required: false,
		type: Number,
		description: 'Filter by customer ID',
	})
	@ApiQuery({
		name: 'employeeId',
		required: false,
		type: Number,
		description: 'Filter by employee ID',
	})
	@ApiQuery({
		name: 'status',
		required: false,
		type: String,
		description: 'Filter by order status (PROCESSING, CANCELLED, COMPLETED)',
	})
	@ApiResponse({
		status: 200,
		description: 'Paginated list of orders',
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
		@Query() paginationDto: PaginationDto,
		@Query('customerId') customerId?: string,
		@Query('employeeId') employeeId?: string,
		@Query('status') status?: order_status_enum
	): Promise<PaginatedResult<order>> {
		const filters = {
			...(customerId && { customerId: parseInt(customerId, 10) }),
			...(employeeId && { employeeId: parseInt(employeeId, 10) }),
			...(status && { status }),
		}

		return this.orderService.findAll(paginationDto, filters)
	}

	@Get(':id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER, ROLES.STAFF, ROLES.CUSTOMER)
	@ApiOperation({
		summary:
			'Get a specific order by ID (All roles - CUSTOMER can only view their own orders)',
	})
	@ApiParam({ name: 'id', description: 'Order ID', type: Number })
	@ApiResponse({ status: 200, description: 'The order details' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Insufficient permissions',
	})
	@ApiResponse({ status: 404, description: 'Order not found' })
	async findOne(@Param('id', ParseIntPipe) id: number): Promise<order> {
		return this.orderService.findOne(id)
	}

	@Patch(':id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER, ROLES.STAFF)
	@ApiOperation({
		summary: 'Update an existing order (MANAGER and STAFF only)',
	})
	@ApiParam({ name: 'id', description: 'Order ID', type: Number })
	@ApiBody({ type: UpdateOrderDto })
	@ApiResponse({ status: 200, description: 'Order updated successfully.' })
	@ApiResponse({ status: 400, description: 'Bad Request' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Insufficient permissions',
	})
	@ApiResponse({
		status: 404,
		description: 'Order not found or related entity not found during update',
	})
	@ApiResponse({
		status: 422,
		description:
			'Unprocessable Entity (e.g., product not active, discount not valid during update)',
	})
	async update(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateOrderDto: UpdateOrderDto
	): Promise<order> {
		return this.orderService.update(id, updateOrderDto)
	}

	@Patch(':id/cancel')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER, ROLES.STAFF, ROLES.CUSTOMER)
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'Cancel an order (All roles)',
		description:
			'Changes the order status to CANCELLED. A CUSTOMER can only cancel their own order and only when it is in PENDING status.',
	})
	@ApiParam({ name: 'id', description: 'Order ID', type: Number })
	@ApiResponse({ status: 200, description: 'Order cancelled successfully.' })
	@ApiResponse({
		status: 400,
		description:
			'Bad Request - Order cannot be cancelled (already completed or cancelled)',
	})
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Insufficient permissions to cancel this order',
	})
	@ApiResponse({ status: 404, description: 'Order not found' })
	async cancelOrder(@Param('id', ParseIntPipe) id: number): Promise<order> {
		return this.orderService.cancelOrder(id)
	}

	@Delete(':id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER)
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Delete an order by ID (MANAGER only)' })
	@ApiParam({ name: 'id', description: 'Order ID', type: Number })
	@ApiResponse({
		status: 200,
		description: 'Order deleted successfully (returns the deleted order).',
	})
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Insufficient permissions',
	})
	@ApiResponse({ status: 404, description: 'Order not found' })
	async remove(@Param('id', ParseIntPipe) id: number): Promise<order> {
		return this.orderService.remove(id)
	}

	@Get('employee/:employeeId')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.STAFF, ROLES.MANAGER)
	@ApiOperation({
		summary: 'Get orders by employee with pagination (STAFF/MANAGER)',
	})
	@ApiParam({ name: 'employeeId', description: 'Employee ID', type: Number })
	@ApiResponse({
		status: 200,
		description: 'List of orders for the employee',
	})
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Insufficient permissions',
	})
	async findByEmployee(
		@Param('employeeId', ParseIntPipe) employeeId: number,
		@Query() paginationDto: PaginationDto
	): Promise<PaginatedResult<order>> {
		return this.orderService.findByEmployee(employeeId, paginationDto)
	}

	@Get('customer/:customerId')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.STAFF, ROLES.MANAGER)
	@ApiOperation({
		summary: 'Get orders by customer with pagination (STAFF/MANAGER)',
	})
	@ApiParam({ name: 'customerId', description: 'Customer ID', type: Number })
	@ApiResponse({
		status: 200,
		description: 'List of orders for the customer',
	})
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Insufficient permissions',
	})
	async findByCustomer(
		@Param('customerId', ParseIntPipe) customerId: number,
		@Query() paginationDto: PaginationDto
	): Promise<PaginatedResult<order>> {
		return this.orderService.findByCustomer(customerId, paginationDto)
	}

	@Get('status/:status')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER, ROLES.STAFF)
	@ApiOperation({
		summary: 'Get orders by status with pagination (MANAGER/STAFF)',
	})
	@ApiParam({
		name: 'status',
		description: 'Order status (PROCESSING, CANCELLED, COMPLETED)',
		type: String,
	})
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
		description: 'List of orders by status',
	})
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Insufficient permissions',
	})
	async findByStatus(
		@Param('status') status: order_status_enum,
		@Query() paginationDto: PaginationDto
	): Promise<PaginatedResult<order>> {
		return this.orderService.findByStatus(status, paginationDto)
	}

	@Post('validate-discounts')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER, ROLES.STAFF, ROLES.CUSTOMER)
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'Validate discounts for an order (All roles)',
		description:
			'Validates if discounts can be applied to an order, including checking customer conditions, membership, and usage limits.',
	})
	@ApiBody({ type: ValidateDiscountDto })
	@ApiResponse({
		status: 200,
		description: 'Discount validation result with detailed information',
		schema: {
			type: 'object',
			properties: {
				valid_discounts: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							discount_id: { type: 'number' },
							discount_name: { type: 'string' },
							discount_amount: { type: 'number' },
							reason: { type: 'string' },
						},
					},
				},
				invalid_discounts: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							discount_id: { type: 'number' },
							discount_name: { type: 'string' },
							reason: { type: 'string' },
						},
					},
				},
				summary: {
					type: 'object',
					properties: {
						total_checked: { type: 'number' },
						valid_count: { type: 'number' },
						invalid_count: { type: 'number' },
						total_discount_amount: { type: 'number' },
					},
				},
			},
		},
	})
	@ApiResponse({ status: 400, description: 'Bad Request - Validation error' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Insufficient permissions',
	})
	async validateDiscounts(@Body() validateDiscountDto: ValidateDiscountDto) {
		return this.orderService.validateDiscounts(validateDiscountDto)
	}
}
