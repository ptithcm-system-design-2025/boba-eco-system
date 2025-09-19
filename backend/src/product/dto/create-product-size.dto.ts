import {
	IsString,
	IsNotEmpty,
	MaxLength,
	IsInt,
	Min,
	IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductSizeForProductDto {
	@ApiProperty({
		description: 'The name of the product size',
		example: 'S',
		maxLength: 50,
	})
	@IsString()
	@IsNotEmpty()
	@MaxLength(50)
	name: string;

	@ApiProperty({
		description: 'The unit of measurement',
		example: 'inch',
		maxLength: 20,
	})
	@IsString()
	@IsNotEmpty()
	@MaxLength(20)
	unit: string;

	@ApiProperty({
		description: 'The quantity or size value',
		example: 10,
		minimum: 1,
	})
	@IsInt()
	@Min(1)
	@Type(() => Number)
	quantity: number;

	@ApiProperty({
		description: 'A description of the product size',
		example: 'A 10-inch cake suitable for 8-10 people',
		required: false,
		maxLength: 255,
	})
	@IsOptional()
	@IsString()
	@MaxLength(255)
	description?: string;
}
