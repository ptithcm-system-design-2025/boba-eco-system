import { IsInt, IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductPriceDto {
  @ApiPropertyOptional({
    description: 'The new price of the product (in VND)',
    example: 60000,
    type: Number,
  })
  @IsOptional()
  @IsInt({ message: 'price must be an integer' })
  price?: number;

  @ApiPropertyOptional({
    description: 'The active status of the price',
    example: false,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean({ message: 'is_active must be a boolean value' })
  is_active?: boolean;
}
