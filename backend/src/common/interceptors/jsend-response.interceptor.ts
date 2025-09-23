import {
	type CallHandler,
	type ExecutionContext,
	Injectable,
	type NestInterceptor,
} from '@nestjs/common'
import type { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { JSendHelper, type JSendResponse } from '../interfaces/jsend.interface'

/**
 * Interceptor that wraps successful responses in JSend format
 */
@Injectable()
export class JSendResponseInterceptor implements NestInterceptor {
	intercept(
		_context: ExecutionContext,
		next: CallHandler
	): Observable<JSendResponse> {
		return next.handle().pipe(
			map((data) => {
				if (this.isJSendResponse(data)) {
					return data
				}
				if (this.isPaginatedResponse(data)) {
					return JSendHelper.paginatedSuccess(
						data.data,
						data.pagination as {
							page: number
							limit: number
							total: number
							totalPages: number
							hasNext: boolean
							hasPrev: boolean
						}
					)
				}
				return JSendHelper.success(data)
			})
		)
	}

	/**
	 * Check if the response is already in JSend format
	 */
	private isJSendResponse(data: unknown): data is JSendResponse {
		return Boolean(
			data &&
				typeof data === 'object' &&
				'status' in data &&
				(data.status === 'success' ||
					data.status === 'fail' ||
					data.status === 'error')
		)
	}

	/**
	 * Check if the response is a paginated response
	 */
	private isPaginatedResponse(
		data: unknown
	): data is { data: unknown[]; pagination: unknown } {
		return Boolean(
			data &&
				typeof data === 'object' &&
				'data' in data &&
				'pagination' in data &&
				Array.isArray(data.data) &&
				typeof data.pagination === 'object' &&
				data.pagination &&
				'page' in data.pagination &&
				'limit' in data.pagination &&
				'total' in data.pagination
		)
	}
}
