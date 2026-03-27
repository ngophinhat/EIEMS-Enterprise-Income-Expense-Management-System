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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const transactions_service_1 = require("./transactions.service");
const auth_guard_1 = require("../auth/auth.guard");
let TransactionsController = class TransactionsController {
    transactionsService;
    constructor(transactionsService) {
        this.transactionsService = transactionsService;
    }
    create(body, req) {
        return this.transactionsService.create({
            ...body,
            transactionDate: new Date(body.transactionDate),
            createdById: req.user.id,
        });
    }
    findAll() {
        return this.transactionsService.findAll();
    }
    findAllArchived() {
        return this.transactionsService.findAllArchived();
    }
    findOne(id) {
        return this.transactionsService.findOne(id);
    }
    getLogs(id) {
        return this.transactionsService.getLogs(id);
    }
    update(id, body, req) {
        return this.transactionsService.update(id, body, req.user.id);
    }
    archive(id, req) {
        return this.transactionsService.softDelete(id, req.user.id);
    }
    unarchive(id, req) {
        return this.transactionsService.unarchive(id, req.user.id);
    }
};
exports.TransactionsController = TransactionsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('archived'),
    (0, common_1.UseGuards)(auth_guard_1.RolesGuard),
    (0, auth_guard_1.Roles)(client_1.Role.ACCOUNTANT, client_1.Role.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "findAllArchived", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/logs'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "getLogs", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/archive'),
    (0, common_1.UseGuards)(auth_guard_1.RolesGuard),
    (0, auth_guard_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "archive", null);
__decorate([
    (0, common_1.Patch)(':id/unarchive'),
    (0, common_1.UseGuards)(auth_guard_1.RolesGuard),
    (0, auth_guard_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "unarchive", null);
exports.TransactionsController = TransactionsController = __decorate([
    (0, common_1.Controller)('transactions'),
    (0, common_1.UseGuards)(auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [transactions_service_1.TransactionsService])
], TransactionsController);
//# sourceMappingURL=transactions.controller.js.map