import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
	IsEmail,
	IsInt,
	IsNotEmpty,
	IsOptional,
	IsString,
	Min,
} from 'class-validator';

export class CreateStripePaymentDto {
	@ApiProperty({ description: 'ID của đơn hàng cần thanh toán', example: 1 })
	@IsInt()
	@IsNotEmpty()
	@Min(1)
	@Type(() => Number)
	orderId: number;

	@ApiProperty({
		description: 'Loại tiền tệ',
		example: 'vnd',
		required: false,
		default: 'vnd',
	})
	@IsOptional()
	@IsString()
	currency?: string = 'vnd';

	@ApiProperty({
		description: 'Thông tin mô tả đơn hàng',
		example: 'Thanh toan don hang #1 - Banh kem socola',
		required: false,
	})
	@IsOptional()
	@IsString()
	orderInfo?: string;

	@ApiProperty({
		description: 'Email khách hàng để gửi biên lai',
		example: 'customer@example.com',
		required: false,
	})
	@IsOptional()
	@IsEmail()
	customerEmail?: string;
}
