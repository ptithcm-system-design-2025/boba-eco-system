import { ApiProperty, PartialType } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
	ArrayMinSize,
	IsInt,
	IsOptional,
	IsString,
	MaxLength,
	Min,
	ValidateNested,
} from 'class-validator'
import { CreateOrderDiscountDto } from './create-order-discount.dto' // Assuming discounts can be updated
import { CreateOrderProductDto } from './create-order-product.dto' // Assuming products can be updated
import { CreateOrderDto } from './create-order.dto'

// May need UpdateOrderProductDto and UpdateOrderDiscountDto for more detailed update logic

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
	@ApiProperty({
		description: 'The ID of the updating employee (if changed)',
		example: 2,
		required: false,
	})
	@IsOptional()
	@IsInt()
	@Min(1)
	@Type(() => Number)
	employee_id?: number

	@ApiProperty({
		description: 'The ID of the updating customer (if changed)',
		example: 2,
		required: false,
	})
	@IsOptional()
	@IsInt()
	@Min(1)
	@Type(() => Number)
	customer_id?: number

	@ApiProperty({
		description: 'Updated custom note',
		example: 'Confirmed, urgent delivery',
		maxLength: 1000,
		required: false,
	})
	@IsOptional()
	@IsString()
	@MaxLength(1000)
	customize_note?: string

	// status can only be updated through business logic, not directly by the client

	// To update products and discounts: the client sends the entire new array.
	// If the array is empty or not sent, the service can either keep the existing items or delete them, depending on the logic.
	// For more detailed add/edit/delete logic for individual items, more complex DTOs and services are needed.
	@ApiProperty({
		description: '(Replacement) List of products in the order',
		type: [CreateOrderProductDto],
		required: false,
	})
	@IsOptional()
	@ArrayMinSize(0) // Allows sending an empty array to delete all products (depending on service logic)
	@ValidateNested({ each: true })
	@Type(() => CreateOrderProductDto)
	products?: CreateOrderProductDto[]

	@ApiProperty({
		description: '(Replacement) List of applied discount codes',
		type: [CreateOrderDiscountDto],
		required: false,
	})
	@IsOptional()
	@ValidateNested({ each: true })
	@Type(() => CreateOrderDiscountDto)
	discounts?: CreateOrderDiscountDto[]
}
