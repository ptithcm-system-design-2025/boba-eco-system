// Transform backend store transport to domain model

import type { Store } from './store.domain';
import type { BackendStoreResponse } from './store.response';

export function transformStoreResponse(
	backendStore: BackendStoreResponse,
): Store {
	return {
		id: backendStore.store_id,
		name: backendStore.name,
		address: backendStore.address,
		phone: backendStore.phone,
		openingTime: backendStore.opening_time,
		closingTime: backendStore.closing_time,
		email: backendStore.email,
		openingDate: new Date(backendStore.opening_date),
		taxCode: backendStore.tax_code,
		createdAt: new Date(backendStore.created_at),
		updatedAt: new Date(backendStore.updated_at),
	};
}
