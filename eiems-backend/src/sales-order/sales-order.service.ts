import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CakeProductService } from '../cake-product/cake-product.service';
import { NotificationService } from '../notification/notification.service';
import {
  ConfirmPaymentDto,
  CreateSalesOrderDto,
  UpdateOrderStatusDto,
  UpdatePaymentStatusDto,
} from './dto/sales-order.dto';
import {
  OrderStatus,
  PaymentStatus,
  NotificationType,
  Role,
  Prisma,
} from '@prisma/client';

// Type cho order được trả về từ findOne
type OrderWithRelations = Prisma.SalesOrderGetPayload<{
  include: {
    cakeProduct: { include: { prices: true } };
    customer: true;
    createdBy: { select: { id: true; fullName: true; role: true } };
    debt: true;
    notifications: true;
  };
}>;

@Injectable()
export class SalesOrderService {
  constructor(
    private prisma: PrismaService,
    private cakeProductService: CakeProductService,
    private notificationService: NotificationService,
  ) {}

  // ─── Tạo đơn hàng (STAFF) ────────────────────────────────────────────────

  async create(dto: CreateSalesOrderDto, createdById: string) {
    const { basePrice, totalPrice } = await this.resolvePrice(dto);
    const orderCode = await this.generateOrderCode();

    const orderTime = new Date();
    const deliveryTime = dto.deliveryTime
      ? new Date(dto.deliveryTime)
      : new Date(orderTime.getTime() + 2 * 60 * 60 * 1000);

    const deliveryDate = new Date(deliveryTime);
    deliveryDate.setHours(0, 0, 0, 0);

    const order = await this.prisma.salesOrder.create({
      data: {
        orderCode,
        customerName: dto.customerName ?? '',
        customerPhone: dto.customerPhone ?? '',
        customerId: dto.customerId,
        cakeProductId: dto.cakeProductId,
        cakeName: dto.cakeName ?? '',
        quantity: dto.quantity ?? 1,
        basePrice,
        surcharge: dto.surcharge ?? 0,
        addonPrice: dto.addonPrice ?? 0,
        addonNote: dto.addonNote,
        totalPrice,
        orderTime,
        deliveryTime,
        deliveryDate,
        note: dto.note,
        imageUrl: dto.imageUrl,
        createdById,
        orderStatus: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.UNPAID,
      },
      include: {
        cakeProduct: { include: { prices: true } },
        customer: true,
        createdBy: { select: { id: true, fullName: true, role: true } },
      },
    });

    await this.notificationService.notifyAdminAndAccountant(
      NotificationType.NEW_ORDER,
      `Đơn hàng mới ${orderCode} - ${dto.cakeName ?? ''} - KH: ${dto.customerName ?? ''}`,
      order.id,
    );

    return order;
  }

  // ─── Lấy danh sách đơn ───────────────────────────────────────────────────

  async findAll(filters: {
    orderStatus?: OrderStatus;
    paymentStatus?: PaymentStatus;
    deliveryDate?: string;
    createdById?: string;
  }) {
    return this.prisma.salesOrder.findMany({
      where: {
        ...(filters.orderStatus && { orderStatus: filters.orderStatus }),
        ...(filters.paymentStatus && { paymentStatus: filters.paymentStatus }),
        ...(filters.createdById && { createdById: filters.createdById }),
        ...(filters.deliveryDate && {
          deliveryDate: new Date(filters.deliveryDate),
        }),
      },
      include: {
        cakeProduct: true,
        customer: true,
        createdBy: { select: { id: true, fullName: true, role: true } },
        debt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── Lấy 1 đơn ───────────────────────────────────────────────────────────

  async findOne(id: string): Promise<OrderWithRelations> {
    const order = await this.prisma.salesOrder.findUnique({
      where: { id },
      include: {
        cakeProduct: { include: { prices: true } },
        customer: true,
        createdBy: { select: { id: true, fullName: true, role: true } },
        debt: true,
        notifications: true,
      },
    });
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    return order;
  }

  // ─── ADMIN/ACCOUNTANT: Confirm hoặc Cancel đơn ───────────────────────────

  async updateOrderStatus(
    id: string,
    dto: UpdateOrderStatusDto,
    _userId: string,
    userRole: Role,
  ) {
    const order = await this.findOne(id);

    if (!dto.orderStatus) {
      throw new BadRequestException('Thiếu trạng thái đơn hàng');
    }

    this.validateStatusTransition(order.orderStatus, dto.orderStatus, userRole);

    const updated = await this.prisma.salesOrder.update({
      where: { id },
      data: {
        orderStatus: dto.orderStatus,
        ...(dto.cancelReason && { cancelReason: dto.cancelReason }),
      },
      include: { createdBy: true },
    });

    const typeMap: Partial<Record<OrderStatus, NotificationType>> = {
      [OrderStatus.CONFIRMED]: NotificationType.ORDER_CONFIRMED,
      [OrderStatus.DELIVERED]: NotificationType.ORDER_DELIVERED,
      [OrderStatus.CANCELLED_RESALE]: NotificationType.ORDER_CANCELLED,
      [OrderStatus.CANCELLED_LOSS]: NotificationType.ORDER_CANCELLED,
      [OrderStatus.CANCELLED_CUSTOMER]: NotificationType.ORDER_CANCELLED,
    };

    const notifType = typeMap[dto.orderStatus];
    if (notifType) {
      await this.notificationService.notifyUser(
        updated.createdById,
        notifType,
        `Đơn ${order.orderCode} đã được cập nhật: ${dto.orderStatus}`,
        id,
      );
    }

    return updated;
  }

  // ─── STAFF: Cập nhật thanh toán sau khi giao hàng ────────────────────────

  async updatePaymentStatus(
    id: string,
    dto: UpdatePaymentStatusDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _userId: string,
  ) {
    const order = await this.findOne(id);

    if (order.orderStatus !== OrderStatus.DELIVERED) {
      throw new BadRequestException(
        'Chỉ có thể cập nhật thanh toán khi đơn đã giao',
      );
    }

    if (order.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('Đơn hàng đã được thanh toán');
    }

    return this.prisma.$transaction(async (tx) => {
      if (dto.paymentStatus === PaymentStatus.DEBT) {
        const debt = await this.createDebtFromOrder(
          tx,
          order,
          dto.note,
          dto.dueDate,
        );
        return tx.salesOrder.update({
          where: { id },
          data: {
            paymentStatus: PaymentStatus.DEBT,
            debtId: debt.id,
          },
        });
      }

      // Staff báo khách trả tiền → chờ accountant confirm
      if (dto.paymentStatus === PaymentStatus.PAID) {
        await this.notificationService.notifyAdminAndAccountant(
          NotificationType.ORDER_PAID,
          `Đơn ${order.orderCode} - KH ${order.customerName} chờ xác nhận thanh toán`,
          id,
        );

        return tx.salesOrder.update({
          where: { id },
          data: {
            paymentStatus: PaymentStatus.PENDING_CONFIRM,
            paymentMethod: dto.paymentMethod,
          },
        });
      }

      return tx.salesOrder.update({
        where: { id },
        data: { paymentStatus: dto.paymentStatus },
      });
    });
  }

  // ─── Tạo công nợ từ đơn hàng ─────────────────────────────────────────────

  private async createDebtFromOrder(
    tx: Prisma.TransactionClient,
    order: OrderWithRelations,
    note?: string,
    dueDate?: string,
  ) {
    let customerId = order.customerId;

    if (!customerId) {
      const customer = await tx.customer.upsert({
        where: { phone: order.customerPhone },
        update: {},
        create: {
          name: order.customerName,
          phone: order.customerPhone,
        },
      });
      customerId = customer.id;

      await tx.salesOrder.update({
        where: { id: order.id },
        data: { customerId },
      });
    }

    const debt = await tx.debt.create({
      data: {
        totalAmount: order.totalPrice,
        remainingAmount: order.totalPrice,
        status: 'UNPAID',
        note: note ?? `Công nợ từ đơn hàng ${order.orderCode}`,
        customerId,
        ...(dueDate && { dueDate: new Date(dueDate) }),
      },
    });

    await this.notificationService.notifyAdminAndAccountant(
      NotificationType.DEBT_CREATED,
      `Công nợ mới: KH ${order.customerName} - ${Number(order.totalPrice).toLocaleString('vi-VN')}đ - Đơn ${order.orderCode}`,
      order.id,
    );

    return debt;
  }
  // ─── Confirm nhận tiền (ACCOUNTANT/ADMIN) → Auto tạo Transaction THU ────────

  async confirmPayment(
    id: string,
    dto: ConfirmPaymentDto,
    confirmedById: string,
  ) {
    // Query thẳng để lấy đủ field kể cả paymentMethod
    const order = await this.prisma.salesOrder.findUnique({
      where: { id },
      include: {
        cakeProduct: { include: { prices: true } },
        customer: true,
        createdBy: { select: { id: true, fullName: true, role: true } },
        debt: true,
        notifications: true,
      },
    });

    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');

    if (order.orderStatus !== OrderStatus.DELIVERED) {
      throw new BadRequestException(
        'Chỉ có thể xác nhận thanh toán khi đơn đã giao',
      );
    }

    if (order.paymentStatus !== PaymentStatus.PENDING_CONFIRM) {
      throw new BadRequestException(
        'Đơn hàng chưa được staff xác nhận thanh toán',
      );
    }

    if (!order.paymentMethod) {
      throw new BadRequestException('Staff chưa cập nhật hình thức thanh toán');
    }

    // Tìm category THU mặc định cho bán hàng
    const category = await this.prisma.category.findFirst({
      where: { type: 'INCOME', isSystem: true },
    });

    if (!category) {
      throw new BadRequestException('Không tìm thấy danh mục THU mặc định');
    }

    return this.prisma.$transaction(async (tx) => {
      // Tạo Transaction THU
      const transaction = await tx.transaction.create({
        data: {
          type: 'INCOME',
          amount: order.totalPrice,
          note:
            dto.note ??
            `Thu tiền đơn hàng ${order.orderCode} - KH: ${order.customerName}`,
          transactionDate: new Date(),
          categoryId: category.id,
          createdById: confirmedById,
          customerId: order.customerId ?? undefined,
        },
      });

      // Tạo log cho transaction
      await tx.transactionLog.create({
        data: {
          action: 'CREATE',
          note: `Tự động tạo từ xác nhận thanh toán đơn ${order.orderCode}`,
          transactionId: transaction.id,
          performedById: confirmedById,
        },
      });

      // Cập nhật SalesOrder
      const updated = await tx.salesOrder.update({
        where: { id },
        data: {
          paymentStatus: PaymentStatus.PAID,
          confirmedById,
          confirmedAt: new Date(),
          transactionId: transaction.id,
        },
      });

      // Thông báo cho staff người tạo đơn
      await this.notificationService.notifyUser(
        order.createdById,
        NotificationType.ORDER_PAID,
        `Đơn ${order.orderCode} - KH ${order.customerName} đã được xác nhận thanh toán`,
        id,
      );

      return updated;
    });
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  private async resolvePrice(dto: CreateSalesOrderDto): Promise<{
    basePrice: number;
    totalPrice: number;
  }> {
    let basePrice = 0;

    if (dto.cakeProductId) {
      const product = await this.cakeProductService.findOne(dto.cakeProductId);

      if (product.isPriceManual) {
        if (dto.basePrice == null || dto.basePrice <= 0) {
          throw new BadRequestException(
            'Loại bánh này cần nhập giá thủ công (basePrice)',
          );
        }
        basePrice = dto.basePrice;
      } else {
        basePrice = await this.cakeProductService.lookupPrice(
          dto.cakeProductId,
          dto.shape ?? product.shape ?? undefined,
          dto.size ?? product.size ?? undefined,
        );
      }
    } else {
      if (dto.basePrice == null || dto.basePrice <= 0) {
        throw new BadRequestException('Cần nhập giá bánh (basePrice)');
      }
      basePrice = dto.basePrice;
    }

    const quantity = dto.quantity ?? 1;
    const surcharge = dto.surcharge ?? 0;
    const addonPrice = dto.addonPrice ?? 0;
    const totalPrice = (basePrice + surcharge + addonPrice) * quantity;

    return { basePrice, totalPrice };
  }

  private async generateOrderCode(): Promise<string> {
    const count = await this.prisma.salesOrder.count();
    return `DH${String(count + 1).padStart(3, '0')}`;
  }

  private validateStatusTransition(
    current: OrderStatus,
    next: OrderStatus,
    role: Role,
  ) {
    // STAFF chỉ được phép: DELIVERED, CANCELLED_RESALE, CANCELLED_LOSS
    const staffAllowed: Partial<Record<OrderStatus, OrderStatus[]>> = {
      [OrderStatus.CONFIRMED]: [
        OrderStatus.DELIVERED,
        OrderStatus.CANCELLED_RESALE,
        OrderStatus.CANCELLED_LOSS,
        OrderStatus.CANCELLED_CUSTOMER,
      ],
      [OrderStatus.PENDING]: [
        OrderStatus.CANCELLED_RESALE,
        OrderStatus.CANCELLED_LOSS,
        OrderStatus.CANCELLED_CUSTOMER,
      ],
    };

    // ADMIN/ACCOUNTANT được full quyền
    const adminAllowed: Partial<Record<OrderStatus, OrderStatus[]>> = {
      [OrderStatus.PENDING]: [
        OrderStatus.CONFIRMED,
        OrderStatus.CANCELLED_RESALE,
        OrderStatus.CANCELLED_LOSS,
        OrderStatus.CANCELLED_CUSTOMER,
      ],
      [OrderStatus.CONFIRMED]: [
        OrderStatus.DELIVERED,
        OrderStatus.CANCELLED_RESALE,
        OrderStatus.CANCELLED_LOSS,
        OrderStatus.CANCELLED_CUSTOMER,
      ],
      [OrderStatus.DELIVERED]: [],
    };

    const allowed = role === Role.STAFF ? staffAllowed : adminAllowed;
    const allowedNext = allowed[current] ?? [];

    if (!allowedNext.includes(next)) {
      if (role === Role.STAFF) {
        throw new ForbiddenException(
          `STAFF chỉ có thể chuyển sang: Đã giao, Hủy-Bán lại, Hủy-Mất trắng`,
        );
      }
      throw new BadRequestException(
        `Không thể chuyển từ ${current} sang ${next}`,
      );
    }
  }
}
