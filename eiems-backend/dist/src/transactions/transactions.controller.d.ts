import { TransactionsService } from './transactions.service';
export declare class TransactionsController {
    private transactionsService;
    constructor(transactionsService: TransactionsService);
    create(body: {
        amount: number;
        type: 'INCOME' | 'EXPENSE';
        categoryId: string;
        note?: string;
        transactionDate: string;
        materialId?: string;
    }, req: {
        user: {
            id: string;
        };
    }): Promise<{
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
    }>;
    findAll(): Promise<({
        category: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            name: string;
            type: import("@prisma/client").$Enums.CategoryType;
            isSystem: boolean;
        };
        customer: {
            id: string;
            createdAt: Date;
            name: string;
            phone: string;
            address: string | null;
        } | null;
        createdBy: {
            id: string;
            fullName: string;
            role: import("@prisma/client").$Enums.Role;
        };
        updatedBy: {
            id: string;
            fullName: string;
            role: import("@prisma/client").$Enums.Role;
        } | null;
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
    })[]>;
    findAllArchived(): Promise<({
        category: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            name: string;
            type: import("@prisma/client").$Enums.CategoryType;
            isSystem: boolean;
        };
        customer: {
            id: string;
            createdAt: Date;
            name: string;
            phone: string;
            address: string | null;
        } | null;
        createdBy: {
            id: string;
            fullName: string;
        };
        updatedBy: {
            id: string;
            fullName: string;
        } | null;
        deletedBy: {
            id: string;
            fullName: string;
        } | null;
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
    })[]>;
    findOne(id: string): Promise<{
        category: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            name: string;
            type: import("@prisma/client").$Enums.CategoryType;
            isSystem: boolean;
        };
        customer: {
            id: string;
            createdAt: Date;
            name: string;
            phone: string;
            address: string | null;
        } | null;
        logs: ({
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
            changedFields: import("@prisma/client/runtime/library").JsonValue | null;
            transactionId: string;
            performedById: string;
        })[];
        createdBy: {
            id: string;
            fullName: string;
            role: import("@prisma/client").$Enums.Role;
        };
        updatedBy: {
            id: string;
            fullName: string;
            role: import("@prisma/client").$Enums.Role;
        } | null;
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
    }>;
    getLogs(id: string): Promise<({
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
        changedFields: import("@prisma/client/runtime/library").JsonValue | null;
        transactionId: string;
        performedById: string;
    })[]>;
    update(id: string, body: {
        type?: 'INCOME' | 'EXPENSE';
        amount?: number;
        note?: string;
        categoryId?: string;
        materialId?: string;
        transactionDate?: string;
    }, req: {
        user: {
            id: string;
        };
    }): Promise<{
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
    }>;
    archive(id: string, req: {
        user: {
            id: string;
        };
    }): Promise<{
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
    }>;
    unarchive(id: string, req: {
        user: {
            id: string;
        };
    }): Promise<{
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
    }>;
}
