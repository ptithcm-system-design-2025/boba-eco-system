import { IsNotEmpty, IsString, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteImageDto {
  @ApiProperty({
    description: 'The full URL of the image to be deleted',
    example: 'https://storage.googleapis.com/your-bucket/products/image.jpg',
  })
  @IsNotEmpty()
  @IsString()
  @IsUrl()
  imageUrl: string;
}
