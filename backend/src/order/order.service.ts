import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
	UnprocessableEntityException,
} from '@nestjs/common'
import { Decimal } from '@prisma/client/runtime/library'
import type {
	PaginatedResult,
	PaginationDto,
} from '../common/dto/pagination.dto'
import {
	type order,
	order_status_enum,
	Prisma,
} from '../generated/prisma/client'
import type { PrismaService } from '../prisma/prisma.service'
import type { CreateOrderDto } from './dto/create-order.dto'
import type { UpdateOrderDto } from './dto/update-order.dto'
import type { ValidateDiscountDto } from './dto/validate-discount.dto'

@Injectable()
export class OrderService {
	constructor(private prisma: PrismaService) {}

	/**
	 * Creates a new order.
	 * @param createOrderDto - The data to create the order.
	 * @returns The created order.
	 */
	async create(createOrderDto: CreateOrderDto): Promise<order> {
		const { employee_id, customer_id, products, discounts, customize_note } =
			createOrderDto

		const employee = await this.prisma.employee.findUnique({
			where: { employee_id },
		})
		if (!employee)
			throw new NotFoundException(`Employee with ID ${employee_id} not found.`)

		let customerWithMembership: Prisma.customerGetPayload<{
			include: { membership_type: true }
		}> | null = null
		if (customer_id) {
			customerWithMembership = await this.prisma.customer.findUnique({
				where: { customer_id },
				include: {
					membership_type: true,
				},
			})
			if (!customerWithMembership)
				throw new NotFoundException(
					`Customer with ID ${customer_id} not found.`
				)
		}

		let calculatedTotalAmount = new Decimal(0)
		const orderProductCreateInputs: Prisma.order_productCreateWithoutOrderInput[] =
			[]

		if (!products || products.length === 0) {
			throw new BadRequestException('Order must contain at least one product.')
		}

		for (const productDto of products) {
			const productPriceInfo = await this.prisma.product_price.findUnique({
				where: { product_price_id: productDto.product_price_id },
			})
			if (!productPriceInfo) {
				throw new NotFoundException(
					`Product price with ID ${productDto.product_price_id} not found.`
				)
			}
			if (!productPriceInfo.is_active) {
				throw new UnprocessableEntityException(
					`ProductPrice with ID ${productDto.product_price_id} is not active.`
				)
			}
			calculatedTotalAmount = calculatedTotalAmount.plus(
				new Decimal(productPriceInfo.price).times(productDto.quantity)
			)
			orderProductCreateInputs.push({
				quantity: productDto.quantity,
				option: productDto.option,
				product_price: {
					connect: { product_price_id: productDto.product_price_id },
				},
			})
		}

		let calculatedFinalAmount = new Decimal(calculatedTotalAmount)
		const orderDiscountCreateInputs: Prisma.order_discountCreateWithoutOrderInput[] =
			[]
		let totalDiscountApplied = new Decimal(0)

		if (customerWithMembership?.membership_type) {
			const membershipType = customerWithMembership.membership_type

			if (
				membershipType.is_active &&
				(!membershipType.valid_until ||
					new Date() <= new Date(membershipType.valid_until))
			) {
				const membershipDiscountAmount = calculatedTotalAmount
					.times(new Decimal(membershipType.discount_value))
					.dividedBy(100)

				calculatedFinalAmount = calculatedFinalAmount.minus(
					membershipDiscountAmount
				)
				totalDiscountApplied = totalDiscountApplied.plus(
					membershipDiscountAmount
				)
			}
		}

		if (discounts && discounts.length > 0) {
			for (const discountDto of discounts) {
				const validationResult = await this.validateSingleDiscount(
					discountDto.discount_id,
					calculatedTotalAmount.toNumber(),
					products.length,
					customer_id
				)

				if (!validationResult.is_valid) {
					throw new UnprocessableEntityException(validationResult.reason)
				}

				const currentDiscountAmount = new Decimal(
					validationResult.discount_amount
				)
				calculatedFinalAmount = calculatedFinalAmount.minus(
					currentDiscountAmount
				)
				totalDiscountApplied = totalDiscountApplied.plus(currentDiscountAmount)

				orderDiscountCreateInputs.push({
					discount_amount: currentDiscountAmount.toNumber(),
					discount: {
						connect: { discount_id: discountDto.discount_id },
					},
				})
			}
		}
		if (calculatedFinalAmount.lessThan(0))
			calculatedFinalAmount = new Decimal(0)

		const orderData: Prisma.orderCreateInput = {
			order_time: new Date(),
			total_amount: calculatedTotalAmount.toNumber(),
			final_amount: calculatedFinalAmount.toNumber(),
			status: order_status_enum.PROCESSING,
			customize_note: customize_note,
			employee: { connect: { employee_id } },
			...(customer_id && { customer: { connect: { customer_id } } }),
			order_product: { create: orderProductCreateInputs },
			...(orderDiscountCreateInputs.length > 0 && {
				order_discount: { create: orderDiscountCreateInputs },
			}),
		}

		try {
			return await this.prisma.order.create({
				data: orderData,
				include: {
					customer: true,
					employee: true,
					order_product: {
						include: {
							product_price: {
								include: { product_size: true, product: true },
							},
						},
					},
					order_discount: { include: { discount: true } },
					payment: true,
				},
			})
		} catch (error) {
			console.error('Error creating order:', error)
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
			}
			throw new InternalServerErrorException('Could not create order.')
		}
	}

	/**
	 * Finds all orders with pagination and filtering.
	 * @param paginationDto - The pagination options.
	 * @param filters - The filters to apply.
	 * @returns A paginated list of orders.
	 */
	async findAll(
		paginationDto: PaginationDto,
		filters?: {
			customerId?: number
			employeeId?: number
			status?: order_status_enum
		}
	): Promise<PaginatedResult<order>> {
		const { page = 1, limit = 10 } = paginationDto
		const skip = (page - 1) * limit

		const where: Prisma.orderWhereInput = {}
		if (filters?.customerId) where.customer_id = filters.customerId
		if (filters?.employeeId) where.employee_id = filters.employeeId
		if (filters?.status) where.status = filters.status as order_status_enum

		const [data, total] = await Promise.all([
			this.prisma.order.findMany({
				skip,
				take: limit,
				where,
				orderBy: { order_id: 'desc' },
			}),
			this.prisma.order.count({ where }),
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

	/**
	 * Finds a single order by its ID.
	 * @param id - The ID of the order to find.
	 * @param include - The relations to include in the result.
	 * @returns The found order.
	 */
	async findOne(id: number, include?: Prisma.orderInclude): Promise<order> {
		const order = await this.prisma.order.findUnique({
			where: { order_id: id },
			include: include || {
				customer: true,
				employee: true,
				order_product: {
					include: {
						product_price: {
							include: { product_size: true, product: true },
						},
					},
				},
				order_discount: { include: { discount: true } },
				payment: true,
			},
		})
		if (!order) {
			throw new NotFoundException(`Order with ID ${id} not found.`)
		}
		return order
	}

	/**
	 * Updates an existing order.
	 * @param id - The ID of the order to update.
	 * @param updateOrderDto - The data to update the order with.
	 * @returns The updated order.
	 */
	async update(id: number, updateOrderDto: UpdateOrderDto): Promise<order> {
		const existingOrder = await this.findOne(id)

		const { employee_id, customer_id, products, discounts, customize_note } =
			updateOrderDto

		const dataToUpdate: Prisma.orderUpdateInput = {
			...(employee_id && { employee: { connect: { employee_id } } }),
			...(customer_id !== undefined && {
				customer: customer_id
					? { connect: { customer_id } }
					: { disconnect: true },
			}),
			...(customize_note !== undefined && { customize_note }),
		}

		return this.prisma.$transaction(async (tx) => {
			let newTotalAmount = new Decimal(existingOrder.total_amount || 0)
			let newFinalAmount = new Decimal(existingOrder.final_amount || 0)

			if (products !== undefined) {
				await tx.order_product.deleteMany({ where: { order_id: id } })
				newTotalAmount = new Decimal(0)
				if (products.length > 0) {
					const newOrderProductCreateInputs: Prisma.order_productCreateWithoutOrderInput[] =
						[]
					for (const productDto of products) {
						const productPriceInfo = await tx.product_price.findUnique({
							where: {
								product_price_id: productDto.product_price_id,
							},
						})
						if (!productPriceInfo)
							throw new NotFoundException(
								`Product price with ID ${productDto.product_price_id} not found.`
							)
						if (!productPriceInfo.is_active)
							throw new UnprocessableEntityException(
								`ProductPrice ID ${productDto.product_price_id} is not active.`
							)
						newTotalAmount = newTotalAmount.plus(
							new Decimal(productPriceInfo.price).times(productDto.quantity)
						)
						newOrderProductCreateInputs.push({
							quantity: productDto.quantity,
							option: productDto.option,
							product_price: {
								connect: {
									product_price_id: productDto.product_price_id,
								},
							},
						})
					}
					dataToUpdate.order_product = {
						create: newOrderProductCreateInputs,
					}
				} else {
					dataToUpdate.order_product = { deleteMany: {} }
				}
				dataToUpdate.total_amount = newTotalAmount.toNumber()
			} else {
				newTotalAmount = new Decimal(existingOrder.total_amount || 0)
			}

			newFinalAmount = new Decimal(newTotalAmount)
			if (discounts !== undefined) {
				await tx.order_discount.deleteMany({ where: { order_id: id } })
				let totalDiscountAppliedOnUpdate = new Decimal(0)
				if (discounts.length > 0) {
					const newOrderDiscountCreateInputs: Prisma.order_discountCreateWithoutOrderInput[] =
						[]
					for (const discountDto of discounts) {
						const discountInfo = await tx.discount.findUnique({
							where: { discount_id: discountDto.discount_id },
						})
						if (!discountInfo)
							throw new NotFoundException(
								`Discount with ID ${discountDto.discount_id} not found.`
							)
						if (
							!discountInfo.is_active ||
							new Date() > new Date(discountInfo.valid_until) ||
							(discountInfo.valid_from &&
								new Date() < new Date(discountInfo.valid_from))
						) {
							throw new UnprocessableEntityException(
								`Discount ID ${discountInfo.discount_id} ('${discountInfo.name}') is not valid or active at this time.`
							)
						}
						if (
							newTotalAmount.lessThan(discountInfo.min_required_order_value)
						) {
							throw new UnprocessableEntityException(
								`Order total (${newTotalAmount}) does not meet minimum required value (${discountInfo.min_required_order_value}) for discount '${discountInfo.name}'.`
							)
						}

						const discountPercentageUpdate = new Decimal(
							discountInfo.discount_value
						).dividedBy(100)
						let currentDiscountAmountUpdate = newTotalAmount.times(
							discountPercentageUpdate
						)

						const maxDiscountUpdate = new Decimal(
							discountInfo.max_discount_amount
						)
						if (currentDiscountAmountUpdate.greaterThan(maxDiscountUpdate)) {
							currentDiscountAmountUpdate = maxDiscountUpdate
						}

						newFinalAmount = newFinalAmount.minus(currentDiscountAmountUpdate)
						totalDiscountAppliedOnUpdate = totalDiscountAppliedOnUpdate.plus(
							currentDiscountAmountUpdate
						)
						newOrderDiscountCreateInputs.push({
							discount_amount: currentDiscountAmountUpdate.toNumber(),
							discount: {
								connect: {
									discount_id: discountDto.discount_id,
								},
							},
						})
					}
					dataToUpdate.order_discount = {
						create: newOrderDiscountCreateInputs,
					}
				} else {
					dataToUpdate.order_discount = { deleteMany: {} }
				}
			} else {
				const existingDiscounts = await tx.order_discount.findMany({
					where: { order_id: id },
					include: { discount: true },
				})
				for (const od of existingDiscounts) {
					newFinalAmount = newFinalAmount.minus(od.discount_amount)
				}
			}
			if (newFinalAmount.lessThan(0)) newFinalAmount = new Decimal(0)
			dataToUpdate.final_amount = newFinalAmount.toNumber()

			return tx.order.update({
				where: { order_id: id },
				data: dataToUpdate,
				include: {
					customer: true,
					employee: true,
					order_product: {
						include: {
							product_price: {
								include: { product_size: true, product: true },
							},
						},
					},
					order_discount: { include: { discount: true } },
					payment: true,
				},
			})
		})
	}

	/**
	 * Cancels an order.
	 * @param id - The ID of the order to cancel.
	 * @returns The cancelled order.
	 */
	async cancelOrder(id: number): Promise<order> {
		const existingOrder = await this.findOne(id)

		if (existingOrder.status === order_status_enum.CANCELLED) {
			throw new BadRequestException('Order has already been cancelled.')
		}

		if (existingOrder.status === order_status_enum.COMPLETED) {
			throw new BadRequestException('Cannot cancel a completed order.')
		}

		return this.prisma.order.update({
			where: { order_id: id },
			data: { status: order_status_enum.CANCELLED },
			include: {
				customer: true,
				employee: true,
				order_product: {
					include: {
						product_price: {
							include: { product_size: true, product: true },
						},
					},
				},
				order_discount: { include: { discount: true } },
				payment: true,
			},
		})
	}

	/**
	 * Removes an order.
	 * @param id - The ID of the order to remove.
	 * @returns The removed order.
	 */
	async remove(id: number): Promise<order> {
		const orderToDelete = await this.findOne(id)
		if (orderToDelete.status === order_status_enum.COMPLETED) {
		}

		await this.prisma.order.delete({ where: { order_id: id } })
		return orderToDelete
	}

	/**
	 * Finds orders by employee with pagination.
	 * @param employee_id - The ID of the employee.
	 * @param paginationDto - The pagination options.
	 * @returns A paginated list of orders.
	 */
	async findByEmployee(
		employee_id: number,
		paginationDto: PaginationDto
	): Promise<PaginatedResult<order>> {
		const { page = 1, limit = 10 } = paginationDto
		const skip = (page - 1) * limit

		const [data, total] = await Promise.all([
			this.prisma.order.findMany({
				where: { employee_id },
				skip,
				take: limit,
				orderBy: { order_id: 'desc' },
			}),
			this.prisma.order.count({
				where: { employee_id },
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

	/**
	 * Finds orders by customer with pagination.
	 * @param customer_id - The ID of the customer.
	 * @param paginationDto - The pagination options.
	 * @returns A paginated list of orders.
	 */
	async findByCustomer(
		customer_id: number,
		paginationDto: PaginationDto
	): Promise<PaginatedResult<order>> {
		const { page = 1, limit = 10 } = paginationDto
		const skip = (page - 1) * limit

		const [data, total] = await Promise.all([
			this.prisma.order.findMany({
				where: { customer_id },
				skip,
				take: limit,
				orderBy: { order_id: 'desc' },
			}),
			this.prisma.order.count({
				where: { customer_id },
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

	/**
	 * Finds orders by status with pagination.
	 * @param status - The status to filter by.
	 * @param paginationDto - The pagination options.
	 * @returns A paginated list of orders.
	 */
	async findByStatus(
		status: order_status_enum,
		paginationDto: PaginationDto
	): Promise<PaginatedResult<order>> {
		const { page = 1, limit = 10 } = paginationDto
		const skip = (page - 1) * limit

		const [data, total] = await Promise.all([
			this.prisma.order.findMany({
				where: { status: status as order_status_enum },
				skip,
				take: limit,
				orderBy: { order_id: 'desc' },
			}),
			this.prisma.order.count({
				where: { status: status as order_status_enum },
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

	/**
	 * Validates a list of discounts for an order.
	 * @param validateDiscountDto - The data to validate the discounts.
	 * @returns The validation result.
	 */
	async validateDiscounts(validateDiscountDto: ValidateDiscountDto): Promise<{
		valid_discounts: Array<{
			discount_id: number
			discount_name: string
			discount_amount: number
			reason: string
		}>
		invalid_discounts: Array<{
			discount_id: number
			discount_name: string
			reason: string
		}>
		summary: {
			total_checked: number
			valid_count: number
			invalid_count: number
			total_discount_amount: number
		}
	}> {
		const { customer_id, discount_ids, total_amount, product_count } =
			validateDiscountDto

		const valid_discounts: Array<{
			discount_id: number
			discount_name: string
			discount_amount: number
			reason: string
		}> = []
		const invalid_discounts: Array<{
			discount_id: number
			discount_name: string
			reason: string
		}> = []
		let total_discount_amount = 0

		for (const discount_id of discount_ids) {
			const validationResult = await this.validateSingleDiscount(
				discount_id,
				total_amount,
				product_count,
				customer_id
			)

			if (validationResult.is_valid) {
				valid_discounts.push({
					discount_id,
					discount_name: validationResult.discount_name,
					discount_amount: validationResult.discount_amount,
					reason: validationResult.reason,
				})
				total_discount_amount += validationResult.discount_amount
			} else {
				invalid_discounts.push({
					discount_id,
					discount_name: validationResult.discount_name,
					reason: validationResult.reason,
				})
			}
		}

		return {
			valid_discounts,
			invalid_discounts,
			summary: {
				total_checked: discount_ids.length,
				valid_count: valid_discounts.length,
				invalid_count: invalid_discounts.length,
				total_discount_amount,
			},
		}
	}

	private async validateSingleDiscount(
		discount_id: number,
		total_amount: number,
		product_count: number,
		customer_id?: number
	): Promise<{
		is_valid: boolean
		discount_name: string
		discount_amount: number
		reason: string
	}> {
		const discountInfo = await this.prisma.discount.findUnique({
			where: { discount_id },
		})

		if (!discountInfo) {
			return {
				is_valid: false,
				discount_name: '',
				discount_amount: 0,
				reason: `Discount with ID ${discount_id} not found.`,
			}
		}

		const currentDate = new Date()
		if (
			!discountInfo.is_active ||
			currentDate > new Date(discountInfo.valid_until) ||
			(discountInfo.valid_from &&
				currentDate < new Date(discountInfo.valid_from))
		) {
			return {
				is_valid: false,
				discount_name: discountInfo.name,
				discount_amount: 0,
				reason: `Discount '${discountInfo.name}' is no longer valid or not yet active.`,
			}
		}

		if (total_amount < discountInfo.min_required_order_value) {
			return {
				is_valid: false,
				discount_name: discountInfo.name,
				discount_amount: 0,
				reason: `Order total (${total_amount.toLocaleString(
					'en-US'
				)}) does not meet the minimum required value (${discountInfo.min_required_order_value.toLocaleString(
					'en-US'
				)}) to apply discount '${discountInfo.name}'.`,
			}
		}

		if (
			discountInfo.min_required_product &&
			product_count < discountInfo.min_required_product
		) {
			return {
				is_valid: false,
				discount_name: discountInfo.name,
				discount_amount: 0,
				reason: `Order has ${product_count} products, but a minimum of ${discountInfo.min_required_product} is required to apply discount '${discountInfo.name}'.`,
			}
		}

		if (
			discountInfo.max_uses &&
			discountInfo.current_uses &&
			discountInfo.current_uses >= discountInfo.max_uses
		) {
			return {
				is_valid: false,
				discount_name: discountInfo.name,
				discount_amount: 0,
				reason: `Discount '${discountInfo.name}' has reached its maximum usage limit (${discountInfo.max_uses} times).`,
			}
		}

		if (customer_id && discountInfo.max_uses_per_customer) {
			const customerUsageCount = await this.prisma.order_discount.count({
				where: {
					discount_id,
					order: {
						customer_id,
						status: {
							in: [order_status_enum.PROCESSING, order_status_enum.COMPLETED],
						},
					},
				},
			})

			if (customerUsageCount >= discountInfo.max_uses_per_customer) {
				return {
					is_valid: false,
					discount_name: discountInfo.name,
					discount_amount: 0,
					reason: `Customer has reached the maximum usage limit (${discountInfo.max_uses_per_customer} times) for discount '${discountInfo.name}'.`,
				}
			}
		}

		const discountPercentage = new Decimal(
			discountInfo.discount_value
		).dividedBy(100)
		let discountAmount = new Decimal(total_amount).times(discountPercentage)

		const maxDiscountAmount = new Decimal(discountInfo.max_discount_amount)
		if (discountAmount.greaterThan(maxDiscountAmount)) {
			discountAmount = maxDiscountAmount
		}

		return {
			is_valid: true,
			discount_name: discountInfo.name,
			discount_amount: discountAmount.toNumber(),
			reason: `Discount '${
				discountInfo.name
			}' can be applied, reducing the total by ${discountAmount
				.toNumber()
				.toLocaleString('en-US')}.`,
		}
	}
}
