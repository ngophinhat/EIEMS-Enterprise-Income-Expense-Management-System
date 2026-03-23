import { Injectable, NotFoundException } from '@nestjs/common';
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
        payments: {
          include: {
            receivedBy: {
              select: { id: true, fullName: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      // Sort: UNPAID → PARTIAL lên đầu, trong mỗi nhóm sort theo updatedAt mới nhất
      orderBy: [
        { status: 'asc' },
        { updatedAt: 'desc' },
      ],
    });
  }

  async findOne(id: string) {
    const debt = await this.prisma.debt.findUnique({
      where: { id },
      include: {
        customer: true,
        payments: {
          select: {
            id: true,
            amount: true,
            paymentDate: true,
            note: true,       // ← thêm note
            createdAt: true,
            receivedBy: {
              select: { id: true, fullName: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!debt) throw new NotFoundException('Không tìm thấy công nợ!');
    return debt;
  }

  async getOverdueDebts() {
    const debts = await this.prisma.debt.findMany({
      where: {
        dueDate: { not: null, lt: new Date() },
        remainingAmount: { gt: 0 },
      },
      include: { customer: true },
    });
    return debts.map((debt) => {
      const overdueDate = Math.floor(
        (new Date().getTime() - new Date(debt.dueDate!).getTime()) /
          (1000 * 60 * 60 * 24),
      );
      return { ...debt, overdueDate };
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
    return this.prisma.debt.delete({ where: { id } });
  }
}