// Frontend domain model for Customer (camelCase + Date)
import type { Role } from '@/types/api';

export interface Customer {
	id: number;
	membershipTypeId: number;
	name: string;
	firstName?: string;
	lastName?: string;
	phone: string;
	currentPoints?: number;
	gender?: 'MALE' | 'FEMALE' | 'OTHER';
	createdAt: Date;
	updatedAt: Date;
	username?: string;
	lastLogin?: Date;
	role?: Role;
	membershipType?: {
		id: number;
		type: string;
		discountValue: number;
		requiredPoint: number;
		description?: string;
		validUntil?: Date;
		isActive: boolean;
		createdAt: Date;
		updatedAt: Date;
	};
}
