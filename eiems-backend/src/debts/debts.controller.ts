import { Controller, Get, Post, Body } from '@nestjs/common';
import { DebtsService } from './debts.service';

@Controller('debts')
export class DebtsController {
  constructor(private debtsService: DebtsService) {}

  @Post()
  create(@Body() body: any) {
    return this.debtsService.create(body);
  }

  @Get()
  findAll() {
    return this.debtsService.findAll();
  }
}