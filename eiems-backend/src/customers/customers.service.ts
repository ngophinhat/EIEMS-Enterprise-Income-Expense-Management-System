import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; phone: string; address?: string }) {
    return this.prisma.customer.create({
      data: {
        name: data.name,
        phone: data.phone,
        address: data.address,
      },
    });
  }

  async findAll() {
    return this.prisma.customer.findMany({
      include: {
        _count: {
          select: { transactions: true, debts: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        transactions: {
          where: { isArchived: false },
          include: {
            category: true,
            createdBy: {
              select: { id: true, fullName: true },
            },
          },
          orderBy: { transactionDate: 'desc' },
        },
        debts: {
          include: {
            payments: true,
          },
        },
        _count: {
          select: { transactions: true, debts: true },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException(`Không tìm thấy khách hàng với id: ${id}`);
    }

    return customer;
  }

  async update(
    id: string,
    data: { name?: string; phone?: string; address?: string },
  ) {
    await this.findOne(id);
    return this.prisma.customer.update({
      where: { id },
      data,
    });
  }

  async getDebtSummary(customerId: string) {
    const debts = await this.prisma.debt.findMany({
      where: { customerId },
    });

    const totalDebt = debts.reduce((sum, d) => sum + Number(d.totalAmount), 0);
    const remainingDebt = debts.reduce(
      (sum, d) => sum + Number(d.remainingAmount),
      0,
    );
    const totalPaid = totalDebt - remainingDebt;

    return { totalDebt, totalPaid, remainingDebt };
  }
}
