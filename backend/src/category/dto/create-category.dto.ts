import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'

export class CreateCategoryDto {
	@ApiProperty({
		description: 'Category name',
		example: 'Cakes',
		maxLength: 100,
		type: String,
	})
	@IsString({ message: 'Category name must be a string' })
	@IsNotEmpty({ message: 'Category name cannot be empty' })
	@MaxLength(100, { message: 'Category name cannot exceed 100 characters' })
	name: string

	@ApiPropertyOptional({
		description: 'Category description',
		example: 'Fresh and delicious cakes',
		maxLength: 1000,
		type: String,
	})
	@IsOptional()
	@IsString({ message: 'Description must be a string' })
	@MaxLength(1000, { message: 'Description cannot exceed 1000 characters' })
	description?: string
}
