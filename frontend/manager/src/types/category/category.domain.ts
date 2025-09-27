// Domain model for Category (camelCase, Date types)
import type { Product } from '../product/product.domain';

export interface Category {
	id: number;
	name: string;
	description?: string;
	createdAt: Date;
	updatedAt: Date;
	products?: Product[];
}
