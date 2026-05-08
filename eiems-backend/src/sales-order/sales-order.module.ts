import { Module } from '@nestjs/common';
import { SalesOrderService } from './sales-order.service';
import { SalesOrderController } from './sales-order.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CakeProductModule } from '../cake-product/cake-product.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [PrismaModule, CakeProductModule, NotificationModule],
  controllers: [SalesOrderController],
  providers: [SalesOrderService],
})
export class SalesOrderModule {}
