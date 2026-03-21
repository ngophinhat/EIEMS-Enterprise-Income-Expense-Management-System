import { Controller, Get, Param, Query } from '@nestjs/common';
import { TaxService } from './tax.service';
import { QueryTaxDto } from './tax.dto';

@Controller('taxes')
export class TaxController {
  constructor(private readonly taxService: TaxService) {}

  @Get()
  findAll(@Query() query: QueryTaxDto) {
    return this.taxService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.taxService.findOne(id);
  }
}
