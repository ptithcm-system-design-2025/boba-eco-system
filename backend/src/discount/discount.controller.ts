import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DiscountService } from './discount.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { BulkDeleteDiscountDto } from './dto/bulk-delete-discount.dto';
import { PaginationDto, PaginatedResult, PaginationMetadata } from '../common/dto/pagination.dto';
import { discount } from '../generated/prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
  ApiExtraModels,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLES } from '../auth/constants/roles.constant';

@ApiTags('discounts')
@Controller('discounts')
@ApiBearerAuth()
@ApiExtraModels(PaginationMetadata)
export class DiscountController {
  constructor(private readonly discountService: DiscountService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new discount - Chỉ MANAGER' })
  @ApiBody({ type: CreateDiscountDto })
  @ApiResponse({
    status: 201,
    description: 'The discount has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict. Discount name or coupon code already exists.',
  })
  async create(
    @Body() createDiscountDto: CreateDiscountDto,
  ): Promise<discount> {
    return this.discountService.create(createDiscountDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF, ROLES.CUSTOMER)
  @ApiOperation({ summary: 'Get all discounts with pagination - Tất cả role' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Paginated list of discounts',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { type: 'object' },
        },
        pagination: {
          $ref: '#/components/schemas/PaginationMetadata',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResult<discount>> {
    return this.discountService.findAll(paginationDto);
  }


  @Delete('bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk delete discounts - Chỉ MANAGER' })
  @ApiBody({ type: BulkDeleteDiscountDto })
  @ApiResponse({
    status: 200,
    description: 'Bulk delete completed with results',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async bulkDelete(@Body() bulkDeleteDto: BulkDeleteDiscountDto): Promise<{
    deleted: number[];
    failed: { id: number; reason: string }[];
    summary: { total: number; success: number; failed: number };
  }> {
    return this.discountService.bulkDelete(bulkDeleteDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF, ROLES.CUSTOMER)
  @ApiOperation({ summary: 'Get a discount by ID - Tất cả role' })
  @ApiParam({ name: 'id', description: 'The ID of the discount', type: Number })
  @ApiResponse({ status: 200, description: 'Return the discount.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Discount not found.' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<discount | null> {
    return this.discountService.findOne(id);
  }

  @Get('coupon/:couponCode')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF, ROLES.CUSTOMER)
  @ApiOperation({ summary: 'Get a discount by Coupon Code - Tất cả role' })
  @ApiParam({
    name: 'couponCode',
    description: 'The coupon code associated with the discount',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Return the discount.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 404,
    description: 'Discount with this coupon code not found.',
  })
  async findByCouponCode(
    @Param('couponCode') couponCode: string,
  ): Promise<discount | null> {
    return this.discountService.findByCouponCode(couponCode);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @ApiOperation({ summary: 'Update a discount by ID - Chỉ MANAGER' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the discount to update',
    type: Number,
  })
  @ApiBody({ type: UpdateDiscountDto })
  @ApiResponse({
    status: 200,
    description: 'The discount has been successfully updated.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Discount not found.' })
  @ApiResponse({
    status: 409,
    description: 'Conflict. Coupon code or other unique constraint violation.',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDiscountDto: UpdateDiscountDto,
  ): Promise<discount> {
    return this.discountService.update(id, updateDiscountDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a discount by ID - Chỉ MANAGER' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the discount to delete',
    type: Number,
  })
  @ApiResponse({
    status: 204,
    description: 'The discount has been successfully deleted.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Discount not found.' })
  @ApiResponse({
    status: 409,
    description: 'Conflict. Discount is associated with other records.',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.discountService.remove(id);
  }

}
