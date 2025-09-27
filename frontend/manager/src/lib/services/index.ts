/**
 * Services Index
 * Curated exports of service singletons and shared types
 */

// API Client
export { API_CONFIG, apiClient } from '@/lib/api-client';

// Types (curated)
export type { BulkDeleteResponse, PaginatedResponse } from '@/types/common';
export type { Customer } from '@/types/customer';
export type {
	CreateDiscountDto,
	Discount,
	UpdateDiscountDto,
} from '@/types/discount';
export type { Employee } from '@/types/employee';
export type { InvoiceData } from '@/types/invoice';
export type { Manager } from '@/types/manager';
export type { MembershipType } from '@/types/membership-type';
export type { Profile, UpdateProfileDto } from '@/types/profile';
export type {
	DailySalesData,
	EmployeeSalesData,
	MonthlySalesData,
	ProductSalesData,
	SalesReportQuery,
	SalesReportResponse,
	SalesReportSummary,
} from '@/types/reports';
export type { CreateStoreDto, Store, UpdateStoreDto } from '@/types/store';

// Services
export { authService } from './auth-service';
export { categoryService } from './category-service';
export { customerService } from './customer-service';
export { discountService } from './discount-service';
export { employeeService } from './employee-service';
export { invoiceService } from './invoice-service';
export { managerService } from './manager-service';
export { membershipTypeService } from './membership-type-service';
export { orderService } from './order-service';
export { profileService } from './profile-service';
export * from './reports-service';
export { storeService } from './store-service';
