import { create } from 'zustand';
import { categoryService } from '@/lib/services/category-service';
import { extractErrorMessage } from '@/lib/utils/jsend';
import type {
	BulkDeleteCategoryFormData,
	CreateCategoryFormData,
	UpdateCategoryFormData,
} from '@/lib/validations/category';
import type { Category } from '@/types/category';
import type { BulkDeleteResponse } from '@/types/common';

interface CategoriesState {
	// Data state
	categories: Category[];
	currentCategory: Category | null;

	// UI state
	isLoading: boolean;
	isCreating: boolean;
	isUpdating: boolean;
	isDeleting: boolean;
	error: string | null;

	// Pagination state
	currentPage: number;
	totalPages: number;
	totalItems: number;
	limit: number;

	// Actions
	fetchCategories: (params?: {
		page?: number;
		limit?: number;
		search?: string;
	}) => Promise<void>;
	fetchCategoryById: (id: number) => Promise<void>;
	createCategory: (data: CreateCategoryFormData) => Promise<Category>;
	updateCategory: (
		id: number,
		data: UpdateCategoryFormData,
	) => Promise<Category>;
	deleteCategory: (id: number) => Promise<void>;
	bulkDeleteCategories: (
		data: BulkDeleteCategoryFormData,
	) => Promise<BulkDeleteResponse>;

	// Utility actions
	clearError: () => void;
	clearCurrentCategory: () => void;
	setCurrentPage: (page: number) => void;
}

export const useCategoriesStore = create<CategoriesState>((set, get) => ({
	// Initial data state
	categories: [],
	currentCategory: null,

	// Initial UI state
	isLoading: false,
	isCreating: false,
	isUpdating: false,
	isDeleting: false,
	error: null,

	// Initial pagination state
	currentPage: 1,
	totalPages: 0,
	totalItems: 0,
	limit: 10,

	// Actions
	fetchCategories: async (params = {}) => {
		try {
			set({ isLoading: true, error: null });

			const response = await categoryService.getAll({
				page: params.page || get().currentPage,
				limit: params.limit || get().limit,
				search: params.search,
			});

			set({
				categories: response.data,
				currentPage: response.page,
				totalPages: response.totalPages,
				totalItems: response.total,
				limit: response.limit,
				isLoading: false,
			});
		} catch (error: unknown) {
			console.error('Lỗi tải danh sách danh mục:', error);
			const errorMessage = extractErrorMessage(
				error,
				'Không thể tải danh sách danh mục',
			);
			set({
				error: errorMessage,
				isLoading: false,
			});
		}
	},

	fetchCategoryById: async (id: number) => {
		try {
			set({ isLoading: true, error: null });

			const category = await categoryService.getById(id);

			set({
				currentCategory: category,
				isLoading: false,
			});
		} catch (error: unknown) {
			console.error('Lỗi tải danh mục:', error);
			const errorMessage = extractErrorMessage(
				error,
				'Không thể tải thông tin danh mục',
			);
			set({
				error: errorMessage,
				isLoading: false,
			});
		}
	},

	createCategory: async (data: CreateCategoryFormData) => {
		try {
			set({ isCreating: true, error: null });

			const newCategory = await categoryService.create(data);

			// Add to categories list
			set((state) => ({
				categories: [newCategory, ...state.categories],
				totalItems: state.totalItems + 1,
				isCreating: false,
			}));

			return newCategory;
		} catch (error: unknown) {
			console.error('Lỗi tạo danh mục:', error);
			const errorMessage = extractErrorMessage(
				error,
				'Không thể tạo danh mục mới',
			);
			set({
				error: errorMessage,
				isCreating: false,
			});
			throw error;
		}
	},

	updateCategory: async (id: number, data: UpdateCategoryFormData) => {
		try {
			set({ isUpdating: true, error: null });

			const updatedCategory = await categoryService.update(id, data);

			// Update in categories list
			set((state) => ({
				categories: state.categories.map((category) =>
					category.id === id ? updatedCategory : category,
				),
				currentCategory:
					state.currentCategory?.id === id
						? updatedCategory
						: state.currentCategory,
				isUpdating: false,
			}));

			return updatedCategory;
		} catch (error: unknown) {
			console.error('Lỗi cập nhật danh mục:', error);
			const errorMessage = extractErrorMessage(
				error,
				'Không thể cập nhật danh mục',
			);
			set({
				error: errorMessage,
				isUpdating: false,
			});
			throw error;
		}
	},

	deleteCategory: async (id: number) => {
		try {
			set({ isDeleting: true, error: null });

			await categoryService.delete(id);

			// Remove from categories list
			set((state) => ({
				categories: state.categories.filter(
					(category) => category.id !== id,
				),
				currentCategory:
					state.currentCategory?.id === id
						? null
						: state.currentCategory,
				totalItems: state.totalItems - 1,
				isDeleting: false,
			}));
		} catch (error: unknown) {
			console.error('Lỗi xóa danh mục:', error);
			const errorMessage = extractErrorMessage(
				error,
				'Không thể xóa danh mục',
			);
			set({
				error: errorMessage,
				isDeleting: false,
			});
			throw error;
		}
	},

	bulkDeleteCategories: async (data: BulkDeleteCategoryFormData) => {
		try {
			set({ isDeleting: true, error: null });

			const result = await categoryService.bulkDelete(data);

			// Remove deleted categories from list (compute from bulk response)
			const deletedIds = result.details
				.filter((d) => d.success)
				.map((d) => d.id);
			set((state) => ({
				categories: state.categories.filter(
					(category) => !deletedIds.includes(category.id),
				),
				totalItems: Math.max(0, state.totalItems - deletedIds.length),
				isDeleting: false,
			}));

			return result;
		} catch (error: unknown) {
			console.error('Lỗi xóa nhiều danh mục:', error);
			const errorMessage = extractErrorMessage(
				error,
				'Không thể xóa các danh mục đã chọn',
			);
			set({
				error: errorMessage,
				isDeleting: false,
			});
			throw error;
		}
	},

	// Utility actions
	clearError: () => set({ error: null }),

	clearCurrentCategory: () => set({ currentCategory: null }),

	setCurrentPage: (page: number) => set({ currentPage: page }),
}));
