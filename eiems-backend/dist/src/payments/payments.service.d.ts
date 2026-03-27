import { PrismaService } from '../prisma/prisma.service';
export declare class PaymentsService {
    private prisma;
    constructor(prisma: PrismaService);
    createPayment(debtId: string, amount: number, receivedById: string, note?: string, paymentDate?: Date): Promise<{
        id: string;
        createdAt: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        note: string | null;
        paymentDate: Date;
        debtId: string;
        receivedById: string;
    }>;
    getPaymentsByDebt(debtId: string): Promise<{
        id: string;
        createdAt: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        note: string | null;
        paymentDate: Date;
        debtId: string;
        receivedById: string;
    }[]>;
}
