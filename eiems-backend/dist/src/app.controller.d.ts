import { PrismaService } from './prisma/prisma.service';
export declare class AppController {
    private prisma;
    constructor(prisma: PrismaService);
    testDb(): {
        status: string;
    };
}
