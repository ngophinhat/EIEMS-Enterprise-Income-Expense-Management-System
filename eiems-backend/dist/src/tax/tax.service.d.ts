import { PrismaService } from '../prisma/prisma.service';
import { QueryTaxDto } from './tax.dto';
export declare class TaxService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(query: QueryTaxDto): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        type: import("@prisma/client").$Enums.TaxType;
        rate: import("@prisma/client/runtime/library").Decimal;
        description: string | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        type: import("@prisma/client").$Enums.TaxType;
        rate: import("@prisma/client/runtime/library").Decimal;
        description: string | null;
    }>;
    getActiveTaxes(): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        type: import("@prisma/client").$Enums.TaxType;
        rate: import("@prisma/client/runtime/library").Decimal;
        description: string | null;
    }[]>;
    applyTax(income: number, expense: number, vatRate: number, tndnRate: number): {
        incomeBeforeTax: number;
        vatAmount: number;
        tndnAmount: number;
        totalTax: number;
        incomeAfterTax: number;
    };
}
