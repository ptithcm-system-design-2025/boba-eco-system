// Domain model for Profile (camelCase + Date)
export interface Profile {
	accountId: number;
	username: string;
	roleId: number;
	roleName: string;
	isActive: boolean;
	isLocked: boolean;
	lastLogin?: Date;
	createdAt: Date;
	profile?: {
		id?: number;
		lastName: string;
		firstName: string;
		name: string;
		email?: string;
		phone: string;
		gender?: 'MALE' | 'FEMALE' | 'OTHER';
		position?: string;
		currentPoints?: number;
		membershipTypeId?: number;
	};
}
