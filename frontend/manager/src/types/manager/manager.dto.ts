// DTOs for Manager requests (snake_case to match backend)

export interface CreateManagerDto {
	first_name: string;
	last_name: string;
	email: string;
	phone: string;
	gender?: 'MALE' | 'FEMALE';
	username: string;
	password: string;
}

export interface UpdateManagerDto {
	first_name?: string;
	last_name?: string;
	email?: string;
	phone?: string;
	gender?: 'MALE' | 'FEMALE';
	username?: string;
	password?: string;
}

export interface BulkDeleteManagerDto {
	ids: number[];
}
