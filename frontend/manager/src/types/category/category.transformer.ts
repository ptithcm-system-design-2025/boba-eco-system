// Pure transformers for Category

import { transformProductResponse } from '../product/product.transformer';
import type { Category } from './category.domain';
import type { BackendCategoryResponse } from './category.response';

export function transformCategoryResponse(
	backend: BackendCategoryResponse,
): Category {
	return {
		id: backend.category_id,
		name: backend.name,
		description: backend.description,
		createdAt: new Date(backend.created_at),
		updatedAt: new Date(backend.updated_at),
		products: backend.product
			? backend.product.map(transformProductResponse)
			: undefined,
	};
}
