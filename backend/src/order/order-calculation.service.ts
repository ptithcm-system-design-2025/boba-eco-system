import {
	Injectable,
	NotFoundException,
	UnprocessableEntityException,
} from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import type { PrismaService } from '../prisma/prisma.service';
import type {
	CalculateOrderDiscountDto,
	CalculateOrderDto,
	CalculateOrderProductDto,
	OrderCalculationResult,
} from './dto/calculate-order.dto';

@Injectable()
export class OrderCalculationService {
	constructor(private prisma: PrismaService) {}

	/**
	 * Calculates the detailed pricing for an order without actually creating it.
	 */
	async calculateOrder(
		calculateOrderDto: CalculateOrderDto
	): Promise<OrderCalculationResult> {
		const { products, discounts } = calculateOrderDto;

		const productCalculation = await this.calculateProductsTotal(products);

		const discountCalculation = await this.calculateDiscounts(
			discounts || [],
			productCalculation.total_amount
		);

		const final_amount = Math.max(
			0,
			productCalculation.total_amount -
				discountCalculation.total_discount_applied
		);

		return {
			total_amount: productCalculation.total_amount,
			final_amount,
			total_discount_applied: discountCalculation.total_discount_applied,
			products: productCalculation.products,
			discounts: discountCalculation.discounts,
		};
	}

	/**
	 * Calculates the total amount from a list of products.
	 */
	async calculateProductsTotal(products: CalculateOrderProductDto[]) {
		if (!products || products.length === 0) {
			throw new UnprocessableEntityException(
				'Order must contain at least one product.'
			);
		}

		let total_amount = 0;
		const productDetails: Array<{
			product_price_id: number;
			quantity: number;
			unit_price: number;
			subtotal: number;
			product_name: string;
			size_name: string;
		}> = [];

		for (const productDto of products) {
			const productPriceInfo = await this.prisma.product_price.findUnique(
				{
					where: { product_price_id: productDto.product_price_id },
					include: {
						product: true,
						product_size: true,
					},
				}
			);

			if (!productPriceInfo) {
				throw new NotFoundException(
					`Product price with ID ${productDto.product_price_id} not found.`
				);
			}

			if (!productPriceInfo.is_active) {
				throw new UnprocessableEntityException(
					`Giá sản phẩm với ID ${productDto.product_price_id} is not active.`
				);
			}

			const unit_price = Number(productPriceInfo.price);
			const subtotal = unit_price * productDto.quantity;
			total_amount += subtotal;

			productDetails.push({
				product_price_id: productDto.product_price_id,
				quantity: productDto.quantity,
				unit_price,
				subtotal,
				product_name: productPriceInfo.product.name,
				size_name: productPriceInfo.product_size.name,
			});
		}

		return {
			total_amount,
			products: productDetails,
		};
	}

	/**
	 * Calculates the total discount to be applied.
	 */
	async calculateDiscounts(
		discounts: CalculateOrderDiscountDto[],
		total_amount: number
	) {
		let total_discount_applied = 0;
		const discountDetails: Array<{
			discount_id: number;
			discount_name: string;
			discount_value: number;
			discount_amount: number;
			max_discount_amount: number;
		}> = [];

		if (!discounts || discounts.length === 0) {
			return {
				total_discount_applied,
				discounts: discountDetails,
			};
		}

		const totalAmountDecimal = new Decimal(total_amount);

		for (const discountDto of discounts) {
			const discountInfo = await this.prisma.discount.findUnique({
				where: { discount_id: discountDto.discount_id },
			});

			if (!discountInfo) {
				throw new NotFoundException(
					`Discount with ID ${discountDto.discount_id} not found.`
				);
			}

			if (!discountInfo.is_active) {
				throw new UnprocessableEntityException(
					`Discount '${discountInfo.name}' is not active.`
				);
			}

			const now = new Date();
			if (now > new Date(discountInfo.valid_until)) {
				throw new UnprocessableEntityException(
					`Discount '${discountInfo.name}' has expired.`
				);
			}

			if (
				discountInfo.valid_from &&
				now < new Date(discountInfo.valid_from)
			) {
				throw new UnprocessableEntityException(
					`Discount '${discountInfo.name}' is not yet valid.`
				);
			}

			if (
				totalAmountDecimal.lessThan(
					discountInfo.min_required_order_value
				)
			) {
				throw new UnprocessableEntityException(
					`Order total (${total_amount}) does not meet the minimum required value (${discountInfo.min_required_order_value}) for discount '${discountInfo.name}'.`
				);
			}

			const discountPercentage = new Decimal(
				discountInfo.discount_value
			).dividedBy(100);
			let discountAmount = totalAmountDecimal.times(discountPercentage);

			const maxDiscount = new Decimal(discountInfo.max_discount_amount);
			if (discountAmount.greaterThan(maxDiscount)) {
				discountAmount = maxDiscount;
			}

			const discountAmountNumber = discountAmount.toNumber();
			total_discount_applied += discountAmountNumber;

			discountDetails.push({
				discount_id: discountDto.discount_id,
				discount_name: discountInfo.name,
				discount_value: Number(discountInfo.discount_value),
				discount_amount: discountAmountNumber,
				max_discount_amount: Number(discountInfo.max_discount_amount),
			});
		}

		return {
			total_discount_applied,
			discounts: discountDetails,
		};
	}

	/**
	 * Recalculates the price for an existing order (used for updates).
	 */
	async recalculateExistingOrder(
		orderId: number
	): Promise<OrderCalculationResult> {
		const order = await this.prisma.order.findUnique({
			where: { order_id: orderId },
			include: {
				order_product: {
					include: {
						product_price: {
							include: {
								product: true,
								product_size: true,
							},
						},
					},
				},
				order_discount: {
					include: {
						discount: true,
					},
				},
			},
		});

		if (!order) {
			throw new NotFoundException(`Order with ID ${orderId} not found.`);
		}

		const products: CalculateOrderProductDto[] = order.order_product.map(
			(op) => ({
				product_price_id: op.product_price_id,
				quantity: op.quantity,
				option: op.option || undefined,
			})
		);

		const discounts: CalculateOrderDiscountDto[] = order.order_discount.map(
			(od) => ({
				discount_id: od.discount_id,
			})
		);

		return this.calculateOrder({ products, discounts });
	}
}
