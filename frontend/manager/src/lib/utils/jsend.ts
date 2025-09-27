/**
 * JSend Utility Functions
 * Helper functions for working with JSend response format
 */

import type { JSendResponse } from '@/types/protocol/jsend';
import {
    isJSendError,
    isJSendFail,
    isJSendPaginatedSuccess,
    isJSendSuccess,
} from '@/types/protocol/jsend';

/**
 * Extract data from JSend Success response
 * Throws error if response is not success
 */
export function extractJSendData<T>(response: JSendResponse<T>): T {
	if (isJSendSuccess(response)) {
		return response.data;
	}

	if (isJSendFail(response)) {
		throw new Error(`JSend Fail: ${JSON.stringify(response.data)}`);
	}

	if (isJSendError(response)) {
		throw new Error(`JSend Error: ${response.message}`);
	}

	throw new Error('Invalid JSend response');
}

/**
 * Extract items and pagination from JSend Paginated Success response
 * Returns object with items array and pagination metadata
 */
export function extractJSendPaginatedData<T>(
	response: JSendResponse<unknown>,
): {
	items: T[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasNext: boolean;
		hasPrev: boolean;
	};
} {
	if (isJSendPaginatedSuccess<T>(response)) {
		return response.data;
	}

	if (isJSendFail(response)) {
		throw new Error(`JSend Fail: ${JSON.stringify(response.data)}`);
	}

	if (isJSendError(response)) {
		throw new Error(`JSend Error: ${response.message}`);
	}

	throw new Error('Invalid JSend paginated response');
}

/**
 * Extract error message from JSend Fail or Error response
 * Returns user-friendly error message for display
 */
export function extractJSendErrorMessage(
	response: JSendResponse,
	defaultMessage: string = 'Đã xảy ra lỗi',
): string {
	if (isJSendError(response)) {
		return response.message;
	}

	if (isJSendFail(response)) {
		// Handle validation errors or other fail data
		if (typeof response.data === 'string') {
			return response.data;
		}

		if (
			typeof response.data === 'object' &&
			response.data !== null &&
			'message' in response.data &&
			typeof response.data.message === 'string'
		) {
			return response.data.message;
		}

		// For validation errors, try to extract first error message
		if (
			typeof response.data === 'object' &&
			response.data !== null &&
			'errors' in response.data &&
			Array.isArray(response.data.errors) &&
			response.data.errors.length > 0
		) {
			const firstError = response.data.errors[0];
			if (typeof firstError === 'string') {
				return firstError;
			}
			if (
				typeof firstError === 'object' &&
				firstError !== null &&
				'message' in firstError
			) {
				return String(firstError.message);
			}
		}

		// Fallback for complex fail data
		return `Validation error: ${JSON.stringify(response.data)}`;
	}

	return defaultMessage;
}

/**
 * Extract error message from any error object (including ApiError with JSend response)
 * This is the main function stores should use for error handling
 */
export function extractErrorMessage(
	error: unknown,
	defaultMessage: string = 'Đã xảy ra lỗi',
): string {
	// Type guard for error with response property
	const hasResponse = (err: unknown): err is { response: unknown } => {
		return typeof err === 'object' && err !== null && 'response' in err;
	};

	// Type guard for error with message property
	const hasMessage = (err: unknown): err is { message: string } => {
		return typeof err === 'object' && err !== null && 'message' in err &&
			typeof (err as Record<string, unknown>).message === 'string';
	};

	// Type guard for legacy error structure
	const hasLegacyResponse = (err: unknown): err is { response: { data: { message: string } } } => {
		if (typeof err !== 'object' || err === null || !('response' in err)) return false;
		const errWithResponse = err as Record<string, unknown>;
		if (typeof errWithResponse.response !== 'object' || errWithResponse.response === null) return false;
		const response = errWithResponse.response as Record<string, unknown>;
		if (!('data' in response) || typeof response.data !== 'object' || response.data === null) return false;
		const data = response.data as Record<string, unknown>;
		return 'message' in data && typeof data.message === 'string';
	};

	// If error has JSend response (from ApiError)
	if (hasResponse(error) && typeof error.response === 'object') {
		try {
			return extractJSendErrorMessage(error.response as JSendResponse, defaultMessage);
		} catch {
			// Fallback if response is not valid JSend
		}
	}

	// If error has message property
	if (hasMessage(error)) {
		return error.message;
	}

	// Legacy error handling for backward compatibility
	if (hasLegacyResponse(error)) {
		return error.response.data.message;
	}

	return defaultMessage;
}

/**
 * Check if JSend response indicates success
 */
export function isJSendSuccessResponse(response: JSendResponse): boolean {
	return isJSendSuccess(response) || isJSendPaginatedSuccess(response);
}

/**
 * Check if JSend response indicates failure (fail or error)
 */
export function isJSendFailureResponse(response: JSendResponse): boolean {
	return isJSendFail(response) || isJSendError(response);
}

/**
 * Safe data extraction that returns null if response is not success
 * Useful for optional data extraction without throwing errors
 */
export function safeExtractJSendData<T>(response: JSendResponse<T>): T | null {
	try {
		return extractJSendData(response);
	} catch {
		return null;
	}
}

/**
 * Transform JSend paginated response to frontend PaginatedResponse format
 * This maintains compatibility with existing frontend pagination interfaces
 */
export function transformJSendPaginatedResponse<T>(
	response: JSendResponse<unknown>,
): {
	data: T[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
} {
	const { items, pagination } = extractJSendPaginatedData<T>(response);

	return {
		data: items,
		total: pagination.total,
		page: pagination.page,
		limit: pagination.limit,
		totalPages: pagination.totalPages,
	};
}
