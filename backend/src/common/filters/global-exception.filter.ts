import {
	type ArgumentsHost,
	BadRequestException,
	Catch,
	type ExceptionFilter,
	HttpException,
	HttpStatus,
	Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { JSendHelper } from '../interfaces/jsend.interface';

/**
 * Global Exception Filter that formats all exceptions according to JSend specification
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
	private readonly logger = new Logger(GlobalExceptionFilter.name);

	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest();

		let status: number;
		let jsendResponse: JSendResponse;

		if (exception instanceof HttpException) {
			status = exception.getStatus();
			const exceptionResponse = exception.getResponse();

			// Handle validation errors (BadRequestException with validation details)
			if (
				exception instanceof BadRequestException &&
				typeof exceptionResponse === 'object'
			) {
				const validationResponse = exceptionResponse as {
					message?: string | string[];
					error?: string;
					statusCode?: number;
				};

				// Check if it's a validation error from class-validator
				if (
					validationResponse.message &&
					Array.isArray(validationResponse.message)
				) {
					jsendResponse = JSendHelper.fail({
						validation: validationResponse.message,
						error: validationResponse.error || 'Validation failed',
					});
				} else {
					// Regular BadRequestException - treat as fail (client error)
					jsendResponse = JSendHelper.fail({
						message: exception.message,
						error: validationResponse.error || 'Bad Request',
					});
				}
			} else if (status >= 400 && status < 500) {
				// Client errors (4xx) - use JSend fail format
				jsendResponse = JSendHelper.fail({
					message: exception.message,
					statusCode: status,
				});
			} else {
				// Server errors (5xx) - use JSend error format
				jsendResponse = JSendHelper.error(
					exception.message || 'Internal server error',
					status
				);
			}
		} else {
			// Unknown exceptions - treat as server error
			status = HttpStatus.INTERNAL_SERVER_ERROR;
			jsendResponse = JSendHelper.error(
				'Internal server error',
				status,
				process.env.NODE_ENV === 'development' ? exception : undefined
			);
		}

		// Log the exception
		this.logger.error(
			`${request.method} ${request.url} - ${status} - ${
				exception instanceof Error ? exception.message : 'Unknown error'
			}`,
			exception instanceof Error ? exception.stack : undefined
		);

		response.status(status).json(jsendResponse);
	}
}
