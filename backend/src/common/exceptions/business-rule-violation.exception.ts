import { BadRequestException } from '@nestjs/common'

/**
 * Exception thrown when a business rule is violated
 */
export class BusinessRuleViolationException extends BadRequestException {
	constructor(rule: string, details?: string) {
		const message = details
			? `Business rule violation: ${rule}. ${details}`
			: `Business rule violation: ${rule}`
		super(message)
	}
}
