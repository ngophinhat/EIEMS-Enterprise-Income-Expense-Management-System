"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebtsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let DebtsService = class DebtsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.debt.create({
            data: {
                totalAmount: data.totalAmount,
                remainingAmount: data.totalAmount,
                customerId: data.customerId,
                dueDate: data.dueDate ? new Date(data.dueDate) : null,
            },
        });
    }
    async findAll() {
        return this.prisma.debt.findMany({
            include: {
                customer: true,
                payments: {
                    include: {
                        receivedBy: {
                            select: { id: true, fullName: true },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
            orderBy: [
                { status: 'asc' },
                { updatedAt: 'desc' },
            ],
        });
    }
    async findOne(id) {
        const debt = await this.prisma.debt.findUnique({
            where: { id },
            include: {
                customer: true,
                payments: {
                    select: {
                        id: true,
                        amount: true,
                        paymentDate: true,
                        note: true,
                        createdAt: true,
                        receivedBy: {
                            select: { id: true, fullName: true },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!debt)
            throw new common_1.NotFoundException('Không tìm thấy công nợ!');
        return debt;
    }
    async getOverdueDebts() {
        const debts = await this.prisma.debt.findMany({
            where: {
                dueDate: { not: null, lt: new Date() },
                remainingAmount: { gt: 0 },
            },
            include: { customer: true },
        });
        return debts.map((debt) => {
            const overdueDate = Math.floor((new Date().getTime() - new Date(debt.dueDate).getTime()) /
                (1000 * 60 * 60 * 24));
            return { ...debt, overdueDate };
        });
    }
    async update(id, data) {
        if (data.dueDate) {
            data.dueDate = new Date(data.dueDate);
        }
        return this.prisma.debt.update({
            where: { id },
            data: data,
        });
    }
    async remove(id) {
        return this.prisma.debt.delete({ where: { id } });
    }
};
exports.DebtsService = DebtsService;
exports.DebtsService = DebtsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DebtsService);
//# sourceMappingURL=debts.service.js.map