import { Controller, Get } from '@nestjs/common'
import type { AppService } from './app.service'

/**
 * AppController handles the root application routes.
 * This is the main controller for the root application module.
 */
@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	/**
	 * Handles GET requests to the root path.
	 * @returns A hello world string from the AppService
	 */
	@Get()
	getHello(): string {
		return this.appService.getHello()
	}
}
