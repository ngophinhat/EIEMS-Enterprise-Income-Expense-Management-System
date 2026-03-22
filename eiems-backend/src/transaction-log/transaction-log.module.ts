import { Module } from '@nestjs/common';
import { TransactionLogService } from './transaction-log.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [TransactionLogService],
  exports: [TransactionLogService],
})
export class TransactionLogModule {}
