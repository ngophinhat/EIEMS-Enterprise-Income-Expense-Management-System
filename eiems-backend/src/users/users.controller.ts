import {
  Body,
  Post,
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth/auth.guard';
import { Role } from '@prisma/client';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  create(@Body() body: any) {
    return this.usersService.create(body);
  }

  @Patch(':id/toggle-active')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  toggleActive(
    @Param('id') id: string,
    @Request() req: { user: { id: string; role: Role } },
  ) {
    return this.usersService.toggleActive(id, req.user.id, req.user.role);
  }
}
