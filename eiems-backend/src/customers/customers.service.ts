import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomersService {
  finOne: any;
  constructor(private prisma: PrismaService) {}

    async create(data: {
    name: string;
    phone: string;
    address?: string;
    }) {
    return this.prisma.customer.create({
        data: {
        name: data.name,
        phone: data.phone,
        address: data.address,
        },
    });
    }
  async findAll() {
    return this.prisma.customer.findMany();
  }
  async getCustomerDebts(customerId: string) {
    return this.prisma.debt.findMany({
      where: {
        customerId: customerId
      }
    });
  }
  async findOne(id: string) {
    return this.prisma.customer.findUnique({
      where: { id },
      include: {
        debts: true
      }
    });
  }

  async update(id: string, data: any) {
  if (data.dueDate) {
    data.dueDate = new Date(data.dueDate);
  }
  
  return this.prisma.debt.update({
    where: { id },
    data: data,
  });
}
  async getDebtSummary(customerId: string) {

  const debts = await this.prisma.debt.findMany({
    where: { customerId }
  });

  const totalDebt = debts.reduce(
    (sum, d) => sum + Number(d.totalAmount),
    0
  );

  const remainingDebt = debts.reduce(
    (sum, d) => sum + Number(d.remainingAmount),
    0
  );

  const totalPaid = totalDebt - remainingDebt;

  return {
    totalDebt,
    totalPaid,
    remainingDebt
  };
}
}

