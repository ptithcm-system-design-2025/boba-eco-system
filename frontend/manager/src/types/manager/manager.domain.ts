// Frontend domain model for Manager (camelCase + Date)
import type { Role } from '@/types/api';

export interface Manager {
	id: number;
	accountId: number;
	name: string;
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	gender: 'MALE' | 'FEMALE' | null;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
	permissions: string[];
	username?: string;
	lastLogin?: Date;
	role?: Role;
	avatar?: string;
}
