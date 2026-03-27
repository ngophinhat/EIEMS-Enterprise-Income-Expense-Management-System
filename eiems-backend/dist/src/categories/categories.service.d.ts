import { PrismaService } from 'src/prisma/prisma.service';
export declare class CategoriesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: {
        name: string;
        type: 'INCOME' | 'EXPENSE';
    }): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        name: string;
        type: import("@prisma/client").$Enums.CategoryType;
        isSystem: boolean;
    }>;
    findOne(id: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        name: string;
        type: import("@prisma/client").$Enums.CategoryType;
        isSystem: boolean;
    } | null>;
    findAll(): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        name: string;
        type: import("@prisma/client").$Enums.CategoryType;
        isSystem: boolean;
    }[]>;
    update(id: string, data: any): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        name: string;
        type: import("@prisma/client").$Enums.CategoryType;
        isSystem: boolean;
    }>;
}
