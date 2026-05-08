import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  getHello(): any {
    throw new Error('Method not implemented.');
  }
  constructor(private prisma: PrismaService) {}

  @Get()
  testDb() {
    return {
      status: 'phinud very fking handsome nigga',
    };
  }
}
