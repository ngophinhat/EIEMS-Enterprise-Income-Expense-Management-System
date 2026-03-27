import { ReportsService } from './reports.service';
export declare class ReportsController {
    private reportsService;
    constructor(reportsService: ReportsService);
    dashboard(): Promise<{
        totalIncome: number;
        totalExpense: number;
        profit: number;
        totalDebts: number;
        totalCustomers: number;
    }>;
    reportDay(year: string, month: string, day: string): Promise<{
        totalIncome: number;
        totalExpense: number;
        profit: number;
    }>;
    reportMonth(year: string, month: string): Promise<{
        totalIncome: number;
        totalExpense: number;
        profit: number;
    }>;
    reportQuarter(year: string, quarter: string): Promise<{
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
    reportYear(year: string): Promise<{
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
}
