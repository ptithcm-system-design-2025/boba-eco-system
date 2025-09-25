import { NotFoundException } from '@nestjs/common';

/**
 * Exception thrown when a requested resource is not found
 */
export class ResourceNotFoundException extends NotFoundException {
	constructor(resource: string, identifier: string | number) {
		super(`${resource} with identifier '${identifier}' not found`);
	}
}
