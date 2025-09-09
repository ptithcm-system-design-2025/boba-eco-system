import {ConflictException, Injectable, NotFoundException,} from '@nestjs/common';
import {PrismaService} from '../prisma/prisma.service';
import {discount, Prisma} from '../generated/prisma/client';
import {CreateDiscountDto} from './dto/create-discount.dto';
import {UpdateDiscountDto} from './dto/update-discount.dto';
import {BulkDeleteDiscountDto} from './dto/bulk-delete-discount.dto';
import {PaginatedResult, PaginationDto} from '../common/dto/pagination.dto';
import {Decimal} from '@prisma/client/runtime/library';

@Injectable()
/**
 * Service for managing discounts.
 */
export class DiscountService {
  /**
   * @param prisma The Prisma service for database interactions.
   */
  constructor(private prisma: PrismaService) {}

  /**
   * Creates a new discount.
   * @param createDiscountDto The data for the new discount.
   * @returns The created discount.
   * @throws {ConflictException} If a discount with the same name or coupon code already exists.
   */
  async create(createDiscountDto: CreateDiscountDto): Promise<discount> {
    const { coupon_code, valid_from, valid_until, ...restOfDto } =
      createDiscountDto;

    const existingDiscountWithCouponCode = await this.prisma.discount.findFirst(
      {
        where: {
          coupon_code: coupon_code,
        },
      },
    );

    if (existingDiscountWithCouponCode) {
      throw new ConflictException(
        `Coupon code '${coupon_code}' is already used by another promotion.`,
      );
    }

    const data: Prisma.discountCreateInput = {
      ...restOfDto,
      coupon_code,
      discount_value: new Decimal(createDiscountDto.discount_value),
      min_required_order_value: createDiscountDto.min_required_order_value,
      max_discount_amount: createDiscountDto.max_discount_amount,
      is_active:
        createDiscountDto.is_active !== undefined
          ? createDiscountDto.is_active
          : true,
      ...(valid_from && { valid_from: new Date(valid_from) }),
      valid_until: new Date(valid_until),
    };

    try {
      return await this.prisma.discount.create({
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002' && error.meta?.target) {
          const targetFields = error.meta.target as string[];
          if (targetFields.includes('name') && createDiscountDto.name) {
            throw new ConflictException(
              `Discount with name '${createDiscountDto.name}' already exists.`,
            );
          }
          if (targetFields.includes('coupon_code') && coupon_code) {
            throw new ConflictException(
              `Coupon code '${coupon_code}' already exists.`,
            );
          }
          throw new ConflictException(
            `Unique constraint violation on: ${targetFields.join(', ')}.`,
          );
        }
      }
      console.error('Error creating discount:', error);
      throw error;
    }
  }

  /**
   * Retrieves all discounts with pagination.
   * @param paginationDto The pagination parameters.
   * @returns A paginated result of discounts.
   */
  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<discount>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.discount.findMany({
        skip,
        take: limit,
        orderBy: { discount_id: 'desc' },
      }),
      this.prisma.discount.count(),
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
   * Finds a single discount by its ID.
   * @param discount_id The ID of the discount to find.
   * @returns The discount, or null if not found.
   * @throws {NotFoundException} If the discount is not found.
   */
  async findOne(discount_id: number): Promise<discount | null> {
    const discountDetails = await this.prisma.discount.findUnique({
      where: { discount_id },
    });
    if (!discountDetails) {
      throw new NotFoundException(`Discount with ID ${discount_id} not found`);
    }
    return discountDetails;
  }

  /**
   * Finds a single discount by its coupon code.
   * @param couponCode The coupon code of the discount to find.
   * @returns The discount, or null if not found.
   * @throws {NotFoundException} If the discount is not found.
   */
  async findByCouponCode(couponCode: string): Promise<discount | null> {
    const discountDetails = await this.prisma.discount.findFirst({
      where: { coupon_code: couponCode },
    });

    if (!discountDetails) {
      throw new NotFoundException(
        `Discount with coupon code '${couponCode}' not found.`,
      );
    }
    return discountDetails;
  }

  /**
   * Updates an existing discount.
   * @param discount_id The ID of the discount to update.
   * @param updateDiscountDto The new data for the discount.
   * @returns The updated discount.
   * @throws {NotFoundException} If the discount is not found.
   * @throws {ConflictException} If the updated coupon code is already in use.
   */
  async update(
    discount_id: number,
    updateDiscountDto: UpdateDiscountDto,
  ): Promise<discount> {
    const {
      coupon_code,
      valid_from,
      valid_until,
      discount_value,
      ...restOfData
    } = updateDiscountDto;

    const existingDiscount = await this.prisma.discount.findUnique({
      where: { discount_id },
    });

    if (!existingDiscount) {
      throw new NotFoundException(`Discount with ID ${discount_id} not found.`);
    }

    if (coupon_code && coupon_code !== existingDiscount.coupon_code) {
      const conflictingDiscountWithNewCoupon =
        await this.prisma.discount.findFirst({
          where: {
            coupon_code: coupon_code,
            NOT: { discount_id },
          },
        });
      if (conflictingDiscountWithNewCoupon) {
        throw new ConflictException(
          `Coupon code '${coupon_code}' is already used by another promotion.`,
        );
      }
    }

    const data: Prisma.discountUpdateInput = {
      ...restOfData,
      ...(coupon_code && { coupon_code }),
      ...(discount_value !== undefined && {
        discount_value: new Decimal(discount_value),
      }),
      ...(valid_from && { valid_from: new Date(valid_from) }),
      ...(valid_until && { valid_until: new Date(valid_until) }),
    };

    try {
      return await this.prisma.discount.update({
        where: { discount_id },
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Discount with ID ${discount_id} not found.`);
        }
        if (error.code === 'P2002' && error.meta?.target) {
          const targetFields = error.meta.target as string[];
          let fieldName = targetFields.join(', ');
          if (targetFields.includes('name') && updateDiscountDto.name)
            fieldName = `name '${updateDiscountDto.name}'`;
          else if (targetFields.includes('coupon_code') && coupon_code)
            fieldName = `coupon code '${coupon_code}'`;

          throw new ConflictException(
            `The value for ${fieldName} is already in use or a conflict occurred.`,
          );
        }
      }
      console.error(`Error updating discount ${discount_id}:`, error);
      throw error;
    }
  }

  /**
   * Removes a discount.
   * @param discount_id The ID of the discount to remove.
   * @returns The removed discount.
   * @throws {NotFoundException} If the discount is not found.
   * @throws {ConflictException} If the discount is in use and cannot be deleted.
   */
  async remove(discount_id: number): Promise<discount> {
    const existingDiscount = await this.prisma.discount.findUnique({
      where: { discount_id },
    });

    if (!existingDiscount) {
      throw new NotFoundException(`Discount with ID ${discount_id} not found`);
    }

    try {
      return await this.prisma.discount.delete({
        where: { discount_id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Discount with ID ${discount_id} not found`);
        }
        if (error.code === 'P2003') {
          throw new ConflictException(
            `Discount with ID ${discount_id} cannot be deleted as it is associated with other orders.`,
          );
        }
      }
      console.error(`Error deleting discount ${discount_id}:`, error);
      throw error;
    }
  }

  /**
   * Performs a bulk deletion of discounts.
   * @param bulkDeleteDto The DTO containing the IDs of discounts to delete.
   * @returns An object with the results of the bulk delete operation.
   */
  async bulkDelete(bulkDeleteDto: BulkDeleteDiscountDto): Promise<{
    deleted: number[];
    failed: { id: number; reason: string }[];
    summary: { total: number; success: number; failed: number };
  }> {
    const { ids } = bulkDeleteDto;

    try {
      await this.prisma.discount.deleteMany({
        where: { discount_id: { in: ids } },
      });

      return {
        deleted: ids,
        failed: [],
        summary: {
          total: ids.length,
          success: ids.length,
          failed: 0,
        },
      };
    } catch (error) {
      return {
        deleted: [],
        failed: ids.map((id) => ({
          id,
          reason: `Error deleting discount: ${(error as Error).message}`,
        })),
        summary: {
          total: ids.length,
          success: 0,
          failed: ids.length,
        },
      };
    }
  }
}
