import { IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { TaxType } from '@prisma/client';

export class QueryTaxDto {
  @IsOptional()
  @IsEnum(TaxType)
  type?: TaxType;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
