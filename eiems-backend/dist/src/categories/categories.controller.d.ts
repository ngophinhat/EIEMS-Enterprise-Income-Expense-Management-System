import { CategoriesService } from './categories.service';
export declare class CategoriesController {
    private categoriesService;
    constructor(categoriesService: CategoriesService);
    create(body: any): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        name: string;
        type: import("@prisma/client").$Enums.CategoryType;
        isSystem: boolean;
    }>;
    findAll(): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        name: string;
        type: import("@prisma/client").$Enums.CategoryType;
        isSystem: boolean;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        name: string;
        type: import("@prisma/client").$Enums.CategoryType;
        isSystem: boolean;
    } | null>;
    update(id: string, body: any): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        name: string;
        type: import("@prisma/client").$Enums.CategoryType;
        isSystem: boolean;
    }>;
}
