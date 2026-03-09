import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DebtsService {
  constructor(private prisma: PrismaService) {}

create(data: {
  totalAmount: number;
  customerId: string;
}); async create(data: { totalAmount: number; customerId: string }) {
  return this.prisma.debt.create({
    data: {
      totalAmount: data.totalAmount,
      remainingAmount: data.totalAmount,
      customerId: data.customerId,
    },
  });
}

findAll() {
  return this.prisma.debt.findMany({
    include: {
      customer: true,
    },
  });
}
}