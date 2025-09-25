import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsOptional, Min } from 'class-validator';

export class ValidateDiscountDto {
	@ApiProperty({
		description: 'The ID of the customer (can be null)',
		example: 1,
		required: false,
		type: Number,
	})
	@IsOptional()
	@IsInt({ message: 'customer_id must be an integer' })
	customer_id?: number;

	@ApiProperty({
		description: 'List of discount IDs to validate',
		example: [1, 2],
		type: [Number],
	})
	@IsArray({ message: 'discount_ids must be an array' })
	@IsInt({ each: true, message: 'Each discount_id must be an integer' })
	discount_ids: number[];

	@ApiProperty({
		description: 'The total amount of the order (in VND)',
		example: 250000,
		minimum: 0,
		type: Number,
	})
	@IsInt({ message: 'total_amount must be an integer' })
	@Min(0, { message: 'total_amount must be greater than or equal to 0' })
	total_amount: number;

	@ApiProperty({
		description: 'The number of products in the order',
		example: 3,
		minimum: 1,
		type: Number,
	})
	@IsInt({ message: 'product_count must be an integer' })
	@Min(1, { message: 'product_count must be greater than 0' })
	product_count: number;
}
