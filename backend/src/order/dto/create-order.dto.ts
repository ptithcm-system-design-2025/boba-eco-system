import {
  IsInt,
  IsNotEmpty,
  Min,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
  ArrayNotEmpty,
  ArrayMinSize,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateOrderProductDto } from './create-order-product.dto';
import { CreateOrderDiscountDto } from './create-order-discount.dto';

export class CreateOrderDto {
  @ApiProperty({ description: 'The ID of the employee creating the order', example: 1 })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  @Type(() => Number)
  employee_id: number;

  @ApiProperty({
    description: 'The ID of the customer (if any)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  customer_id?: number;

  @ApiProperty({
    description: 'Custom note for the entire order',
    example: 'Deliver after 5 PM',
    maxLength: 1000,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  customize_note?: string;

  @ApiProperty({
    description: 'List of products in the order',
    type: [CreateOrderProductDto],
    minItems: 1,
  })
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderProductDto)
  products: CreateOrderProductDto[];

  @ApiProperty({
    description: 'List of discount codes applied to the order',
    type: [CreateOrderDiscountDto],
    required: false,
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderDiscountDto)
  discounts?: CreateOrderDiscountDto[];

  // status will be managed by the service, defaulting to PROCESSING

  // order_time, total_amount, final_amount will be calculated and set by the service.
}
