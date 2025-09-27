import { apiClient } from '@/lib/api-client';
import {
	extractJSendData,
	transformJSendPaginatedResponse,
} from '@/lib/utils/jsend';
import type { PaginatedResponse } from '@/types/common';
import {
	type BackendOrderResponse,
	type Order,
	transformOrderResponse,
} from '@/types/order';
import type {
	JSendPaginatedSuccess,
	JSendSuccess,
} from '@/types/protocol/jsend';

/**
 * Order Service
 * Xử lý API calls liên quan đến orders
 */
export class OrderService {
	private readonly endpoint = '/orders';

	/**
	 * Lấy danh sách tất cả orders với pagination và filtering
	 */
	async getOrders(params?: {
		page?: number;
		limit?: number;
		customerId?: number;
		employeeId?: number;
		status?: 'PROCESSING' | 'CANCELLED' | 'COMPLETED';
	}): Promise<PaginatedResponse<Order>> {
		const jsendResponse = await apiClient.get<
			JSendPaginatedSuccess<BackendOrderResponse>
		>(this.endpoint, params);

		// Transform JSend paginated response to frontend format
		const paginatedData =
			transformJSendPaginatedResponse<BackendOrderResponse>(
				jsendResponse,
			);

		return {
			data: paginatedData.data.map(transformOrderResponse),
			total: paginatedData.total,
			page: paginatedData.page,
			limit: paginatedData.limit,
			totalPages: paginatedData.totalPages,
		};
	}

	/**
	 * Lấy danh sách orders theo trạng thái
	 */
	async getOrdersByStatus(
		status: 'PROCESSING' | 'CANCELLED' | 'COMPLETED',
		params?: {
			page?: number;
			limit?: number;
		},
	): Promise<PaginatedResponse<Order>> {
		const jsendResponse = await apiClient.get<
			JSendPaginatedSuccess<BackendOrderResponse>
		>(`${this.endpoint}/status/${status}`, params);

		// Transform JSend paginated response to frontend format
		const paginatedData =
			transformJSendPaginatedResponse<BackendOrderResponse>(
				jsendResponse,
			);

		return {
			data: paginatedData.data.map(transformOrderResponse),
			total: paginatedData.total,
			page: paginatedData.page,
			limit: paginatedData.limit,
			totalPages: paginatedData.totalPages,
		};
	}

	/**
	 * Lấy danh sách orders theo employee
	 */
	async getOrdersByEmployee(
		employeeId: number,
		params?: {
			page?: number;
			limit?: number;
		},
	): Promise<PaginatedResponse<Order>> {
		const jsendResponse = await apiClient.get<
			JSendPaginatedSuccess<BackendOrderResponse>
		>(`${this.endpoint}/employee/${employeeId}`, params);

		// Transform JSend paginated response to frontend format
		const paginatedData =
			transformJSendPaginatedResponse<BackendOrderResponse>(
				jsendResponse,
			);

		return {
			data: paginatedData.data.map(transformOrderResponse),
			total: paginatedData.total,
			page: paginatedData.page,
			limit: paginatedData.limit,
			totalPages: paginatedData.totalPages,
		};
	}

	/**
	 * Lấy danh sách orders theo customer
	 */
	async getOrdersByCustomer(
		customerId: number,
		params?: {
			page?: number;
			limit?: number;
		},
	): Promise<PaginatedResponse<Order>> {
		const jsendResponse = await apiClient.get<
			JSendPaginatedSuccess<BackendOrderResponse>
		>(`${this.endpoint}/customer/${customerId}`, params);

		// Transform JSend paginated response to frontend format
		const paginatedData =
			transformJSendPaginatedResponse<BackendOrderResponse>(
				jsendResponse,
			);

		return {
			data: paginatedData.data.map(transformOrderResponse),
			total: paginatedData.total,
			page: paginatedData.page,
			limit: paginatedData.limit,
			totalPages: paginatedData.totalPages,
		};
	}

	/**
	 * Lấy order theo ID với đầy đủ thông tin
	 */
	async getById(id: number): Promise<Order> {
		const jsendResponse = await apiClient.get<
			JSendSuccess<BackendOrderResponse>
		>(`${this.endpoint}/${id}`);
		const backendResponse = extractJSendData(jsendResponse);
		return transformOrderResponse(backendResponse);
	}

	/**
	 * Hủy order
	 */
	async cancelOrder(id: number): Promise<Order> {
		const jsendResponse = await apiClient.patch<
			JSendSuccess<BackendOrderResponse>
		>(`${this.endpoint}/${id}/cancel`);
		const backendResponse = extractJSendData(jsendResponse);
		return transformOrderResponse(backendResponse);
	}

	/**
	 * Xóa order (chỉ Manager)
	 */
	async deleteOrder(id: number): Promise<Order> {
		const jsendResponse = await apiClient.delete<
			JSendSuccess<BackendOrderResponse>
		>(`${this.endpoint}/${id}`);
		const backendResponse = extractJSendData(jsendResponse);
		return transformOrderResponse(backendResponse);
	}
}

// Export singleton instance
export const orderService = new OrderService();
