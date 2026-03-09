import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { UsersModule } from './users/users.module';
import { CustomersModule } from './customers/customers.module';
import { DebtsModule } from './debts/debts.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [PrismaModule, UserModule, UsersModule, CustomersModule, DebtsModule, PaymentsModule],
  controllers : [AppController],
})
export class AppModule {}