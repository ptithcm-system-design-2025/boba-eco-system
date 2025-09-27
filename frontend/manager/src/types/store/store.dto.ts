// Store DTOs (snake_case)
export interface CreateStoreDto {
	name: string;
	address: string;
	phone: string;
	opening_time: string; // Format: "HH:mm:ss"
	closing_time: string; // Format: "HH:mm:ss"
	email: string;
	opening_date: string; // Format: "YYYY-MM-DD"
	tax_code: string;
}

export interface UpdateStoreDto {
	name?: string;
	address?: string;
	phone?: string;
	opening_time?: string;
	closing_time?: string;
	email?: string;
	opening_date?: string;
	tax_code?: string;
}
