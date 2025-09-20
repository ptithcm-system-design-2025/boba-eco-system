import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
} from '@nestjs/common'
import type { ConfigService } from '@nestjs/config'
import * as admin from 'firebase-admin'
import * as path from 'path'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class FirebaseStorageService {
	private bucket: admin.storage.Storage

	constructor(private configService: ConfigService) {
		this.initializeFirebase()
	}

	/**
	 * Initializes the Firebase Admin SDK.
	 * @private
	 * @throws {InternalServerErrorException} If Firebase initialization fails.
	 */
	private initializeFirebase() {
		try {
			if (!admin.apps.length) {
				const serviceAccount = require(path.join(__dirname, 'key.json'))

				admin.initializeApp({
					credential: admin.credential.cert(
						serviceAccount as admin.ServiceAccount
					),
					storageBucket: this.configService.get<string>(
						'FIREBASE_STORAGE_BUCKET'
					),
				})
			}

			this.bucket = admin.storage()
		} catch (error) {
			console.error('Firebase initialization error:', error)
			throw new InternalServerErrorException('Firebase initialization failed')
		}
	}

	/**
	 * Upload ảnh sản phẩm lên Firebase Storage
	 * @param file - File buffer từ multer
	 * @param fileName - Tên file (optional, sẽ tự generate nếu không có)
	 * @param folder - Thư mục lưu trữ (mặc định: 'products')
	 * @returns gs:// path của ảnh đã upload
	 */
	async uploadProductImage(
		file: Express.Multer.File,
		fileName?: string,
		folder: string = 'products'
	): Promise<string> {
		try {
			const allowedMimeTypes = [
				'image/jpeg',
				'image/jpg',
				'image/png',
				'image/webp',
			]
			if (!allowedMimeTypes.includes(file.mimetype)) {
				throw new BadRequestException(
					'Chỉ chấp nhận file ảnh định dạng JPEG, PNG, hoặc WebP'
				)
			}

			const maxSize = 5 * 1024 * 1024
			if (file.size > maxSize) {
				throw new BadRequestException('Kích thước file không được vượt quá 5MB')
			}

			const fileExtension = file.originalname.split('.').pop()
			const uniqueFileName = fileName || `${uuidv4()}.${fileExtension}`
			const filePath = `${folder}/${uniqueFileName}`

			const bucketRef = this.bucket.bucket()
			const fileRef = bucketRef.file(filePath)

			await fileRef.save(file.buffer, {
				metadata: {
					contentType: file.mimetype,
					metadata: {
						originalName: file.originalname,
						uploadedAt: new Date().toISOString(),
					},
				},
			})

			await fileRef.makePublic()

			const bucketName = this.configService.get<string>(
				'FIREBASE_STORAGE_BUCKET'
			)
			const gsPath = `gs://${bucketName}/${filePath}`
			return gsPath
		} catch (error) {
			console.error('Upload error:', error)
			if (error instanceof BadRequestException) {
				throw error
			}
			throw new InternalServerErrorException('Error uploading image')
		}
	}

	/**
	 * Converts gs:// path to public URL
	 * @param gsPath - The gs:// path to convert
	 * @returns Public URL for the file
	 */
	convertGsToPublicUrl(gsPath: string): string {
		if (!gsPath || !gsPath.startsWith('gs://')) {
			return gsPath // Return as-is if not a gs:// path
		}

		const bucketName = this.configService.get<string>('FIREBASE_STORAGE_BUCKET')
		const filePath = gsPath.replace(`gs://${bucketName}/`, '')
		return `https://storage.googleapis.com/${bucketName}/${filePath}`
	}

	/**
	 * Deletes a product image from Firebase Storage.
	 * @param imagePath - The gs:// path or public URL of the image to delete.
	 * @returns boolean - true if deletion is successful.
	 */
	async deleteProductImage(imagePath: string): Promise<boolean> {
		try {
			const bucketName = this.configService.get<string>(
				'FIREBASE_STORAGE_BUCKET'
			)
			let filePath: string

			// Handle both gs:// paths and public URLs for backward compatibility
			if (imagePath.startsWith('gs://')) {
				filePath = imagePath.replace(`gs://${bucketName}/`, '')
			} else if (
				imagePath.startsWith(`https://storage.googleapis.com/${bucketName}/`)
			) {
				filePath = imagePath.replace(
					`https://storage.googleapis.com/${bucketName}/`,
					''
				)
			} else {
				throw new BadRequestException('Invalid image path format')
			}

			const bucketRef = this.bucket.bucket()
			const fileRef = bucketRef.file(filePath)

			const [exists] = await fileRef.exists()
			if (!exists) {
				throw new BadRequestException('File not found')
			}

			await fileRef.delete()
			return true
		} catch (error) {
			console.error('Delete error:', error)
			if (error instanceof BadRequestException) {
				throw error
			}
			throw new InternalServerErrorException('Error deleting image')
		}
	}

	/**
	 * Lists all images in a specified folder.
	 * @param folder - The folder to list images from.
	 * @returns An array of gs:// paths.
	 */
	async listProductImages(folder: string = 'products'): Promise<string[]> {
		try {
			const bucketRef = this.bucket.bucket()
			const [files] = await bucketRef.getFiles({
				prefix: `${folder}/`,
			})

			const bucketName = this.configService.get<string>(
				'FIREBASE_STORAGE_BUCKET'
			)
			const gsPaths = files.map((file) => `gs://${bucketName}/${file.name}`)

			return gsPaths
		} catch (error) {
			console.error('List images error:', error)
			throw new InternalServerErrorException('Error listing images')
		}
	}

	/**
	 * Updates a product image by deleting the old one and uploading a new one.
	 * @param oldImagePath - The gs:// path or URL of the old image to delete.
	 * @param newFile - The new image file.
	 * @param fileName - Optional new file name.
	 * @param folder - The storage folder.
	 * @returns The gs:// path of the new image.
	 */
	async updateProductImage(
		oldImagePath: string,
		newFile: Express.Multer.File,
		fileName?: string,
		folder: string = 'products'
	): Promise<string> {
		try {
			const newImagePath = await this.uploadProductImage(
				newFile,
				fileName,
				folder
			)

			if (oldImagePath) {
				try {
					await this.deleteProductImage(oldImagePath)
				} catch (error) {
					console.warn('Warning: Could not delete old image:', error.message)
				}
			}

			return newImagePath
		} catch (error) {
			console.error('Update image error:', error)
			throw error
		}
	}
}
