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
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CustomersService = class CustomersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.customer.create({
            data: {
                name: data.name,
                phone: data.phone,
                address: data.address,
            },
        });
    }
    async findAll() {
        return this.prisma.customer.findMany({
            include: {
                _count: {
                    select: { transactions: true, debts: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const customer = await this.prisma.customer.findUnique({
            where: { id },
            include: {
                transactions: {
                    where: { isArchived: false },
                    include: {
                        category: true,
                        createdBy: {
                            select: { id: true, fullName: true },
                        },
                    },
                    orderBy: { transactionDate: 'desc' },
                },
                debts: {
                    include: {
                        payments: true,
                    },
                },
                _count: {
                    select: { transactions: true, debts: true },
                },
            },
        });
        if (!customer) {
            throw new common_1.NotFoundException(`Không tìm thấy khách hàng với id: ${id}`);
        }
        return customer;
    }
    async update(id, data) {
        await this.findOne(id);
        return this.prisma.customer.update({
            where: { id },
            data,
        });
    }
    async getDebtSummary(customerId) {
        const debts = await this.prisma.debt.findMany({
            where: { customerId },
        });
        const totalDebt = debts.reduce((sum, d) => sum + Number(d.totalAmount), 0);
        const remainingDebt = debts.reduce((sum, d) => sum + Number(d.remainingAmount), 0);
        const totalPaid = totalDebt - remainingDebt;
        return { totalDebt, totalPaid, remainingDebt };
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CustomersService);
//# sourceMappingURL=customers.service.js.map