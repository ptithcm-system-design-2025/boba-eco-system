import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
	IsInt,
	IsNotEmpty,
	IsOptional,
	IsString,
	MaxLength,
	Min,
} from 'class-validator';

export class CreateOrderProductDto {
	@ApiProperty({
		description: 'The ID of the product price (product_price_id)',
		example: 1,
	})
	@IsInt()
	@IsNotEmpty()
	@Min(1)
	@Type(() => Number)
	product_price_id: number;

	@ApiProperty({
		description: 'The quantity of the product',
		example: 2,
		minimum: 1,
	})
	@IsInt()
	@IsNotEmpty()
	@Min(1)
	@Type(() => Number)
	quantity: number;

	@ApiProperty({
		description: 'Optional note for the product in the order',
		example: 'Less sugar',
		maxLength: 500,
		required: false,
	})
	@IsOptional()
	@IsString()
	@MaxLength(500)
	option?: string;
}
