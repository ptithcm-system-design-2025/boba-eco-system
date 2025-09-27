import { create } from 'zustand';
import { reportsService } from '@/lib/services/reports-service';
import { extractErrorMessage } from '@/lib/utils/jsend';
import type { SalesReportQuery, SalesReportResponse } from '@/types/reports';

interface ReportsState {
	// State
	currentReport: SalesReportResponse | null;
	isLoading: boolean;

	// Actions
	getSalesReport: (query?: SalesReportQuery) => Promise<void>;
	getMonthlySalesReport: (query?: SalesReportQuery) => Promise<void>;
	getDailySalesReport: (query?: SalesReportQuery) => Promise<void>;
	getEmployeeSalesReport: (query?: SalesReportQuery) => Promise<void>;
	getProductSalesReport: (query?: SalesReportQuery) => Promise<void>;
	clearReport: () => void;
}

export const useReportsStore = create<ReportsState>((set) => ({
	// Initial state
	currentReport: null,
	isLoading: false,

	// Actions
	getSalesReport: async (query?: SalesReportQuery) => {
		set({ isLoading: true });
		try {
			const report = await reportsService.getSalesReport(query);
			set({ currentReport: report, isLoading: false });
		} catch (error) {
			const errorMessage = extractErrorMessage(error);
			console.error('Lỗi khi lấy báo cáo bán hàng:', errorMessage);
			set({ isLoading: false });
		}
	},

	getMonthlySalesReport: async (query?: SalesReportQuery) => {
		set({ isLoading: true });
		try {
			const report = await reportsService.getMonthlySalesReport(query);
			set({ currentReport: report, isLoading: false });
		} catch (error) {
			const errorMessage = extractErrorMessage(error);
			console.error('Lỗi khi lấy báo cáo theo tháng:', errorMessage);
			set({ isLoading: false });
		}
	},

	getDailySalesReport: async (query?: SalesReportQuery) => {
		set({ isLoading: true });
		try {
			const report = await reportsService.getDailySalesReport(query);
			set({ currentReport: report, isLoading: false });
		} catch (error) {
			const errorMessage = extractErrorMessage(error);
			console.error('Lỗi khi lấy báo cáo theo ngày:', errorMessage);
			set({ isLoading: false });
		}
	},

	getEmployeeSalesReport: async (query?: SalesReportQuery) => {
		set({ isLoading: true });
		try {
			const report = await reportsService.getEmployeeSalesReport(query);
			set({ currentReport: report, isLoading: false });
		} catch (error) {
			const errorMessage = extractErrorMessage(error);
			console.error('Lỗi khi lấy báo cáo theo nhân viên:', errorMessage);
			set({ isLoading: false });
		}
	},

	getProductSalesReport: async (query?: SalesReportQuery) => {
		set({ isLoading: true });
		try {
			const report = await reportsService.getProductSalesReport(query);
			set({ currentReport: report, isLoading: false });
		} catch (error) {
			const errorMessage = extractErrorMessage(error);
			console.error('Lỗi khi lấy báo cáo sản phẩm:', errorMessage);
			set({ isLoading: false });
		}
	},

	clearReport: () => {
		set({ currentReport: null });
	},
}));
