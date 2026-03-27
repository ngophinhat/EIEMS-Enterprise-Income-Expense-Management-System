import { PaymentsService } from './payments.service';
export declare class PaymentsController {
    private paymentsService;
    constructor(paymentsService: PaymentsService);
    create(body: any): Promise<{
        id: string;
        createdAt: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        note: string | null;
        paymentDate: Date;
        debtId: string;
        receivedById: string;
    }>;
    getPayments(id: string): Promise<{
        id: string;
        createdAt: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        note: string | null;
        paymentDate: Date;
        debtId: string;
        receivedById: string;
    }[]>;
}
