import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateRoleDto {
	@ApiProperty({
		example: 'Manager',
		description: 'The name of the role',
	})
	@IsString()
	@IsNotEmpty()
	name: string

	@ApiProperty({
		example: 'A user with management privileges',
		description: 'A description of the role',
		required: false,
	})
	@IsString()
	@IsOptional()
	description?: string
}
