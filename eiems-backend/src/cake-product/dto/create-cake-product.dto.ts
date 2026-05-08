import {
  IsEnum,
  IsOptional,
  IsBoolean,
  IsString,
  IsInt,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CakeCategory, CakeShape, CakeSize, AgeGroup } from '@prisma/client';

export class CreateCakePriceDto {
  @IsOptional()
  @IsEnum(CakeShape)
  shape?: CakeShape;

  @IsOptional()
  @IsEnum(CakeSize)
  size?: CakeSize;

  @IsNumber()
  @Min(0)
  price: number;
}

export class CreateCakeProductDto {
  @IsEnum(CakeCategory)
  category: CakeCategory;

  @IsString()
  name: string;

  @IsOptional()
  @IsEnum(CakeShape)
  shape?: CakeShape;

  @IsOptional()
  @IsEnum(CakeSize)
  size?: CakeSize;

  @IsOptional()
  @IsEnum(AgeGroup)
  ageGroup?: AgeGroup;

  @IsOptional()
  @IsInt()
  setNumber?: number;

  @IsOptional()
  @IsInt()
  setQuantity?: number;

  @IsOptional()
  @IsBoolean()
  isPriceManual?: boolean;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCakePriceDto)
  prices: CreateCakePriceDto[];
}
