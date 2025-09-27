// Frontend domain models for Order module (camelCase, Date types)

import type { Customer } from '../customer/customer.domain';
import type { Discount } from '../discount/discount.domain';
import type { Employee } from '../employee/employee.domain';
import type { ProductPrice } from '../product/product.domain';

export interface Order {
	id: number;
	employeeId?: number;
	customerId?: number;
	orderTime?: Date;
	totalAmount: number;
	finalAmount: number;
	status: 'PROCESSING' | 'CANCELLED' | 'COMPLETED';
	customizeNote?: string;
	createdAt: Date;
	updatedAt: Date;
	customer?: Customer;
	employee?: Employee;
	products?: OrderProduct[];
	discounts?: OrderDiscount[];
	payments?: Payment[];
	// Computed helpers for UI
	customerName?: string;
	employeeName?: string;
	paymentStatus?: 'PROCESSING' | 'PAID' | 'CANCELLED';
	paymentMethod?: string;
}

export interface OrderProduct {
	id: number;
	orderId: number;
	productPriceId: number;
	quantity: number;
	option?: string;
	createdAt: Date;
	updatedAt: Date;
	productPrice?: ProductPrice;
	// Computed helpers
	productName?: string;
	sizeName?: string;
	unitPrice?: number;
	totalPrice?: number;
}

export interface OrderDiscount {
	id: number;
	orderId: number;
	discountId: number;
	discountAmount: number;
	createdAt: Date;
	updatedAt: Date;
	discount?: Discount;
	// Computed helpers
	discountName?: string;
}

export interface Payment {
	id: number;
	orderId: number;
	paymentMethodId: number;
	status: 'PROCESSING' | 'PAID' | 'CANCELLED';
	amountPaid?: number;
	changeAmount?: number;
	paymentTime?: Date;
	createdAt: Date;
	updatedAt: Date;
	paymentMethod?: {
		id: number;
		name: string;
		description?: string;
		createdAt: Date;
		updatedAt: Date;
	};
}
