import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
} from '@nestjs/common'
import { Decimal } from '@prisma/client/runtime/library'
import type {
	PaginatedResult,
	PaginationDto,
} from '../common/dto/pagination.dto'
import {
	Prisma,
	type payment,
	payment_status_enum,
} from '../generated/prisma/client'
import type { InvoiceService } from '../invoice/invoice.service'
import type { PrismaService } from '../prisma/prisma.service'
import type { CreatePaymentDto } from './dto/create-payment.dto'
import type { UpdatePaymentDto } from './dto/update-payment.dto'

type PaymentWithRelations = Prisma.paymentGetPayload<{
	include: {
		order: true
		payment_method: true
	}
}>
/**
 * Defines constants for payment method IDs.
 */
export const PAYMENT_METHOD = {
	CASH: 1,
	STRIPE: 2,
} as const
/**
 * Service for managing payments.
 */
@Injectable()
export class PaymentService {
	constructor(
		private prisma: PrismaService,
		private stripeService: StripeService,
		private invoiceService: InvoiceService
	) {}
	async create(
		createPaymentDto: CreatePaymentDto
	): Promise<PaymentWithRelations> {
		const { order_id, payment_method_id, amount_paid, payment_time } =
			createPaymentDto

		const order = await this.prisma.order.findUnique({
			where: { order_id },
		})
		if (!order) {
			throw new NotFoundException(`Order with ID ${order_id} not found.`)
		}

		const paymentMethod = await this.prisma.payment_method.findUnique({
			where: { payment_method_id },
		})
		if (!paymentMethod) {
			throw new NotFoundException(
				`Payment method with ID ${payment_method_id} not found.`
			)
		}

		const orderFinalAmount = new Decimal(
			order.final_amount || order.total_amount || 0
		)
		const paidAmount = new Decimal(amount_paid)
		let changeAmount = new Decimal(0)

		if (paidAmount.greaterThan(orderFinalAmount)) {
			changeAmount = paidAmount.minus(orderFinalAmount)
		}

		let paymentStatus: payment_status_enum = payment_status_enum.PROCESSING
		if (payment_method_id === PAYMENT_METHOD.CASH) {
			paymentStatus = payment_status_enum.PAID
		}

		const paymentData: Prisma.paymentCreateInput = {
			status: paymentStatus,
			amount_paid: paidAmount,
			change_amount: changeAmount,
			payment_time: payment_time ? new Date(payment_time) : new Date(),
			order: {
				connect: { order_id },
			},
			payment_method: {
				connect: { payment_method_id },
			},
		}

		try {
			const newPayment = await this.prisma.payment.create({
				data: paymentData,
				include: { order: true, payment_method: true },
			})

			return newPayment
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === 'P2025') {
					throw new NotFoundException(
						`Failed to create payment. Related order or payment method not found.`
					)
				}
			}
			console.error('Error creating payment:', error)
			throw new InternalServerErrorException('Could not create payment.')
		}
	}

	async createStripePaymentIntent(
		orderId: number,
		currency: string = 'vnd',
		orderInfo?: string,
		customerEmail?: string
	): Promise<{ clientSecret: string; paymentIntentId: string }> {
		const order = await this.prisma.order.findUnique({
			where: { order_id: orderId },
		})
		if (!order) {
			throw new NotFoundException(`Order with ID ${orderId} not found.`)
		}

		const amount = Number(order.final_amount || order.total_amount || 0)

		if (amount <= 0) {
			throw new BadRequestException('Payment amount must be greater than 0.')
		}

		const paymentRequest: StripePaymentRequest = {
			orderId,
			amount,
			currency,
			orderInfo: orderInfo || `Payment for order #${orderId}`,
			customerEmail,
		}

		return this.stripeService.createPaymentIntent(paymentRequest)
	}

	async confirmStripePayment(paymentIntentId: string): Promise<{
		success: boolean
		message: string
		payment?: PaymentWithRelations
	}> {
		try {
			const paymentIntent =
				await this.stripeService.retrievePaymentIntent(paymentIntentId)

			const orderId =
				this.stripeService.extractOrderIdFromMetadata(paymentIntent)
			const amount =
				this.stripeService.getAmountFromPaymentIntent(paymentIntent)
			const isSuccessful = this.stripeService.isPaymentSuccessful(paymentIntent)

			const payment = await this.createOrUpdateStripePayment(
				orderId,
				amount,
				isSuccessful ? payment_status_enum.PAID : payment_status_enum.CANCELLED,
				paymentIntent.id
			)

			return {
				success: isSuccessful,
				message: isSuccessful ? 'Payment confirmed.' : 'Payment failed.',
				payment,
			}
		} catch (error) {
			console.error('Error confirming Stripe payment:', error)
			return {
				success: false,
				message: 'Error confirming payment.',
			}
		}
	}

	async processStripeWebhook(
		payload: string,
		signature: string
	): Promise<{
		success: boolean
		message: string
		payment?: PaymentWithRelations
	}> {
		try {
			const verification = await this.stripeService.verifyWebhook(
				payload,
				signature
			)

			if (!verification.isValid || !verification.event) {
				return {
					success: false,
					message: 'Invalid webhook signature.',
				}
			}

			const event = verification.event

			// Only process payment_intent.succeeded events
			if (event.type !== 'payment_intent.succeeded') {
				return {
					success: true,
					message: 'Event type not processed.',
				}
			}

			const paymentIntent = event.data.object
			const orderId =
				this.stripeService.extractOrderIdFromMetadata(paymentIntent)
			const amount =
				this.stripeService.getAmountFromPaymentIntent(paymentIntent)

			const isSuccessful = this.stripeService.isPaymentSuccessful(paymentIntent)

			const payment = await this.createOrUpdateStripePayment(
				orderId,
				amount,
				isSuccessful ? payment_status_enum.PAID : payment_status_enum.CANCELLED,
				paymentIntent.id
			)

			if (isSuccessful && payment.status === payment_status_enum.PAID) {
				try {
					const invoiceData = await this.invoiceService.getInvoiceData(orderId)
					this.invoiceService.generateInvoiceHTML(invoiceData)
					console.log(`Stripe invoice created for order #${orderId}`)
				} catch (invoiceError) {
					console.error(
						`Error creating Stripe invoice for order #${orderId}:`,
						invoiceError
					)
				}
			}

			return {
				success: isSuccessful,
				message: isSuccessful ? 'Payment successful.' : 'Payment failed.',
				payment,
			}
		} catch (error) {
			console.error('Error processing Stripe webhook:', error)
			return {
				success: false,
				message: 'Error processing webhook.',
			}
		}
	}

	private async createOrUpdateStripePayment(
		orderId: number,
		amount: number,
		status: payment_status_enum,
		paymentIntentId: string
	): Promise<PaymentWithRelations> {
		const existingPayment = await this.prisma.payment.findFirst({
			where: {
				order_id: orderId,
				payment_method_id: PAYMENT_METHOD.STRIPE,
			},
			include: { order: true, payment_method: true },
		})

		if (existingPayment) {
			return this.prisma.payment.update({
				where: { payment_id: existingPayment.payment_id },
				data: {
					status,
					amount_paid: new Decimal(amount),
					payment_time: new Date(),
				},
				include: { order: true, payment_method: true },
			})
		} else {
			return this.prisma.payment.create({
				data: {
					order_id: orderId,
					payment_method_id: PAYMENT_METHOD.STRIPE,
					status,
					amount_paid: new Decimal(amount),
					change_amount: new Decimal(0),
					payment_time: new Date(),
				},
				include: { order: true, payment_method: true },
			})
		}
	}

	async findAll(
		paginationDto: PaginationDto,
		orderId?: number
	): Promise<PaginatedResult<PaymentWithRelations>> {
		const { page = 1, limit = 10 } = paginationDto
		const skip = (page - 1) * limit

		const where = orderId ? { order_id: orderId } : {}

		const [data, total] = await Promise.all([
			this.prisma.payment.findMany({
				skip,
				take: limit,
				where,
				include: { order: true, payment_method: true },
				orderBy: { payment_time: 'desc' },
			}),
			this.prisma.payment.count({ where }),
		])

		const totalPages = Math.ceil(total / limit)

		return {
			data,
			pagination: {
				page,
				limit,
				total,
				totalPages,
				hasNext: page < totalPages,
				hasPrev: page > 1,
			},
		}
	}

	async findOne(id: number): Promise<PaymentWithRelations> {
		const payment = await this.prisma.payment.findUnique({
			where: { payment_id: id },
			include: { order: true, payment_method: true },
		})
		if (!payment) {
			throw new NotFoundException(`Payment with ID ${id} not found.`)
		}
		return payment
	}

	async update(
		id: number,
		updatePaymentDto: UpdatePaymentDto
	): Promise<PaymentWithRelations> {
		const existingPayment = await this.findOne(id)

		const { amount_paid, payment_time } = updatePaymentDto

		const dataToUpdate: Prisma.paymentUpdateInput = {}

		if (payment_time) dataToUpdate.payment_time = new Date(payment_time)

		let newPaidAmount: Decimal | undefined
		if (amount_paid !== undefined) {
			newPaidAmount = new Decimal(amount_paid)
			dataToUpdate.amount_paid = newPaidAmount

			const orderFinalAmount = new Decimal(
				existingPayment.order.final_amount ||
					existingPayment.order.total_amount ||
					0
			)
			let newChangeAmount = new Decimal(0)
			if (newPaidAmount.greaterThan(orderFinalAmount)) {
				newChangeAmount = newPaidAmount.minus(orderFinalAmount)
			}
			dataToUpdate.change_amount = newChangeAmount
		}

		try {
			const updatedPayment = await this.prisma.payment.update({
				where: { payment_id: id },
				data: dataToUpdate,
				include: { order: true, payment_method: true },
			})
			return updatedPayment
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				console.error(
					`Prisma error updating payment ${id}:`,
					error.code,
					error.meta
				)
			} else {
				console.error(`Error updating payment ${id}:`, error)
			}
			throw new InternalServerErrorException('Could not update payment.')
		}
	}

	/**
	 * Deletes a payment by its ID.
	 * @param id - The ID of the payment to delete.
	 * @returns The deleted payment record.
	 */
	async remove(id: number): Promise<PaymentWithRelations> {
		const paymentToDelete = await this.findOne(id)
		try {
			await this.prisma.payment.delete({
				where: { payment_id: id },
			})
			return paymentToDelete
		} catch (error) {
			console.error(`Error deleting payment ${id}:`, error)
			throw new InternalServerErrorException('Could not delete payment.')
		}
	}

	/**
	 * Finds payments by a specific payment method.
	 * @param payment_method_id - The ID of the payment method.
	 * @param paginationDto - Pagination options.
	 * @returns A paginated result of payments.
	 */
	async findByPaymentMethod(
		payment_method_id: number,
		paginationDto: PaginationDto
	): Promise<PaginatedResult<payment>> {
		const { page = 1, limit = 10 } = paginationDto
		const skip = (page - 1) * limit

		const [data, total] = await Promise.all([
			this.prisma.payment.findMany({
				where: { payment_method_id },
				skip,
				take: limit,
				orderBy: { payment_id: 'desc' },
			}),
			this.prisma.payment.count({
				where: { payment_method_id },
			}),
		])

		const totalPages = Math.ceil(total / limit)

		return {
			data,
			pagination: {
				page,
				limit,
				total,
				totalPages,
				hasNext: page < totalPages,
				hasPrev: page > 1,
			},
		}
	}
}
