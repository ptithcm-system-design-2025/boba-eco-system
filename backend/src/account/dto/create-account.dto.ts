import { ApiProperty } from '@nestjs/swagger'
import {
	IsBoolean,
	IsInt,
	IsNotEmpty,
	IsOptional,
	IsString,
	MinLength,
} from 'class-validator'

export class CreateAccountDto {
	@ApiProperty({
		description: 'The role ID for the account.',
		example: 1,
		type: Number,
	})
	@IsInt({ message: 'role_id must be an integer.' })
	@IsNotEmpty({ message: 'role_id is required.' })
	role_id: number

	@ApiProperty({
		description: 'The username (minimum 3 characters).',
		example: 'user123',
		minLength: 3,
		type: String,
	})
	@IsString({ message: 'username must be a string.' })
	@IsNotEmpty({ message: 'username is required.' })
	@MinLength(3, { message: 'username must be at least 3 characters long.' })
	username: string

	@ApiProperty({
		description: 'The password (minimum 8 characters).',
		example: 'password123',
		minLength: 8,
		type: String,
	})
	@IsString({ message: 'password must be a string.' })
	@IsNotEmpty({ message: 'password is required.' })
	@MinLength(8, { message: 'password must be at least 8 characters long.' })
	password: string

	@ApiProperty({
		description: 'The active status of the account.',
		example: true,
		required: false,
		type: Boolean,
	})
	@IsOptional()
	@IsBoolean({ message: 'is_active must be a boolean value.' })
	is_active?: boolean
}
