import { DebtsService } from './debts.service';
export declare class DebtsController {
    private debtsService;
    constructor(debtsService: DebtsService);
    create(body: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        remainingAmount: import("@prisma/client/runtime/library").Decimal;
        status: import("@prisma/client").$Enums.DebtStatus;
        dueDate: Date | null;
    }>;
    findAll(): Promise<({
        customer: {
            id: string;
            createdAt: Date;
            name: string;
            phone: string;
            address: string | null;
        };
        payments: ({
            receivedBy: {
                id: string;
                fullName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            amount: import("@prisma/client/runtime/library").Decimal;
            note: string | null;
            paymentDate: Date;
            debtId: string;
            receivedById: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        remainingAmount: import("@prisma/client/runtime/library").Decimal;
        status: import("@prisma/client").$Enums.DebtStatus;
        dueDate: Date | null;
    })[]>;
    findOne(id: string): Promise<{
        customer: {
            id: string;
            createdAt: Date;
            name: string;
            phone: string;
            address: string | null;
        };
        payments: {
            id: string;
            createdAt: Date;
            amount: import("@prisma/client/runtime/library").Decimal;
            note: string | null;
            paymentDate: Date;
            receivedBy: {
                id: string;
                fullName: string;
            };
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
    }>;
    update(id: string, body: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        remainingAmount: import("@prisma/client/runtime/library").Decimal;
        status: import("@prisma/client").$Enums.DebtStatus;
        dueDate: Date | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        remainingAmount: import("@prisma/client/runtime/library").Decimal;
        status: import("@prisma/client").$Enums.DebtStatus;
        dueDate: Date | null;
    }>;
}
