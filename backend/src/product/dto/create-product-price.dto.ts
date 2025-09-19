import {
	IsNotEmpty,
	IsInt,
	IsBoolean,
	IsOptional,
	ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateProductSizeForProductDto } from './create-product-size.dto';

export class CreateProductPriceDto {
	@ApiProperty({
		description: 'The ID of the product',
		example: 1,
		type: Number,
	})
	@IsNotEmpty({ message: 'product_id cannot be empty' })
	@IsInt({ message: 'product_id must be an integer' })
	product_id: number;

	@ApiPropertyOptional({
		description: 'The ID of the product size (if using an existing size)',
		example: 1,
		type: Number,
	})
	@IsOptional()
	@IsInt({ message: 'size_id must be an integer' })
	size_id?: number;

	@ApiPropertyOptional({
		description: 'New size information (if creating a new size)',
		type: CreateProductSizeForProductDto,
	})
	@IsOptional()
	@ValidateNested()
	@Type(() => CreateProductSizeForProductDto)
	size_data?: CreateProductSizeForProductDto;

	@ApiProperty({
		description: 'The price of the product (in VND)',
		example: 50000,
		type: Number,
	})
	@IsNotEmpty({ message: 'price cannot be empty' })
	@IsInt({ message: 'price must be an integer' })
	price: number;

	@ApiPropertyOptional({
		description: 'The active status of the price',
		example: true,
		default: true,
		type: Boolean,
	})
	@IsOptional()
	@IsBoolean({ message: 'is_active must be a boolean value' })
	is_active?: boolean;
}
