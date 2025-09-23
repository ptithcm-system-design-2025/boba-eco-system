import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { ArrayMinSize, IsArray, IsInt } from 'class-validator'

export class BulkDeleteCustomerDto {
	@ApiProperty({
		description: 'Danh sách ID của các khách hàng cần xóa',
		example: [1, 2, 3],
		type: [Number],
	})
	@IsArray()
	@ArrayMinSize(1, { message: 'Danh sách ID không được rỗng' })
	@IsInt({ each: true, message: 'Mỗi ID phải là số nguyên' })
	@Type(() => Number)
	ids: number[]
}
