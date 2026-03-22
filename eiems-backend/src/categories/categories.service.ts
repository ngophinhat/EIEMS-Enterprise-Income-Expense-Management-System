import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; type: 'INCOME' | 'EXPENSE' }) {
    return this.prisma.category.create({
      data: {
        name: data.name,
        type: data.type,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.category.findUnique({
      where: { id },
    });
  }

  async findAll() {
    return this.prisma.category.findMany();
  }

  async update(id: string, data: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (data.dueDate) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
      data.dueDate = new Date(data.dueDate);
    }
    return this.prisma.category.update({
      where: { id },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data,
    });
  }
}
