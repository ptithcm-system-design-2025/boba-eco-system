// Transformer for various Sales Reports responses into domain models
import type {
	DailySalesData,
	EmployeeSalesData,
	MonthlySalesData,
	ProductSalesData,
	SalesReportResponse,
} from './reports.domain';

// Backend response types (snake_case)
interface BackendSalesReportSummary {
	total_orders?: number;
	total_revenue?: number;
	total_products_sold?: number;
	period?: string;
}

interface BackendEmployeeSalesData {
	employee_id?: number;
	employee_name?: string;
	total_orders?: number;
	total_revenue?: number;
	total_products_sold?: number;
}

interface BackendMonthlySalesData {
	month?: number;
	year?: number;
	total_orders?: number;
	total_revenue?: number;
	total_products_sold?: number;
}

interface BackendDailySalesData {
	day?: number;
	month?: number;
	year?: number;
	total_orders?: number;
	total_revenue?: number;
	total_products_sold?: number;
}

interface BackendProductSalesData {
	product_id?: number;
	product_name?: string;
	quantity_sold?: number;
	revenue?: number;
}

interface BackendSalesReportResponse {
	summary?: BackendSalesReportSummary;
	employee_sales?: BackendEmployeeSalesData[];
	monthly_sales?: BackendMonthlySalesData[];
	daily_sales?: BackendDailySalesData[];
	product_sales?: BackendProductSalesData[];
}

// The backend returns JSend success with `data` containing nested keys like summary, employee_sales...
// We keep this transformer permissive and defensive: null-safe and default values.
export const transformSalesReportResponse = (
	data: BackendSalesReportResponse | null | undefined,
): SalesReportResponse => {
	if (!data) {
		return {
			summary: {
				total_orders: 0,
				total_revenue: 0,
				total_products_sold: 0,
				period: 'Không có dữ liệu',
			},
		};
	}

	return {
		summary: {
			total_orders: data.summary?.total_orders || 0,
			total_revenue: data.summary?.total_revenue || 0,
			total_products_sold: data.summary?.total_products_sold || 0,
			period: data.summary?.period || '',
		},
		employee_sales:
			data.employee_sales?.map(
				(item: BackendEmployeeSalesData): EmployeeSalesData => ({
					employee_id: item.employee_id || 0,
					employee_name: item.employee_name || 'Không xác định',
					total_orders: item.total_orders || 0,
					total_revenue: item.total_revenue || 0,
					total_products_sold: item.total_products_sold || 0,
				}),
			) || undefined,
		monthly_sales:
			data.monthly_sales?.map(
				(item: BackendMonthlySalesData): MonthlySalesData => ({
					month: item.month || 0,
					year: item.year || 0,
					total_orders: item.total_orders || 0,
					total_revenue: item.total_revenue || 0,
					total_products_sold: item.total_products_sold || 0,
				}),
			) || undefined,
		daily_sales:
			data.daily_sales?.map(
				(item: BackendDailySalesData): DailySalesData => ({
					day: item.day || 0,
					month: item.month || 0,
					year: item.year || 0,
					total_orders: item.total_orders || 0,
					total_revenue: item.total_revenue || 0,
					total_products_sold: item.total_products_sold || 0,
				}),
			) || undefined,
		product_sales:
			data.product_sales?.map(
				(item: BackendProductSalesData): ProductSalesData => ({
					product_id: item.product_id || 0,
					product_name: item.product_name || 'Không xác định',
					quantity_sold: item.quantity_sold || 0,
					revenue: item.revenue || 0,
				}),
			) || undefined,
	};
};
