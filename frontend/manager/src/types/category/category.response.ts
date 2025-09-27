// Raw backend transport types for Category module (snake_case).
export interface BackendCategoryResponse {
	category_id: number;
	name: string;
	description?: string;
	created_at: string;
	updated_at: string;
	product?: import('../product/product.response').BackendProductResponse[];
}
