// Raw backend transport types for Discount (snake_case)

export interface BackendDiscountResponse {
	discount_id: number;
	name: string;
	description?: string;
	coupon_code: string;
	discount_value: number;
	min_required_order_value: number;
	max_discount_amount: number;
	min_required_product?: number;
	valid_from?: string;
	valid_until: string;
	current_uses?: number;
	max_uses?: number;
	max_uses_per_customer?: number;
	is_active: boolean;
	created_at: string;
	updated_at: string;
}
