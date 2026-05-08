import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  IsNumber,
  IsDateString,
  Min,
  IsUUID,
} from 'class-validator';
import { CakeShape, CakeSize, AgeGroup, OrderStatus, PaymentStatus } from '@prisma/client';

export class CreateSalesOrderDto {
  // Khách hàng
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsString()
  customerName: string | undefined;

  @IsString()
  customerPhone: string | undefined;

  // Bánh
  @IsOptional()
  @IsUUID()
  cakeProductId?: string;

  @IsString()
  cakeName: string | undefined;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  basePrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  surcharge?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  addonPrice?: number;

  @IsOptional()
  @IsString()
  addonNote?: string;

  @IsOptional()
  @IsDateString()
  deliveryTime?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  // Bánh sinh nhật
  @IsOptional()
  @IsEnum(CakeShape)
  shape?: CakeShape;

  @IsOptional()
  @IsEnum(CakeSize)
  size?: CakeSize;

  @IsOptional()
  @IsEnum(AgeGroup)
  ageGroup?: AgeGroup;
}

// ─── Update trạng thái đơn (ADMIN/ACCOUNTANT confirm) ───────────────────────

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  orderStatus: OrderStatus | undefined;

  @IsOptional()
  @IsString()
  cancelReason?: string;
}

// ─── Update trạng thái thanh toán (STAFF sau khi giao hàng) ─────────────────

export class UpdatePaymentStatusDto {
  @IsEnum(PaymentStatus)
  paymentStatus: PaymentStatus | undefined;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsEnum(['CASH', 'BANK_TRANSFER'])
  paymentMethod?: 'CASH' | 'BANK_TRANSFER';
}

// ─── Confirm nhận tiền (ACCOUNTANT) → Auto tạo Transaction THU ──────────────

export class ConfirmPaymentDto {
  @IsOptional()
  @IsString()
  note?: string; // Ghi chú thêm nếu có
}
