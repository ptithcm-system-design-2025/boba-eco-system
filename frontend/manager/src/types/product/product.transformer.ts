// Pure transform functions between transport and domain for Product module.
// Only here do we convert snake_case <-> camelCase and string dates <-> Date.

import type { Category } from '../category/category.domain';
import type { Product, ProductPrice, ProductSize } from './product.domain';
import type {
	BackendCategoryResponse,
	BackendProductPriceResponse,
	BackendProductResponse,
	BackendProductSizeResponse,
} from './product.response';

export function transformProductSize(
	backend: BackendProductSizeResponse,
): ProductSize {
	return {
		id: backend.size_id,
		name: backend.name,
		unit: backend.unit,
		quantity: backend.quantity,
		description: backend.description,
		createdAt: new Date(backend.created_at),
		updatedAt: new Date(backend.updated_at),
		productPrices: backend.product_price
			? backend.product_price.map(transformProductPriceResponse)
			: undefined,
	};
}

export function transformProductPriceResponse(
	backend: BackendProductPriceResponse,
): ProductPrice {
	return {
		id: backend.product_price_id,
		productId: backend.product_id,
		sizeId: backend.size_id,
		price: backend.price,
		isActive: backend.is_active,
		createdAt: new Date(backend.created_at),
		updatedAt: new Date(backend.updated_at),
		product: backend.product
			? transformProductResponse(backend.product)
			: undefined,
		productSize: backend.product_size
			? transformProductSize(backend.product_size)
			: undefined,
	};
}

function mapBackendCategoryToDomain(
	backend?: BackendCategoryResponse,
): Category | undefined {
	if (!backend) return undefined;
	return {
		id: backend.category_id,
		name: backend.name,
		description: backend.description,
		createdAt: new Date(backend.created_at),
		updatedAt: new Date(backend.updated_at),
	};
}

export function transformProductResponse(
	backend: BackendProductResponse,
): Product {
	const productPrices = backend.product_price
		? backend.product_price.map(transformProductPriceResponse)
		: [];
	const activePrices = productPrices.filter((p) => p.isActive);

	return {
		id: backend.product_id,
		categoryId: backend.category_id,
		name: backend.name,
		description: backend.description,
		isSignature: backend.is_signature,
		imagePath: backend.image_path,
		createdAt: new Date(backend.created_at),
		updatedAt: new Date(backend.updated_at),
		category: mapBackendCategoryToDomain(backend.category),
		productPrices,
		minPrice:
			activePrices.length > 0
				? Math.min(...activePrices.map((p) => p.price))
				: undefined,
		maxPrice:
			activePrices.length > 0
				? Math.max(...activePrices.map((p) => p.price))
				: undefined,
		availableSizes: activePrices
			.map((price) => price.productSize)
			.filter(Boolean) as ProductSize[],
	};
}
