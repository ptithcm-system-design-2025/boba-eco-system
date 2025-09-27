// Raw backend transport type for Store (snake_case)
export interface BackendStoreResponse {
	store_id: number;
	name: string;
	address: string;
	phone: string;
	opening_time: string;
	closing_time: string;
	email: string;
	opening_date: string;
	tax_code: string;
	created_at: string;
	updated_at: string;
}
