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
	Res,
	UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import type { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreateVNPayPaymentDto } from './dto/create-vnpay-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import {
	type PaginatedResult,
	type PaginationDto,
	PaginationMetadata,
} from '../common/dto/pagination.dto';
import type { payment } from '../generated/prisma/client';
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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLES } from '../auth/constants/roles.constant';

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
		type: CreatePaymentDto,
	})
	@ApiResponse({
		status: 400,
		description:
			'Bad Request (e.g., validation error, invalid order_id or payment_method_id)',
	})
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Insufficient permissions',
	})
	@ApiResponse({
		status: 404,
		description: 'Not Found (e.g., Order or PaymentMethod not found)',
	})
	async create(@Body() createPaymentDto: CreatePaymentDto): Promise<payment> {
		return this.paymentService.create(createPaymentDto);
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
		@Query('orderId') orderId?: string
	): Promise<PaginatedResult<payment>> {
		let orderIdNum: number | undefined;
		if (orderId) {
			orderIdNum = parseInt(orderId, 10);
			if (isNaN(orderIdNum)) {
				throw new BadRequestException('Invalid Order ID. Must be a number.');
			}
		}
		return this.paymentService.findAll(paginationDto, orderIdNum);
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
		type: CreatePaymentDto,
	})
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Insufficient permissions',
	})
	@ApiResponse({ status: 404, description: 'Payment not found' })
	async findOne(
		@Param('id', ParseIntPipe) id: number
	): Promise<payment | null> {
		return this.paymentService.findOne(id);
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
		type: CreatePaymentDto,
	})
	@ApiResponse({ status: 400, description: 'Bad Request' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Insufficient permissions',
	})
	@ApiResponse({ status: 404, description: 'Payment not found' })
	async update(
		@Param('id', ParseIntPipe) id: number,
		@Body() updatePaymentDto: UpdatePaymentDto
	): Promise<payment> {
		return this.paymentService.update(id, updatePaymentDto);
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
	})
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Insufficient permissions',
	})
	@ApiResponse({ status: 404, description: 'Payment not found' })
	async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
		await this.paymentService.remove(id);
	}

	@Post('vnpay/create')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER, ROLES.STAFF, ROLES.CUSTOMER)
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Create VNPay payment URL (All Roles)' })
	@ApiBody({ type: CreateVNPayPaymentDto })
	@ApiResponse({
		status: 200,
		description: 'VNPay payment URL created successfully',
		schema: { type: 'object', properties: { paymentUrl: { type: 'string' } } },
	})
	@ApiResponse({ status: 400, description: 'Bad Request' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({ status: 404, description: 'Order not found' })
	async createVNPayPayment(
		@Body() createVNPayPaymentDto: CreateVNPayPaymentDto,
		@Req() req: Request
	): Promise<{ paymentUrl: string }> {
		const { orderId, orderInfo, returnUrl } = createVNPayPaymentDto;
		const ipAddr = req.ip || req.socket.remoteAddress || '127.0.0.1';

		const paymentUrl = await this.paymentService.createVNPayPaymentUrl(
			orderId,
			orderInfo,
			returnUrl,
			ipAddr
		);

		return { paymentUrl };
	}

	@Get('vnpay/callback')
	@ApiOperation({ summary: 'Handle VNPay payment callback (Public)' })
	@ApiResponse({
		status: 200,
		description: 'Payment callback processed successfully',
	})
	@ApiResponse({ status: 400, description: 'Invalid callback data' })
	async handleVNPayCallback(
		@Query() callbackData: any,
		@Res() res: Response
	): Promise<void> {
		const result = await this.paymentService.processVNPayCallback(callbackData);

		if (result.success) {
			res.redirect(
				`${process.env.POS_URL || 'http://localhost:3001'}/payment/success?orderId=${result.payment?.order_id}`
			);
		} else {
			res.redirect(
				`${process.env.POS_URL || 'http://localhost:3001'}/payment/failure?message=${encodeURIComponent(result.message)}`
			);
		}
	}

	@Post('vnpay/webhook')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Handle VNPay IPN webhook (Public)' })
	@ApiResponse({ status: 200, description: 'Webhook processed successfully' })
	async handleVNPayWebhook(
		@Body() webhookData: any
	): Promise<{ RspCode: string; Message: string }> {
		try {
			const result =
				await this.paymentService.processVNPayCallback(webhookData);

			if (result.success) {
				return {
					RspCode: '00',
					Message: 'Confirm Success',
				};
			} else {
				return {
					RspCode: '01',
					Message: 'Order not found',
				};
			}
		} catch (error) {
			console.error('VNPay webhook error:', error);
			return {
				RspCode: '99',
				Message: 'Unknown error',
			};
		}
	}

	@Get('admin/test')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(ROLES.MANAGER)
	@ApiOperation({
		summary: 'Test endpoint for payment controller (MANAGER)',
	})
	@ApiResponse({ status: 200, description: 'Test successful' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({
		status: 403,
		description: 'Forbidden - Insufficient permissions',
	})
	/**
	 * Admin test endpoint to check if the controller is responsive.
	 * @returns A confirmation message.
	 */
	adminTest(): { message: string } {
		return { message: 'Payment controller is working!' };
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
		);
	}
}
