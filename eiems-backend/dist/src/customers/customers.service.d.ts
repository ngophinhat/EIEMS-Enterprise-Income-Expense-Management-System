import { PrismaService } from '../prisma/prisma.service';
export declare class CustomersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: {
        name: string;
        phone: string;
        address?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        phone: string;
        address: string | null;
    }>;
    findAll(): Promise<({
        _count: {
            transactions: number;
            debts: number;
        };
    } & {
        id: string;
        createdAt: Date;
        name: string;
        phone: string;
        address: string | null;
    })[]>;
    findOne(id: string): Promise<{
        transactions: ({
            category: {
                id: string;
                isActive: boolean;
                createdAt: Date;
                name: string;
                type: import("@prisma/client").$Enums.CategoryType;
                isSystem: boolean;
            };
            createdBy: {
                id: string;
                fullName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import("@prisma/client").$Enums.TransactionType;
            amount: import("@prisma/client/runtime/library").Decimal;
            note: string | null;
            isArchived: boolean;
            transactionDate: Date;
            deletedAt: Date | null;
            categoryId: string;
            createdById: string;
            customerId: string | null;
            updatedById: string | null;
            deletedById: string | null;
        })[];
        debts: ({
            payments: {
                id: string;
                createdAt: Date;
                amount: import("@prisma/client/runtime/library").Decimal;
                note: string | null;
                paymentDate: Date;
                debtId: string;
                receivedById: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            remainingAmount: import("@prisma/client/runtime/library").Decimal;
            status: import("@prisma/client").$Enums.DebtStatus;
            dueDate: Date | null;
        })[];
        _count: {
            transactions: number;
            debts: number;
        };
    } & {
        id: string;
        createdAt: Date;
        name: string;
        phone: string;
        address: string | null;
    }>;
    update(id: string, data: {
        name?: string;
        phone?: string;
        address?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        phone: string;
        address: string | null;
    }>;
    getDebtSummary(customerId: string): Promise<{
        totalDebt: number;
        totalPaid: number;
        remainingDebt: number;
    }>;
}
