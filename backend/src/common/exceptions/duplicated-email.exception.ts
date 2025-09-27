import { BadRequestException } from '@nestjs/common';

/**
 * Exception thrown when an attempt is made to register or use an email address
 * that already exists in the system.
 *
 * Extends BadRequestException to represent a 400-level client error.
 *
 * @param email - The email address that is already registered and will be
 *                included in the generated error message.
 *
 * @example
 * // Throw when a registration attempt uses an existing email
 * throw new DuplicatedEmailException('user@example.com');
 */
export class DuplicatedEmailException extends BadRequestException {
	constructor(email: string) {
		super(`The email ${email} is already registered`);
	}
}
