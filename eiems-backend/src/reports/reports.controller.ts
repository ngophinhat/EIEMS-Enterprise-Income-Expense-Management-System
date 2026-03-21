import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('dashboard')
  dashboard() {
    return this.reportsService.dashboard();
  }

  @Get('day')
  reportDay(
    @Query('year') year: string,
    @Query('month') month: string,
    @Query('day') day: string,
  ) {
    return this.reportsService.reportByDay(
      Number(year),
      Number(month),
      Number(day),
    );
  }

  @Get('month')
  reportMonth(@Query('year') year: string, @Query('month') month: string) {
    return this.reportsService.reportByMonth(Number(year), Number(month));
  }

  @Get('quarter')
  reportQuarter(
    @Query('year') year: string,
    @Query('quarter') quarter: string,
  ) {
    return this.reportsService.reportByQuarter(Number(year), Number(quarter));
  }
  @Get('year')
  reportYear(@Query('year') year: string) {
    return this.reportsService.reportByYear(Number(year));
  }
}
