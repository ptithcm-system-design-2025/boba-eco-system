// Raw backend transport types for Customer (snake_case)

export interface BackendCustomerResponse {
	customer_id: number;
	membership_type_id: number;
	last_name?: string;
	first_name?: string;
	phone: string;
	current_points?: number;
	gender?: 'MALE' | 'FEMALE' | 'OTHER';
	created_at: string;
	updated_at: string;
	account?: {
		account_id: number;
		role_id: number;
		username: string;
		is_active: boolean;
		is_locked: boolean;
		last_login: string | null;
		created_at: string;
		updated_at: string;
		role: Record<string, unknown>;
	};
	membership_type?: {
		membership_type_id: number;
		type: string;
		discount_value: number;
		required_point: number;
		description?: string;
		valid_until?: string;
		is_active: boolean;
		created_at: string;
		updated_at: string;
	};
}
