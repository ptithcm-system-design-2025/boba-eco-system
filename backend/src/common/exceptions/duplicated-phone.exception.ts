import { ConflictException } from '@nestjs/common';

/**
 * Exception thrown when attempting to create an account with a phone number that already exists
 */
export class DuplicatedPhoneException extends ConflictException {
	constructor(phone: string) {
		super(`The phone number ${phone} is already registered`);
	}
}
