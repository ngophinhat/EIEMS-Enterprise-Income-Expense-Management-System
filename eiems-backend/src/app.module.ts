import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { UsersModule } from './users/users.module';
import { CustomersModule } from './customers/customers.module';
import { DebtsModule } from './debts/debts.module';
import { PaymentsModule } from './payments/payments.module';
import { ReportsModule } from './reports/reports.module';
import { CategoriesModule } from './categories/categories.module';
// import { EmployeesModule } from './employees/employees.module';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [PrismaModule, UserModule, UsersModule, CustomersModule, DebtsModule, PaymentsModule, ReportsModule, CategoriesModule, TransactionsModule],
  controllers : [AppController],
})
export class AppModule {}