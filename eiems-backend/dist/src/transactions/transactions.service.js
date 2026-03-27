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
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const transaction_log_service_1 = require("../transaction-log/transaction-log.service");
let TransactionsService = class TransactionsService {
    prisma;
    logService;
    constructor(prisma, logService) {
        this.prisma = prisma;
        this.logService = logService;
    }
    async create(data) {
        const transaction = await this.prisma.transaction.create({ data });
        await this.logService.log({
            transactionId: transaction.id,
            action: 'CREATE',
            performedById: data.createdById,
            note: 'Tạo giao dịch mới',
        });
        return transaction;
    }
    async findAll() {
        return this.prisma.transaction.findMany({
            where: { isArchived: false },
            include: {
                category: true,
                customer: true,
                createdBy: {
                    select: { id: true, fullName: true, role: true },
                },
                updatedBy: {
                    select: { id: true, fullName: true, role: true },
                },
            },
            orderBy: { transactionDate: 'desc' },
        });
    }
    async findAllArchived() {
        return this.prisma.transaction.findMany({
            where: { isArchived: true },
            include: {
                category: true,
                customer: true,
                createdBy: {
                    select: { id: true, fullName: true },
                },
                updatedBy: {
                    select: { id: true, fullName: true },
                },
                deletedBy: {
                    select: { id: true, fullName: true },
                },
            },
            orderBy: { deletedAt: 'desc' },
        });
    }
    async findOne(id) {
        const transaction = await this.prisma.transaction.findUnique({
            where: { id },
            include: {
                category: true,
                customer: true,
                createdBy: {
                    select: { id: true, fullName: true, role: true },
                },
                updatedBy: {
                    select: { id: true, fullName: true, role: true },
                },
                logs: {
                    include: {
                        performedBy: {
                            select: { id: true, fullName: true, role: true },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!transaction) {
            throw new common_1.NotFoundException(`Không tìm thấy giao dịch với id: ${id}`);
        }
        return transaction;
    }
    async update(id, data, userId) {
        const old = await this.findOne(id);
        const changedFields = {};
        if (data.amount !== undefined && Number(old.amount) !== data.amount) {
            changedFields.amount = { from: Number(old.amount), to: data.amount };
        }
        if (data.type !== undefined && old.type !== data.type) {
            changedFields.type = { from: old.type, to: data.type };
        }
        if (data.note !== undefined && old.note !== data.note) {
            changedFields.note = { from: old.note, to: data.note };
        }
        if (data.categoryId !== undefined && old.categoryId !== data.categoryId) {
            changedFields.categoryId = { from: old.categoryId, to: data.categoryId };
        }
        if (data.transactionDate !== undefined) {
            const newDate = new Date(data.transactionDate).toISOString();
            const oldDate = new Date(old.transactionDate).toISOString();
            if (oldDate !== newDate) {
                changedFields.transactionDate = { from: oldDate, to: newDate };
            }
        }
        const updated = await this.prisma.transaction.update({
            where: { id },
            data: {
                ...data,
                ...(data.transactionDate && {
                    transactionDate: new Date(data.transactionDate),
                }),
                updatedById: userId,
            },
        });
        await this.logService.log({
            transactionId: id,
            action: 'UPDATE',
            changedFields,
            performedById: userId,
            note: 'Cập nhật giao dịch',
        });
        return updated;
    }
    async softDelete(id, userId) {
        await this.findOne(id);
        const archived = await this.prisma.transaction.update({
            where: { id },
            data: {
                isArchived: true,
                deletedAt: new Date(),
                deletedById: userId,
            },
        });
        await this.logService.log({
            transactionId: id,
            action: 'ARCHIVE',
            performedById: userId,
            note: 'Lưu trữ giao dịch',
        });
        return archived;
    }
    async getLogs(transactionId) {
        return this.logService.findByTransaction(transactionId);
    }
    async unarchive(id, userId) {
        await this.findOne(id);
        const tx = await this.prisma.transaction.update({
            where: { id },
            data: {
                isArchived: false,
                deletedAt: null,
                deletedById: null,
            },
        });
        await this.logService.log({
            transactionId: id,
            action: 'UPDATE',
            performedById: userId,
            note: 'Khôi phục giao dịch từ lưu trữ',
        });
        return tx;
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        transaction_log_service_1.TransactionLogService])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map