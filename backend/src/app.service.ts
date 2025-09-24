import { Injectable } from '@nestjs/common'

/**
 * AppService provides basic application functionality.
 * This is the main service for the root application module.
 */
@Injectable()
export class AppService {
	/**
	 * Returns a simple greeting message.
	 * @returns A hello world string
	 */
	getHello(): string {
		return 'Hello World!'
	}
}
