/**
 * API Client Configuration
 * Cấu hình client API với environment variables và JSend response handling
 */

import { extractErrorMessage } from '@/lib/utils/jsend';
import { isJSendFail, type JSendResponse } from '@/types/protocol/jsend';

// API Configuration từ environment variables
const API_CONFIG = {
	BASE_URL:
		process.env.NEXT_PUBLIC_API_URL || 'https://localhost:4653/api/v1',
	TIMEOUT: 10000, // 10 seconds
	RETRY_ATTEMPTS: 3,
} as const;

// Error types
export class ApiError extends Error {
	constructor(
		message: string,
		public status: number,
		public response?: unknown,
	) {
		super(message);
		this.name = 'ApiError';
	}
}

export class NetworkError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'NetworkError';
	}
}

/**
 * API Client class với retry logic và error handling
 */
class ApiClient {
	private baseURL: string;
	private timeout: number;
	private retryAttempts: number;
	private isRefreshing: boolean = false;
	private refreshPromise: Promise<string> | null = null;

	constructor() {
		this.baseURL = API_CONFIG.BASE_URL;
		this.timeout = API_CONFIG.TIMEOUT;
		this.retryAttempts = API_CONFIG.RETRY_ATTEMPTS;
	}

	/**
	 * Lấy headers mặc định với auth token
	 */
	private getHeaders(isFormData: boolean = false): HeadersInit {
		const token =
			typeof window !== 'undefined'
				? localStorage.getItem('auth_token')
				: null;

		const headers: HeadersInit = {
			...(token && { Authorization: `Bearer ${token}` }),
		};

		// Không set Content-Type cho FormData, để browser tự set với boundary
		if (!isFormData) {
			headers['Content-Type'] = 'application/json';
		}

		return headers;
	}

	/**
	 * Refresh access token
	 */
	private async refreshAccessToken(): Promise<string> {
		if (this.isRefreshing && this.refreshPromise) {
			return this.refreshPromise;
		}

		this.isRefreshing = true;
		this.refreshPromise = this.performTokenRefresh();

		try {
			const newToken = await this.refreshPromise;
			return newToken;
		} finally {
			this.isRefreshing = false;
			this.refreshPromise = null;
		}
	}

	/**
	 * Thực hiện refresh token
	 */
	private async performTokenRefresh(): Promise<string> {
		try {
			const response = await fetch(`${this.baseURL}/auth/refresh`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include', // Để gửi cookie refresh_token
			});

			if (!response.ok) {
				throw new Error('Không thể refresh token');
			}

			const data = await response.json();
			const newToken = data.access_token;

			// Cập nhật token mới vào localStorage
			if (typeof window !== 'undefined') {
				localStorage.setItem('auth_token', newToken);
			}

			return newToken;
		} catch (error) {
			// Nếu refresh thất bại, clear auth và redirect về login
			if (typeof window !== 'undefined') {
				localStorage.removeItem('auth_token');
				// Dispatch custom event để auth store có thể lắng nghe
				window.dispatchEvent(new CustomEvent('auth:token-expired'));
			}
			throw error;
		}
	}

	/**
	 * Xử lý response từ API với JSend format và auto refresh token
	 */
	private async handleResponse<T>(
		response: Response,
		originalRequest?: () => Promise<Response>,
	): Promise<T> {
		// Nếu gặp lỗi 401 và có originalRequest, thử refresh token
		if (response.status === 401 && originalRequest && !this.isRefreshing) {
			try {
				await this.refreshAccessToken();

				// Retry request với token mới
				const retryResponse = await originalRequest();
				return this.handleResponse<T>(retryResponse);
			} catch (refreshError) {
				// Nếu refresh thất bại, throw lỗi 401 gốc
				console.error('Token refresh failed:', refreshError);
			}
		}

		// Parse response body first
		let responseData: unknown;
		try {
			responseData = await response.json();
		} catch (_error) {
			// If response is not JSON, handle as network/server error
			const errorMessage = response.ok
				? 'Phản hồi không hợp lệ từ server'
				: `HTTP ${response.status}: ${await response.text().catch(() => 'Unknown error')}`;
			throw new ApiError(errorMessage, response.status, null);
		}

		// Handle non-200 HTTP status codes
		if (!response.ok) {
			// Try to extract error message from JSend error response
			let errorMessage = `HTTP ${response.status}`;

			if (responseData && typeof responseData === 'object') {
				const data = responseData as Record<string, unknown>;
				// Check if it's a JSend error/fail response
				if (data.status === 'error' && typeof data.message === 'string') {
					errorMessage = data.message;
				} else if (data.status === 'fail') {
					errorMessage = extractErrorMessage(
						responseData,
						errorMessage,
					);
				} else if (typeof data.message === 'string') {
					errorMessage = data.message;
				} else if (typeof data.error === 'string') {
					errorMessage = data.error;
				}
			}

			throw new ApiError(errorMessage, response.status, responseData);
		}

		// For successful responses, check if it's JSend format
		if (
			responseData &&
			typeof responseData === 'object' &&
			'status' in responseData
		) {
			// If it's a JSend fail/error response with 200 status (shouldn't happen but handle it)
			if (isJSendFail(responseData as JSendResponse)) {
				const errorMessage = extractErrorMessage(
					responseData,
					'API request failed',
				);
				throw new ApiError(errorMessage, response.status, responseData);
			}
		}

		// Return the JSend response as-is for services to handle
		return responseData as T;
	}

	/**
	 * Retry logic cho network requests
	 */
	private async fetchWithRetry(
		url: string,
		options: RequestInit,
		attempt: number = 1,
	): Promise<Response> {
		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(
				() => controller.abort(),
				this.timeout,
			);

			const response = await fetch(url, {
				...options,
				signal: controller.signal,
			});

			clearTimeout(timeoutId);
			return response;
		} catch (error) {
			if (attempt < this.retryAttempts && this.shouldRetry(error)) {
				console.warn(
					`API request failed, retrying... (${attempt}/${this.retryAttempts})`,
				);
				await this.delay(1000 * attempt); // Exponential backoff
				return this.fetchWithRetry(url, options, attempt + 1);
			}

			if (error instanceof Error && error.name === 'AbortError') {
				throw new NetworkError('Yêu cầu bị timeout');
			}

			throw new NetworkError('Lỗi kết nối mạng');
		}
	}

	/**
	 * Kiểm tra có nên retry không
	 */
	private shouldRetry(error: unknown): boolean {
		return (
			error instanceof TypeError || // Network error
			(error instanceof ApiError && error.status >= 500) // Server error
		);
	}

	/**
	 * Delay helper cho retry
	 */
	private delay(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	/**
	 * GET request
	 */
	async get<T>(
		endpoint: string,
		params?: Record<string, unknown>,
	): Promise<T> {
		const url = new URL(this.baseURL + endpoint);

		if (params) {
			Object.entries(params).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					url.searchParams.append(key, String(value));
				}
			});
		}

		const makeRequest = () =>
			this.fetchWithRetry(url.toString(), {
				method: 'GET',
				headers: this.getHeaders(),
			});

		const response = await makeRequest();
		return this.handleResponse<T>(response, makeRequest);
	}

	/**
	 * POST request
	 */
	async post<T>(endpoint: string, data?: unknown): Promise<T> {
		const url = new URL(this.baseURL + endpoint);
		const isFormData = data instanceof FormData;

		const makeRequest = () =>
			this.fetchWithRetry(url.toString(), {
				method: 'POST',
				headers: this.getHeaders(isFormData),
				body: isFormData
					? data
					: data
						? JSON.stringify(data)
						: undefined,
			});

		const response = await makeRequest();
		return this.handleResponse<T>(response, makeRequest);
	}

	/**
	 * PATCH request
	 */
	async patch<T>(endpoint: string, data?: unknown): Promise<T> {
		const url = new URL(this.baseURL + endpoint);

		const makeRequest = () =>
			this.fetchWithRetry(url.toString(), {
				method: 'PATCH',
				headers: this.getHeaders(),
				body: data ? JSON.stringify(data) : undefined,
			});

		const response = await makeRequest();
		return this.handleResponse<T>(response, makeRequest);
	}

	/**
	 * PUT request
	 */
	async put<T>(endpoint: string, data?: unknown): Promise<T> {
		const url = new URL(this.baseURL + endpoint);

		const makeRequest = () =>
			this.fetchWithRetry(url.toString(), {
				method: 'PUT',
				headers: this.getHeaders(),
				body: data ? JSON.stringify(data) : undefined,
			});

		const response = await makeRequest();
		return this.handleResponse<T>(response, makeRequest);
	}

	/**
	 * DELETE request
	 */
	async delete<T>(endpoint: string, data?: unknown): Promise<T> {
		const url = new URL(this.baseURL + endpoint);

		const makeRequest = () =>
			this.fetchWithRetry(url.toString(), {
				method: 'DELETE',
				headers: this.getHeaders(),
				body: data ? JSON.stringify(data) : undefined,
			});

		const response = await makeRequest();
		return this.handleResponse<T>(response, makeRequest);
	}

	/**
	 * Health check
	 */
	async healthCheck(): Promise<{ status: string; timestamp: string }> {
		try {
			return await this.get('/health');
		} catch (error) {
			console.error('API Health check failed:', error);
			throw error;
		}
	}

	/**
	 * Lấy thông tin cấu hình API
	 */
	getConfig() {
		return {
			baseURL: this.baseURL,
			timeout: this.timeout,
			retryAttempts: this.retryAttempts,
		};
	}
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export configuration
export { API_CONFIG };
