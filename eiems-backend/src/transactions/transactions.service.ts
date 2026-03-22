import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TransactionLogService } from '../transaction-log/transaction-log.service';

@Injectable()
export class TransactionsService {
  constructor(
    private prisma: PrismaService,
    private logService: TransactionLogService,
  ) {}

  async create(data: {
    amount: number;
    type: 'INCOME' | 'EXPENSE';
    categoryId: string;
    createdById: string;
    note?: string;
    transactionDate: Date;
  }) {
    const transaction = await this.prisma.transaction.create({ data });

    await this.logService.log({
      transactionId: transaction.id,
      action: 'CREATE',
      performedById: data.createdById,
      note: 'Tạo giao dịch mới',
    });

    return transaction;
  }

  async findAll() {
    return this.prisma.transaction.findMany({
      where: { isArchived: false },
      include: {
        category: true,
        customer: true,
        createdBy: {
          select: { id: true, fullName: true, role: true },
        },
        updatedBy: {
          select: { id: true, fullName: true, role: true },
        },
      },
      orderBy: { transactionDate: 'desc' },
    });
  }

  async findAllArchived() {
    return this.prisma.transaction.findMany({
      where: { isArchived: true },
      include: {
        category: true,
        customer: true,
        createdBy: {
          select: { id: true, fullName: true },
        },
        updatedBy: {
          select: { id: true, fullName: true },
        },
        deletedBy: {
          select: { id: true, fullName: true },
        },
      },
      orderBy: { deletedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        category: true,
        customer: true,
        createdBy: {
          select: { id: true, fullName: true, role: true },
        },
        updatedBy: {
          select: { id: true, fullName: true, role: true },
        },
        logs: {
          include: {
            performedBy: {
              select: { id: true, fullName: true, role: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!transaction) {
      throw new NotFoundException(`Không tìm thấy giao dịch với id: ${id}`);
    }

    return transaction;
  }

  async update(
    id: string,
    data: {
      type?: 'INCOME' | 'EXPENSE';
      amount?: number;
      note?: string;
      categoryId?: string;
      transactionDate?: Date | string;
    },
    userId: string,
  ) {
    const old = await this.findOne(id);

    // Tính changedFields
    const changedFields: Record<string, { from: unknown; to: unknown }> = {};
    if (data.amount !== undefined && Number(old.amount) !== data.amount) {
      changedFields.amount = { from: Number(old.amount), to: data.amount };
    }
    if (data.type !== undefined && old.type !== data.type) {
      changedFields.type = { from: old.type, to: data.type };
    }
    if (data.note !== undefined && old.note !== data.note) {
      changedFields.note = { from: old.note, to: data.note };
    }
    if (data.categoryId !== undefined && old.categoryId !== data.categoryId) {
      changedFields.categoryId = { from: old.categoryId, to: data.categoryId };
    }
    if (data.transactionDate !== undefined) {
      const newDate = new Date(data.transactionDate).toISOString();
      const oldDate = new Date(old.transactionDate).toISOString();
      if (oldDate !== newDate) {
        changedFields.transactionDate = { from: oldDate, to: newDate };
      }
    }

    const updated = await this.prisma.transaction.update({
      where: { id },
      data: {
        ...data,
        ...(data.transactionDate && {
          transactionDate: new Date(data.transactionDate),
        }),
        updatedById: userId,
      },
    });

    await this.logService.log({
      transactionId: id,
      action: 'UPDATE',
      changedFields,
      performedById: userId,
      note: 'Cập nhật giao dịch',
    });

    return updated;
  }

  async softDelete(id: string, userId: string) {
    await this.findOne(id);

    const archived = await this.prisma.transaction.update({
      where: { id },
      data: {
        isArchived: true,
        deletedAt: new Date(),
        deletedById: userId,
      },
    });

    await this.logService.log({
      transactionId: id,
      action: 'ARCHIVE',
      performedById: userId,
      note: 'Lưu trữ giao dịch',
    });

    return archived;
  }

  async getLogs(transactionId: string) {
    return this.logService.findByTransaction(transactionId);
  }
  async unarchive(id: string, userId: string) {
    await this.findOne(id);

    const tx = await this.prisma.transaction.update({
      where: { id },
      data: {
        isArchived: false,
        deletedAt: null,
        deletedById: null,
      },
    });

    await this.logService.log({
      transactionId: id,
      action: 'UPDATE',
      performedById: userId,
      note: 'Khôi phục giao dịch từ lưu trữ',
    });

    return tx;
  }
}
