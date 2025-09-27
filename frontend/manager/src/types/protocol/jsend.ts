/**
 * JSend Response Format Types
 * Based on JSend specification: https://github.com/omniti-labs/jsend
 * These types mirror the backend JSend interfaces for frontend compliance
 */

/**
 * JSend Success Response
 * Used when the API call is successful and data is returned
 */
export interface JSendSuccess<T = unknown> {
	status: 'success';
	data: T;
}

/**
 * JSend Fail Response
 * Used when the API call fails due to client error (validation, missing data, etc.)
 */
export interface JSendFail<T = unknown> {
	status: 'fail';
	data: T;
}

/**
 * JSend Error Response
 * Used when the API call fails due to server error (exception, system error, etc.)
 */
export interface JSendError {
	status: 'error';
	message: string;
	code?: string | number;
	data?: unknown;
}

/**
 * Union type for all JSend response types
 */
export type JSendResponse<T = unknown> =
	| JSendSuccess<T>
	| JSendFail<T>
	| JSendError;

/**
 * JSend Paginated Success Response
 * Used for paginated list endpoints that return items with pagination metadata
 */
export interface JSendPaginatedSuccess<T = unknown> {
	status: 'success';
	data: {
		items: T[];
		pagination: {
			page: number;
			limit: number;
			total: number;
			totalPages: number;
			hasNext: boolean;
			hasPrev: boolean;
		};
	};
}

/**
 * Type guard to check if response is JSend Success
 */
export function isJSendSuccess<T>(
	response: JSendResponse<T>,
): response is JSendSuccess<T> {
	return response.status === 'success';
}

/**
 * Type guard to check if response is JSend Fail
 */
export function isJSendFail<T>(
	response: JSendResponse<T>,
): response is JSendFail<T> {
	return response.status === 'fail';
}

/**
 * Type guard to check if response is JSend Error
 */
export function isJSendError(response: JSendResponse): response is JSendError {
	return response.status === 'error';
}

/**
 * Type guard to check if response is JSend Paginated Success
 */
export function isJSendPaginatedSuccess<T>(
	response: JSendResponse<unknown>,
): response is JSendPaginatedSuccess<T> {
	return (
		response.status === 'success' &&
		typeof response.data === 'object' &&
		response.data !== null &&
		'items' in response.data &&
		'pagination' in response.data &&
		Array.isArray(response.data.items)
	);
}

/**
 * Utility type for extracting data type from JSend Success response
 */
export type ExtractJSendData<T> = T extends JSendSuccess<infer U> ? U : never;

/**
 * Utility type for extracting items type from JSend Paginated Success response
 */
export type ExtractJSendItems<T> = T extends JSendPaginatedSuccess<infer U>
	? U
	: never;
