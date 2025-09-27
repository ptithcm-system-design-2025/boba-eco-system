// Frontend domain model for Employee (camelCase + Date)
import type { Role } from '@/types/api';

export interface Employee {
	id: number;
	accountId: number;
	name: string;
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	position: string;
	createdAt: Date;
	updatedAt: Date;
	username?: string;
	lastLogin?: Date;
	role?: Role;
}
