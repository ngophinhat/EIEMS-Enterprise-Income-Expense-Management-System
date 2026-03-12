import { Body, Controller, Get, Post,Param, Patch  } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

    @Post()
    create(@Body() body: any) {
    return this.paymentsService.createPayment(
      body.debtId,
      body.amount,
      body.receivedById,
    );
    }
    @Get('/debt/:id')
      getPayments(@Param('id') id: string) {
      return this.paymentsService.getPaymentsByDebt(id);
      }
}