import { apiClient } from '@/lib/api-client';
import {
	extractJSendData,
	transformJSendPaginatedResponse,
} from '@/lib/utils/jsend';
import {
	type BulkDeleteProductFormData,
	type CreateProductFormData,
	type CreateProductPriceFormData,
	transformCreateProductFormData,
	transformUpdateProductFormData,
	type UpdateProductFormData,
	type UpdateProductPriceFormData,
} from '@/lib/validations/product';
import type { BulkDeleteResponse, PaginatedResponse } from '@/types/common';
import {
	type BackendProductPriceResponse,
	type BackendProductResponse,
	type Product,
	type ProductPrice,
	transformProductPriceResponse,
	transformProductResponse,
} from '@/types/product';
import type {
	JSendPaginatedSuccess,
	JSendSuccess,
} from '@/types/protocol/jsend';

/**
 * Product Service
 * Xử lý tất cả API calls liên quan đến products với JSend response format
 */
export class ProductService {
	private readonly endpoint = '/products';

	/**
	 * Lấy danh sách products với pagination
	 */
	async getAll(params?: {
		page?: number;
		limit?: number;
		search?: string;
		category_id?: number;
		is_signature?: boolean;
	}): Promise<PaginatedResponse<Product>> {
		const jsendResponse = await apiClient.get<
			JSendPaginatedSuccess<BackendProductResponse>
		>(this.endpoint, params);

		// Transform JSend paginated response to frontend format
		const paginatedData =
			transformJSendPaginatedResponse<BackendProductResponse>(
				jsendResponse,
			);

		return {
			data: paginatedData.data.map(transformProductResponse),
			total: paginatedData.total,
			page: paginatedData.page,
			limit: paginatedData.limit,
			totalPages: paginatedData.totalPages,
		};
	}

	/**
	 * Lấy product theo ID
	 */
	async getById(id: number): Promise<Product> {
		const jsendResponse = await apiClient.get<
			JSendSuccess<BackendProductResponse>
		>(`${this.endpoint}/${id}`);
		const backendResponse = extractJSendData(jsendResponse);
		return transformProductResponse(backendResponse);
	}

	/**
	 * Lấy products theo category ID
	 */
	async getByCategory(
		categoryId: number,
		params?: {
			page?: number;
			limit?: number;
			search?: string;
		},
	): Promise<PaginatedResponse<Product>> {
		const jsendResponse = await apiClient.get<
			JSendPaginatedSuccess<BackendProductResponse>
		>(`${this.endpoint}/category/${categoryId}`, params);

		// Transform JSend paginated response to frontend format
		const paginatedData =
			transformJSendPaginatedResponse<BackendProductResponse>(
				jsendResponse,
			);

		return {
			data: paginatedData.data.map(transformProductResponse),
			total: paginatedData.total,
			page: paginatedData.page,
			limit: paginatedData.limit,
			totalPages: paginatedData.totalPages,
		};
	}

	/**
	 * Tạo product mới
	 */
	async create(formData: CreateProductFormData): Promise<Product> {
		const backendData = transformCreateProductFormData(formData);
		const jsendResponse = await apiClient.post<
			JSendSuccess<BackendProductResponse>
		>(this.endpoint, backendData);
		const backendResponse = extractJSendData(jsendResponse);
		return transformProductResponse(backendResponse);
	}

	/**
	 * Cập nhật product
	 */
	async update(
		id: number,
		formData: UpdateProductFormData,
	): Promise<Product> {
		const backendData = transformUpdateProductFormData(formData);
		const jsendResponse = await apiClient.patch<
			JSendSuccess<BackendProductResponse>
		>(`${this.endpoint}/${id}`, backendData);
		const backendResponse = extractJSendData(jsendResponse);
		return transformProductResponse(backendResponse);
	}

	/**
	 * Xóa product
	 */
	async delete(id: number): Promise<void> {
		const jsendResponse = await apiClient.delete<JSendSuccess<void>>(
			`${this.endpoint}/${id}`,
		);
		extractJSendData(jsendResponse);
	}

	/**
	 * Xóa nhiều products
	 */
	async bulkDelete(
		formData: BulkDeleteProductFormData,
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
	 * Lấy thống kê products
	 */
	async getStats(): Promise<{
		total: number;
		signature: number;
		withCategory: number;
		withoutCategory: number;
		recentlyCreated: number;
	}> {
		const jsendResponse = await apiClient.get<
			JSendSuccess<{
				total: number;
				signature: number;
				withCategory: number;
				withoutCategory: number;
				recentlyCreated: number;
			}>
		>(`${this.endpoint}/stats`);
		return extractJSendData(jsendResponse);
	}

	/**
	 * Upload product image
	 */
	async uploadImage(file: File): Promise<{ image_path: string }> {
		const formData = new FormData();
		formData.append('image', file);

		const jsendResponse = await apiClient.post<
			JSendSuccess<{ image_path: string }>
		>(`${this.endpoint}/upload-image`, formData);
		return extractJSendData(jsendResponse);
	}

	// === PRODUCT PRICE MANAGEMENT ===

	/**
	 * Lấy danh sách giá của sản phẩm
	 */
	async getProductPrices(productId: number): Promise<ProductPrice[]> {
		const jsendResponse = await apiClient.get<
			JSendSuccess<BackendProductPriceResponse[]>
		>(`${this.endpoint}/${productId}/prices`);
		const backendResponse = extractJSendData(jsendResponse);
		return backendResponse.map(transformProductPriceResponse);
	}

	/**
	 * Tạo giá mới cho sản phẩm
	 */
	async createProductPrice(
		formData: CreateProductPriceFormData,
	): Promise<ProductPrice> {
		const jsendResponse = await apiClient.post<
			JSendSuccess<BackendProductPriceResponse>
		>(`${this.endpoint}/prices`, formData);
		const backendResponse = extractJSendData(jsendResponse);
		return transformProductPriceResponse(backendResponse);
	}

	/**
	 * Cập nhật giá sản phẩm
	 */
	async updateProductPrice(
		priceId: number,
		formData: UpdateProductPriceFormData,
	): Promise<ProductPrice> {
		const jsendResponse = await apiClient.patch<
			JSendSuccess<BackendProductPriceResponse>
		>(`${this.endpoint}/prices/${priceId}`, formData);
		const backendResponse = extractJSendData(jsendResponse);
		return transformProductPriceResponse(backendResponse);
	}

	/**
	 * Xóa giá sản phẩm
	 */
	async deleteProductPrice(priceId: number): Promise<void> {
		const jsendResponse = await apiClient.delete<JSendSuccess<void>>(
			`${this.endpoint}/prices/${priceId}`,
		);
		extractJSendData(jsendResponse);
	}

	/**
	 * Xóa nhiều giá sản phẩm
	 */
	async bulkDeleteProductPrices(
		priceIds: number[],
	): Promise<BulkDeleteResponse> {
		const jsendResponse = await apiClient.delete<
			JSendSuccess<BulkDeleteResponse>
		>(`${this.endpoint}/prices/bulk`, { ids: priceIds });
		return extractJSendData(jsendResponse);
	}
}

// Export singleton instance
export const productService = new ProductService();
