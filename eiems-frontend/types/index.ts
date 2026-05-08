// ─── Enums ────────────────────────────────────────────────────────────────

export type Role = "OWNER" | "ADMIN" | "ACCOUNTANT" | "STAFF";

export type CakeCategory =
  | "BIRTHDAY"
  | "ONG_TAO"
  | "LE"
  | "THOI_NOI"
  | "PLAN"
  | "TET"
  | "BANH_BO"
  | "BANH_AN";

export type CakeShape = "ROUND" | "HEART" | "SQUARE";
export type CakeSize = "SIZE_16" | "SIZE_20" | "SIZE_24";
export type AgeGroup = "CHILD" | "ADULT" | "ELDERLY";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "DELIVERED"
  | "CANCELLED_RESALE"
  | "CANCELLED_LOSS"
  | "CANCELLED_CUSTOMER";

export type PaymentStatus = "UNPAID" | "PAID" | "DEBT" | "PENDING_CONFIRM";

export type NotificationType =
  | "NEW_ORDER"
  | "ORDER_CONFIRMED"
  | "ORDER_DELIVERED"
  | "ORDER_PAID"
  | "ORDER_CANCELLED"
  | "DEBT_CREATED";

export type DebtStatus = "UNPAID" | "PARTIAL" | "PAID" | "PENDING_CONFIRM";
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER';

// ─── Models ───────────────────────────────────────────────────────────────

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
}

export interface CakePrice {
  id: string;
  shape?: CakeShape;
  size?: CakeSize;
  price: number;
}

export interface CakeProduct {
  id: string;
  category: CakeCategory;
  name: string;
  shape?: CakeShape;
  size?: CakeSize;
  ageGroup?: AgeGroup;
  setNumber?: number;
  setQuantity?: number;
  isPriceManual: boolean;
  description?: string;
  isActive: boolean;
  prices: CakePrice[];
}

export interface SalesOrder {
  id: string;
  orderCode: string;
  customerId?: string;
  customer?: Customer;
  customerName: string;
  customerPhone: string;
  cakeProductId?: string;
  cakeProduct?: CakeProduct;
  cakeName: string;
  quantity: number;
  basePrice: number;
  surcharge: number;
  addonPrice: number;
  addonNote?: string;
  totalPrice: number;
  orderTime: string;
  deliveryTime: string;
  deliveryDate: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  note?: string;
  imageUrl?: string;
  cancelReason?: string;
  createdBy: { id: string; fullName: string; role: Role };
  debt?: Debt;
  createdAt: string;
  updatedAt: string;
  paymentMethod?: PaymentMethod;
  confirmedAt?: string;
  transactionId?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  createdAt: string;
}

export interface Debt {
  id: string;
  totalAmount: number;
  remainingAmount: number;
  status: DebtStatus;
  dueDate?: string;
  note?: string;
  customer: Customer;
  payments: DebtPayment[];
  createdAt: string;
}

export interface DebtPayment {
  id: string;
  amount: number;
  paymentDate: string;
  note?: string;
  receivedBy: { fullName: string };
}

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  orderId?: string;
  order?: Partial<SalesOrder>;
  createdAt: string;
}
export interface Transaction {
  id: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  note?: string;
  transactionDate: string;
  isArchived: boolean;
  category?: { id: string; name: string };
  customer?: Customer;
  createdBy?: { id: string; fullName: string };
  createdAt: string;
  updatedAt: string;
}

export interface Dashboard {
  totalIncome: number;
  totalExpense: number;
  profit: number;
  totalDebts: number;
  totalCustomers: number;
}
export interface Category {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
}
// ─── Label helpers ────────────────────────────────────────────────────────

export const CAKE_CATEGORY_LABEL: Record<CakeCategory, string> = {
  BIRTHDAY: "Sinh nhật",
  ONG_TAO: "Cúng ông Táo",
  LE: "Lễ",
  THOI_NOI: "Thôi nôi",
  PLAN: "Plan",
  TET: "Tết",
  BANH_BO: "Bánh bò",
  BANH_AN: "Bánh ăn",
};

export const CAKE_SHAPE_LABEL: Record<CakeShape, string> = {
  ROUND: "Tròn",
  HEART: "Tim",
  SQUARE: "Vuông",
};

export const CAKE_SIZE_LABEL: Record<CakeSize, string> = {
  SIZE_16: "16 (Nhỏ)",
  SIZE_20: "20 (Vừa)",
  SIZE_24: "24 (Lớn)",
};

export const AGE_GROUP_LABEL: Record<AgeGroup, string> = {
  CHILD: "Trẻ con",
  ADULT: "Người lớn",
  ELDERLY: "Người cao tuổi",
};

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đang làm",
  DELIVERED: "Đã giao",
  CANCELLED_RESALE: "Hủy - Bán lại",
  CANCELLED_LOSS: "Hủy - Mất trắng",
   CANCELLED_CUSTOMER: "Hủy - Khách hủy", // Mới thêm
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  UNPAID: "Chưa thanh toán",
  PAID: "Đã thanh toán",
  DEBT: "Công nợ",
  PENDING_CONFIRM: "Cần Kế toán xác nhận",
};

export const ORDER_STATUS_COLOR: Record<OrderStatus, string> = {
  PENDING: "gold",
  CONFIRMED: "blue",
  DELIVERED: "green",
  CANCELLED_RESALE: "orange",
  CANCELLED_LOSS: "red",
  CANCELLED_CUSTOMER: "volcano",
};

export const PAYMENT_STATUS_COLOR: Record<PaymentStatus, string> = {
  UNPAID: "default",
  PAID: "green",
  DEBT: "red",
  PENDING_CONFIRM: "orange",
};
