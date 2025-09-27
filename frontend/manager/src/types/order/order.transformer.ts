// Pure transform functions for Order module
// Convert snake_case transport to camelCase domain models and parse dates

import { transformCustomerResponse } from '@/types/customer';
import { transformDiscountResponse } from '@/types/discount';
import { transformEmployeeResponse } from '@/types/employee';
import { transformProductPriceResponse } from '../product/product.transformer';
import type {
	Order,
	OrderDiscount,
	OrderProduct,
	Payment,
} from './order.domain';
import type {
	BackendOrderDiscountResponse,
	BackendOrderProductResponse,
	BackendOrderResponse,
	BackendPaymentResponse,
} from './order.response';

export function transformOrderResponse(
	backendOrder: BackendOrderResponse,
): Order {
	const customer = backendOrder.customer
		? transformCustomerResponse(backendOrder.customer)
		: undefined;
	const employee = backendOrder.employee
		? transformEmployeeResponse(backendOrder.employee)
		: undefined;

	return {
		id: backendOrder.order_id,
		employeeId: backendOrder.employee_id,
		customerId: backendOrder.customer_id,
		orderTime: backendOrder.order_time
			? new Date(backendOrder.order_time)
			: undefined,
		totalAmount: backendOrder.total_amount,
		finalAmount: backendOrder.final_amount,
		status: backendOrder.status,
		customizeNote: backendOrder.customize_note,
		createdAt: new Date(backendOrder.created_at),
		updatedAt: new Date(backendOrder.updated_at),
		customer,
		employee,
		products: backendOrder.order_product?.map(
			transformOrderProductResponse,
		),
		discounts: backendOrder.order_discount?.map(
			transformOrderDiscountResponse,
		),
		payments: backendOrder.payment?.map(transformPaymentResponse),
		// Computed
		customerName: customer ? customer.name : undefined,
		employeeName: employee ? employee.name : undefined,
		paymentStatus: backendOrder.payment?.[0]?.status,
		paymentMethod: backendOrder.payment?.[0]?.payment_method?.name,
	};
}

export function transformOrderProductResponse(
	backendOrderProduct: BackendOrderProductResponse,
): OrderProduct {
	return {
		id: backendOrderProduct.order_product_id,
		orderId: backendOrderProduct.order_id,
		productPriceId: backendOrderProduct.product_price_id,
		quantity: backendOrderProduct.quantity,
		option: backendOrderProduct.option,
		createdAt: new Date(backendOrderProduct.created_at),
		updatedAt: new Date(backendOrderProduct.updated_at),
		productPrice: backendOrderProduct.product_price
			? transformProductPriceResponse(backendOrderProduct.product_price)
			: undefined,
		// Computed
		productName: backendOrderProduct.product_price?.product?.name,
		sizeName: backendOrderProduct.product_price?.product_size?.name,
		unitPrice: backendOrderProduct.product_price?.price,
		totalPrice: backendOrderProduct.product_price
			? backendOrderProduct.product_price.price *
				backendOrderProduct.quantity
			: 0,
	};
}

export function transformOrderDiscountResponse(
	backendOrderDiscount: BackendOrderDiscountResponse,
): OrderDiscount {
	return {
		id: backendOrderDiscount.order_discount_id,
		orderId: backendOrderDiscount.order_id,
		discountId: backendOrderDiscount.discount_id,
		discountAmount: backendOrderDiscount.discount_amount,
		createdAt: new Date(backendOrderDiscount.created_at),
		updatedAt: new Date(backendOrderDiscount.updated_at),
		discount: backendOrderDiscount.discount
			? transformDiscountResponse(backendOrderDiscount.discount)
			: undefined,
		// Computed
		discountName: backendOrderDiscount.discount?.name,
	};
}

export function transformPaymentResponse(
	backendPayment: BackendPaymentResponse,
): Payment {
	return {
		id: backendPayment.payment_id,
		orderId: backendPayment.order_id,
		paymentMethodId: backendPayment.payment_method_id,
		status: backendPayment.status,
		amountPaid: backendPayment.amount_paid,
		changeAmount: backendPayment.change_amount,
		paymentTime: backendPayment.payment_time
			? new Date(backendPayment.payment_time)
			: undefined,
		createdAt: new Date(backendPayment.created_at),
		updatedAt: new Date(backendPayment.updated_at),
		paymentMethod: backendPayment.payment_method
			? {
					id: backendPayment.payment_method.payment_method_id,
					name: backendPayment.payment_method.name,
					description: backendPayment.payment_method.description,
					createdAt: new Date(
						backendPayment.payment_method.created_at,
					),
					updatedAt: new Date(
						backendPayment.payment_method.updated_at,
					),
				}
			: undefined,
	};
}
