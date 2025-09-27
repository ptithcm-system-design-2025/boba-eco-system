import { apiClient } from '@/lib/api-client';
import {
	extractJSendData,
	transformJSendPaginatedResponse,
} from '@/lib/utils/jsend';
import {
	type BulkDeleteCategoryFormData,
	type CreateCategoryFormData,
	transformCreateCategoryFormData,
	transformUpdateCategoryFormData,
	type UpdateCategoryFormData,
} from '@/lib/validations/category';
import {
	type BackendCategoryResponse,
	type Category,
	transformCategoryResponse,
} from '@/types/category';
import type { BulkDeleteResponse, PaginatedResponse } from '@/types/common';
import type {
	JSendPaginatedSuccess,
	JSendSuccess,
} from '@/types/protocol/jsend';

/**
 * Category Service
 * Xử lý tất cả API calls liên quan đến categories
 */
export class CategoryService {
	private readonly endpoint = '/categories';

	/**
	 * Lấy danh sách categories với pagination
	 */
	async getAll(params?: {
		page?: number;
		limit?: number;
		search?: string;
	}): Promise<PaginatedResponse<Category>> {
		const jsendResponse = await apiClient.get<
			JSendPaginatedSuccess<BackendCategoryResponse>
		>(this.endpoint, params);

		// Transform JSend paginated response to frontend format
		const paginatedData =
			transformJSendPaginatedResponse<BackendCategoryResponse>(
				jsendResponse,
			);

		return {
			data: paginatedData.data.map(transformCategoryResponse),
			total: paginatedData.total,
			page: paginatedData.page,
			limit: paginatedData.limit,
			totalPages: paginatedData.totalPages,
		};
	}

	/**
	 * Lấy category theo ID
	 */
	async getById(id: number): Promise<Category> {
		const jsendResponse = await apiClient.get<
			JSendSuccess<BackendCategoryResponse>
		>(`${this.endpoint}/${id}`);
		const backendResponse = extractJSendData(jsendResponse);
		return transformCategoryResponse(backendResponse);
	}

	/**
	 * Tạo category mới
	 */
	async create(formData: CreateCategoryFormData): Promise<Category> {
		const backendData = transformCreateCategoryFormData(formData);
		const jsendResponse = await apiClient.post<
			JSendSuccess<BackendCategoryResponse>
		>(this.endpoint, backendData);
		const backendResponse = extractJSendData(jsendResponse);
		return transformCategoryResponse(backendResponse);
	}

	/**
	 * Cập nhật category
	 */
	async update(
		id: number,
		formData: UpdateCategoryFormData,
	): Promise<Category> {
		const backendData = transformUpdateCategoryFormData(formData);
		const jsendResponse = await apiClient.patch<
			JSendSuccess<BackendCategoryResponse>
		>(`${this.endpoint}/${id}`, backendData);
		const backendResponse = extractJSendData(jsendResponse);
		return transformCategoryResponse(backendResponse);
	}

	/**
	 * Xóa category
	 */
	async delete(id: number): Promise<void> {
		const jsendResponse = await apiClient.delete<JSendSuccess<void>>(
			`${this.endpoint}/${id}`,
		);
		extractJSendData(jsendResponse);
	}

	/**
	 * Xóa nhiều categories
	 */
	async bulkDelete(
		formData: BulkDeleteCategoryFormData,
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
		>(`${this.endpoint}/admin/test`);
		return extractJSendData(jsendResponse);
	}

	/**
	 * Lấy thống kê categories
	 */
	async getStats(): Promise<{
		total: number;
		withProducts: number;
		withoutProducts: number;
		recentlyCreated: number;
	}> {
		const jsendResponse = await apiClient.get<
			JSendSuccess<{
				total: number;
				withProducts: number;
				withoutProducts: number;
				recentlyCreated: number;
			}>
		>(`${this.endpoint}/stats`);
		return extractJSendData(jsendResponse);
	}
}

// Export singleton instance
export const categoryService = new CategoryService();
