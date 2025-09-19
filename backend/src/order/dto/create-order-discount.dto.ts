import { IsInt, IsNotEmpty, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDiscountDto {
	@ApiProperty({
		description: 'The ID of the discount program (discount_id)',
		example: 1,
	})
	@IsInt()
	@IsNotEmpty()
	@Min(1)
	@Type(() => Number)
	discount_id: number;

	// discount_amount will be calculated by the service based on Discount and Order information
}
