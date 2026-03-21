import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryTaxDto } from './tax.dto';

@Injectable()
export class TaxService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryTaxDto) {
    return this.prisma.tax.findMany({
      where: {
        ...(query.type !== undefined && { type: query.type }),
        ...(query.isActive !== undefined && { isActive: query.isActive }),
      },
      orderBy: [{ type: 'asc' }, { rate: 'asc' }],
    });
  }

  async findOne(id: string) {
    const tax = await this.prisma.tax.findUnique({ where: { id } });
    if (!tax) {
      throw new NotFoundException(`Không tìm thấy thuế với id: ${id}`);
    }
    return tax;
  }
  async getActiveTaxes() {
    return this.prisma.tax.findMany({
      where: { isActive: true },
      orderBy: [{ type: 'asc' }],
    });
  }

  applyTax(income: number, expense: number, vatRate: number, tndnRate: number) {
    const vat = parseFloat((income * vatRate).toFixed(2));
    const profit = income - expense;
    const tndn = parseFloat((profit > 0 ? profit * tndnRate : 0).toFixed(2));
    const totalTax = vat + tndn;

    return {
      incomeBeforeTax: income,
      vatAmount: vat,
      tndnAmount: tndn,
      totalTax,
      incomeAfterTax: parseFloat((income - totalTax).toFixed(2)),
    };
  }
}
