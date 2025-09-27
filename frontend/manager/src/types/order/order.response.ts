// Raw backend transport types for Order module (snake_case). Keep 1:1 with backend.

import type { BackendCustomerResponse } from '../customer/customer.response';
import type { BackendDiscountResponse } from '../discount/discount.response';
import type { BackendEmployeeResponse } from '../employee/employee.response';
import type { BackendProductPriceResponse } from '../product/product.response';

export interface BackendOrderResponse {
	order_id: number;
	employee_id?: number;
	customer_id?: number;
	order_time?: string;
	total_amount: number;
	final_amount: number;
	status: 'PROCESSING' | 'CANCELLED' | 'COMPLETED';
	customize_note?: string;
	created_at: string;
	updated_at: string;
	customer?: BackendCustomerResponse;
	employee?: BackendEmployeeResponse;
	order_product?: BackendOrderProductResponse[];
	order_discount?: BackendOrderDiscountResponse[];
	payment?: BackendPaymentResponse[];
}

export interface BackendOrderProductResponse {
	order_product_id: number;
	order_id: number;
	product_price_id: number;
	quantity: number;
	option?: string;
	created_at: string;
	updated_at: string;
	product_price?: BackendProductPriceResponse;
}

export interface BackendOrderDiscountResponse {
	order_discount_id: number;
	order_id: number;
	discount_id: number;
	discount_amount: number;
	created_at: string;
	updated_at: string;
	discount?: BackendDiscountResponse;
}

export interface BackendPaymentResponse {
	payment_id: number;
	order_id: number;
	payment_method_id: number;
	status: 'PROCESSING' | 'PAID' | 'CANCELLED';
	amount_paid?: number;
	change_amount?: number;
	payment_time?: string;
	created_at: string;
	updated_at: string;
	payment_method?: {
		payment_method_id: number;
		name: string;
		description?: string;
		created_at: string;
		updated_at: string;
	};
}
