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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let PaymentsService = class PaymentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createPayment(debtId, amount, receivedById, note, paymentDate) {
        const debt = await this.prisma.debt.findUnique({
            where: { id: debtId },
        });
        if (!debt) {
            throw new common_1.NotFoundException('Không tìm thấy công nợ!');
        }
        if (debt.status === client_1.DebtStatus.PAID) {
            throw new common_1.BadRequestException('Công nợ này đã được tất toán!');
        }
        const remaining = Number(debt.remainingAmount);
        if (amount > remaining) {
            throw new common_1.BadRequestException(`Số tiền thanh toán (${amount}) vượt quá số nợ còn lại (${remaining})!`);
        }
        const newRemaining = remaining - amount;
        const status = newRemaining === 0 ? client_1.DebtStatus.PAID : client_1.DebtStatus.PARTIAL;
        const payment = await this.prisma.debtPayment.create({
            data: {
                amount,
                debtId,
                paymentDate: paymentDate ?? new Date(),
                receivedById,
                note,
            },
        });
        await this.prisma.debt.update({
            where: { id: debtId },
            data: {
                remainingAmount: newRemaining,
                status,
            },
        });
        return payment;
    }
    async getPaymentsByDebt(debtId) {
        return this.prisma.debtPayment.findMany({
            where: { debtId },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map