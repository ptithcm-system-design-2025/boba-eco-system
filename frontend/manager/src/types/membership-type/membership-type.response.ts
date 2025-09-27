// Raw backend transport types for MembershipType (snake_case)

import type { BackendCustomerResponse } from '@/types/customer/customer.response';

export interface BackendMembershipTypeResponse {
	membership_type_id: number;
	type: string;
	discount_value: number;
	required_point: number;
	description?: string;
	valid_until?: string;
	is_active: boolean;
	created_at: string;
	updated_at: string;
	customers?: BackendCustomerResponse[];
}
