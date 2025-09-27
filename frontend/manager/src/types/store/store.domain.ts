// Domain model for Store (camelCase + Date)
export interface Store {
	id: number;
	name: string;
	address: string;
	phone: string;
	openingTime: string;
	closingTime: string;
	email: string;
	openingDate: Date;
	taxCode: string;
	createdAt: Date;
	updatedAt: Date;
}
