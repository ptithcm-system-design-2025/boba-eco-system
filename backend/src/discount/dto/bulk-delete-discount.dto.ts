import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { ArrayMinSize, IsArray, IsInt } from 'class-validator'

export class BulkDeleteDiscountDto {
	@ApiProperty({
		description: 'A list of discount IDs to be deleted.',
		example: [1, 2, 3],
		type: [Number],
	})
	@IsArray()
	@ArrayMinSize(1, { message: 'The ID list cannot be empty.' })
	@IsInt({ each: true, message: 'Each ID must be an integer.' })
	@Type(() => Number)
	ids: number[]
}
