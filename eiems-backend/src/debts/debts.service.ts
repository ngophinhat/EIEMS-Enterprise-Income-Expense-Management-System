import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DebtsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    totalAmount: number;
    customerId: string;
    dueDate?: Date;
  }) {
    return this.prisma.debt.create({
      data: {
        totalAmount: data.totalAmount,
        remainingAmount: data.totalAmount,
        customerId: data.customerId,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      },
    });
  }

  async findAll() {
    return this.prisma.debt.findMany({
      include: {
        customer: true,
        payments: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.debt.findUnique({
      where: { id },
      include: {
        customer: true,
        payments: true,
      },
    });
  }

  async getOverdueDebts() {
    const debts = await this.prisma.debt.findMany({
      where: {
        dueDate: {
          not: null,
          lt: new Date(),
        },
        remainingAmount: {
          gt: 0,
        },
      },
      include: {
        customer: true,
      },
    });
    return debts.map((debts) => {
      const today = new Date();
      const due = new Date(debts.dueDate!);

      const overdueDate = Math.floor(
        (today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24),
      );
      return {
        ...debts,
        overdueDate,
      };
    });
  }
  async update(id: string, data: any) {
    if (data.dueDate) {
      data.dueDate = new Date(data.dueDate);
    }

    return this.prisma.debt.update({
      where: { id },
      data: data,
    });
  }
  async remove(id: string) {
    return this.prisma.debt.delete({
      where: { id },
    });
  }
}
