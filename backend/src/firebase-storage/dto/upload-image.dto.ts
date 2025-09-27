import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UploadImageDto {
	@ApiProperty({
		description:
			'Optional file name (will be auto-generated if not provided)',
		required: false,
		maxLength: 100,
		example: 'product-image-1.jpg',
	})
	@IsOptional()
	@IsString()
	@MaxLength(100)
	fileName?: string;

	@ApiProperty({
		description: 'Storage folder (default: products)',
		required: false,
		maxLength: 50,
		example: 'products',
	})
	@IsOptional()
	@IsString()
	@MaxLength(50)
	folder?: string;
}
