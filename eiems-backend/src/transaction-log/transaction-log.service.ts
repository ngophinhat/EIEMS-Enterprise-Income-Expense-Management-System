import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionAction, Prisma } from '@prisma/client';

@Injectable()
export class TransactionLogService {
  constructor(private readonly prisma: PrismaService) {}

  async log({
    transactionId,
    action,
    changedFields,
    note,
    performedById,
  }: {
    transactionId: string;
    action: TransactionAction;
    changedFields?: Record<string, { from: unknown; to: unknown }>;
    note?: string;
    performedById: string;
  }) {
    return this.prisma.transactionLog.create({
      data: {
        transactionId,
        action,
        changedFields: (changedFields ?? {}) as Prisma.InputJsonValue,
        note,
        performedById,
      },
    });
  }

  async findByTransaction(transactionId: string) {
    return this.prisma.transactionLog.findMany({
      where: { transactionId },
      include: {
        performedBy: {
          select: { id: true, fullName: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
