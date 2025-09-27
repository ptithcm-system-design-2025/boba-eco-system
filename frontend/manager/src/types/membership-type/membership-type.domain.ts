// Frontend domain model for MembershipType (camelCase + Date)

import type { Customer } from '@/types/customer';

export interface MembershipType {
	id: number;
	type: string;
	discountValue: number;
	requiredPoint: number;
	description?: string;
	validUntil?: Date;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
	customers?: Customer[];
}
