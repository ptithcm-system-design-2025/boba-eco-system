import { apiClient } from '@/lib/api-client';
import {
	extractJSendData,
	transformJSendPaginatedResponse,
} from '@/lib/utils/jsend';
import type { BulkDeleteResponse, PaginatedResponse } from '@/types/common';
import type { CreateDiscountDto, UpdateDiscountDto } from '@/types/discount';
import {
	type BackendDiscountResponse,
	type Discount,
	transformDiscountResponse,
} from '@/types/discount';
import type {
	JSendPaginatedSuccess,
	JSendSuccess,
} from '@/types/protocol/jsend';

/**
 * Discount Service
 * Xử lý tất cả API calls liên quan đến discounts
 */
export class DiscountService {
	private readonly endpoint = '/discounts';

	/**
	 * Lấy danh sách discounts với pagination
	 */
	async getAll(params?: {
		page?: number;
		limit?: number;
		search?: string;
		isActive?: boolean;
	}): Promise<PaginatedResponse<Discount>> {
		const jsendResponse = await apiClient.get<
			JSendPaginatedSuccess<BackendDiscountResponse>
		>(this.endpoint, params);

		// Transform JSend paginated response to frontend format
		const paginatedData =
			transformJSendPaginatedResponse<BackendDiscountResponse>(
				jsendResponse,
			);

		return {
			data: paginatedData.data.map(transformDiscountResponse),
			total: paginatedData.total,
			page: paginatedData.page,
			limit: paginatedData.limit,
			totalPages: paginatedData.totalPages,
		};
	}

	/**
	 * Lấy discount theo ID
	 */
	async getById(id: number): Promise<Discount> {
		const jsendResponse = await apiClient.get<
			JSendSuccess<BackendDiscountResponse>
		>(`${this.endpoint}/${id}`);
		const backendResponse = extractJSendData(jsendResponse);
		return transformDiscountResponse(backendResponse);
	}

	/**
	 * Lấy discount theo coupon code
	 */
	async getByCouponCode(couponCode: string): Promise<Discount> {
		const jsendResponse = await apiClient.get<
			JSendSuccess<BackendDiscountResponse>
		>(`${this.endpoint}/coupon/${couponCode}`);
		const backendResponse = extractJSendData(jsendResponse);
		return transformDiscountResponse(backendResponse);
	}

	/**
	 * Tạo discount mới
	 */
	async create(discountData: CreateDiscountDto): Promise<Discount> {
		const jsendResponse = await apiClient.post<
			JSendSuccess<BackendDiscountResponse>
		>(this.endpoint, discountData);
		const backendResponse = extractJSendData(jsendResponse);
		return transformDiscountResponse(backendResponse);
	}

	/**
	 * Cập nhật discount
	 */
	async update(
		id: number,
		discountData: UpdateDiscountDto,
	): Promise<Discount> {
		const jsendResponse = await apiClient.patch<
			JSendSuccess<BackendDiscountResponse>
		>(`${this.endpoint}/${id}`, discountData);
		const backendResponse = extractJSendData(jsendResponse);
		return transformDiscountResponse(backendResponse);
	}

	/**
	 * Xóa discount
	 */
	async delete(id: number): Promise<void> {
		const jsendResponse = await apiClient.delete<JSendSuccess<void>>(
			`${this.endpoint}/${id}`,
		);
		extractJSendData(jsendResponse);
	}

	/**
	 * Xóa nhiều discount
	 */
	async bulkDelete(ids: number[]): Promise<BulkDeleteResponse> {
		const jsendResponse = await apiClient.delete<
			JSendSuccess<BulkDeleteResponse>
		>(`${this.endpoint}/bulk`, {
			ids: ids,
		});
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
}

// Export singleton instance
export const discountService = new DiscountService();
