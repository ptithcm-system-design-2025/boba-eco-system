// Pure transformer functions for Customer

import { transformRole } from '@/types/api';
import type { Customer } from './customer.domain';
import type { BackendCustomerResponse } from './customer.response';

export function transformCustomerResponse(
	backend: BackendCustomerResponse,
): Customer {
	const name =
		backend.first_name && backend.last_name
			? `${backend.first_name} ${backend.last_name}`
			: backend.phone;

	const membershipType = backend.membership_type
		? {
				id: backend.membership_type.membership_type_id,
				type: backend.membership_type.type,
				discountValue: backend.membership_type.discount_value,
				requiredPoint: backend.membership_type.required_point,
				description: backend.membership_type.description,
				validUntil: backend.membership_type.valid_until
					? new Date(backend.membership_type.valid_until)
					: undefined,
				isActive: backend.membership_type.is_active,
				createdAt: new Date(backend.membership_type.created_at),
				updatedAt: new Date(backend.membership_type.updated_at),
			}
		: undefined;

	return {
		id: backend.customer_id,
		membershipTypeId: backend.membership_type_id,
		name,
		firstName: backend.first_name,
		lastName: backend.last_name,
		phone: backend.phone,
		currentPoints: backend.current_points,
		gender: backend.gender,
		createdAt: new Date(backend.created_at),
		updatedAt: new Date(backend.updated_at),
		username: backend.account?.username,
		lastLogin: backend.account?.last_login
			? new Date(backend.account.last_login)
			: undefined,
		role: transformRole(backend.account?.role),
		membershipType,
	};
}
