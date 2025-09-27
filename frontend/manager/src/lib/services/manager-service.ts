import { apiClient } from '@/lib/api-client';
import {
	extractJSendData,
	transformJSendPaginatedResponse,
} from '@/lib/utils/jsend';
import {
	type BulkDeleteManagerFormData,
	type CreateManagerFormData,
	transformCreateManagerFormData,
	transformUpdateManagerFormData,
	type UpdateManagerFormData,
} from '@/lib/validations/manager';
import type { BulkDeleteResponse, PaginatedResponse } from '@/types/common';
import {
	type BackendManagerResponse,
	type Manager,
	transformManagerResponse,
} from '@/types/manager';

import type {
	JSendPaginatedSuccess,
	JSendSuccess,
} from '@/types/protocol/jsend';

/**
 * Manager Service
 * Xử lý tất cả API calls liên quan đến managers với JSend response format
 */
export class ManagerService {
	private readonly endpoint = '/managers';

	/**
	 * Lấy danh sách managers với pagination
	 */
	async getAll(params?: {
		page?: number;
		limit?: number;
		search?: string;
		isActive?: boolean;
	}): Promise<PaginatedResponse<Manager>> {
		const jsendResponse = await apiClient.get<
			JSendPaginatedSuccess<BackendManagerResponse>
		>(this.endpoint, params);

		// Transform JSend paginated response to frontend format
		const paginatedData =
			transformJSendPaginatedResponse<BackendManagerResponse>(
				jsendResponse,
			);

		return {
			data: paginatedData.data.map(transformManagerResponse),
			total: paginatedData.total,
			page: paginatedData.page,
			limit: paginatedData.limit,
			totalPages: paginatedData.totalPages,
		};
	}

	/**
	 * Lấy manager theo ID
	 */
	async getById(id: number): Promise<Manager> {
		const jsendResponse = await apiClient.get<
			JSendSuccess<BackendManagerResponse>
		>(`${this.endpoint}/${id}`);
		const backendResponse = extractJSendData(jsendResponse);
		return transformManagerResponse(backendResponse);
	}

	/**
	 * Lấy manager theo email
	 */
	async getByEmail(email: string): Promise<Manager> {
		const jsendResponse = await apiClient.get<
			JSendSuccess<BackendManagerResponse>
		>(`${this.endpoint}/email/${email}`);
		const backendResponse = extractJSendData(jsendResponse);
		return transformManagerResponse(backendResponse);
	}

	/**
	 * Tạo manager mới
	 */
	async create(formData: CreateManagerFormData): Promise<Manager> {
		const backendData = transformCreateManagerFormData(formData);
		const jsendResponse = await apiClient.post<
			JSendSuccess<BackendManagerResponse>
		>(this.endpoint, backendData);
		const backendResponse = extractJSendData(jsendResponse);
		return transformManagerResponse(backendResponse);
	}

	/**
	 * Cập nhật manager
	 */
	async update(
		id: number,
		formData: UpdateManagerFormData,
	): Promise<Manager> {
		const backendData = transformUpdateManagerFormData(formData);
		const jsendResponse = await apiClient.patch<
			JSendSuccess<BackendManagerResponse>
		>(`${this.endpoint}/${id}`, backendData);
		const backendResponse = extractJSendData(jsendResponse);
		return transformManagerResponse(backendResponse);
	}

	/**
	 * Xóa manager
	 */
	async delete(id: number): Promise<void> {
		const jsendResponse = await apiClient.delete<JSendSuccess<void>>(
			`${this.endpoint}/${id}`,
		);
		extractJSendData(jsendResponse);
	}

	/**
	 * Xóa nhiều managers
	 */
	async bulkDelete(
		formData: BulkDeleteManagerFormData,
	): Promise<BulkDeleteResponse> {
		const jsendResponse = await apiClient.delete<
			JSendSuccess<BulkDeleteResponse>
		>(`${this.endpoint}/bulk`, formData);
		return extractJSendData(jsendResponse);
	}

	/**
	 * Test API connection
	 */
	async ping(): Promise<{ message: string }> {
		const jsendResponse = await apiClient.get<
			JSendSuccess<{ message: string }>
		>(`${this.endpoint}/test/ping`);
		return extractJSendData(jsendResponse);
	}

	/**
	 * Lấy thống kê managers
	 */
	async getStats(): Promise<{
		total: number;
		active: number;
		inactive: number;
		recentlyCreated: number;
	}> {
		const jsendResponse = await apiClient.get<
			JSendSuccess<{
				total: number;
				active: number;
				inactive: number;
				recentlyCreated: number;
			}>
		>(`${this.endpoint}/stats`);
		return extractJSendData(jsendResponse);
	}
}

// Export singleton instance
export const managerService = new ManagerService();
