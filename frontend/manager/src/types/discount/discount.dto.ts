// Discount DTOs (snake_case)

export interface CreateDiscountDto {
	name: string;
	description?: string;
	coupon_code: string;
	discount_value: number;
	min_required_order_value: number;
	max_discount_amount: number;
	min_required_product?: number;
	valid_from?: string;
	valid_until: string;
	max_uses?: number;
	max_uses_per_customer?: number;
	is_active?: boolean;
}

export interface UpdateDiscountDto {
	name?: string;
	description?: string;
	coupon_code?: string;
	discount_value?: number;
	min_required_order_value?: number;
	max_discount_amount?: number;
	min_required_product?: number;
	valid_from?: string;
	valid_until?: string;
	max_uses?: number;
	max_uses_per_customer?: number;
	is_active?: boolean;
}
