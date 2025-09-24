import {
	type CanActivate,
	type ExecutionContext,
	Injectable,
} from '@nestjs/common'
import type { Reflector } from '@nestjs/core'
import { ROLE_HIERARCHY, type RoleType } from '../constants/roles.constant'
import { ROLES_KEY } from '../decorators/roles.decorator'

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const requiredRoles = this.reflector.getAllAndOverride<RoleType[]>(
			ROLES_KEY,
			[context.getHandler(), context.getClass()]
		)

		if (!requiredRoles) {
			return true
		}

		const { user } = context.switchToHttp().getRequest()

		if (!user || !user.role_name) {
			return false
		}

		const userRole = user.role_name as RoleType
		const allowedRoles = ROLE_HIERARCHY[userRole] || [userRole]

		return requiredRoles.some((requiredRole) =>
			allowedRoles.includes(requiredRole)
		)
	}
}
