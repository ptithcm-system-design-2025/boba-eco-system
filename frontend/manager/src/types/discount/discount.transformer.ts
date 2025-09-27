// Pure transformer functions for Discount

import type { Discount } from './discount.domain';
import type { BackendDiscountResponse } from './discount.response';

export function transformDiscountResponse(
	backend: BackendDiscountResponse,
): Discount {
	return {
		id: backend.discount_id,
		name: backend.name,
		description: backend.description,
		couponCode: backend.coupon_code,
		discountValue: backend.discount_value,
		minRequiredOrderValue: backend.min_required_order_value,
		maxDiscountAmount: backend.max_discount_amount,
		minRequiredProduct: backend.min_required_product,
		validFrom: backend.valid_from
			? new Date(backend.valid_from)
			: undefined,
		validUntil: new Date(backend.valid_until),
		currentUses: backend.current_uses,
		maxUses: backend.max_uses,
		maxUsesPerCustomer: backend.max_uses_per_customer,
		isActive: backend.is_active,
		createdAt: new Date(backend.created_at),
		updatedAt: new Date(backend.updated_at),
	};
}
