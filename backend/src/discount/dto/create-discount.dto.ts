import {
    IsBoolean,
    IsDateString,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Matches,
    MaxLength,
    Min,
} from 'class-validator';
import {Type} from 'class-transformer';

export class CreateDiscountDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Matches(/^[A-Z0-9]+$/, {
    message: 'Coupon code must be uppercase alphanumeric and unique.',
  })
  coupon_code: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  discount_value: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  min_required_order_value: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  max_discount_amount: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  min_required_product?: number;

  @IsOptional()
  @IsDateString()
  valid_from?: string;

  @IsDateString()
  @IsNotEmpty()
  valid_until: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  max_uses?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  max_uses_per_customer?: number;

  @IsBoolean()
  @IsOptional()
  is_active: boolean = true;
}
