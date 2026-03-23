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
        _count: {
          select: { createdTransactions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: { createdTransactions: true },
        },
      },
    });
    if (!user) throw new NotFoundException('Không tìm thấy tài khoản!');
    return user;
  }

  async getUserTransactions(id: string) {
    return this.prisma.transaction.findMany({
      where: { createdById: id, isArchived: false },
      include: {
        category: true,
        customer: { select: { id: true, name: true } },
      },
      orderBy: { transactionDate: 'desc' },
    });
  }

  async getUserLogs(id: string) {
    return this.prisma.transactionLog.findMany({
      where: { performedById: id },
      include: {
        transaction: {
          select: {
            id: true,
            note: true,
            amount: true,
            type: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
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
    if (!user) throw new NotFoundException('Không tìm thấy tài khoản!');

    if (id === currentUserId) {
      throw new ForbiddenException(
        'Không thể tắt hoạt động tài khoản của chính mình!',
      );
    }

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