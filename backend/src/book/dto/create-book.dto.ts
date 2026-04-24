import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsArray,
  Min,
  Length,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @Length(13, 13, { message: 'ISBN 13 karakter olmalıdır' })
  isbn: string;

  @IsString()
  @IsOptional()
  description?: string;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  price: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  stock?: number;

  @IsOptional()
  coverImage?: string;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  publishYear?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  pageCount?: number;

  @IsString()
  @IsOptional()
  language?: string;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @IsArray()
  @IsOptional()
  authorIds?: number[];
}
