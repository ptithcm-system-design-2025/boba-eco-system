// Raw backend transport types for Product module (snake_case). Keep 1:1 with backend.

export interface BackendProductSizeResponse {
	/** size_id from backend */
	size_id: number;
	name: string;
	unit: string;
	quantity: number;
	description?: string;
	created_at: string;
	updated_at: string;
	product_price?: BackendProductPriceResponse[];
}

export interface BackendProductPriceResponse {
	product_price_id: number;
	product_id: number;
	size_id: number;
	price: number;
	is_active: boolean;
	created_at: string;
	updated_at: string;
	product?: BackendProductResponse;
	product_size?: BackendProductSizeResponse;
}

export interface BackendProductResponse {
	product_id: number;
	category_id?: number;
	name: string;
	description?: string;
	is_signature?: boolean;
	image_path?: string;
	created_at: string;
	updated_at: string;
	category?: BackendCategoryResponse;
	product_price?: BackendProductPriceResponse[];
}

// Minimal category response to allow nested mapping without import cycles
export interface BackendCategoryResponse {
	category_id: number;
	name: string;
	description?: string;
	created_at: string;
	updated_at: string;
}
