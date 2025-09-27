// Pure transformer functions for Manager

import { transformRole } from '@/types/api';
import type { Manager } from './manager.domain';
import type { BackendManagerResponse } from './manager.response';

export function transformManagerResponse(
	backend: BackendManagerResponse,
): Manager {
	return {
		id: backend.manager_id,
		accountId: backend.account_id,
		name: `${backend.first_name} ${backend.last_name}`,
		firstName: backend.first_name,
		lastName: backend.last_name,
		email: backend.email,
		phone: backend.phone,
		gender: backend.gender,
		isActive: backend.account?.is_active ?? true,
		createdAt: new Date(backend.created_at),
		updatedAt: new Date(backend.updated_at),
		permissions: ['MANAGE_USERS', 'MANAGE_ORDERS', 'MANAGE_PRODUCTS'],
		username: backend.account?.username,
		lastLogin: backend.account?.last_login
			? new Date(backend.account.last_login)
			: undefined,
		role: transformRole(backend.account?.role),
	};
}
