import { PrismaService } from '../prisma/prisma.service';
import { TaxService } from '../tax/tax.service';
export declare class ReportsService {
    private prisma;
    private taxService;
    constructor(prisma: PrismaService, taxService: TaxService);
    getRevenue(month: number, year: number): Promise<{
        month: number;
        year: number;
        totalRevenue: number;
    }>;
    calculate(startDate: Date, endDate: Date): Promise<{
        totalIncome: number;
        totalExpense: number;
        profit: number;
    }>;
    reportByDay(year: number, month: number, day: number): Promise<{
        totalIncome: number;
        totalExpense: number;
        profit: number;
    }>;
    reportByMonth(year: number, month: number): Promise<{
        totalIncome: number;
        totalExpense: number;
        profit: number;
    }>;
    reportByQuarter(year: number, quarter: number): Promise<{
        tax: {
            incomeBeforeTax: number;
            vatAmount: number;
            tndnAmount: number;
            totalTax: number;
            incomeAfterTax: number;
            vatRate: number;
            tndnRate: number;
        };
        totalIncome: number;
        totalExpense: number;
        profit: number;
        year: number;
        quarter: number;
    }>;
    reportByYear(year: number): Promise<{
        tax: {
            incomeBeforeTax: number;
            vatAmount: number;
            tndnAmount: number;
            totalTax: number;
            incomeAfterTax: number;
            vatRate: number;
            tndnRate: number;
        };
        totalIncome: number;
        totalExpense: number;
        profit: number;
        year: number;
    }>;
    dashboard(): Promise<{
        totalIncome: number;
        totalExpense: number;
        profit: number;
        totalDebts: number;
        totalCustomers: number;
    }>;
}
