// Raw backend transport type for Profile (snake_case)
export interface BackendProfileResponse {
	account_id: number;
	username: string;
	role_id: number;
	role_name: string;
	is_active: boolean;
	is_locked: boolean;
	last_login?: string;
	created_at: string;
	profile?: {
		manager_id?: number;
		employee_id?: number;
		customer_id?: number;
		last_name: string;
		first_name: string;
		email?: string;
		phone: string;
		gender?: 'MALE' | 'FEMALE' | 'OTHER';
		position?: string;
		current_points?: number;
		membership_type_id?: number;
	};
}
