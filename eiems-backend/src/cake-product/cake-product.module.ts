import { Module } from '@nestjs/common';
import { CakeProductService } from './cake-product.service';
import { CakeProductController } from './cake-product.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CakeProductController],
  providers: [CakeProductService],
  exports: [CakeProductService], // Export để SalesOrderModule dùng
})
export class CakeProductModule {}
