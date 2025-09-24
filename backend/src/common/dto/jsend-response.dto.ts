import { ApiProperty } from '@nestjs/swagger'

/**
 * JSend Success Response DTO for OpenAPI documentation
 */
export class JSendSuccessDto<T = unknown> {
	@ApiProperty({
		description: 'Response status indicating success',
		example: 'success',
		enum: ['success'],
	})
	status: 'success'

	@ApiProperty({
		description: 'Response data',
		type: 'object',
		additionalProperties: true,
	})
	data: T
}

/**
 * JSend Fail Response DTO for OpenAPI documentation
 */
export class JSendFailDto<T = unknown> {
	@ApiProperty({
		description: 'Response status indicating client error',
		example: 'fail',
		enum: ['fail'],
	})
	status: 'fail'

	@ApiProperty({
		description: 'Error details and validation information',
		type: 'object',
		additionalProperties: true,
		example: {
			message: 'Validation failed',
			validation: ['email must be a valid email address'],
		},
	})
	data: T
}

/**
 * JSend Error Response DTO for OpenAPI documentation
 */
export class JSendErrorDto {
	@ApiProperty({
		description: 'Response status indicating server error',
		example: 'error',
		enum: ['error'],
	})
	status: 'error'

	@ApiProperty({
		description: 'Error message',
		example: 'Internal server error',
	})
	message: string

	@ApiProperty({
		description: 'Error code (optional)',
		example: 500,
		required: false,
	})
	code?: string | number

	@ApiProperty({
		description: 'Additional error data (optional)',
		required: false,
	})
	data?: unknown
}

/**
 * JSend Paginated Success Response DTO for OpenAPI documentation
 */
export class JSendPaginatedSuccessDto<T = unknown> {
	@ApiProperty({
		description: 'Response status indicating success',
		example: 'success',
		enum: ['success'],
	})
	status: 'success'

	@ApiProperty({
		description: 'Paginated response data',
		type: 'object',
		additionalProperties: true,
	})
	data: {
		items: T[]
		pagination: {
			page: number
			limit: number
			total: number
			totalPages: number
			hasNext: boolean
			hasPrev: boolean
		}
	}
}

/**
 * Validation Error Response DTO for OpenAPI documentation
 */
export class ValidationErrorDto {
	@ApiProperty({
		description: 'Response status indicating validation failure',
		example: 'fail',
		enum: ['fail'],
	})
	status: 'fail'

	@ApiProperty({
		description: 'Validation error details',
		type: 'object',
		additionalProperties: true,
		example: {
			validation: [
				'email must be a valid email address',
				'password must be at least 8 characters long',
			],
			error: 'Validation failed',
		},
	})
	data: {
		validation: string[]
		error: string
	}
}

/**
 * Common error responses for OpenAPI documentation
 */
export class UnauthorizedErrorDto {
	@ApiProperty({
		description: 'Response status indicating client error',
		example: 'fail',
		enum: ['fail'],
	})
	status: 'fail'

	@ApiProperty({
		description: 'Unauthorized error details',
		example: {
			message: 'Unauthorized access',
			statusCode: 401,
		},
	})
	data: {
		message: string
		statusCode: number
	}
}

export class ForbiddenErrorDto {
	@ApiProperty({
		description: 'Response status indicating client error',
		example: 'fail',
		enum: ['fail'],
	})
	status: 'fail'

	@ApiProperty({
		description: 'Forbidden error details',
		example: {
			message: 'Insufficient permissions',
			statusCode: 403,
		},
	})
	data: {
		message: string
		statusCode: number
	}
}

export class NotFoundErrorDto {
	@ApiProperty({
		description: 'Response status indicating client error',
		example: 'fail',
		enum: ['fail'],
	})
	status: 'fail'

	@ApiProperty({
		description: 'Not found error details',
		example: {
			message: 'Resource not found',
			statusCode: 404,
		},
	})
	data: {
		message: string
		statusCode: number
	}
}

export class ConflictErrorDto {
	@ApiProperty({
		description: 'Response status indicating client error',
		example: 'fail',
		enum: ['fail'],
	})
	status: 'fail'

	@ApiProperty({
		description: 'Conflict error details',
		example: {
			message: 'The email user@example.com is already registered',
			statusCode: 409,
		},
	})
	data: {
		message: string
		statusCode: number
	}
}

export class InternalServerErrorDto {
	@ApiProperty({
		description: 'Response status indicating server error',
		example: 'error',
		enum: ['error'],
	})
	status: 'error'

	@ApiProperty({
		description: 'Internal server error message',
		example: 'Internal server error',
	})
	message: string

	@ApiProperty({
		description: 'Error code',
		example: 500,
	})
	code: number
}
