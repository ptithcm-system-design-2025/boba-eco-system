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
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { BulkDeleteCustomerDto } from './dto/bulk-delete-customer.dto';
import {
  PaginatedResult,
  PaginationDto,
  PaginationMetadata,
} from '../common/dto/pagination.dto';
import { customer } from '../generated/prisma/client';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLES } from '../auth/constants/roles.constant';
import { AccountService } from '../account/account.service';
import { CreateAccountDto } from '../account/dto/create-account.dto';
import { UpdateAccountDto } from '../account/dto/update-account.dto';
import { LockAccountDto } from '../account/dto/lock-account.dto';

@ApiTags('customers')
@Controller('customers')
@ApiBearerAuth('JWT-auth')
@ApiExtraModels(PaginationMetadata)
export class CustomerController {
  constructor(
    private readonly customerService: CustomerService,
    private readonly accountService: AccountService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new customer - MANAGER and STAFF only',
    description:
      'The system will automatically assign the membership type with the lowest required points and set the current points to that value.',
  })
  @ApiBody({ type: CreateCustomerDto })
  @ApiResponse({
    status: 201,
    description:
      'Customer created successfully with automatic membership type and points.',
    schema: {
      type: 'object',
      properties: {
        customer_id: { type: 'number', description: 'Customer ID' },
        full_name: { type: 'string', description: 'Full name' },
        phone: { type: 'string', description: 'Phone number' },
        email: { type: 'string', description: 'Email', nullable: true },
        address: { type: 'string', description: 'Address', nullable: true },
        date_of_birth: {
          type: 'string',
          format: 'date',
          description: 'Date of birth',
          nullable: true,
        },
        gender: { type: 'string', description: 'Gender', nullable: true },
        membership_type_id: {
          type: 'number',
          description: 'Automatically assigned membership type ID',
        },
        current_points: {
          type: 'number',
          description: 'Automatically assigned current points',
        },
        created_at: {
          type: 'string',
          format: 'date-time',
          description: 'Creation timestamp',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request - Input data is not in the correct format.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only MANAGER and STAFF can create customers.',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Phone number already exists.',
  })
  async create(
    @Body() createCustomerDto: CreateCustomerDto,
  ): Promise<customer> {
    return this.customerService.create(createCustomerDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF)
  @ApiOperation({
    summary: 'Get a paginated list of customers - MANAGER and STAFF only',
    description:
      'Returns a list of all customers in the system with their membership type and loyalty points information.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of records per page (default: 10)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved paginated list of customers.',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              customer_id: { type: 'number' },
              full_name: { type: 'string' },
              phone: { type: 'string' },
              email: { type: 'string', nullable: true },
              address: { type: 'string', nullable: true },
              date_of_birth: { type: 'string', format: 'date', nullable: true },
              gender: { type: 'string', nullable: true },
              membership_type_id: { type: 'number' },
              current_points: { type: 'number' },
              created_at: { type: 'string', format: 'date-time' },
              updated_at: { type: 'string', format: 'date-time' },
            },
          },
        },
        pagination: {
          $ref: '#/components/schemas/PaginationMetadata',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid token.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - Only MANAGER and STAFF can view the customer list.',
  })
  async findAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResult<customer>> {
    return this.customerService.findAll(paginationDto);
  }

  @Delete('bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Xóa nhiều khách hàng cùng lúc - Chỉ MANAGER',
    description:
      'Xóa nhiều khách hàng cùng lúc. Các khách hàng có đơn hàng liên quan sẽ không thể xóa và sẽ được báo lỗi',
  })
  @ApiBody({ type: BulkDeleteCustomerDto })
  @ApiResponse({
    status: 200,
    description: 'Quá trình xóa hàng loạt hoàn thành với kết quả chi tiết',
    schema: {
      type: 'object',
      properties: {
        deleted: {
          type: 'array',
          items: { type: 'number' },
          description: 'Danh sách ID các khách hàng đã xóa thành công',
        },
        failed: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'number',
                description: 'ID khách hàng không thể xóa',
              },
              reason: { type: 'string', description: 'Lý do không thể xóa' },
            },
          },
          description: 'Danh sách các khách hàng không thể xóa và lý do',
        },
        summary: {
          type: 'object',
          properties: {
            total: {
              type: 'number',
              description: 'Tổng số khách hàng được yêu cầu xóa',
            },
            success: {
              type: 'number',
              description: 'Số khách hàng xóa thành công',
            },
            failed: {
              type: 'number',
              description: 'Số khách hàng không thể xóa',
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Yêu cầu không hợp lệ - Danh sách ID không đúng định dạng',
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực - Token không hợp lệ',
  })
  @ApiResponse({
    status: 403,
    description:
      'Không có quyền truy cập - Chỉ MANAGER mới có thể xóa khách hàng',
  })
  async bulkDelete(@Body() bulkDeleteDto: BulkDeleteCustomerDto): Promise<{
    deleted: number[];
    failed: { id: number; reason: string }[];
    summary: { total: number; success: number; failed: number };
  }> {
    return this.customerService.bulkDelete(bulkDeleteDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF, ROLES.CUSTOMER)
  @ApiOperation({
    summary:
      'Get customer information by ID - All roles (CUSTOMER can only view their own information)',
    description:
      'Retrieves detailed information for a specific customer, including membership type and loyalty points.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the customer to retrieve information for',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Detailed customer information.',
    schema: {
      type: 'object',
      properties: {
        customer_id: { type: 'number', description: 'Customer ID' },
        full_name: { type: 'string', description: 'Full name' },
        phone: { type: 'string', description: 'Phone number' },
        email: { type: 'string', description: 'Email', nullable: true },
        address: { type: 'string', description: 'Address', nullable: true },
        date_of_birth: {
          type: 'string',
          format: 'date',
          description: 'Date of birth',
          nullable: true,
        },
        gender: { type: 'string', description: 'Gender', nullable: true },
        membership_type_id: {
          type: 'number',
          description: 'Membership type ID',
        },
        current_points: {
          type: 'number',
          description: 'Current loyalty points',
        },
        created_at: {
          type: 'string',
          format: 'date-time',
          description: 'Creation timestamp',
        },
        updated_at: {
          type: 'string',
          format: 'date-time',
          description: 'Last update timestamp',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - CUSTOMER can only view their own information.',
  })
  @ApiResponse({
    status: 404,
    description: 'Customer with the provided ID not found.',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<customer | null> {
    return this.customerService.findOne(id);
  }

  @Get('phone/:phone')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF)
  @ApiOperation({
    summary: 'Find customer by phone number - MANAGER and STAFF only',
    description:
      'Searches for customer information based on their phone number to support the sales process.',
  })
  @ApiParam({
    name: 'phone',
    description: 'Phone number of the customer to find',
    type: String,
    example: '0987654321',
  })
  @ApiResponse({
    status: 200,
    description: 'Detailed customer information.',
    schema: {
      type: 'object',
      properties: {
        customer_id: { type: 'number', description: 'Customer ID' },
        full_name: { type: 'string', description: 'Full name' },
        phone: { type: 'string', description: 'Phone number' },
        email: { type: 'string', description: 'Email', nullable: true },
        address: { type: 'string', description: 'Address', nullable: true },
        membership_type_id: {
          type: 'number',
          description: 'Membership type ID',
        },
        current_points: {
          type: 'number',
          description: 'Current loyalty points',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only MANAGER and STAFF can search for customers.',
  })
  @ApiResponse({
    status: 404,
    description: 'Customer with the provided phone number not found.',
  })
  async findByPhone(@Param('phone') phone: string): Promise<customer | null> {
    return this.customerService.findByPhone(phone);
  }

  @Get(':id/account')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF, ROLES.CUSTOMER)
  @ApiOperation({
    summary:
      "Get customer's account information - All roles (CUSTOMER can only view their own account)",
    description:
      'Returns the account information linked to this customer, including permissions and status.',
  })
  @ApiParam({
    name: 'id',
    description: 'Customer ID',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: "Customer's account information.",
    schema: {
      type: 'object',
      properties: {
        account_id: { type: 'number', description: 'Account ID' },
        username: { type: 'string', description: 'Username' },
        email: { type: 'string', description: 'Email' },
        phone: { type: 'string', description: 'Phone number' },
        role_id: { type: 'number', description: 'Role ID' },
        is_active: { type: 'boolean', description: 'Active status' },
        created_at: {
          type: 'string',
          format: 'date-time',
          description: 'Creation timestamp',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - CUSTOMER can only view their own account.',
  })
  @ApiResponse({
    status: 404,
    description:
      'Customer not found or customer does not have a linked account.',
  })
  async getCustomerAccount(@Param('id', ParseIntPipe) customerId: number) {
    return this.customerService.getCustomerAccount(customerId);
  }

  @Post(':id/account')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new account for a customer - MANAGER and STAFF only',
    description:
      'Creates a new login account and links it to the existing customer so they can use the application.',
  })
  @ApiParam({
    name: 'id',
    description: 'Customer ID',
    type: Number,
    example: 1,
  })
  @ApiBody({ type: CreateAccountDto })
  @ApiResponse({
    status: 201,
    description: 'Successfully created an account for the customer.',
    schema: {
      type: 'object',
      properties: {
        account_id: { type: 'number', description: 'New account ID' },
        customer_id: { type: 'number', description: 'Customer ID' },
        username: { type: 'string', description: 'Username' },
        email: { type: 'string', description: 'Email' },
        phone: { type: 'string', description: 'Phone number' },
        role_id: {
          type: 'number',
          description: 'Role ID (defaults to CUSTOMER)',
        },
        is_active: { type: 'boolean', description: 'Active status' },
        created_at: {
          type: 'string',
          format: 'date-time',
          description: 'Creation timestamp',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request - Account data is not in the correct format.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only MANAGER and STAFF can create accounts.',
  })
  @ApiResponse({
    status: 404,
    description: 'Customer with the provided ID not found.',
  })
  @ApiResponse({
    status: 409,
    description:
      'Conflict - Username already exists or the customer already has an account.',
  })
  async createCustomerAccount(
    @Param('id', ParseIntPipe) customerId: number,
    @Body() createAccountDto: CreateAccountDto,
  ) {
    return this.customerService.createCustomerAccount(
      customerId,
      createAccountDto,
    );
  }

  @Patch(':id/account')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF, ROLES.CUSTOMER)
  @ApiOperation({
    summary:
      "Update customer's account - All roles (CUSTOMER can only update their own account)",
    description:
      'Updates the account information linked to the customer, such as changing the password, email, or contact information.',
  })
  @ApiParam({
    name: 'id',
    description: 'Customer ID',
    type: Number,
    example: 1,
  })
  @ApiBody({ type: UpdateAccountDto })
  @ApiResponse({
    status: 200,
    description: 'Account updated successfully.',
    schema: {
      type: 'object',
      properties: {
        account_id: { type: 'number', description: 'Account ID' },
        customer_id: { type: 'number', description: 'Customer ID' },
        username: { type: 'string', description: 'Username' },
        email: { type: 'string', description: 'Updated email' },
        phone: { type: 'string', description: 'Updated phone number' },
        updated_at: {
          type: 'string',
          format: 'date-time',
          description: 'Last update timestamp',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request - Update data is not in the correct format.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - CUSTOMER can only update their own account.',
  })
  @ApiResponse({
    status: 404,
    description:
      'Customer not found or customer does not have a linked account.',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Username already exists.',
  })
  async updateCustomerAccount(
    @Param('id', ParseIntPipe) customerId: number,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    return this.customerService.updateCustomerAccount(
      customerId,
      updateAccountDto,
    );
  }

  @Patch(':id/account/lock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @ApiOperation({
    summary: "Lock/unlock a customer's account - MANAGER only",
    description:
      "Changes the lock status of a customer's account to prevent or allow login.",
  })
  @ApiParam({
    name: 'id',
    description: 'Customer ID',
    type: Number,
    example: 1,
  })
  @ApiBody({ type: LockAccountDto })
  @ApiResponse({
    status: 200,
    description: 'Successfully changed the account lock status.',
    schema: {
      type: 'object',
      properties: {
        account_id: { type: 'number', description: 'Account ID' },
        customer_id: { type: 'number', description: 'Customer ID' },
        is_locked: { type: 'boolean', description: 'New lock status' },
        locked_at: {
          type: 'string',
          format: 'date-time',
          description: 'Timestamp of the lock status change',
          nullable: true,
        },
        message: { type: 'string', description: 'Result message' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request - Lock status is not in the correct format.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only MANAGER can lock/unlock accounts.',
  })
  @ApiResponse({
    status: 404,
    description:
      'Customer not found or customer does not have a linked account.',
  })
  async lockCustomerAccount(
    @Param('id', ParseIntPipe) customerId: number,
    @Body() lockAccountDto: LockAccountDto,
  ) {
    return this.customerService.lockCustomerAccount(
      customerId,
      lockAccountDto.is_locked,
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF, ROLES.CUSTOMER)
  @ApiOperation({
    summary:
      'Update customer information - All roles (CUSTOMER can only update their own information)',
    description:
      "Updates a customer's personal information. Note: Membership type and loyalty points cannot be updated as they are managed automatically by the system.",
  })
  @ApiParam({
    name: 'id',
    description: 'Customer ID',
    type: Number,
    example: 1,
  })
  @ApiBody({ type: UpdateCustomerDto })
  @ApiResponse({
    status: 200,
    description: 'Customer information updated successfully.',
    schema: {
      type: 'object',
      properties: {
        customer_id: { type: 'number', description: 'Customer ID' },
        full_name: { type: 'string', description: 'Updated full name' },
        phone: { type: 'string', description: 'Updated phone number' },
        email: {
          type: 'string',
          description: 'Updated email',
          nullable: true,
        },
        address: {
          type: 'string',
          description: 'Updated address',
          nullable: true,
        },
        date_of_birth: {
          type: 'string',
          format: 'date',
          description: 'Updated date of birth',
          nullable: true,
        },
        gender: {
          type: 'string',
          description: 'Updated gender',
          nullable: true,
        },
        updated_at: {
          type: 'string',
          format: 'date-time',
          description: 'Last update timestamp',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request - Update data is not in the correct format.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - CUSTOMER can only update their own information.',
  })
  @ApiResponse({
    status: 404,
    description: 'Customer with the provided ID not found.',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Phone number already exists.',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ): Promise<customer> {
    return this.customerService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a customer - MANAGER only',
    description:
      'Permanently deletes a customer from the system. Note: Customers with associated orders or accounts cannot be deleted.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the customer to delete',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 204,
    description: 'Customer deleted successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only MANAGER can delete customers.',
  })
  @ApiResponse({
    status: 404,
    description: 'Customer with the provided ID not found.',
  })
  @ApiResponse({
    status: 409,
    description:
      'Conflict - Cannot delete a customer with associated orders or accounts.',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.customerService.remove(id);
  }

  @Get('test/ping')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Test the Customer Controller - MANAGER only',
    description:
      'An endpoint to check if the Customer Controller is working correctly (smoke test).',
  })
  @ApiResponse({
    status: 200,
    description: 'Test successful.',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'Confirmation message that the controller is working.',
          example: 'Customer controller is working!',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only MANAGER can perform this test.',
  })
  test(): Promise<{ message: string }> {
    return Promise.resolve({ message: 'Customer controller is working!' });
  }

  @Get('membership-type/:membershipTypeId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.STAFF, ROLES.MANAGER)
  @ApiOperation({
    summary:
      'Get customers by membership type with pagination - STAFF/MANAGER only',
    description:
      'Returns a list of customers belonging to a specific membership type for analysis and loyalty program management.',
  })
  @ApiParam({
    name: 'membershipTypeId',
    description: 'Membership Type ID',
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of records per page (default: 10)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description:
      'Successfully retrieved paginated list of customers by membership type.',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              customer_id: { type: 'number' },
              full_name: { type: 'string' },
              phone: { type: 'string' },
              email: { type: 'string', nullable: true },
              current_points: { type: 'number' },
              membership_type_id: { type: 'number' },
              created_at: { type: 'string', format: 'date-time' },
            },
          },
        },
        pagination: {
          $ref: '#/components/schemas/PaginationMetadata',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid token.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - Only STAFF and MANAGER can view customers by membership type.',
  })
  @ApiResponse({
    status: 404,
    description: 'Membership type with the provided ID not found.',
  })
  async findByMembershipType(
    @Param('membershipTypeId', ParseIntPipe) membershipTypeId: number,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResult<customer>> {
    return this.customerService.findByMembershipType(
      membershipTypeId,
      paginationDto,
    );
  }
}
