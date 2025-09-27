// Profile DTOs (snake_case)
export interface UpdateProfileDto {
	username?: string;
	password?: string;
	last_name?: string;
	first_name?: string;
	gender?: 'MALE' | 'FEMALE' | 'OTHER';
	phone?: string;
	email?: string;
	position?: string; // For employee only
}
