import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
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
  @Get(':id')
    findOne(@Param('id') id: string) {
      return this.debtsService.findOne(id);
  }

  @Patch(':id')
    update(@Param('id') id: string, @Body() body: any) {
      return this.debtsService.update(id, body);
  }
  @Delete(':id')
    remove (@Param('id')id : string ){
      return this.debtsService.remove(id,);
    }
}