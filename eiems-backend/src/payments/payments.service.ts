import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DebtStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async createPayment(
    debtId: string,
    amount: number,
    receivedById: string,
    note?: string,
    paymentDate?: Date,
  ) {
    const debt = await this.prisma.debt.findUnique({
      where: { id: debtId },
    });

    if (!debt) {
      throw new NotFoundException('Không tìm thấy công nợ!');
    }

    if (debt.status === DebtStatus.PAID) {
      throw new BadRequestException('Công nợ này đã được tất toán!');
    }

    const remaining = Number(debt.remainingAmount);

    if (amount > remaining) {
      throw new BadRequestException(
        `Số tiền thanh toán (${amount}) vượt quá số nợ còn lại (${remaining})!`,
      );
    }

    const newRemaining = remaining - amount;
    const status: DebtStatus =
      newRemaining === 0 ? DebtStatus.PAID : DebtStatus.PARTIAL;

    const payment = await this.prisma.debtPayment.create({
      data: {
        amount,
        debtId,
        paymentDate: paymentDate ?? new Date(),
        receivedById,
        note,
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
      where: { debtId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
