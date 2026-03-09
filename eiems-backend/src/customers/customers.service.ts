import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomersService {

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

}