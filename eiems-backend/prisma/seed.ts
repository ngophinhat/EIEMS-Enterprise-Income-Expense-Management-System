import {
  PrismaClient,
  Role,
  TransactionType,
  CategoryType,
  DebtStatus,
} from '@prisma/client';

import * as bcrypt from 'bcrypt';

import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10);

  const users = await Promise.all(
    Array.from({ length: 5 }).map(() =>
      prisma.user.create({
        data: {
          fullName: faker.person.fullName(),
          email: faker.internet.email(),
          password: hashedPassword,
          role: faker.helpers.arrayElement([
            Role.OWNER,
            Role.ADMIN,
            Role.ACCOUNTANT,
            Role.STAFF,
          ]),
        },
      }),
    ),
  );

  // CATEGORIES
  const categories = await Promise.all(
    Array.from({ length: 6 }).map(() =>
      prisma.category.create({
        data: {
          name: faker.commerce.department() + faker.number.int(100),
          type: faker.helpers.arrayElement([
            CategoryType.INCOME,
            CategoryType.EXPENSE,
          ]),
        },
      }),
    ),
  );

  // MATERIALS
  const materials = await Promise.all(
    Array.from({ length: 5 }).map(() =>
      prisma.material.create({
        data: {
          name: faker.commerce.productName(),
          unit: faker.helpers.arrayElement(['kg', 'box', 'piece', 'liter']),
        },
      }),
    ),
  );

  // CUSTOMERS
  const customers = await Promise.all(
    Array.from({ length: 20 }).map(() =>
      prisma.customer.create({
        data: {
          name: faker.person.fullName(),
          phone: faker.phone.number(),
          address: faker.location.streetAddress(),
        },
      }),
    ),
  );

  // TRANSACTIONS
  await Promise.all(
    Array.from({ length: 80 }).map(() =>
      prisma.transaction.create({
        data: {
          type: faker.helpers.arrayElement([
            TransactionType.INCOME,
            TransactionType.EXPENSE,
          ]),
          amount: faker.number.int({ min: 50000, max: 5000000 }),
          note: faker.lorem.sentence(),
          transactionDate: faker.date.recent({ days: 90 }),
          categoryId: faker.helpers.arrayElement(categories).id,
          materialId: faker.helpers.arrayElement(materials).id,
          createdById: faker.helpers.arrayElement(users).id,
        },
      }),
    ),
  );

  // DEBTS
  const debts = await Promise.all(
    Array.from({ length: 15 }).map(() =>
      prisma.debt.create({
        data: {
          totalAmount: faker.number.int({ min: 100000, max: 5000000 }),
          remainingAmount: faker.number.int({ min: 0, max: 3000000 }),
          status: faker.helpers.arrayElement([
            DebtStatus.UNPAID,
            DebtStatus.PARTIAL,
            DebtStatus.PAID,
          ]),
          dueDate: faker.date.future(),
          customerId: faker.helpers.arrayElement(customers).id,
        },
      }),
    ),
  );

  // DEBT PAYMENTS
  await Promise.all(
    Array.from({ length: 40 }).map(() =>
      prisma.debtPayment.create({
        data: {
          amount: faker.number.int({ min: 50000, max: 2000000 }),
          paymentDate: faker.date.recent({ days: 60 }),
          note: faker.lorem.sentence(),
          debtId: faker.helpers.arrayElement(debts).id,
          receivedById: faker.helpers.arrayElement(users).id,
        },
      }),
    ),
  );

  // TAX
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
