import {
  Controller,
  Post,
  Get,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './auth.dto';
import { JwtAuthGuard, Roles, RolesGuard } from './auth.guard';
import { Role } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // POST /auth/login - ai cũng dùng được
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // POST /auth/register - chỉ OWNER và ADMIN mới tạo được
  @Post('register')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  // GET /auth/me - lấy thông tin user hiện tại
  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Request() req: { user: { id: string } }) {
    return this.authService.me(req.user.id);
  }
}
