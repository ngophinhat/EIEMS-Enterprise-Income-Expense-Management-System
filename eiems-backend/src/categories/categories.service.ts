import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoriesService {

  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; type: 'INCOME' | 'EXPENSE' }) {
        return this.prisma.category.create({
        data: {
            name: data.name,
            type: data.type
        }
        });
    }

    async findOne(id: string){
        return this.prisma.category.findUnique({
            where: {id}
            });
        }

    async findAll() {
        return this.prisma.category.findMany();
        }
    
    async update(id: string, data: any) {
        if (data.dueDate) {
        data.dueDate = new Date(data.dueDate);
        }
        return this.prisma.category.update({
            where: { id },
            data
        });
    }
}