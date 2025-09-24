import { Module } from '@nestjs/common'
import { CategoryController } from './category.controller'
import { CategoryService } from './category.service'
/**
 * Module that bundles CategoryController and CategoryService.
 * Provides category-related functionality to the application.
 */
@Module({
	controllers: [CategoryController],
	providers: [CategoryService],
	exports: [CategoryService],
})
export class CategoryModule {}
