import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { ArrayMinSize, IsArray, IsInt } from 'class-validator'

export class BulkDeleteEmployeeDto {
	@ApiProperty({
		description: 'A list of employee IDs to be deleted',
		example: [1, 2, 3],
		type: [Number],
	})
	@IsArray()
	@ArrayMinSize(1, { message: 'The ID list must not be empty' })
	@IsInt({ each: true, message: 'Each ID must be an integer' })
	@Type(() => Number)
	ids: number[]
}
