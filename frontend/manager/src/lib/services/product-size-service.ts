import { apiClient } from '@/lib/api-client';
import {
	extractJSendData,
	transformJSendPaginatedResponse,
} from '@/lib/utils/jsend';
import type {
	BulkDeleteProductSizeFormData,
	CreateProductSizeFormData,
	UpdateProductSizeFormData,
} from '@/lib/validations/product-size';
import type { BulkDeleteResponse } from '@/types/common';
import {
	type BackendProductSizeResponse,
	type ProductSize,
	transformProductSize,
} from '@/types/product';
import type {
	JSendPaginatedSuccess,
	JSendSuccess,
} from '@/types/protocol/jsend';

export interface ProductSizeQueryParams {
	page?: number;
	limit?: number;
	search?: string;
}

export interface PaginatedProductSizeResponse {
	data: ProductSize[];
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}

class ProductSizeService {
	private readonly baseUrl = '/product-sizes';

	async getAll(
		params?: ProductSizeQueryParams,
	): Promise<PaginatedProductSizeResponse> {
		const searchParams = new URLSearchParams();

		if (params?.page) searchParams.append('page', params.page.toString());
		if (params?.limit)
			searchParams.append('limit', params.limit.toString());
		if (params?.search) searchParams.append('search', params.search);

		const jsendResponse = await apiClient.get<
			JSendPaginatedSuccess<ProductSize>
		>(`${this.baseUrl}?${searchParams.toString()}`);

		const paginatedData =
			transformJSendPaginatedResponse<BackendProductSizeResponse>(
				jsendResponse,
			);

		return {
			data: paginatedData.data.map(transformProductSize),
			page: paginatedData.page,
			limit: paginatedData.limit,
			total: paginatedData.total,
			totalPages: paginatedData.totalPages,
		};
	}

	async getById(id: number): Promise<ProductSize> {
		const jsendResponse = await apiClient.get<
			JSendSuccess<BackendProductSizeResponse>
		>(`${this.baseUrl}/${id}`);
		const response = extractJSendData(jsendResponse);
		return transformProductSize(response);
	}

	async create(data: CreateProductSizeFormData): Promise<ProductSize> {
		const jsendResponse = await apiClient.post<
			JSendSuccess<BackendProductSizeResponse>
		>(this.baseUrl, data);
		const response = extractJSendData(jsendResponse);
		return transformProductSize(response);
	}

	async update(
		id: number,
		data: UpdateProductSizeFormData,
	): Promise<ProductSize> {
		const jsendResponse = await apiClient.patch<
			JSendSuccess<BackendProductSizeResponse>
		>(`${this.baseUrl}/${id}`, data);
		const response = extractJSendData(jsendResponse);
		return transformProductSize(response);
	}

	async delete(id: number): Promise<void> {
		const jsendResponse = await apiClient.delete<JSendSuccess<void>>(
			`${this.baseUrl}/${id}`,
		);
		extractJSendData(jsendResponse);
	}

	async bulkDelete(
		data: BulkDeleteProductSizeFormData,
	): Promise<BulkDeleteResponse> {
		const jsendResponse = await apiClient.post<
			JSendSuccess<BulkDeleteResponse>
		>(`${this.baseUrl}/bulk-delete`, data);
		return extractJSendData(jsendResponse);
	}

	async getProductPricesBySize(
		sizeId: number,
		params?: ProductSizeQueryParams,
	): Promise<unknown> {
		const searchParams = new URLSearchParams();

		if (params?.page) searchParams.append('page', params.page.toString());
		if (params?.limit)
			searchParams.append('limit', params.limit.toString());

		const jsendResponse = await apiClient.get<JSendSuccess<unknown>>(
			`${this.baseUrl}/${sizeId}/product-prices?${searchParams.toString()}`,
		);

		return extractJSendData(jsendResponse);
	}
}

export const productSizeService = new ProductSizeService();
