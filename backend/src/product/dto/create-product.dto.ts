import {
	IsString,
	IsNotEmpty,
	MaxLength,
	IsOptional,
	IsBoolean,
	IsInt,
	Min,
	ValidateNested,
	ArrayNotEmpty,
	ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateProductPriceForNewProductDto } from './create-product-price-for-new-product.dto';

export class CreateProductDto {
	@ApiProperty({
		description: 'The name of the product',
		example: 'Strawberry Cake',
		maxLength: 100,
		type: String,
	})
	@IsString({ message: 'Product name must be a string' })
	@IsNotEmpty({ message: 'Product name cannot be empty' })
	@MaxLength(100, { message: 'Product name cannot exceed 100 characters' })
	name: string;

	@ApiPropertyOptional({
		description: 'A description of the product',
		example: 'Fresh cream cake with natural strawberries',
		maxLength: 1000,
		type: String,
	})
	@IsOptional()
	@IsString({ message: 'Description must be a string' })
	@MaxLength(1000, { message: 'Description cannot exceed 1000 characters' })
	description?: string;

	@ApiPropertyOptional({
		description: 'Whether the product is a signature item',
		example: false,
		type: Boolean,
		default: false,
	})
	@IsOptional()
	@IsBoolean({ message: 'Signature status must be a boolean' })
	is_signature?: boolean = false;

	@ApiPropertyOptional({
		description: 'The path to the product image',
		example: '/uploads/products/cake-strawberry.jpg',
		maxLength: 255,
		type: String,
	})
	@IsOptional()
	@IsString({ message: 'Image path must be a string' })
	@MaxLength(255, {
		message: 'Image path cannot exceed 255 characters',
	})
	image_path?: string;

	@ApiPropertyOptional({
		description: 'The ID of the product category',
		example: 1,
		type: Number,
		minimum: 1,
	})
	@IsInt({ message: 'Category ID must be an integer' })
	@Min(1, { message: 'Category ID must be greater than 0' })
	@Type(() => Number)
	category_id: number;

	@ApiProperty({
		description: 'A list of prices for different sizes of the product',
		type: [CreateProductPriceForNewProductDto],
		isArray: true,
		minItems: 1,
	})
	@ArrayNotEmpty({ message: 'Price list cannot be empty' })
	@ArrayMinSize(1, { message: 'Product must have at least one price' })
	@ValidateNested({ each: true, message: 'Invalid price data' })
	@Type(() => CreateProductPriceForNewProductDto)
	prices: CreateProductPriceForNewProductDto[];
}
