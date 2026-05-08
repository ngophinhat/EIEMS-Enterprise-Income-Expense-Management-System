/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SalesOrderService } from './sales-order.service';
import {
  ConfirmPaymentDto,
  CreateSalesOrderDto,
  UpdateOrderStatusDto,
  UpdatePaymentStatusDto,
} from './dto/sales-order.dto';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth/auth.guard';
import { OrderStatus, PaymentStatus } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sales-orders')
export class SalesOrderController {
  constructor(private readonly salesOrderService: SalesOrderService) {}

  @Post()
  @Roles('STAFF', 'ADMIN', 'ACCOUNTANT')
  create(@Body() dto: CreateSalesOrderDto, @Request() req: any) {
    return this.salesOrderService.create(dto, req.user.id);
  }

  @Get()
  @Roles('OWNER', 'ADMIN', 'ACCOUNTANT', 'STAFF')
  findAll(
    @Query('orderStatus') orderStatus?: OrderStatus,
    @Query('paymentStatus') paymentStatus?: PaymentStatus,
    @Query('deliveryDate') deliveryDate?: string,
    @Request() req?: any,
  ) {
    const createdById = req.user.role === 'STAFF' ? req.user.id : undefined;
    return this.salesOrderService.findAll({
      orderStatus,
      paymentStatus,
      deliveryDate,
      createdById,
    });
  }

  @Get(':id')
  @Roles('OWNER', 'ADMIN', 'ACCOUNTANT', 'STAFF')
  findOne(@Param('id') id: string) {
    return this.salesOrderService.findOne(id);
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'ACCOUNTANT', 'STAFF')
  updateOrderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @Request() req: any,
  ) {
    // eslint-disable-next-line prettier/prettier
    return this.salesOrderService.updateOrderStatus(id, dto, req.user.id, req.user.role);
  }

  @Patch(':id/payment')
  @Roles('STAFF', 'ADMIN', 'ACCOUNTANT')
  updatePaymentStatus(
    @Param('id') id: string,
    @Body() dto: UpdatePaymentStatusDto,
    @Request() req: any,
  ) {
    return this.salesOrderService.updatePaymentStatus(id, dto, req.user.id);
  }

  // ✅ Phải nằm TRONG class này
  @Patch(':id/confirm-payment')
  @Roles('STAFF', 'ADMIN', 'ACCOUNTANT')
  confirmPayment(
    @Param('id') id: string,
    @Body() dto: ConfirmPaymentDto,
    @Request() req: any,
  ) {
    return this.salesOrderService.confirmPayment(id, dto, req.user.id);
  }
}
