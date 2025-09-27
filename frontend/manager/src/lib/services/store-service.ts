import {
	extractJSendData,
	transformJSendPaginatedResponse,
} from '@/lib/utils/jsend';
import type {
	JSendPaginatedSuccess,
	JSendSuccess,
} from '@/types/protocol/jsend';
import {
	type BackendStoreResponse,
	type CreateStoreDto,
	type Store,
	transformStoreResponse,
	type UpdateStoreDto,
} from '@/types/store';
import { apiClient } from '../api-client';

class StoreService {
	/**
	 * Lấy thông tin cửa hàng mặc định
	 */
	async getDefaultStore(): Promise<Store> {
		try {
			const jsendResponse =
				await apiClient.get<JSendSuccess<BackendStoreResponse>>(
					'/stores/default',
				);
			const response = extractJSendData(jsendResponse);
			return transformStoreResponse(response);
		} catch (error) {
			console.error('Lỗi lấy thông tin cửa hàng mặc định:', error);
			throw error;
		}
	}

	/**
	 * Lấy thông tin cửa hàng theo ID
	 */
	async getStoreById(id: number): Promise<Store> {
		try {
			const jsendResponse = await apiClient.get<
				JSendSuccess<BackendStoreResponse>
			>(`/stores/${id}`);
			const response = extractJSendData(jsendResponse);
			return transformStoreResponse(response);
		} catch (error) {
			console.error('Lỗi lấy thông tin cửa hàng:', error);
			throw error;
		}
	}

	/**
	 * Lấy danh sách tất cả cửa hàng với pagination
	 */
	async getAllStores(
		page = 1,
		limit = 10,
	): Promise<{
		stores: Store[];
		pagination: {
			page: number;
			limit: number;
			total: number;
			totalPages: number;
			hasNext: boolean;
			hasPrev: boolean;
		};
	}> {
		try {
			const jsendResponse = await apiClient.get<
				JSendPaginatedSuccess<BackendStoreResponse>
			>('/stores', { page, limit });

			const paginatedData =
				transformJSendPaginatedResponse<BackendStoreResponse>(
					jsendResponse,
				);

			return {
				stores: paginatedData.data.map(transformStoreResponse),
				pagination: {
					page: paginatedData.page,
					limit: paginatedData.limit,
					total: paginatedData.total,
					totalPages: paginatedData.totalPages,
					hasNext: paginatedData.page < paginatedData.totalPages,
					hasPrev: paginatedData.page > 1,
				},
			};
		} catch (error) {
			console.error('Lỗi lấy danh sách cửa hàng:', error);
			throw error;
		}
	}

	/**
	 * Tạo cửa hàng mới
	 */
	async createStore(data: CreateStoreDto): Promise<Store> {
		try {
			const jsendResponse = await apiClient.post<
				JSendSuccess<BackendStoreResponse>
			>('/stores', data);
			const response = extractJSendData(jsendResponse);
			return transformStoreResponse(response);
		} catch (error) {
			console.error('Lỗi tạo cửa hàng:', error);
			throw error;
		}
	}

	/**
	 * Cập nhật thông tin cửa hàng
	 */
	async updateStore(id: number, data: UpdateStoreDto): Promise<Store> {
		try {
			const jsendResponse = await apiClient.patch<
				JSendSuccess<BackendStoreResponse>
			>(`/stores/${id}`, data);
			const response = extractJSendData(jsendResponse);
			return transformStoreResponse(response);
		} catch (error) {
			console.error('Lỗi cập nhật cửa hàng:', error);
			throw error;
		}
	}

	/**
	 * Xóa cửa hàng
	 */
	async deleteStore(id: number): Promise<void> {
		try {
			const jsendResponse = await apiClient.delete<JSendSuccess<void>>(
				`/stores/${id}`,
			);
			extractJSendData(jsendResponse);
		} catch (error) {
			console.error('Lỗi xóa cửa hàng:', error);
			throw error;
		}
	}
}

export const storeService = new StoreService();
