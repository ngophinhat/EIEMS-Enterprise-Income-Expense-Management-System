import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth/auth.guard';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Post()
  create(
    @Body()
    body: {
      amount: number;
      type: 'INCOME' | 'EXPENSE';
      categoryId: string;
      note?: string;
      transactionDate: string;
      materialId?: string;
    },
    @Request() req: { user: { id: string } },
  ) {
    return this.transactionsService.create({
      ...body,
      transactionDate: new Date(body.transactionDate),
      createdById: req.user.id,
    });
  }

  @Get()
  findAll() {
    return this.transactionsService.findAll();
  }

  @Get('archived')
  @UseGuards(RolesGuard)
  @Roles(Role.ACCOUNTANT, Role.ADMIN)
  findAllArchived() {
    return this.transactionsService.findAllArchived();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transactionsService.findOne(id);
  }

  @Get(':id/logs')
  getLogs(@Param('id') id: string) {
    return this.transactionsService.getLogs(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    body: {
      type?: 'INCOME' | 'EXPENSE';
      amount?: number;
      note?: string;
      categoryId?: string;
      materialId?: string;
      transactionDate?: string;
    },
    @Request() req: { user: { id: string } },
  ) {
    return this.transactionsService.update(id, body, req.user.id);
  }

  @Patch(':id/archive')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  archive(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.transactionsService.softDelete(id, req.user.id);
  }

  @Patch(':id/unarchive')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  unarchive(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.transactionsService.unarchive(id, req.user.id);
  }
}
