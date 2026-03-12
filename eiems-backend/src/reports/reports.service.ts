import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getRevenue(month: number, year: number) {
    const payments = await this.prisma.debtPayment.findMany({
      where: {
        paymentDate: {
          gte: new Date(`${year}-${month}-01`),
          lt: new Date(`${year}-${month + 1}-01`)
        }
      }
    });

    const totalRevenue = payments.reduce(
      (sum, p) => sum + Number(p.amount),
      0
    );

    return {
      month,
      year,
      totalRevenue
    };
  }
    async calculate(startDate: Date, endDate: Date) {

        const transactions = await this.prisma.transaction.findMany({
            where: {
            transactionDate: {
                gte: startDate,
                lt: endDate
            }
            }
        })

        let totalIncome = 0
        let totalExpense = 0

        for (const t of transactions) {

            const amount = Number(t.amount)

            if (t.type === 'INCOME') {
            totalIncome += amount
            } else {
            totalExpense += amount
            }

        }

        return {
            totalIncome,
            totalExpense,
            profit: totalIncome - totalExpense
        }

            }

    async reportByDay(year: number, month: number, day: number) {

        const startDate = new Date(year, month - 1, day)
        const endDate = new Date(year, month - 1, day + 1)

        return this.calculate(startDate, endDate)
    }

    async reportByMonth(year: number, month: number) {

        const startDate = new Date(year, month - 1, 1)
        const endDate = new Date(year, month, 1)

        return this.calculate(startDate, endDate)
    }

    async reportByQuarter(year: number, quarter: number) {

        const startMonth = (quarter - 1) * 3

        const startDate = new Date(year, startMonth, 1)
        const endDate = new Date(year, startMonth + 3, 1)

        return this.calculate(startDate, endDate)

    }

    async reportByYear(year: number) {

        const startDate = new Date(year, 0, 1)
        const endDate = new Date(year + 1, 0, 1)

        return this.calculate(startDate, endDate)

    }

    async dashboard() {

    const income = await this.prisma.transaction.aggregate({
            _sum: { amount: true },
            where: {
            type: 'INCOME',
            deletedAt: null
            }
        })

        const expense = await this.prisma.transaction.aggregate({
            _sum: { amount: true },
            where: {
            type: 'EXPENSE',
            deletedAt: null
            }
        })

        const debts = await this.prisma.debt.aggregate({
            _sum: { remainingAmount: true }
        })

        const totalCustomers = await this.prisma.customer.count()

        const totalIncome = Number(income._sum.amount || 0)
        const totalExpense = Number(expense._sum.amount || 0)

        return {
            totalIncome,
            totalExpense,
            profit: totalIncome - totalExpense,
            totalDebts: Number(debts._sum.remainingAmount || 0),
            totalCustomers
        }

    }

}

