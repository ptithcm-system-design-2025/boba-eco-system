import { IsArray, IsInt, ArrayNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BulkDeleteCategoryDto {
  @ApiProperty({
    description: 'List of category IDs to delete',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsArray({ message: 'ids must be an array' })
  @ArrayNotEmpty({ message: 'The ID list cannot be empty' })
  @IsInt({ each: true, message: 'Each ID must be an integer' })
  ids: number[];
}
