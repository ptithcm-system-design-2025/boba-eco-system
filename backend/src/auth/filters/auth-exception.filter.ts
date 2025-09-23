import {
	type ArgumentsHost,
	Catch,
	type ExceptionFilter,
	Logger,
	UnauthorizedException,
} from '@nestjs/common'
import type { Response } from 'express'

@Catch(UnauthorizedException)
export class AuthExceptionFilter implements ExceptionFilter {
	private readonly logger = new Logger(AuthExceptionFilter.name)

	catch(exception: UnauthorizedException, host: ArgumentsHost) {
		const ctx = host.switchToHttp()
		const response = ctx.getResponse<Response>()
		const request = ctx.getRequest()

		const status = exception.getStatus()
		const message = exception.message || 'Unauthorized'

		this.logger.warn(
			`Unauthorized access attempt: ${request.method} ${request.url} - IP: ${request.ip}`
		)

		response.status(status).json({
			statusCode: status,
			timestamp: new Date().toISOString(),
			path: request.url,
			message: message,
			error: 'Unauthorized',
		})
	}
}
