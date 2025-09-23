import {
	BadRequestException,
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
	Req,
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
import type { Request } from 'express'
import { ROLES } from '../auth/constants/roles.constant'
import { Roles } from '../auth/decorators/roles.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import {
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
import type { payment } from '../generated/prisma/client'
import { CreatePaymentDto } from './dto/create-payment.dto'
import { CreateStripePaymentDto } from './dto/create-stripe-payment.dto'
import { UpdatePaymentDto } from './dto/update-payment.dto'
import type { PaymentService } from './payment.service'

@ApiTags('payments')
@Controller('payments')
@ApiBearerAuth()
@ApiExtraModels(PaginationMetadata)
export class PaymentController {
	constructor(private readonly paymentService: PaymentService) {}

	@Post()
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER, ROLES.STAFF)
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({
		summary: 'Create a new payment record (MANAGER, STAFF)',
	})
	@ApiBody({ type: CreatePaymentDto })
	@ApiResponse({
		status: 201,
		description: 'The payment has been successfully created.',
		type: JSendSuccessDto,
	})
	@ApiResponse({
		status: 400,
		description:
			'Bad Request (e.g., validation error, invalid order_id or payment_method_id)',
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
		description: 'Not Found (e.g., Order or PaymentMethod not found)',
		type: NotFoundErrorDto,
	})
	async create(@Body() createPaymentDto: CreatePaymentDto): Promise<payment> {
		return this.paymentService.create(createPaymentDto)
	}

	@Get()
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER, ROLES.STAFF)
	@ApiOperation({
		summary:
			'Get all payments with pagination and optional order filter (MANAGER, STAFF)',
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
		name: 'orderId',
		required: false,
		type: Number,
		description: 'Filter payments by a specific order ID',
	})
	@ApiResponse({
		status: 200,
		description: 'Paginated list of payments',
		type: JSendPaginatedSuccessDto,
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
	async findAll(
		@Query() paginationDto: PaginationDto,
		@Query('orderId') orderId?: string
	): Promise<PaginatedResult<payment>> {
		let orderIdNum: number | undefined
		if (orderId) {
			orderIdNum = parseInt(orderId, 10)
			if (Number.isNaN(orderIdNum)) {
				throw new BadRequestException('Invalid Order ID. Must be a number.')
			}
		}
		return this.paymentService.findAll(paginationDto, orderIdNum)
	}

	@Get(':id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER, ROLES.STAFF)
	@ApiOperation({
		summary: 'Get a specific payment by ID (MANAGER, STAFF)',
	})
	@ApiParam({ name: 'id', description: 'Payment ID', type: Number })
	@ApiResponse({
		status: 200,
		description: 'The payment details',
		type: JSendSuccessDto,
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
		description: 'Payment not found',
		type: NotFoundErrorDto,
	})
	async findOne(
		@Param('id', ParseIntPipe) id: number
	): Promise<payment | null> {
		return this.paymentService.findOne(id)
	}

	@Patch(':id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER, ROLES.STAFF)
	@ApiOperation({
		summary: 'Update an existing payment (MANAGER, STAFF)',
	})
	@ApiParam({ name: 'id', description: 'Payment ID', type: Number })
	@ApiBody({ type: UpdatePaymentDto })
	@ApiResponse({
		status: 200,
		description: 'The payment has been successfully updated.',
		type: JSendSuccessDto,
	})
	@ApiResponse({
		status: 400,
		description: 'Bad Request',
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
		description: 'Payment not found',
		type: NotFoundErrorDto,
	})
	async update(
		@Param('id', ParseIntPipe) id: number,
		@Body() updatePaymentDto: UpdatePaymentDto
	): Promise<payment> {
		return this.paymentService.update(id, updatePaymentDto)
	}

	@Delete(':id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER)
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: 'Delete a payment by ID (MANAGER)' })
	@ApiParam({ name: 'id', description: 'Payment ID', type: Number })
	@ApiResponse({
		status: 204,
		description: 'The payment has been successfully deleted.',
		type: JSendSuccessDto,
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
		description: 'Payment not found',
		type: NotFoundErrorDto,
	})
	async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
		await this.paymentService.remove(id)
	}

	@Post('stripe/create-payment-intent')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER, ROLES.STAFF, ROLES.CUSTOMER)
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Create Stripe payment intent (All Roles)' })
	@ApiBody({ type: CreateStripePaymentDto })
	@ApiResponse({
		status: 200,
		description: 'Stripe payment intent created successfully',
		type: JSendSuccessDto,
	})
	@ApiResponse({
		status: 400,
		description: 'Bad Request',
		type: ValidationErrorDto,
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized',
		type: UnauthorizedErrorDto,
	})
	@ApiResponse({
		status: 404,
		description: 'Order not found',
		type: NotFoundErrorDto,
	})
	async createStripePaymentIntent(
		@Body() createStripePaymentDto: CreateStripePaymentDto
	): Promise<{ clientSecret: string; paymentIntentId: string }> {
		const { orderId, currency, orderInfo, customerEmail } =
			createStripePaymentDto

		return this.paymentService.createStripePaymentIntent(
			orderId,
			currency,
			orderInfo,
			customerEmail
		)
	}

	@Post('stripe/confirm-payment')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER, ROLES.STAFF, ROLES.CUSTOMER)
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Confirm Stripe payment (All Roles)' })
	@ApiResponse({
		status: 200,
		description: 'Payment confirmation processed successfully',
		type: JSendSuccessDto,
	})
	@ApiResponse({
		status: 400,
		description: 'Invalid payment intent ID',
		type: ValidationErrorDto,
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized',
		type: UnauthorizedErrorDto,
	})
	async confirmStripePayment(
		@Body() body: { paymentIntentId: string }
	): Promise<{
		success: boolean
		message: string
		payment?: payment
	}> {
		return this.paymentService.confirmStripePayment(body.paymentIntentId)
	}

	@Post('stripe/webhook')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Handle Stripe webhook (Public)' })
	@ApiResponse({
		status: 200,
		description: 'Webhook processed successfully',
		type: JSendSuccessDto,
	})
	async handleStripeWebhook(
		@Req() req: Request
	): Promise<{ received: boolean }> {
		try {
			const signature = req.headers['stripe-signature'] as string
			const payload = req.body

			if (!signature) {
				throw new BadRequestException('Missing Stripe signature')
			}

			const result = await this.paymentService.processStripeWebhook(
				payload,
				signature
			)

			if (result.success) {
				return { received: true }
			} else {
				throw new BadRequestException(result.message)
			}
		} catch (error) {
			console.error('Stripe webhook error:', error)
			throw new BadRequestException('Webhook processing failed')
		}
	}

	@Get('admin/test')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER)
	@ApiOperation({
		summary: 'Test endpoint for payment controller (MANAGER)',
	})
	@ApiResponse({
		status: 200,
		description: 'Test successful',
		type: JSendSuccessDto,
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
	/**
	 * Admin test endpoint to check if the controller is responsive.
	 * @returns A confirmation message.
	 */
	adminTest(): { message: string } {
		return { message: 'Payment controller is working!' }
	}

	@Get('payment-method/:paymentMethodId')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.STAFF, ROLES.MANAGER)
	@ApiOperation({
		summary:
			'Lấy thanh toán theo phương thức thanh toán với pagination - STAFF/MANAGER',
	})
	@ApiParam({
		name: 'paymentMethodId',
		description: 'Payment Method ID',
		type: Number,
	})
	@ApiResponse({
		status: 200,
		description: 'Danh sách thanh toán theo phương thức',
		type: JSendPaginatedSuccessDto,
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
	/**
	 * Retrieves payments filtered by a specific payment method.
	 * @param paymentMethodId - The ID of the payment method to filter by.
	 * @param paginationDto - Pagination options.
	 * @returns A paginated list of payments for the specified method.
	 */
	async findByPaymentMethod(
		@Param('paymentMethodId', ParseIntPipe) paymentMethodId: number,
		@Query() paginationDto: PaginationDto
	): Promise<PaginatedResult<payment>> {
		return this.paymentService.findByPaymentMethod(
			paymentMethodId,
			paginationDto
		)
	}
}
