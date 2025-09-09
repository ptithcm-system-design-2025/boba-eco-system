import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccountService } from '../account/account.service';
import { customer, Prisma } from '../generated/prisma/client';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { BulkDeleteCustomerDto } from './dto/bulk-delete-customer.dto';
import { PaginatedResult, PaginationDto } from '../common/dto/pagination.dto';
import { ROLES } from '../auth/constants/roles.constant';
import { CreateAccountDto } from '../account/dto/create-account.dto';
import { UpdateAccountDto } from '../account/dto/update-account.dto';

@Injectable()
export class CustomerService {
  constructor(
    private prisma: PrismaService,
    private accountService: AccountService,
  ) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<customer> {
    const { phone, username, ...customerData } = createCustomerDto;

    try {
      return await this.prisma.$transaction(async (tx) => {
        const lowestMembershipType = await tx.membership_type.findFirst({
          orderBy: { required_point: 'asc' },
        });

        if (!lowestMembershipType) {
          throw new BadRequestException(
            'No membership types found in the system',
          );
        }

        const data: Prisma.customerCreateInput = {
          ...customerData,
          phone,
          current_points: lowestMembershipType.required_point,
          membership_type: {
            connect: {
              membership_type_id: lowestMembershipType.membership_type_id,
            },
          },
        };

        if (username) {
          const account = await this.accountService.create({
            username,
            password: '12345678',
            role_id: await this.getCustomerRoleId(),
            is_active: true,
          });
          data.account = { connect: { account_id: account.account_id } };
        }

        return await tx.customer.create({
          data,
          include: { account: true, membership_type: true },
        });
      });
    } catch (error) {
      this.handleCreateError(error, phone);
    }
  }

  /**
   * Handles errors during customer creation.
   * @param error The error object.
   * @param phone The phone number of the customer being created.
   * @returns never
   */
  private handleCreateError(error: any, phone: string): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002': {
          const fieldDescription = this.getUniqueConstraintField(error, phone);
          throw new ConflictException(
            `Customer with ${fieldDescription} already exists.`,
          );
        }
        case 'P2025':
          throw new BadRequestException('Related record does not exist.');
        default:
          throw new BadRequestException(`Database error: ${error.message}`);
      }
    }
    throw error;
  }

  /**
   * Gets the field that violated the unique constraint.
   * @param error The Prisma error object.
   * @param phone The phone number for context.
   * @returns A string describing the field.
   */
  private getUniqueConstraintField(
    error: Prisma.PrismaClientKnownRequestError,
    phone: string,
  ): string {
    if (error.meta && error.meta.target) {
      const target = error.meta.target;
      let targetString: string;

      if (Array.isArray(target)) {
        targetString = target.join(', ');
      } else if (typeof target === 'string') {
        targetString = target;
      } else {
        targetString = JSON.stringify(target);
      }

      if (targetString.includes('phone')) {
        return `phone number '${phone}'`;
      }
      return `information ${targetString}`;
    }
    return 'the provided unique information';
  }

  /**
   * Checks if the error is related to MembershipType.
   * @param error The Prisma error object.
   * @returns boolean
   */
  private isMembershipTypeError(
    error: Prisma.PrismaClientKnownRequestError,
  ): boolean {
    return !!(
      error.meta &&
      typeof error.meta.cause === 'string' &&
      error.meta.cause.includes('MembershipType')
    );
  }

  /**
   * Gets the role_id for CUSTOMER.
   * @returns The role_id for the CUSTOMER role.
   */
  private async getCustomerRoleId(): Promise<number> {
    const customerRole = await this.prisma.role.findFirst({
      where: { name: ROLES.CUSTOMER },
    });
    if (!customerRole) {
      throw new BadRequestException(
        'CUSTOMER role does not exist in the system',
      );
    }
    return customerRole.role_id;
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<customer>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.customer.findMany({
        skip,
        take: limit,
        orderBy: { customer_id: 'desc' },
      }),
      this.prisma.customer.count(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async findOne(id: number): Promise<customer | null> {
    const customerDetails = await this.prisma.customer.findUnique({
      where: { customer_id: id },
      include: {
        account: {
          select: {
            account_id: true,
            role_id: true,
            username: true,
            is_active: true,
            is_locked: true,
            last_login: true,
            created_at: true,
            updated_at: true,
            role: true,
          },
        },
        membership_type: true,
      },
    });
    if (!customerDetails) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    return customerDetails;
  }

  async findByPhone(phone: string): Promise<customer | null> {
    return this.prisma.customer.findUnique({
      where: { phone },
      include: { membership_type: true },
    });
  }

  async update(
    id: number,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<customer> {
    const data: Prisma.customerUpdateInput = { ...updateCustomerDto };

    try {
      return await this.prisma.customer.update({
        where: { customer_id: id },
        data,
        include: { account: true, membership_type: true },
      });
    } catch (error) {
      this.handleUpdateError(error, id, updateCustomerDto);
    }
  }

  /**
   * Handles errors during customer update.
   * @param error The error object.
   * @param id The ID of the customer being updated.
   * @param updateDto The update DTO.
   * @returns never
   */
  private handleUpdateError(
    error: any,
    id: number,
    updateDto: UpdateCustomerDto,
  ): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2025':
          throw new NotFoundException(`Customer with ID ${id} not found.`);
        case 'P2002': {
          if (updateDto.phone && this.isPhoneConstraintError(error)) {
            throw new ConflictException(
              `Customer with phone number '${updateDto.phone}' already exists.`,
            );
          }
          const field = this.getConstraintField(error);
          throw new ConflictException(
            `Unique constraint violation on: ${field}.`,
          );
        }
        default:
          throw new BadRequestException(`Database error: ${error.message}`);
      }
    }
    throw error;
  }

  /**
   * Checks if the error is related to the phone constraint.
   * @param error The Prisma error object.
   * @returns boolean
   */
  private isPhoneConstraintError(
    error: Prisma.PrismaClientKnownRequestError,
  ): boolean {
    if (error.meta && error.meta.target) {
      const target = error.meta.target;
      if (typeof target === 'string') {
        return target.includes('phone');
      }
      if (Array.isArray(target)) {
        return target.includes('phone');
      }
    }
    return false;
  }

  /**
   * Gets the field that violated a constraint.
   * @param error The Prisma error object.
   * @returns A string describing the field.
   */
  private getConstraintField(
    error: Prisma.PrismaClientKnownRequestError,
  ): string {
    if (error.meta && error.meta.target) {
      const target = error.meta.target;
      if (Array.isArray(target)) {
        return target.join(', ');
      }
      if (typeof target === 'string') {
        return target;
      }
      return JSON.stringify(target);
    }
    return 'unknown field';
  }

  async remove(id: number): Promise<customer> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const customerWithAccount = await tx.customer.findUnique({
          where: { customer_id: id },
          include: { account: true },
        });

        if (!customerWithAccount) {
          throw new NotFoundException(`Customer with ID ${id} not found`);
        }

        const deletedCustomer = await tx.customer.delete({
          where: { customer_id: id },
        });

        if (customerWithAccount.account) {
          await this.accountService.remove(
            customerWithAccount.account.account_id,
          );
        }

        return deletedCustomer;
      });
    } catch (error) {
      this.handleDeleteError(error, id);
    }
  }

  /**
   * Handles errors during customer deletion.
   * @param error The error object.
   * @param id The ID of the customer being deleted.
   * @returns never
   */
  private handleDeleteError(error: any, id: number): never {
    if (error instanceof NotFoundException) {
      throw error;
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2025':
          throw new NotFoundException(`Customer with ID ${id} not found`);
        case 'P2003':
          throw new ConflictException(
            `Cannot delete customer with ID ${id} due to existing orders or other related data.`,
          );
        default:
          throw new BadRequestException(`Database error: ${error.message}`);
      }
    }
    throw error;
  }

  /**
   * Xóa nhiều customer theo danh sách ID
   */
  async bulkDelete(bulkDeleteDto: BulkDeleteCustomerDto): Promise<{
    deleted: number[];
    failed: { id: number; reason: string }[];
    summary: { total: number; success: number; failed: number };
  }> {
    const { ids } = bulkDeleteDto;

    try {
      return await this.prisma.$transaction(async (tx) => {
        const customersWithAccounts = await tx.customer.findMany({
          where: { customer_id: { in: ids } },
          include: { account: true },
        });

        const foundIds = customersWithAccounts.map((c) => c.customer_id);
        const notFoundIds = ids.filter((id) => !foundIds.includes(id));
        const accountIds = customersWithAccounts
          .filter((c) => c.account)
          .map((c) => c.account!.account_id);

        if (accountIds.length > 0) {
          await tx.account.deleteMany({
            where: { account_id: { in: accountIds } },
          });
        }

        const failed: { id: number; reason: string }[] = notFoundIds.map(
          (id) => ({
            id,
            reason: `Khách hàng với ID ${id} không tồn tại`,
          }),
        );

        return {
          deleted: foundIds,
          failed,
          summary: {
            total: ids.length,
            success: foundIds.length,
            failed: failed.length,
          },
        };
      });
    } catch (error) {
      const failed: { id: number; reason: string }[] = ids.map((id) => ({
        id,
        reason: error instanceof Error ? error.message : 'Lỗi không xác định',
      }));

      return {
        deleted: [],
        failed,
        summary: {
          total: ids.length,
          success: 0,
          failed: ids.length,
        },
      };
    }
  }

  /**
   * Find customers by membership type with pagination
   * @param membership_type_id - ID of the membership type
   * @param paginationDto - Pagination parameters
   * @returns PaginatedResult of customers
   */
  async findByMembershipType(
    membership_type_id: number,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<customer>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.customer.findMany({
        where: { membership_type_id },
        skip,
        take: limit,
        orderBy: { customer_id: 'desc' },
      }),
      this.prisma.customer.count({
        where: { membership_type_id },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Get account information of a customer
   * @param customerId - ID of the customer
   * @returns Account information of the customer
   */
  async getCustomerAccount(customerId: number) {
    const customer = await this.prisma.customer.findUnique({
      where: { customer_id: customerId },
      include: {
        account: {
          select: {
            account_id: true,
            username: true,
            role_id: true,
            is_active: true,
            is_locked: true,
            last_login: true,
            created_at: true,
            updated_at: true,
            role: true,
          },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }

    if (!customer.account) {
      throw new NotFoundException(
        `Customer with ID ${customerId} does not have a linked account`,
      );
    }

    return customer.account;
  }

  /**
   * Create a new account for a customer
   * @param customerId - ID of the customer
   * @param createAccountDto - Data for creating the account
   * @returns Newly created account information
   */
  async createCustomerAccount(
    customerId: number,
    createAccountDto: CreateAccountDto,
  ) {
    const customer = await this.prisma.customer.findUnique({
      where: { customer_id: customerId },
      include: { account: true },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }

    if (customer.account) {
      throw new ConflictException(
        `Customer with ID ${customerId} already has a linked account`,
      );
    }

    const newAccount = await this.accountService.create(createAccountDto);

    const updatedCustomer = await this.prisma.customer.update({
      where: { customer_id: customerId },
      data: { account_id: newAccount.account_id },
      include: {
        account: {
          select: {
            account_id: true,
            username: true,
            role_id: true,
            is_active: true,
            is_locked: true,
            last_login: true,
            created_at: true,
            updated_at: true,
            role: true,
          },
        },
      },
    });

    return updatedCustomer.account;
  }

  /**
   * Update account information of a customer
   * @param customerId - ID of the customer
   * @param updateAccountDto - Data for updating the account
   * @returns Updated account information
   */
  async updateCustomerAccount(
    customerId: number,
    updateAccountDto: UpdateAccountDto,
  ) {
    const customer = await this.prisma.customer.findUnique({
      where: { customer_id: customerId },
      include: { account: true },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }

    if (!customer.account) {
      throw new NotFoundException(
        `Customer with ID ${customerId} does not have a linked account`,
      );
    }

    return this.accountService.update(
      customer.account.account_id,
      updateAccountDto,
    );
  }

  /**
   * Lock or unlock a customer's account
   * @param customerId - ID of the customer
   * @param isLocked - Lock status to be set
   * @returns Updated account with new lock status
   */
  async lockCustomerAccount(customerId: number, isLocked: boolean) {
    const customer = await this.prisma.customer.findUnique({
      where: { customer_id: customerId },
      include: { account: true },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }

    if (!customer.account) {
      throw new NotFoundException(
        `Customer with ID ${customerId} does not have a linked account`,
      );
    }

    return this.accountService.update(customer.account.account_id, {
      is_locked: isLocked,
    });
  }
}
