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
import { TransactionsModule } from './transactions/transactions.module';
import { ConfigModule } from '@nestjs/config';
import { TaxModule } from './tax/tax.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UserModule,
    UsersModule,
    CustomersModule,
    DebtsModule,
    PaymentsModule,
    ReportsModule,
    CategoriesModule,
    TransactionsModule,
    TaxModule,
    AuthModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
