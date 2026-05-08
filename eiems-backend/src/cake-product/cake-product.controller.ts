import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CakeProductService } from './cake-product.service';
import { CreateCakeProductDto } from './dto/create-cake-product.dto';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth/auth.guard';
import { CakeCategory } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('cake-products')
export class CakeProductController {
  constructor(private readonly cakeProductService: CakeProductService) {}

  // POST /cake-products — ADMIN only
  @Post()
  @Roles('ADMIN')
  create(@Body() dto: CreateCakeProductDto) {
    return this.cakeProductService.create(dto);
  }

  // GET /cake-products?category=BIRTHDAY — tất cả role
  @Get()
  @Roles('OWNER', 'ADMIN', 'ACCOUNTANT', 'STAFF')
  findAll(@Query('category') category?: CakeCategory) {
    return this.cakeProductService.findAll(category);
  }

  // GET /cake-products/:id
  @Get(':id')
  @Roles('OWNER', 'ADMIN', 'ACCOUNTANT', 'STAFF')
  findOne(@Param('id') id: string) {
    return this.cakeProductService.findOne(id);
  }

  // PATCH /cake-products/:id — ADMIN only
  @Patch(':id')
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() dto: Partial<CreateCakeProductDto>) {
    return this.cakeProductService.update(id, dto);
  }

  // PATCH /cake-products/:id/toggle-active — ADMIN only
  @Patch(':id/toggle-active')
  @Roles('ADMIN')
  toggleActive(@Param('id') id: string) {
    return this.cakeProductService.toggleActive(id);
  }
}
