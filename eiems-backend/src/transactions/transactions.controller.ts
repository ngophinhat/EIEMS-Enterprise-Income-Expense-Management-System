import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Post()
  create(@Body() body: any) {
    return this.transactionsService.create(body);
  }

  @Get()
  findAll() {
    return this.transactionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transactionsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    const userId = 'some-user-Id';
    return this.transactionsService.update(id, body, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, req: any) {
    const userId = req.user.id;

    return this.transactionsService.sofDelete(id, userId);
  }
}
