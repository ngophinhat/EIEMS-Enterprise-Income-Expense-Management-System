import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType, Role } from '@prisma/client';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  // ─── Gửi thông báo tới 1 user cụ thể ────────────────────────────────────

  async notifyUser(
    userId: string,
    type: NotificationType,
    message: string,
    orderId?: string,
  ) {
    return this.prisma.notification.create({
      data: { userId, type, message, orderId },
    });
  }

  // ─── Gửi thông báo tới tất cả ADMIN và ACCOUNTANT ────────────────────────
  // Dùng khi STAFF tạo đơn, tạo công nợ...

  async notifyAdminAndAccountant(
    type: NotificationType,
    message: string,
    orderId?: string,
  ) {
    const recipients = await this.prisma.user.findMany({
      where: {
        role: { in: [Role.ADMIN, Role.ACCOUNTANT] },
        isActive: true,
      },
      select: { id: true },
    });

    if (recipients.length === 0) return;

    await this.prisma.notification.createMany({
      data: recipients.map((u) => ({
        userId: u.id,
        type,
        message,
        orderId: orderId ?? null,
      })),
    });
  }

  // ─── Lấy thông báo của user ───────────────────────────────────────────────

  async findByUser(userId: string, onlyUnread = false) {
    return this.prisma.notification.findMany({
      where: {
        userId,
        ...(onlyUnread && { isRead: false }),
      },
      include: {
        order: {
          select: {
            id: true,
            orderCode: true,
            orderStatus: true,
            paymentStatus: true,
            customerName: true,
            totalPrice: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50, // Giới hạn 50 thông báo gần nhất
    });
  }

  // ─── Đếm thông báo chưa đọc ──────────────────────────────────────────────

  async countUnread(userId: string) {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  // ─── Đánh dấu đã đọc ─────────────────────────────────────────────────────

  async markAsRead(notificationId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  // ─── Đánh dấu tất cả đã đọc ──────────────────────────────────────────────

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}
