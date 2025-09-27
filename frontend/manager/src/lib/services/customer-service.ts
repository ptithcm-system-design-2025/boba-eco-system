import { apiClient } from '@/lib/api-client';
import {
	extractJSendData,
	transformJSendPaginatedResponse,
} from '@/lib/utils/jsend';
import {
	type BulkDeleteCustomerFormData,
	type CreateCustomerFormData,
	transformCreateCustomerFormData,
	transformUpdateCustomerFormData,
	type UpdateCustomerFormData,
} from '@/lib/validations/customer';
import type { PaginatedResponse } from '@/types/common';
import {
	type BackendCustomerResponse,
	type Customer,
	transformCustomerResponse,
} from '@/types/customer';
import type {
	JSendPaginatedSuccess,
	JSendSuccess,
} from '@/types/protocol/jsend';

/**
 * Customer Service
 * Xử lý tất cả API calls liên quan đến customers với JSend response format
 */
export class CustomerService {
	private readonly endpoint = '/customers';

	/**
	 * Lấy danh sách customers với pagination
	 */
	async getAll(params?: {
		page?: number;
		limit?: number;
		search?: string;
	}): Promise<PaginatedResponse<Customer>> {
		const jsendResponse = await apiClient.get<
			JSendPaginatedSuccess<BackendCustomerResponse>
		>(this.endpoint, params);

		// Transform JSend paginated response to frontend format
		const paginatedData =
			transformJSendPaginatedResponse<BackendCustomerResponse>(
				jsendResponse,
			);

		return {
			data: paginatedData.data.map(transformCustomerResponse),
			total: paginatedData.total,
			page: paginatedData.page,
			limit: paginatedData.limit,
			totalPages: paginatedData.totalPages,
		};
	}

	/**
	 * Lấy customer theo ID
	 */
	async getById(id: number): Promise<Customer> {
		const jsendResponse = await apiClient.get<
			JSendSuccess<BackendCustomerResponse>
		>(`${this.endpoint}/${id}`);
		const backendResponse = extractJSendData(jsendResponse);
		return transformCustomerResponse(backendResponse);
	}

	/**
	 * Lấy customer theo phone
	 */
	async getByPhone(phone: string): Promise<Customer> {
		const jsendResponse = await apiClient.get<
			JSendSuccess<BackendCustomerResponse>
		>(`${this.endpoint}/phone/${phone}`);
		const backendResponse = extractJSendData(jsendResponse);
		return transformCustomerResponse(backendResponse);
	}

	/**
	 * Lấy customers theo membership type
	 */
	async getByMembershipType(
		membershipTypeId: number,
		params?: {
			page?: number;
			limit?: number;
		},
	): Promise<PaginatedResponse<Customer>> {
		const jsendResponse = await apiClient.get<
			JSendPaginatedSuccess<BackendCustomerResponse>
		>(`${this.endpoint}/membership-type/${membershipTypeId}`, params);

		const paginatedData =
			transformJSendPaginatedResponse<BackendCustomerResponse>(
				jsendResponse,
			);

		return {
			data: paginatedData.data.map(transformCustomerResponse),
			total: paginatedData.total,
			page: paginatedData.page,
			limit: paginatedData.limit,
			totalPages: paginatedData.totalPages,
		};
	}

	/**
	 * Tạo customer mới
	 */
	async create(formData: CreateCustomerFormData): Promise<Customer> {
		const backendData = transformCreateCustomerFormData(formData);
		const jsendResponse = await apiClient.post<
			JSendSuccess<BackendCustomerResponse>
		>(this.endpoint, backendData);
		const backendResponse = extractJSendData(jsendResponse);
		return transformCustomerResponse(backendResponse);
	}

	/**
	 * Cập nhật customer
	 */
	async update(
		id: number,
		formData: UpdateCustomerFormData,
	): Promise<Customer> {
		const backendData = transformUpdateCustomerFormData(formData);
		const jsendResponse = await apiClient.patch<
			JSendSuccess<BackendCustomerResponse>
		>(`${this.endpoint}/${id}`, backendData);
		const backendResponse = extractJSendData(jsendResponse);
		return transformCustomerResponse(backendResponse);
	}

	/**
	 * Xóa customer
	 */
	async delete(id: number): Promise<void> {
		const jsendResponse = await apiClient.delete<JSendSuccess<void>>(
			`${this.endpoint}/${id}`,
		);
		extractJSendData(jsendResponse);
	}

	/**
	 * Bulk delete customers
	 */
	async bulkDelete(formData: BulkDeleteCustomerFormData): Promise<{
		deleted: number[];
		failed: { id: number; reason: string }[];
		summary: { total: number; success: number; failed: number };
	}> {
		const jsendResponse = await apiClient.delete<
			JSendSuccess<{
				deleted: number[];
				failed: { id: number; reason: string }[];
				summary: { total: number; success: number; failed: number };
			}>
		>(`${this.endpoint}/bulk`, {
			ids: formData.ids,
		});
		return extractJSendData(jsendResponse);
	}

	/**
	 * Test customer controller
	 */
	async test(): Promise<{ message: string }> {
		const jsendResponse = await apiClient.get<
			JSendSuccess<{ message: string }>
		>(`${this.endpoint}/test/ping`);
		return extractJSendData(jsendResponse);
	}
}

// Export singleton instance
export const customerService = new CustomerService();
