import { apiClient } from '@/lib/api-client';
import {
	extractJSendData,
	transformJSendPaginatedResponse,
} from '@/lib/utils/jsend';
import {
	type BulkDeleteEmployeeFormData,
	type CreateEmployeeFormData,
	transformCreateEmployeeFormData,
	transformUpdateEmployeeFormData,
	type UpdateEmployeeFormData,
} from '@/lib/validations/employee';
import type { BulkDeleteResponse, PaginatedResponse } from '@/types/common';
import {
	type BackendEmployeeResponse,
	type Employee,
	transformEmployeeResponse,
} from '@/types/employee';
import type {
	JSendPaginatedSuccess,
	JSendSuccess,
} from '@/types/protocol/jsend';

/**
 * Employee Service
 * Xử lý tất cả API calls liên quan đến employees với JSend response format
 */
export class EmployeeService {
	private readonly endpoint = '/employees';

	/**
	 * Lấy danh sách employees với pagination
	 */
	async getAll(params?: {
		page?: number;
		limit?: number;
		search?: string;
		isActive?: boolean;
	}): Promise<PaginatedResponse<Employee>> {
		const jsendResponse = await apiClient.get<
			JSendPaginatedSuccess<BackendEmployeeResponse>
		>(this.endpoint, params);

		// Transform JSend paginated response to frontend format
		const paginatedData =
			transformJSendPaginatedResponse<BackendEmployeeResponse>(
				jsendResponse,
			);

		return {
			data: paginatedData.data.map(transformEmployeeResponse),
			total: paginatedData.total,
			page: paginatedData.page,
			limit: paginatedData.limit,
			totalPages: paginatedData.totalPages,
		};
	}

	/**
	 * Lấy employee theo ID
	 */
	async getById(id: number): Promise<Employee> {
		const jsendResponse = await apiClient.get<
			JSendSuccess<BackendEmployeeResponse>
		>(`${this.endpoint}/${id}`);
		const backendResponse = extractJSendData(jsendResponse);
		return transformEmployeeResponse(backendResponse);
	}

	/**
	 * Lấy employee theo email
	 */
	async getByEmail(email: string): Promise<Employee> {
		const jsendResponse = await apiClient.get<
			JSendSuccess<BackendEmployeeResponse>
		>(`${this.endpoint}/email/${email}`);
		const backendResponse = extractJSendData(jsendResponse);
		return transformEmployeeResponse(backendResponse);
	}

	/**
	 * Tạo employee mới
	 */
	async create(formData: CreateEmployeeFormData): Promise<Employee> {
		const backendData = transformCreateEmployeeFormData(formData);
		const jsendResponse = await apiClient.post<
			JSendSuccess<BackendEmployeeResponse>
		>(this.endpoint, backendData);
		const backendResponse = extractJSendData(jsendResponse);
		return transformEmployeeResponse(backendResponse);
	}

	/**
	 * Cập nhật employee
	 */
	async update(
		id: number,
		formData: UpdateEmployeeFormData,
	): Promise<Employee> {
		const backendData = transformUpdateEmployeeFormData(formData);
		const jsendResponse = await apiClient.patch<
			JSendSuccess<BackendEmployeeResponse>
		>(`${this.endpoint}/${id}`, backendData);
		const backendResponse = extractJSendData(jsendResponse);
		return transformEmployeeResponse(backendResponse);
	}

	/**
	 * Xóa employee
	 */
	async delete(id: number): Promise<void> {
		const jsendResponse = await apiClient.delete<JSendSuccess<void>>(
			`${this.endpoint}/${id}`,
		);
		extractJSendData(jsendResponse);
	}

	/**
	 * Xóa nhiều employees
	 */
	async bulkDelete(
		formData: BulkDeleteEmployeeFormData,
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
	 * Lấy thống kê employees
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
export const employeeService = new EmployeeService();
