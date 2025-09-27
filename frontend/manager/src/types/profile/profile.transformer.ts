// Transform backend profile transport to domain model

import type { Profile } from './profile.domain';
import type { BackendProfileResponse } from './profile.response';

export function transformProfileResponse(
	backendProfile: BackendProfileResponse,
): Profile {
	return {
		accountId: backendProfile.account_id,
		username: backendProfile.username,
		roleId: backendProfile.role_id,
		roleName: backendProfile.role_name,
		isActive: backendProfile.is_active,
		isLocked: backendProfile.is_locked,
		lastLogin: backendProfile.last_login
			? new Date(backendProfile.last_login)
			: undefined,
		createdAt: new Date(backendProfile.created_at),
		profile: backendProfile.profile
			? {
					id:
						backendProfile.profile.manager_id ||
						backendProfile.profile.employee_id ||
						backendProfile.profile.customer_id,
					lastName: backendProfile.profile.last_name,
					firstName: backendProfile.profile.first_name,
					name: `${backendProfile.profile.first_name} ${backendProfile.profile.last_name}`,
					email: backendProfile.profile.email,
					phone: backendProfile.profile.phone,
					gender: backendProfile.profile.gender,
					position: backendProfile.profile.position,
					currentPoints: backendProfile.profile.current_points,
					membershipTypeId: backendProfile.profile.membership_type_id,
				}
			: undefined,
	};
}
