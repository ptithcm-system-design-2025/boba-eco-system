import {
	ConflictException,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
} from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service';
import { type payment_method, Prisma } from '../generated/prisma/client';
import type { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import type { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import type { PaginatedResult, PaginationDto } from '../common/dto/pagination.dto';

/**
 * Service for managing payment methods.
 * Handles business logic related to payment methods.
 */
@Injectable()
export class PaymentMethodService {
	constructor(private prisma: PrismaService) {}

	/**
	 * Creates a new payment method.
	 * @param createDto - The data for creating the new payment method.
	 * @returns The created payment method.
	 * @throws {ConflictException} If a payment method with the same name already exists.
	 * @throws {InternalServerErrorException} If an unexpected error occurs.
	 */
	async create(createDto: CreatePaymentMethodDto): Promise<payment_method> {
		const { name, description } = createDto;
		try {
			return await this.prisma.payment_method.create({
				data: {
					name,
					description,
				},
			});
		} catch (error) {
			if (
				error instanceof Prisma.PrismaClientKnownRequestError &&
				error.code === 'P2002'
			) {
				if ((error.meta?.target as string[])?.includes('name')) {
					throw new ConflictException(
						`Payment method with name '${name}' already exists.`
					);
				}
				throw new ConflictException('A unique constraint violation occurred.');
			}
			console.error('Error creating payment method:', error);
			throw new InternalServerErrorException(
				'Could not create payment method.'
			);
		}
	}

	/**
	 * Retrieves a paginated list of payment methods.
	 * @param paginationDto - DTO for pagination parameters.
	 * @returns A paginated result of payment methods.
	 */
	async findAll(
		paginationDto: PaginationDto
	): Promise<PaginatedResult<payment_method>> {
		const { page = 1, limit = 10 } = paginationDto;
		const skip = (page - 1) * limit;

		const [data, total] = await Promise.all([
			this.prisma.payment_method.findMany({
				skip,
				take: limit,
				orderBy: { name: 'asc' },
			}),
			this.prisma.payment_method.count(),
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
	 * Finds a single payment method by its ID.
	 * @param id - The ID of the payment method to find.
	 * @returns The payment method.
	 * @throws {NotFoundException} If the payment method with the given ID is not found.
	 */
	async findOne(id: number): Promise<payment_method> {
		const method = await this.prisma.payment_method.findUnique({
			where: { payment_method_id: id },
		});
		if (!method) {
			throw new NotFoundException(`Payment method with ID ${id} not found.`);
		}
		return method;
	}

	/**
	 * Finds a single payment method by its name.
	 * @param name - The name of the payment method to find.
	 * @returns The payment method, or null if not found.
	 */
	async findByName(name: string): Promise<payment_method | null> {
		return this.prisma.payment_method.findUnique({
			where: { name },
		});
	}

	/**
	 * Updates a payment method.
	 * @param id - The ID of the payment method to update.
	 * @param updateDto - The data to update the payment method with.
	 * @returns The updated payment method.
	 * @throws {NotFoundException} If the payment method is not found.
	 * @throws {ConflictException} If the new name conflicts with an existing payment method.
	 * @throws {InternalServerErrorException} If an unexpected error occurs.
	 */
	async update(
		id: number,
		updateDto: UpdatePaymentMethodDto
	): Promise<payment_method> {
		await this.findOne(id);
		const { name, description } = updateDto;
		try {
			return await this.prisma.payment_method.update({
				where: { payment_method_id: id },
				data: {
					...(name && { name }),
					...(description !== undefined && { description }),
				},
			});
		} catch (error) {
			if (
				error instanceof Prisma.PrismaClientKnownRequestError &&
				error.code === 'P2002'
			) {
				if ((error.meta?.target as string[])?.includes('name') && name) {
					throw new ConflictException(
						`Payment method with name '${name}' already exists.`
					);
				}
				throw new ConflictException(
					'A unique constraint violation occurred during update.'
				);
			}
			if (
				error instanceof Prisma.PrismaClientKnownRequestError &&
				error.code === 'P2025'
			) {
				throw new NotFoundException(
					`Payment method with ID ${id} not found for update.`
				);
			}
			console.error(`Error updating payment method ${id}:`, error);
			throw new InternalServerErrorException(
				'Could not update payment method.'
			);
		}
	}

	/**
	 * Removes a payment method.
	 * @param id - The ID of the payment method to remove.
	 * @returns The removed payment method.
	 * @throws {NotFoundException} If the payment method is not found.
	 * @throws {ConflictException} If the payment method is in use by existing payments.
	 * @throws {InternalServerErrorException} If an unexpected error occurs.
	 */
	async remove(id: number): Promise<payment_method> {
		const methodToDelete = await this.findOne(id);
		try {
			const paymentsUsingMethod = await this.prisma.payment.count({
				where: { payment_method_id: id },
			});
			if (paymentsUsingMethod > 0) {
				throw new ConflictException(
					`Cannot delete payment method ID ${id} as it is currently used by ${paymentsUsingMethod} payment(s).`
				);
			}
			await this.prisma.payment_method.delete({
				where: { payment_method_id: id },
			});
			return methodToDelete;
		} catch (error) {
			if (error instanceof ConflictException) throw error;
			if (
				error instanceof Prisma.PrismaClientKnownRequestError &&
				error.code === 'P2025'
			) {
				throw new NotFoundException(
					`Payment method with ID ${id} not found for deletion.`
				);
			}
			console.error(`Error deleting payment method ${id}:`, error);
			throw new InternalServerErrorException(
				'Could not delete payment method.'
			);
		}
	}
}
