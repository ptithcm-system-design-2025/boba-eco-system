/**
 * JSend Response Format Interfaces
 * Based on JSend specification: https://github.com/omniti-labs/jsend
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
 * Helper type for pagination responses
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
 * Helper functions to create JSend responses
 */
export namespace JSendHelper {
	/**
	 * Create a success response
	 */
	export function success<T>(data: T): JSendSuccess<T> {
		return {
			status: 'success',
			data,
		};
	}

	/**
	 * Create a fail response (client error)
	 */
	export function fail<T>(data: T): JSendFail<T> {
		return {
			status: 'fail',
			data,
		};
	}

	/**
	 * Create an error response (server error)
	 */
	export function error(
		message: string,
		code?: string | number,
		data?: unknown
	): JSendError {
		const response: JSendError = {
			status: 'error',
			message,
		};

		if (code !== undefined) {
			response.code = code;
		}

		if (data !== undefined) {
			response.data = data;
		}

		return response;
	}

	/**
	 * Create a paginated success response
	 */
	export function paginatedSuccess<T>(
		items: T[],
		pagination: {
			page: number;
			limit: number;
			total: number;
			totalPages: number;
			hasNext: boolean;
			hasPrev: boolean;
		}
	): JSendPaginatedSuccess<T> {
		return {
			status: 'success',
			data: {
				items,
				pagination,
			},
		};
	}
}
