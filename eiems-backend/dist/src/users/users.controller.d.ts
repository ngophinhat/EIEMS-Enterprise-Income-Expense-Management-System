import { UsersService } from './users.service';
import { Role } from '@prisma/client';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<{
        id: string;
        fullName: string;
        email: string;
        role: import("@prisma/client").$Enums.Role;
        isActive: boolean;
        createdAt: Date;
        _count: {
            createdTransactions: number;
        };
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        fullName: string;
        email: string;
        role: import("@prisma/client").$Enums.Role;
        isActive: boolean;
        createdAt: Date;
        _count: {
            createdTransactions: number;
        };
    }>;
    getUserTransactions(id: string): Promise<({
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
            name: string;
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
    getUserLogs(id: string): Promise<({
        transaction: {
            id: string;
            type: import("@prisma/client").$Enums.TransactionType;
            amount: import("@prisma/client/runtime/library").Decimal;
            note: string | null;
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
    create(body: any): Promise<{
        id: string;
        fullName: string;
        email: string;
        role: import("@prisma/client").$Enums.Role;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    toggleActive(id: string, req: {
        user: {
            id: string;
            role: Role;
        };
    }): Promise<{
        id: string;
        fullName: string;
        email: string;
        role: import("@prisma/client").$Enums.Role;
        isActive: boolean;
    }>;
}
