import { PrismaService } from '../prisma/prisma.service';
import { TransactionAction, Prisma } from '@prisma/client';
export declare class TransactionLogService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    log({ transactionId, action, changedFields, note, performedById, }: {
        transactionId: string;
        action: TransactionAction;
        changedFields?: Record<string, {
            from: unknown;
            to: unknown;
        }>;
        note?: string;
        performedById: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        note: string | null;
        action: import("@prisma/client").$Enums.TransactionAction;
        changedFields: Prisma.JsonValue | null;
        transactionId: string;
        performedById: string;
    }>;
    findByTransaction(transactionId: string): Promise<({
        performedBy: {
            id: string;
            fullName: string;
            role: import("@prisma/client").$Enums.Role;
        };
    } & {
        id: string;
        createdAt: Date;
        note: string | null;
        action: import("@prisma/client").$Enums.TransactionAction;
        changedFields: Prisma.JsonValue | null;
        transactionId: string;
        performedById: string;
    })[]>;
}
