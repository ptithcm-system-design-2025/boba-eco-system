// Raw backend transport types for Manager (snake_case)

export interface BackendManagerResponse {
	manager_id: number;
	account_id: number;
	last_name: string;
	first_name: string;
	gender: 'MALE' | 'FEMALE' | null;
	phone: string;
	email: string;
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
}
