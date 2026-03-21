import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DebtStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async createPayment(debtId: string, amount: number, receivedById: string) {
    const debt = await this.prisma.debt.findUnique({
      where: { id: debtId },
    });

    if (!debt) {
      throw new Error('Debt not found');
    }

    const newRemaining = Number(debt.remainingAmount) - amount;

    let status: DebtStatus = DebtStatus.PARTIAL;

    if (newRemaining <= 0) {
      status = DebtStatus.PAID;
    }

    const payment = await this.prisma.debtPayment.create({
      data: {
        amount,
        debtId,
        paymentDate: new Date(),
        receivedById,
      },
    });

    await this.prisma.debt.update({
      where: { id: debtId },
      data: {
        remainingAmount: newRemaining,
        status,
      },
    });

    return payment;
  }
  async getPaymentsByDebt(debtId: string) {
    return this.prisma.debtPayment.findMany({
      where: {
        debtId: debtId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
