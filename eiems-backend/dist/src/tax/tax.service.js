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
exports.TaxService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TaxService = class TaxService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        return this.prisma.tax.findMany({
            where: {
                ...(query.type !== undefined && { type: query.type }),
                ...(query.isActive !== undefined && { isActive: query.isActive }),
            },
            orderBy: [{ type: 'asc' }, { rate: 'asc' }],
        });
    }
    async findOne(id) {
        const tax = await this.prisma.tax.findUnique({ where: { id } });
        if (!tax) {
            throw new common_1.NotFoundException(`Không tìm thấy thuế với id: ${id}`);
        }
        return tax;
    }
    async getActiveTaxes() {
        return this.prisma.tax.findMany({
            where: { isActive: true },
            orderBy: [{ type: 'asc' }],
        });
    }
    applyTax(income, expense, vatRate, tndnRate) {
        const vat = parseFloat((income * vatRate).toFixed(2));
        const profit = income - expense;
        const tndn = parseFloat((profit > 0 ? profit * tndnRate : 0).toFixed(2));
        const totalTax = vat + tndn;
        return {
            incomeBeforeTax: income,
            vatAmount: vat,
            tndnAmount: tndn,
            totalTax,
            incomeAfterTax: parseFloat((income - totalTax).toFixed(2)),
        };
    }
};
exports.TaxService = TaxService;
exports.TaxService = TaxService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TaxService);
//# sourceMappingURL=tax.service.js.map