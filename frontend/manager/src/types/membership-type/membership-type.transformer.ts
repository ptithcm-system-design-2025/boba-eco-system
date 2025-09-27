// Pure transformer functions for MembershipType

import { transformCustomerResponse } from '@/types/customer';
import type { MembershipType } from './membership-type.domain';
import type { BackendMembershipTypeResponse } from './membership-type.response';

export function transformMembershipTypeResponse(
	backend: BackendMembershipTypeResponse,
): MembershipType {
	return {
		id: backend.membership_type_id,
		type: backend.type,
		discountValue: backend.discount_value,
		requiredPoint: backend.required_point,
		description: backend.description,
		validUntil: backend.valid_until
			? new Date(backend.valid_until)
			: undefined,
		isActive: backend.is_active,
		createdAt: new Date(backend.created_at),
		updatedAt: new Date(backend.updated_at),
		customers: backend.customers?.map(transformCustomerResponse),
	};
}
