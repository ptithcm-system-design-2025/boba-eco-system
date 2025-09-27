// Common shared types used across services and stores

// UI-level pagination type (camelCase)
export interface PaginatedResponse<T> {
	data: T[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

// Bulk delete transport/domain type (already camelCase for convenience)
export interface BulkDeleteResponse {
	summary: {
		success: number;
		failed: number;
	};
	details: Array<{
		id: number;
		success: boolean;
		error?: string;
	}>;
}
