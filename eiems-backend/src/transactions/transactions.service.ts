import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  create(data: {
    amount: number;
    type: 'INCOME' | 'EXPENSE';
    categoryId: string;
    createdById: string;
    note?: string;
    transactionDate: Date;
  }) {
    return this.prisma.transaction.create({
      data,
    });
  }

  async findAll() {
    return this.prisma.transaction.findMany({
      where: {
        isArchived: false,
      },
      include: {
        category: true,
        createdBy: true,
      },
    });
  }

  async findAllArchived() {
    return this.prisma.transaction.findMany({
      where: {
        isArchived: true,
      },
      include: {
        category: true,
        createdBy: {
          select: { id: true, fullName: true },
        },
        updatedBy: {
          select: { id: true, fullName: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
  async findOne(id: string) {
    return this.prisma.transaction.findUnique({
      where: { id },
      include: {
        category: true,
        createdBy: true,
      },
    });
  }
  async update(
    id: string,
    data: {
      type?: 'INCOME' | 'EXPENSE';
      amount?: number;
      note?: string;
      categoryId?: string;
      materialId?: string;
      transactionDate?: Date | string;
    },
    userId: string,
  ) {
    return this.prisma.transaction.update({
      where: { id },
      data: {
        ...data,
        ...(data.transactionDate && {
          transactionDate: new Date(data.transactionDate),
        }),
        updatedById: userId,
      },
    });
  }

  async sofDelete(id: string, userId: string) {
    return this.prisma.transaction.update({
      where: { id },
      data: {
        isArchived: true,
        deletedAt: new Date(),
        deletedById: userId,
      },
    });
  }
}
