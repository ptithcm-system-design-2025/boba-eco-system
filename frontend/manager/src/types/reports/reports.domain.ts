// Domain models for Reports
export interface SalesReportQuery {
	month?: number;
	year?: number;
	employee_id?: number;
	// Index signature to make it compatible with Record<string, unknown>
	[key: string]: unknown;
}

export interface EmployeeSalesData {
	employee_id: number;
	employee_name: string;
	total_orders: number;
	total_revenue: number;
	total_products_sold: number;
}

export interface MonthlySalesData {
	month: number;
	year: number;
	total_orders: number;
	total_revenue: number;
	total_products_sold: number;
}

export interface DailySalesData {
	day: number;
	month: number;
	year: number;
	total_orders: number;
	total_revenue: number;
	total_products_sold: number;
}

export interface ProductSalesData {
	product_id: number;
	product_name: string;
	quantity_sold: number;
	revenue: number;
}

export interface SalesReportSummary {
	total_orders: number;
	total_revenue: number;
	total_products_sold: number;
	period: string;
}

export interface SalesReportResponse {
	summary: SalesReportSummary;
	employee_sales?: EmployeeSalesData[];
	monthly_sales?: MonthlySalesData[];
	daily_sales?: DailySalesData[];
	product_sales?: ProductSalesData[];
}
