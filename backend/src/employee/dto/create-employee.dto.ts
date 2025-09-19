import {
	IsString,
	IsNotEmpty,
	MaxLength,
	IsEmail,
	IsPhoneNumber,
	MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEmployeeDto {
	@ApiProperty({
		description: 'The first name of the employee',
		example: 'John',
		maxLength: 70,
		type: String,
	})
	@IsString({ message: 'First name must be a string' })
	@IsNotEmpty({ message: 'First name is required' })
	@MaxLength(70, { message: 'First name must not exceed 70 characters' })
	first_name: string;

	@ApiProperty({
		description: 'The last name of the employee',
		example: 'Doe',
		maxLength: 70,
		type: String,
	})
	@IsString({ message: 'Last name must be a string' })
	@IsNotEmpty({ message: 'Last name is required' })
	@MaxLength(70, { message: 'Last name must not exceed 70 characters' })
	last_name: string;

	@ApiProperty({
		description: 'The email address of the employee',
		example: 'employee@example.com',
		maxLength: 255,
		format: 'email',
		type: String,
	})
	@IsEmail({}, { message: 'Invalid email format' })
	@IsNotEmpty({ message: 'Email is required' })
	@MaxLength(255, { message: 'Email must not exceed 255 characters' })
	email: string;

	@ApiProperty({
		description: 'The phone number of the employee',
		example: '+84901234567',
		maxLength: 15,
		type: String,
	})
	@IsPhoneNumber('VN', { message: 'Invalid phone number format' })
	@IsNotEmpty({ message: 'Phone number is required' })
	@MaxLength(15, { message: 'Phone number must not exceed 15 characters' })
	phone: string;

	@ApiProperty({
		description: 'The position of the employee',
		example: 'Sales Staff',
		maxLength: 100,
		type: String,
	})
	@IsString({ message: 'Position must be a string' })
	@IsNotEmpty({ message: 'Position is required' })
	@MaxLength(100, { message: 'Position must not exceed 100 characters' })
	position: string;

	/**
	 * The username for the employee's account.
	 * This is required to create an account for the employee.
	 */
	@ApiProperty({
		description: 'The username for the employee account',
		example: 'employee_user',
		minLength: 3,
		type: String,
	})
	@IsString({ message: 'Username must be a string' })
	@IsNotEmpty({ message: 'Username is required' })
	@MinLength(3, { message: 'Username must be at least 3 characters long' })
	username: string;
}
