import { ApiProperty } from '@nestjs/swagger';
import {
	IsNotEmpty,
	IsOptional,
	IsString,
	IsUrl,
	MaxLength,
} from 'class-validator';

export class UpdateImageDto {
	@ApiProperty({
		description: 'The URL of the old image to be deleted',
		example:
			'https://storage.googleapis.com/your-bucket/products/old-image.jpg',
	})
	@IsNotEmpty()
	@IsString()
	@IsUrl()
	oldImageUrl: string;

	@ApiProperty({
		description: 'Optional new file name',
		required: false,
		maxLength: 100,
		example: 'new-product-image.jpg',
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
