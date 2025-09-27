import { apiClient } from '@/lib/api-client';
import {
	extractJSendData,
	transformJSendPaginatedResponse,
} from '@/lib/utils/jsend';
import {
	type CreateMembershipTypeFormData,
	transformCreateMembershipTypeFormData,
	transformUpdateMembershipTypeFormData,
	type UpdateMembershipTypeFormData,
} from '@/lib/validations/membership-type';
import type { PaginatedResponse } from '@/types/common';
import {
	type BackendMembershipTypeResponse,
	type MembershipType,
	transformMembershipTypeResponse,
} from '@/types/membership-type';

import type {
	JSendPaginatedSuccess,
	JSendSuccess,
} from '@/types/protocol/jsend';

/**
 * MembershipType Service
 * Xử lý tất cả API calls liên quan đến membership types
 */
export class MembershipTypeService {
	private readonly endpoint = '/membership-types';

	/**
	 * Lấy danh sách membership types với pagination
	 */
	async getAll(params?: {
		page?: number;
		limit?: number;
	}): Promise<PaginatedResponse<MembershipType>> {
		const jsendResponse = await apiClient.get<
			JSendPaginatedSuccess<BackendMembershipTypeResponse>
		>(this.endpoint, params);

		// Transform JSend paginated response to frontend format
		const paginatedData =
			transformJSendPaginatedResponse<BackendMembershipTypeResponse>(
				jsendResponse,
			);

		return {
			data: paginatedData.data.map(transformMembershipTypeResponse),
			total: paginatedData.total,
			page: paginatedData.page,
			limit: paginatedData.limit,
			totalPages: paginatedData.totalPages,
		};
	}

	/**
	 * Lấy membership type theo ID
	 */
	async getById(
		id: number,
		includeCustomers?: boolean,
	): Promise<MembershipType> {
		const params = includeCustomers
			? { includeCustomers: true }
			: undefined;
		const jsendResponse = await apiClient.get<
			JSendSuccess<BackendMembershipTypeResponse>
		>(`${this.endpoint}/${id}`, params);
		const backendResponse = extractJSendData(jsendResponse);
		return transformMembershipTypeResponse(backendResponse);
	}

	/**
	 * Lấy membership type theo type name
	 */
	async getByType(
		type: string,
		includeCustomers?: boolean,
	): Promise<MembershipType> {
		const params = includeCustomers
			? { includeCustomers: true }
			: undefined;
		const jsendResponse = await apiClient.get<
			JSendSuccess<BackendMembershipTypeResponse>
		>(`${this.endpoint}/by-type/${type}`, params);
		const backendResponse = extractJSendData(jsendResponse);
		return transformMembershipTypeResponse(backendResponse);
	}

	/**
	 * Tạo membership type mới
	 */
	async create(
		formData: CreateMembershipTypeFormData,
	): Promise<MembershipType> {
		const backendData = transformCreateMembershipTypeFormData(formData);
		const jsendResponse = await apiClient.post<
			JSendSuccess<BackendMembershipTypeResponse>
		>(this.endpoint, backendData);
		const backendResponse = extractJSendData(jsendResponse);
		return transformMembershipTypeResponse(backendResponse);
	}

	/**
	 * Cập nhật membership type
	 */
	async update(
		id: number,
		formData: UpdateMembershipTypeFormData,
	): Promise<MembershipType> {
		const backendData = transformUpdateMembershipTypeFormData(formData);
		const jsendResponse = await apiClient.patch<
			JSendSuccess<BackendMembershipTypeResponse>
		>(`${this.endpoint}/${id}`, backendData);
		const backendResponse = extractJSendData(jsendResponse);
		return transformMembershipTypeResponse(backendResponse);
	}

	/**
	 * Xóa membership type
	 */
	async delete(id: number): Promise<void> {
		const jsendResponse = await apiClient.delete<JSendSuccess<void>>(
			`${this.endpoint}/${id}`,
		);
		extractJSendData(jsendResponse);
	}
}

// Export singleton instance
export const membershipTypeService = new MembershipTypeService();
