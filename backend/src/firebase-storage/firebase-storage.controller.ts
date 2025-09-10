import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UseGuards,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FirebaseStorageService } from './firebase-storage.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ROLES } from '../auth/constants/roles.constant';
import { UploadImageDto } from './dto/upload-image.dto';
import { DeleteImageDto } from './dto/delete-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';

@ApiTags('Firebase Storage')
@Controller('firebase-storage')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class FirebaseStorageController {
  constructor(
    private readonly firebaseStorageService: FirebaseStorageService,
  ) {}

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a product image to Firebase Storage' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Image file to upload',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file (JPEG, PNG, WebP, max 5MB)',
        },
        fileName: {
          type: 'string',
          description:
            'Optional file name (will be auto-generated if not provided)',
        },
        folder: {
          type: 'string',
          description: 'Storage folder (default: products)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Image uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        imageUrl: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid or oversized file' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Roles(ROLES.MANAGER, ROLES.STAFF)
  /**
   * Uploads an image file to Firebase Storage.
   * @param file The image file to upload.
   * @param fileName Optional custom file name.
   * @param folder Optional destination folder.
   * @param user The current authenticated user.
   * @returns An object containing the success message and the image URL.
   * @throws {BadRequestException} If no file is provided.
   */
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('fileName') fileName?: string,
    @Body('folder') folder?: string,
    @CurrentUser() user?: any,
  ) {
    if (!file) {
      throw new BadRequestException('Please select a file to upload');
    }

    const imageUrl = await this.firebaseStorageService.uploadProductImage(
      file,
      fileName,
      folder || 'products',
    );

    return {
      message: 'Image uploaded successfully',
      imageUrl,
    };
  }

  @Delete('delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a product image from Firebase Storage' })
  @ApiBody({
    description: 'URL of the image to delete',
    schema: {
      type: 'object',
      properties: {
        imageUrl: {
          type: 'string',
          description: 'Full URL of the image to be deleted',
          example:
            'https://storage.googleapis.com/your-bucket/products/image.jpg',
        },
      },
      required: ['imageUrl'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Image deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        success: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid image URL or file not found',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Roles(ROLES.MANAGER, ROLES.STAFF)
  /**
   * Deletes an image from Firebase Storage.
   * @param imageUrl The URL of the image to delete.
   * @param user The current authenticated user.
   * @returns An object indicating the success of the operation.
   * @throws {BadRequestException} If the image URL is not provided.
   */
  async deleteImage(
    @Body('imageUrl') imageUrl: string,
    @CurrentUser() user?: any,
  ) {
    if (!imageUrl) {
      throw new BadRequestException(
        'Please provide the URL of the image to delete',
      );
    }

    const success =
      await this.firebaseStorageService.deleteProductImage(imageUrl);

    return {
      message: 'Image deleted successfully',
      success,
    };
  }

  @Get('list')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all images in a directory' })
  @ApiResponse({
    status: 200,
    description: 'Image list retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        images: {
          type: 'array',
          items: { type: 'string' },
        },
        count: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Roles(ROLES.MANAGER, ROLES.STAFF)
  /**
   * Lists all images in a specified folder in Firebase Storage.
   * @param folder The folder to list images from. Defaults to 'products'.
   * @param user The current authenticated user.
   * @returns An object containing the list of image URLs and the count.
   */
  async listImages(
    @Query('folder') folder: string = 'products',
    @CurrentUser() user?: any,
  ) {
    const images = await this.firebaseStorageService.listProductImages(folder);

    return {
      message: 'Image list retrieved successfully',
      images,
      count: images.length,
    };
  }

  @Post('update')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary:
      'Update a product image (deletes the old one and uploads a new one)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'New image file and old image URL',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'New image file (JPEG, PNG, WebP, max 5MB)',
        },
        oldImageUrl: {
          type: 'string',
          description: 'URL of the old image to be deleted',
        },
        fileName: {
          type: 'string',
          description: 'Optional new file name',
        },
        folder: {
          type: 'string',
          description: 'Storage folder (default: products)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Image updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        newImageUrl: { type: 'string' },
        oldImageUrl: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file or missing information',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Roles(ROLES.MANAGER, ROLES.STAFF)
  /**
   * Updates an image in Firebase Storage by deleting the old one and uploading a new one.
   * @param file The new image file.
   * @param oldImageUrl The URL of the old image to be replaced.
   * @param fileName Optional custom file name for the new image.
   * @param folder Optional destination folder for the new image.
   * @param user The current authenticated user.
   * @returns An object containing the new and old image URLs.
   * @throws {BadRequestException} If the new file or old image URL is missing.
   */
  async updateImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('oldImageUrl') oldImageUrl: string,
    @Body('fileName') fileName?: string,
    @Body('folder') folder?: string,
    @CurrentUser() user?: any,
  ) {
    if (!file) {
      throw new BadRequestException('Please select a new image file to upload');
    }

    if (!oldImageUrl) {
      throw new BadRequestException(
        'Please provide the URL of the old image to be replaced',
      );
    }

    const newImageUrl = await this.firebaseStorageService.updateProductImage(
      oldImageUrl,
      file,
      fileName,
      folder || 'products',
    );

    return {
      message: 'Image updated successfully',
      newImageUrl,
      oldImageUrl,
    };
  }

  @Get('test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Test Firebase Storage connection' })
  @ApiResponse({
    status: 200,
    description: 'Test successful',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        status: { type: 'string' },
      },
    },
  })
  /**
   * Tests the connectivity of the Firebase Storage controller.
   * @returns A status message indicating the controller is active.
   */
  async testConnection() {
    return {
      message: 'Firebase Storage controller is active!',
      status: 'OK',
    };
  }
}
