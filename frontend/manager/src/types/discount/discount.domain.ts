// Frontend domain model for Discount (camelCase + Date)

export interface Discount {
	id: number;
	name: string;
	description?: string;
	couponCode: string;
	discountValue: number;
	minRequiredOrderValue: number;
	maxDiscountAmount: number;
	minRequiredProduct?: number;
	validFrom?: Date;
	validUntil: Date;
	currentUses?: number;
	maxUses?: number;
	maxUsesPerCustomer?: number;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}
