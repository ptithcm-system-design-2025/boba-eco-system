// DTOs for Product module. Must strictly match backend contracts (snake_case).

export interface CreateProductSizeDto {
	name: string;
	unit: string;
	quantity: number;
	description?: string;
}

export interface UpdateProductSizeDto {
	name?: string;
	unit?: string;
	quantity?: number;
	description?: string;
}

export interface CreateProductPriceDto {
	size_id?: number;
	size_data?: CreateProductSizeDto;
	price: number;
	is_active?: boolean;
}

export interface CreateProductDto {
	name: string;
	description?: string;
	is_signature?: boolean;
	image_path?: string;
	category_id?: number;
	prices: CreateProductPriceDto[];
}

export interface UpdateProductDto {
	name?: string;
	description?: string;
	is_signature?: boolean;
	image_path?: string;
	category_id?: number;
}
