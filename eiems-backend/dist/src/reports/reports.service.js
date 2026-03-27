"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const tax_service_1 = require("../tax/tax.service");
let ReportsService = class ReportsService {
    prisma;
    taxService;
    constructor(prisma, taxService) {
        this.prisma = prisma;
        this.taxService = taxService;
    }
    async getRevenue(month, year) {
        const payments = await this.prisma.debtPayment.findMany({
            where: {
                paymentDate: {
                    gte: new Date(`${year}-${month}-01`),
                    lt: new Date(`${year}-${month + 1}-01`),
                },
            },
        });
        const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
        return {
            month,
            year,
            totalRevenue,
        };
    }
    async calculate(startDate, endDate) {
        const transactions = await this.prisma.transaction.findMany({
            where: {
                transactionDate: {
                    gte: startDate,
                    lt: endDate,
                },
                isArchived: false,
            },
        });
        let totalIncome = 0;
        let totalExpense = 0;
        for (const t of transactions) {
            const amount = Number(t.amount);
            if (t.type === 'INCOME') {
                totalIncome += amount;
            }
            else {
                totalExpense += amount;
            }
        }
        return {
            totalIncome,
            totalExpense,
            profit: totalIncome - totalExpense,
        };
    }
    async reportByDay(year, month, day) {
        const startDate = new Date(year, month - 1, day);
        const endDate = new Date(year, month - 1, day + 1);
        return this.calculate(startDate, endDate);
    }
    async reportByMonth(year, month) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 1);
        return this.calculate(startDate, endDate);
    }
    async reportByQuarter(year, quarter) {
        const startMonth = (quarter - 1) * 3;
        const startDate = new Date(year, startMonth, 1);
        const endDate = new Date(year, startMonth + 3, 1);
        const base = await this.calculate(startDate, endDate);
        const taxes = await this.taxService.getActiveTaxes();
        const vatRate = Number(taxes.find((t) => t.type === 'VAT')?.rate ?? 0.1);
        const tndnRate = Number(taxes.find((t) => t.type === 'CORPORATE')?.rate ?? 0.2);
        const taxResult = this.taxService.applyTax(base.totalIncome, base.totalExpense, vatRate, tndnRate);
        return {
            year,
            quarter,
            ...base,
            tax: {
                vatRate,
                tndnRate,
                ...taxResult,
            },
        };
    }
    async reportByYear(year) {
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year + 1, 0, 1);
        const base = await this.calculate(startDate, endDate);
        const taxes = await this.taxService.getActiveTaxes();
        const vatRate = Number(taxes.find((t) => t.type === 'VAT')?.rate ?? 0.1);
        const tndnRate = Number(taxes.find((t) => t.type === 'CORPORATE')?.rate ?? 0.2);
        const taxResult = this.taxService.applyTax(base.totalIncome, base.totalExpense, vatRate, tndnRate);
        return {
            year,
            ...base,
            tax: {
                vatRate,
                tndnRate,
                ...taxResult,
            },
        };
    }
    async dashboard() {
        const income = await this.prisma.transaction.aggregate({
            _sum: { amount: true },
            where: {
                type: 'INCOME',
                deletedAt: null,
            },
        });
        const expense = await this.prisma.transaction.aggregate({
            _sum: { amount: true },
            where: {
                type: 'EXPENSE',
                deletedAt: null,
            },
        });
        const debts = await this.prisma.debt.aggregate({
            _sum: { remainingAmount: true },
        });
        const totalCustomers = await this.prisma.customer.count();
        const totalIncome = Number(income._sum.amount || 0);
        const totalExpense = Number(expense._sum.amount || 0);
        return {
            totalIncome,
            totalExpense,
            profit: totalIncome - totalExpense,
            totalDebts: Number(debts._sum.remainingAmount || 0),
            totalCustomers,
        };
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        tax_service_1.TaxService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map