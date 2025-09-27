import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { AppService } from './app.service';
import { JSendSuccessDto } from './common/dto/jsend-response.dto';

/**
 * AppController handles the root application routes.
 * This is the main controller for the root application module.
 */
@ApiTags('app')
@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	/**
	 * Handles GET requests to the root path.
	 * Returns a welcome message for the API
	 */
	@Get()
	@ApiOperation({
		summary: 'Get API welcome message',
		description: 'Returns a welcome message indicating the API is running',
	})
	@ApiResponse({
		status: 200,
		description: 'Welcome message returned successfully',
		type: JSendSuccessDto,
	})
	getHello(): string {
		return this.appService.getHello();
	}
}
