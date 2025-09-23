import {
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common'
import type {
	PaginatedResult,
	PaginationDto,
} from '../common/dto/pagination.dto'
import { Prisma, type store } from '../generated/prisma/client'
import type { PrismaService } from '../prisma/prisma.service'
import type { CreateStoreDto } from './dto/create-store.dto'
import type { UpdateStoreDto } from './dto/update-store.dto'

@Injectable()
export class StoreService {
	constructor(private prisma: PrismaService) {}

	/**
	 * Creates a new store.
	 * @param createStoreDto - The data to create the store.
	 * @returns The created store.
	 * @throws {ConflictException} If a store with the same email or name already exists.
	 */
	async create(createStoreDto: CreateStoreDto): Promise<store> {
		const {
			name,
			email,
			phone,
			opening_time,
			closing_time,
			opening_date,
			...rest
		} = createStoreDto

		const storeData: Prisma.storeCreateInput = {
			...rest,
			name,
			email,
			phone,
			opening_date: new Date(opening_date),
			opening_time: new Date(`1970-01-01T${opening_time}`),
			closing_time: new Date(`1970-01-01T${closing_time}`),
		}

		try {
			return await this.prisma.store.create({
				data: storeData,
			})
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === 'P2002') {
					const target = error.meta?.target as string[]
					if (target?.includes('email')) {
						throw new ConflictException(
							`Store with email '${email}' already exists.`
						)
					}
					if (target?.includes('name')) {
						throw new ConflictException(
							`Store with name '${name}' already exists.`
						)
					}
					throw new ConflictException('A unique constraint violation occurred.')
				}
			}
			throw error
		}
	}

	/**
	 * Retrieves a paginated list of stores.
	 * @param paginationDto - The pagination options.
	 * @returns A paginated list of stores.
	 */
	async findAll(paginationDto: PaginationDto): Promise<PaginatedResult<store>> {
		const { page = 1, limit = 10 } = paginationDto
		const skip = (page - 1) * limit

		const [data, total] = await Promise.all([
			this.prisma.store.findMany({
				skip,
				take: limit,
				orderBy: { store_id: 'desc' },
			}),
			this.prisma.store.count(),
		])

		const totalPages = Math.ceil(total / limit)

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
		}
	}

	/**
	 * Retrieves a single store by its ID.
	 * @param id - The ID of the store to retrieve.
	 * @returns The store with the given ID.
	 * @throws {NotFoundException} If the store is not found.
	 */
	async findOne(id: number): Promise<store | null> {
		const store = await this.prisma.store.findUnique({
			where: { store_id: id },
		})
		if (!store) {
			throw new NotFoundException(`Store with ID ${id} not found.`)
		}
		return store
	}

	/**
	 * Retrieves the default store.
	 * This is assumed to be the first store created.
	 * @returns The default store.
	 * @throws {NotFoundException} If no store is found.
	 */
	async getDefaultStore(): Promise<store | null> {
		const store = await this.prisma.store.findFirst({
			orderBy: { store_id: 'asc' },
		})
		if (!store) {
			throw new NotFoundException('No store information found.')
		}
		return store
	}

	/**
	 * Updates a store by its ID.
	 * @param id - The ID of the store to update.
	 * @param updateStoreDto - The data to update the store with.
	 * @returns The updated store.
	 * @throws {NotFoundException} If the store is not found.
	 * @throws {ConflictException} If the updated email or name conflicts with an existing store.
	 */
	async update(id: number, updateStoreDto: UpdateStoreDto): Promise<store> {
		const { email, name, opening_date, opening_time, closing_time, ...rest } =
			updateStoreDto

		await this.findOne(id)

		const dataToUpdate: Prisma.storeUpdateInput = { ...rest }

		if (email) dataToUpdate.email = email
		if (name) dataToUpdate.name = name
		if (opening_date) dataToUpdate.opening_date = new Date(opening_date)
		if (opening_time)
			dataToUpdate.opening_time = new Date(`1970-01-01T${opening_time}`)
		if (closing_time)
			dataToUpdate.closing_time = new Date(`1970-01-01T${closing_time}`)

		try {
			return await this.prisma.store.update({
				where: { store_id: id },
				data: dataToUpdate,
			})
		} catch (error) {
			if (
				error instanceof Prisma.PrismaClientKnownRequestError &&
				error.code === 'P2002'
			) {
				const target = error.meta?.target as string[]
				if (target?.includes('email') && email) {
					throw new ConflictException(
						`Store with email '${email}' already exists.`
					)
				}
				if (target?.includes('name') && name) {
					throw new ConflictException(
						`Store with name '${name}' already exists.`
					)
				}
				throw new ConflictException(
					'A unique constraint violation occurred during update.'
				)
			}
			throw error
		}
	}

	/**
	 * Removes a store by its ID.
	 * @param id - The ID of the store to remove.
	 * @returns The removed store.
	 * @throws {NotFoundException} If the store is not found.
	 * @throws {ConflictException} If the store cannot be deleted due to foreign key constraints.
	 */
	async remove(id: number): Promise<store> {
		await this.findOne(id)
		try {
			return await this.prisma.store.delete({
				where: { store_id: id },
			})
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === 'P2003') {
					throw new ConflictException(
						`Cannot delete store with ID ${id} due to existing related records.`
					)
				}
			}
			throw error
		}
	}
}
