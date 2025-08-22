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
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ValidateDiscountDto } from './dto/validate-discount.dto';
import { PaginationDto, PaginatedResult, PaginationMetadata } from '../common/dto/pagination.dto';
import { order, Prisma, order_status_enum } from '../generated/prisma/client'; // Import Prisma namespace for types
import { ORDER_STATUS_VALUES } from '../common/constants/enums';
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

@ApiTags('orders')
@Controller('orders')
@ApiBearerAuth('JWT-auth')
@ApiExtraModels(PaginationMetadata)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF, ROLES.CUSTOMER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new order - Tất cả role' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({
    status: 201,
    description:
      'Order created successfully.' /*, type: OrderEntity (nếu có) */,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request (e.g., validation error, no products)',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 404,
    description:
      'Not Found (e.g., employee, customer, product_price, or discount not found)',
  })
  @ApiResponse({
    status: 422,
    description:
      'Unprocessable Entity (e.g., product not active, discount not valid)',
  })
  async create(@Body() createOrderDto: CreateOrderDto): Promise<order> {
    return this.orderService.create(createOrderDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF)
  @ApiOperation({
    summary:
      'Get all orders with pagination and filtering - Chỉ MANAGER và STAFF',
  })
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
  @ApiQuery({
    name: 'customerId',
    required: false,
    type: Number,
    description: 'Filter by customer ID',
  })
  @ApiQuery({
    name: 'employeeId',
    required: false,
    type: Number,
    description: 'Filter by employee ID',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Filter by order status (PROCESSING, CANCELLED, COMPLETED)',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Paginated list of orders',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { type: 'object' }, // Có thể cải thiện bằng cách định nghĩa order schema
        },
        pagination: {
          $ref: '#/components/schemas/PaginationMetadata',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query('customerId') customerId?: string,
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: order_status_enum,
  ): Promise<PaginatedResult<order>> {
    const filters = {
      ...(customerId && { customerId: parseInt(customerId, 10) }),
      ...(employeeId && { employeeId: parseInt(employeeId, 10) }),
      ...(status && { status }),
    };

    return this.orderService.findAll(paginationDto, filters);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF, ROLES.CUSTOMER)
  @ApiOperation({
    summary:
      'Get a specific order by ID - Tất cả role (CUSTOMER chỉ xem order của mình)',
  })
  @ApiParam({ name: 'id', description: 'Order ID', type: Number })
  @ApiResponse({ status: 200, description: 'The order details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<order> {
    return this.orderService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF)
  @ApiOperation({ summary: 'Update an existing order - Chỉ MANAGER và STAFF' })
  @ApiParam({ name: 'id', description: 'Order ID', type: Number })
  @ApiBody({ type: UpdateOrderDto })
  @ApiResponse({ status: 200, description: 'Order updated successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found or related entity not found during update',
  })
  @ApiResponse({
    status: 422,
    description:
      'Unprocessable Entity (e.g., product not active, discount not valid during update)',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<order> {
    return this.orderService.update(id, updateOrderDto);
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF, ROLES.CUSTOMER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Hủy đơn hàng - Tất cả role',
    description:
      'Thay đổi trạng thái đơn hàng thành CANCELLED. CUSTOMER chỉ có thể hủy đơn hàng của mình và chỉ khi đơn hàng ở trạng thái PENDING.',
  })
  @ApiParam({ name: 'id', description: 'Order ID', type: Number })
  @ApiResponse({ status: 200, description: 'Đơn hàng đã được hủy thành công' })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request - Đơn hàng không thể hủy (đã hoàn thành hoặc đã hủy)',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Không có quyền hủy đơn hàng này',
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async cancelOrder(@Param('id', ParseIntPipe) id: number): Promise<order> {
    return this.orderService.cancelOrder(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @HttpCode(HttpStatus.OK) // Trả về order đã xóa thay vì 204 No Content
  @ApiOperation({ summary: 'Delete an order by ID - Chỉ MANAGER' })
  @ApiParam({ name: 'id', description: 'Order ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Order deleted successfully (returns the deleted order).',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  // @ApiResponse({ status: 400, description: 'Cannot delete completed order (tùy business logic)' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<order> {
    return this.orderService.remove(id);
  }

  @Get('employee/:employeeId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.STAFF, ROLES.MANAGER)
  @ApiOperation({
    summary: 'Lấy đơn hàng theo nhân viên với pagination - STAFF/MANAGER',
  })
  @ApiParam({ name: 'employeeId', description: 'Employee ID', type: Number })
  @ApiResponse({ status: 200, description: 'Danh sách đơn hàng của nhân viên' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async findByEmployee(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResult<order>> {
    return this.orderService.findByEmployee(employeeId, paginationDto);
  }

  @Get('customer/:customerId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.STAFF, ROLES.MANAGER)
  @ApiOperation({
    summary: 'Lấy đơn hàng theo khách hàng với pagination - STAFF/MANAGER',
  })
  @ApiParam({ name: 'customerId', description: 'Customer ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Danh sách đơn hàng của khách hàng',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async findByCustomer(
    @Param('customerId', ParseIntPipe) customerId: number,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResult<order>> {
    return this.orderService.findByCustomer(customerId, paginationDto);
  }

  @Get('status/:status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF)
  @ApiOperation({
    summary: 'Lấy đơn hàng theo trạng thái với pagination - MANAGER/STAFF',
  })
  @ApiParam({ 
    name: 'status', 
    description: 'Order status (PROCESSING, CANCELLED, COMPLETED)', 
    type: String 
  })
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
    description: 'Danh sách đơn hàng theo trạng thái',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async findByStatus(
    @Param('status') status: order_status_enum,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResult<order>> {
    return this.orderService.findByStatus(status, paginationDto);
  }

  @Post('validate-discounts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF, ROLES.CUSTOMER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Kiểm tra tính hợp lệ của các discount cho đơn hàng - Tất cả role',
    description: 'Validate xem các discount có thể áp dụng cho đơn hàng không, bao gồm kiểm tra điều kiện khách hàng, membership, và giới hạn sử dụng',
  })
  @ApiBody({ type: ValidateDiscountDto })
  @ApiResponse({
    status: 200,
    description: 'Kết quả validation các discount với thông tin chi tiết',
    schema: {
      type: 'object',
      properties: {
        valid_discounts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              discount_id: { type: 'number' },
              discount_name: { type: 'string' },
              discount_amount: { type: 'number' },
              reason: { type: 'string' },
            },
          },
        },
        invalid_discounts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              discount_id: { type: 'number' },
              discount_name: { type: 'string' },
              reason: { type: 'string' },
            },
          },
        },
        summary: {
          type: 'object',
          properties: {
            total_checked: { type: 'number' },
            valid_count: { type: 'number' },
            invalid_count: { type: 'number' },
            total_discount_amount: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async validateDiscounts(@Body() validateDiscountDto: ValidateDiscountDto) {
    return this.orderService.validateDiscounts(validateDiscountDto);
  }
}
