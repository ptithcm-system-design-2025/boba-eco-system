import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

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
