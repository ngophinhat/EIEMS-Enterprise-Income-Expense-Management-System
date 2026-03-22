import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: {
    fullName: string;
    email: string;
    password: string;
    role: Role;
  }) {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      throw new ConflictException('Email đã được sử dụng!');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        password: hashedPassword,
        role: data.role,
      },
    });

    const { password, ...result } = user;
    void password;
    return result;
  }

  async toggleActive(id: string, currentUserId: string, currentRole: Role) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản!');
    }

    // Không tự tắt chính mình
    if (id === currentUserId) {
      throw new ForbiddenException(
        'Không thể tắt hoạt động tài khoản của chính mình!',
      );
    }

    // ADMIN không được tắt OWNER hoặc ADMIN khác
    if (
      currentRole === Role.ADMIN &&
      (user.role === Role.OWNER || user.role === Role.ADMIN)
    ) {
      throw new ForbiddenException(
        'Bạn không có quyền thực hiện thao tác này!',
      );
    }

    return this.prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
      },
    });
  }
}