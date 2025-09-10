import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccountService } from '../account/account.service';
import { employee, Prisma } from '../generated/prisma/client';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { BulkDeleteEmployeeDto } from './dto/bulk-delete-employee.dto';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';
import { ROLES } from '../auth/constants/roles.constant';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EmployeeService {
  constructor(
    private prisma: PrismaService,
    private accountService: AccountService,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto): Promise<employee> {
    const { email, username, ...employeeData } = createEmployeeDto;

    const existingEmployeeByEmail = await this.prisma.employee.findUnique({
      where: { email },
    });
    if (existingEmployeeByEmail) {
      throw new ConflictException(
        `Employee with email '${email}' already exists.`,
      );
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const account = await this.accountService.create({
          username,
          password: '12345678',
          role_id: await this.getStaffRoleId(),
          is_active: true,
        });

        const data: Prisma.employeeCreateInput = {
          ...employeeData,
          email,
          account: {
            connect: { account_id: account.account_id },
          },
        };

        return await tx.employee.create({
          data,
          include: { account: true },
        });
      });
    } catch (error) {
      throw this.handleCreateError(error, email);
    }
  }

  /**
   * Handles errors during employee creation.
   * @param error The error object.
   * @param email The email of the employee being created.
   */
  private handleCreateError(error: any, email: string): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          const fieldDescription = this.getUniqueConstraintField(error, email);
          throw new ConflictException(
            `Employee already exists with ${fieldDescription}.`,
          );
        default:
          throw new BadRequestException(`Database error: ${error.message}`);
      }
    }
    throw error;
  }

  /**
   * Gets the field that caused a unique constraint violation.
   * @param error The Prisma error object.
   * @param email The email of the employee.
   */
  private getUniqueConstraintField(
    error: Prisma.PrismaClientKnownRequestError,
    email: string,
  ): string {
    if (error.meta && error.meta.target) {
      const target = error.meta.target as string[];
      if (target.includes('email')) return `email '${email}'`;
    }
    return 'the provided unique information';
  }

  /**
   * Retrieves the role ID for the 'STAFF' role.
   */
  private async getStaffRoleId(): Promise<number> {
    const staffRole = await this.prisma.role.findFirst({
      where: { name: ROLES.STAFF },
    });
    if (!staffRole) {
      throw new BadRequestException(
        'The STAFF role does not exist in the system.',
      );
    }
    return staffRole.role_id;
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<employee>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.employee.findMany({
        skip,
        take: limit,
        orderBy: { employee_id: 'desc' },
      }),
      this.prisma.employee.count(),
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

  async findOne(employee_id: number): Promise<employee | null> {
    const emp = await this.prisma.employee.findUnique({
      where: { employee_id },
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
      },
    });
    if (!emp) {
      throw new NotFoundException(`Employee with ID ${employee_id} not found`);
    }
    return emp;
  }

  async findByEmail(email: string): Promise<employee | null> {
    return this.prisma.employee.findUnique({
      where: { email },
      include: { account: true },
    });
  }

  async update(
    employee_id: number,
    updateEmployeeDto: UpdateEmployeeDto,
  ): Promise<employee> {
    const { ...employeeData } = updateEmployeeDto;

    const data: Prisma.employeeUpdateInput = { ...employeeData };

    try {
      return await this.prisma.employee.update({
        where: { employee_id },
        data,
        include: { account: true },
      });
    } catch (error) {
      throw this.handleUpdateError(error, employee_id);
    }
  }

  /**
   * Handles errors during employee update.
   * @param error The error object.
   * @param employee_id The ID of the employee being updated.
   */
  private handleUpdateError(error: any, employee_id: number): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2025':
          throw new NotFoundException(
            `Employee with ID ${employee_id} not found`,
          );
        case 'P2002':
          throw new ConflictException(
            'Cannot update employee due to a unique constraint violation (e.g., email already exists).',
          );
        default:
          throw new BadRequestException(`Database error: ${error.message}`);
      }
    }
    throw error;
  }

  async remove(employee_id: number): Promise<employee> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const employeeWithAccount = await tx.employee.findUnique({
          where: { employee_id },
          include: { account: true },
        });

        if (!employeeWithAccount) {
          throw new NotFoundException(
            `Employee with ID ${employee_id} not found`,
          );
        }

        const deletedEmployee = await tx.employee.delete({
          where: { employee_id },
        });

        if (employeeWithAccount.account) {
          await this.accountService.remove(
            employeeWithAccount.account.account_id,
          );
        }

        return deletedEmployee;
      });
    } catch (error) {
      throw this.handleDeleteError(error, employee_id);
    }
  }

  /**
   * Handles errors during employee deletion.
   * @param error The error object.
   * @param employee_id The ID of the employee being deleted.
   */
  private handleDeleteError(error: any, employee_id: number): never {
    if (error instanceof NotFoundException) {
      throw error;
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2025':
          throw new NotFoundException(
            `Employee with ID ${employee_id} not found`,
          );
        case 'P2003':
          throw new ConflictException(
            `Cannot delete employee with ID ${employee_id} due to related data.`,
          );
        default:
          throw new BadRequestException(`Database error: ${error.message}`);
      }
    }
    throw error;
  }

  /**
   * Deletes multiple employees by their IDs.
   * @param bulkDeleteDto DTO containing the list of employee IDs.
   */
  async bulkDelete(bulkDeleteDto: BulkDeleteEmployeeDto): Promise<{
    deleted: number[];
    failed: { id: number; reason: string }[];
    summary: { total: number; success: number; failed: number };
  }> {
    const { ids } = bulkDeleteDto;

    try {
      return await this.prisma.$transaction(async (tx) => {
        const employeesWithAccounts = await tx.employee.findMany({
          where: { employee_id: { in: ids } },
          include: { account: true },
        });

        const foundIds = employeesWithAccounts.map((e) => e.employee_id);
        const notFoundIds = ids.filter((id) => !foundIds.includes(id));
        const accountIds = employeesWithAccounts
          .filter((e) => e.account)
          .map((e) => e.account.account_id);

        await tx.employee.deleteMany({
          where: { employee_id: { in: foundIds } },
        });

        if (accountIds.length > 0) {
          await tx.account.deleteMany({
            where: { account_id: { in: accountIds } },
          });
        }

        const failed: { id: number; reason: string }[] = notFoundIds.map(
          (id) => ({
            id,
            reason: `Employee with ID ${id} not found`,
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
        reason: error instanceof Error ? error.message : 'Unknown error',
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

  async lockEmployeeAccount(employeeId: number, isLocked: boolean) {
    const employee = await this.prisma.employee.findUnique({
      where: { employee_id: employeeId },
      include: { account: true },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    return this.accountService.update(employee.account.account_id, {
      is_locked: isLocked,
    });
  }

  async updateEmployeeAccount(
    employeeId: number,
    accountId: number,
    updateData: any,
  ) {
    const employee = await this.prisma.employee.findUnique({
      where: { employee_id: employeeId },
      include: { account: true },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    if (employee.account.account_id !== accountId) {
      throw new BadRequestException(
        `Account with ID ${accountId} does not belong to Employee with ID ${employeeId}`,
      );
    }

    return this.accountService.update(accountId, updateData);
  }
}
