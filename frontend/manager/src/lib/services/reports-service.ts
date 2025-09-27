import { extractJSendData } from '@/lib/utils/jsend';
import type { JSendSuccess } from '@/types/protocol/jsend';
import {
	type SalesReportQuery,
	type SalesReportResponse,
	transformSalesReportResponse,
} from '@/types/reports';
import { apiClient } from '../api-client';

export class ReportsService {
	private readonly baseUrl = '/reports';

	async getSalesReport(
		query?: SalesReportQuery,
	): Promise<SalesReportResponse> {
		try {
			console.log('Query params:', query);

			const jsendResponse = await apiClient.get<JSendSuccess<unknown>>(
				`${this.baseUrl}/sales`,
				query,
			);
			console.log('API Response:', jsendResponse);

			const response = extractJSendData(jsendResponse);

			if (!response) {
				console.warn('Empty response from API');
				return transformSalesReportResponse(null);
			}

			return transformSalesReportResponse(response);
		} catch (error) {
			console.error('Lỗi khi lấy báo cáo bán hàng:', error);
			throw new Error('Không thể lấy báo cáo bán hàng');
		}
	}

	async getMonthlySalesReport(
		query?: SalesReportQuery,
	): Promise<SalesReportResponse> {
		try {
			const jsendResponse = await apiClient.get<JSendSuccess<unknown>>(
				`${this.baseUrl}/sales/monthly`,
				query,
			);

			const response = extractJSendData(jsendResponse);

			if (!response) {
				return transformSalesReportResponse(null);
			}

			return transformSalesReportResponse(response);
		} catch (error) {
			console.error('Lỗi khi lấy báo cáo theo tháng:', error);
			throw new Error('Không thể lấy báo cáo theo tháng');
		}
	}

	async getDailySalesReport(
		query?: SalesReportQuery,
	): Promise<SalesReportResponse> {
		try {
			const jsendResponse = await apiClient.get<JSendSuccess<unknown>>(
				`${this.baseUrl}/sales/daily`,
				query,
			);

			const response = extractJSendData(jsendResponse);

			if (!response) {
				return transformSalesReportResponse(null);
			}

			return transformSalesReportResponse(response);
		} catch (error) {
			console.error('Lỗi khi lấy báo cáo theo ngày:', error);
			throw new Error('Không thể lấy báo cáo theo ngày');
		}
	}

	async getEmployeeSalesReport(
		query?: SalesReportQuery,
	): Promise<SalesReportResponse> {
		try {
			const jsendResponse = await apiClient.get<JSendSuccess<unknown>>(
				`${this.baseUrl}/sales/employee`,
				query,
			);

			const response = extractJSendData(jsendResponse);

			if (!response) {
				return transformSalesReportResponse(null);
			}

			return transformSalesReportResponse(response);
		} catch (error) {
			console.error('Lỗi khi lấy báo cáo theo nhân viên:', error);
			throw new Error('Không thể lấy báo cáo theo nhân viên');
		}
	}

	async getProductSalesReport(
		query?: SalesReportQuery,
	): Promise<SalesReportResponse> {
		try {
			const jsendResponse = await apiClient.get<JSendSuccess<unknown>>(
				`${this.baseUrl}/sales/products`,
				query,
			);

			const response = extractJSendData(jsendResponse);

			if (!response) {
				return transformSalesReportResponse(null);
			}

			return transformSalesReportResponse(response);
		} catch (error) {
			console.error('Lỗi khi lấy báo cáo sản phẩm:', error);
			throw new Error('Không thể lấy báo cáo sản phẩm');
		}
	}
}

export const reportsService = new ReportsService();
