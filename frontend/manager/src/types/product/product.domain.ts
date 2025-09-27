// Domain models for Product module (camelCase, Date types). UI consumes these only.

import type { Category } from '../category/category.domain';

export interface ProductSize {
	id: number;
	name: string;
	unit: string;
	quantity: number;
	description?: string;
	createdAt: Date;
	updatedAt: Date;
	productPrices?: ProductPrice[];
}

export interface ProductPrice {
	id: number;
	productId: number;
	sizeId: number;
	price: number;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
	product?: Product;
	productSize?: ProductSize;
}

export interface Product {
	id: number;
	categoryId?: number;
	name: string;
	description?: string;
	isSignature?: boolean;
	imagePath?: string;
	createdAt: Date;
	updatedAt: Date;
	category?: Category;
	productPrices?: ProductPrice[];
	// Computed helpers for UI
	minPrice?: number;
	maxPrice?: number;
	availableSizes?: ProductSize[];
}
