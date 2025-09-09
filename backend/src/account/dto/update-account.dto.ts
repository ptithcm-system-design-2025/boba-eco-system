import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types'; // Helper for Update DTOs
import { CreateAccountDto } from './create-account.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAccountDto extends PartialType(CreateAccountDto) {
  @ApiProperty({
    description: 'The new username (minimum 3 characters).',
    example: 'newuser123',
    required: false,
    minLength: 3,
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'username must be a string.' })
  @MinLength(3, { message: 'username must be at least 3 characters long.' })
  username?: string;

  @ApiProperty({
    description: 'The new password (minimum 8 characters).',
    example: 'newpassword123',
    required: false,
    minLength: 8,
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'password must be a string.' })
  @MinLength(8, { message: 'password must be at least 8 characters long.' })
  password?: string;

  @ApiProperty({
    description: 'The active status of the account.',
    example: false,
    required: false,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean({ message: 'is_active must be a boolean value.' })
  is_active?: boolean;

  @ApiProperty({
    description: 'The lock status of the account.',
    example: true,
    required: false,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean({ message: 'is_locked must be a boolean value.' })
  is_locked?: boolean;
}
