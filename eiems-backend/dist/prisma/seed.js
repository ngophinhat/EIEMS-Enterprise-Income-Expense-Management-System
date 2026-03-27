"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const faker_1 = require("@faker-js/faker");
const prisma = new client_1.PrismaClient();
async function main() {
    const hashedPassword = await bcrypt.hash('123456', 10);
    const users = await Promise.all(Array.from({ length: 5 }).map(() => prisma.user.create({
        data: {
            fullName: faker_1.faker.person.fullName(),
            email: faker_1.faker.internet.email(),
            password: hashedPassword,
            role: faker_1.faker.helpers.arrayElement([
                client_1.Role.OWNER,
                client_1.Role.ADMIN,
                client_1.Role.ACCOUNTANT,
                client_1.Role.STAFF,
            ]),
        },
    })));
    const categories = await Promise.all(Array.from({ length: 6 }).map(() => prisma.category.create({
        data: {
            name: faker_1.faker.commerce.department() + faker_1.faker.number.int(100),
            type: faker_1.faker.helpers.arrayElement([
                client_1.CategoryType.INCOME,
                client_1.CategoryType.EXPENSE,
            ]),
        },
    })));
    const customers = await Promise.all(Array.from({ length: 20 }).map(() => prisma.customer.create({
        data: {
            name: faker_1.faker.person.fullName(),
            phone: faker_1.faker.phone.number(),
            address: faker_1.faker.location.streetAddress(),
        },
    })));
    await Promise.all(Array.from({ length: 80 }).map(() => prisma.transaction.create({
        data: {
            type: faker_1.faker.helpers.arrayElement([
                client_1.TransactionType.INCOME,
                client_1.TransactionType.EXPENSE,
            ]),
            amount: faker_1.faker.number.int({ min: 50000, max: 5000000 }),
            note: faker_1.faker.lorem.sentence(),
            transactionDate: faker_1.faker.date.recent({ days: 90 }),
            categoryId: faker_1.faker.helpers.arrayElement(categories).id,
            createdById: faker_1.faker.helpers.arrayElement(users).id,
        },
    })));
    const debts = await Promise.all(Array.from({ length: 15 }).map(() => prisma.debt.create({
        data: {
            totalAmount: faker_1.faker.number.int({ min: 100000, max: 5000000 }),
            remainingAmount: faker_1.faker.number.int({ min: 0, max: 3000000 }),
            status: faker_1.faker.helpers.arrayElement([
                client_1.DebtStatus.UNPAID,
                client_1.DebtStatus.PARTIAL,
                client_1.DebtStatus.PAID,
            ]),
            dueDate: faker_1.faker.date.future(),
            customerId: faker_1.faker.helpers.arrayElement(customers).id,
        },
    })));
    await Promise.all(Array.from({ length: 40 }).map(() => prisma.debtPayment.create({
        data: {
            amount: faker_1.faker.number.int({ min: 50000, max: 2000000 }),
            paymentDate: faker_1.faker.date.recent({ days: 60 }),
            note: faker_1.faker.lorem.sentence(),
            debtId: faker_1.faker.helpers.arrayElement(debts).id,
            receivedById: faker_1.faker.helpers.arrayElement(users).id,
        },
    })));
    await prisma.tax.createMany({
        data: [
            { name: 'VAT 8%', type: 'VAT', rate: 0.08 },
            { name: 'VAT 10%', type: 'VAT', rate: 0.1 },
            { name: 'Thuế TNDN 20%', type: 'CORPORATE', rate: 0.2 },
        ],
    });
    console.log('Seed data created successfully 🚀');
}
main()
    .catch((e) => {
    console.error(e);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map