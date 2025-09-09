export const ROLES = {
  MANAGER: 'MANAGER',
  STAFF: 'STAFF',
  CUSTOMER: 'CUSTOMER',
} as const;

export type RoleType = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_HIERARCHY: Record<RoleType, RoleType[]> = {
  [ROLES.MANAGER]: [ROLES.MANAGER, ROLES.STAFF, ROLES.CUSTOMER],
  [ROLES.STAFF]: [ROLES.STAFF, ROLES.CUSTOMER],
  [ROLES.CUSTOMER]: [ROLES.CUSTOMER],
};
