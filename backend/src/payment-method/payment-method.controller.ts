import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PaymentMethodService } from './payment-method.service';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import {
  PaginatedResult,
  PaginationDto,
  PaginationMetadata,
} from '../common/dto/pagination.dto';
import { payment_method } from '../generated/prisma/client';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLES } from '../auth/constants/roles.constant';

@ApiTags('payment-methods')
@Controller('payment-methods')
@ApiBearerAuth()
@ApiExtraModels(PaginationMetadata)
/**
 * Controller for managing payment methods.
 * Provides endpoints for creating, retrieving, updating, and deleting payment methods.
 */
export class PaymentMethodController {
  constructor(private readonly paymentMethodService: PaymentMethodService) {}

  /**
   * Creates a new payment method.
   * This endpoint is restricted to users with the MANAGER role.
   * @param createDto - The data to create the payment method.
   * @returns The newly created payment method.
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new payment method (Manager only)' })
  @ApiBody({ type: CreatePaymentMethodDto })
  @ApiResponse({
    status: 201,
    description: 'Payment method created successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict (e.g., name already exists)',
  })
  async create(
    @Body() createDto: CreatePaymentMethodDto,
  ): Promise<payment_method> {
    return this.paymentMethodService.create(createDto);
  }

  /**
   * Retrieves a paginated list of all payment methods.
   * Accessible by all authenticated users.
   * @param paginationDto - The pagination options.
   * @returns A paginated result of payment methods.
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF, ROLES.CUSTOMER)
  @ApiOperation({
    summary: 'Get all payment methods with pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of payment methods',
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
  ): Promise<PaginatedResult<payment_method>> {
    return this.paymentMethodService.findAll(paginationDto);
  }

  /**
   * Retrieves a specific payment method by its ID.
   * Accessible by all authenticated users.
   * @param id - The ID of the payment method to retrieve.
   * @returns The payment method with the specified ID.
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF, ROLES.CUSTOMER)
  @ApiOperation({ summary: 'Get a payment method by ID' })
  @ApiParam({ name: 'id', description: 'Payment Method ID', type: Number })
  @ApiResponse({ status: 200, description: 'The payment method' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Payment method not found' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<payment_method> {
    return this.paymentMethodService.findOne(id);
  }

  /**
   * Retrieves a specific payment method by its name.
   * Accessible by all authenticated users.
   * @param name - The name of the payment method to retrieve.
   * @returns The payment method with the specified name, or null if not found.
   */
  @Get('by-name/:name')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF, ROLES.CUSTOMER)
  @ApiOperation({ summary: 'Get a payment method by its name' })
  @ApiParam({
    name: 'name',
    description: 'Payment method name (e.g., Cash)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'The payment method or null if not found',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Payment method not found' })
  async findByName(
    @Param('name') name: string,
  ): Promise<payment_method | null> {
    return this.paymentMethodService.findByName(name);
  }

  /**
   * Updates an existing payment method.
   * This endpoint is restricted to users with the MANAGER role.
   * @param id - The ID of the payment method to update.
   * @param updateDto - The data to update the payment method with.
   * @returns The updated payment method.
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @ApiOperation({ summary: 'Update a payment method by ID (Manager only)' })
  @ApiParam({ name: 'id', description: 'Payment Method ID', type: Number })
  @ApiBody({ type: UpdatePaymentMethodDto })
  @ApiResponse({
    status: 200,
    description: 'Payment method updated successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Payment method not found' })
  @ApiResponse({
    status: 409,
    description: 'Conflict (e.g., name already exists)',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdatePaymentMethodDto,
  ): Promise<payment_method> {
    return this.paymentMethodService.update(id, updateDto);
  }

  /**
   * Deletes a payment method by its ID.
   * This endpoint is restricted to users with the MANAGER role.
   * @param id - The ID of the payment method to delete.
   * @returns A promise that resolves when the deletion is complete.
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a payment method by ID (Manager only)' })
  @ApiParam({ name: 'id', description: 'Payment Method ID', type: Number })
  @ApiResponse({
    status: 204,
    description: 'Payment method deleted successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Payment method not found' })
  @ApiResponse({
    status: 409,
    description: 'Conflict (cannot delete if used by payments)',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.paymentMethodService.remove(id);
  }
}
