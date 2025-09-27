// Pure transformer functions for Employee

import { transformRole } from '@/types/api';
import type { Employee } from './employee.domain';
import type { BackendEmployeeResponse } from './employee.response';

export function transformEmployeeResponse(
	backend: BackendEmployeeResponse,
): Employee {
	return {
		id: backend.employee_id,
		accountId: backend.account_id,
		name: `${backend.first_name} ${backend.last_name}`,
		firstName: backend.first_name,
		lastName: backend.last_name,
		email: backend.email,
		phone: backend.phone,
		position: backend.position,
		createdAt: new Date(backend.created_at),
		updatedAt: new Date(backend.updated_at),
		username: backend.account?.username,
		lastLogin: backend.account?.last_login
			? new Date(backend.account.last_login)
			: undefined,
		role: transformRole(backend.account?.role),
	};
}
