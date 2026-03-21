export type Role = 'OWNER' | 'ADMIN' | 'ACCOUNTANT' | 'STAFF';

export type TransactionType = 'INCOME' | 'EXPENSE';

export type TaxType = 'VAT' | 'CORPORATE';

export type DebtStatus = 'UNPAID' | 'PARTIAL' | 'PAID';

// Auth
export interface User {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
}

export interface LoginResponse {
  accessToken: string;
  user: Omit<User, 'isActive' | 'createdAt'>;
}

// Transaction
export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  note?: string;
  transactionDate: string;
  isArchived: boolean;
  categoryId: string;
  category?: Category;
  materialId?: string;
  material?: Material;
  createdById: string;
  createdBy?: User;
  createdAt: string;
  updatedAt: string;
}

// Category
export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  isSystem: boolean;
  isActive: boolean;
}

// Material
export interface Material {
  id: string;
  name: string;
  unit: string;
}

// Tax
export interface Tax {
  id: string;
  name: string;
  type: TaxType;
  rate: number;
  description?: string;
  isActive: boolean;
}

// Customer
export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
}

// Debt
export interface Debt {
  id: string;
  totalAmount: number;
  remainingAmount: number;
  status: DebtStatus;
  dueDate?: string;
  customerId: string;
  customer?: Customer;
}

// Report
export interface ReportBase {
  totalIncome: number;
  totalExpense: number;
  profit: number;
}

export interface TaxReport {
  vatRate: number;
  tndnRate: number;
  incomeBeforeTax: number;
  vatAmount: number;
  tndnAmount: number;
  totalTax: number;
  incomeAfterTax: number;
}

export interface ReportByDay extends ReportBase {
  year: number;
  month: number;
  day: number;
}

export interface ReportByMonth extends ReportBase {
  year: number;
  month: number;
}

export interface ReportByQuarter extends ReportBase {
  year: number;
  quarter: number;
  tax: TaxReport;
}

export interface ReportByYear extends ReportBase {
  year: number;
  tax: TaxReport;
}

export interface Dashboard extends ReportBase {
  totalDebts: number;
  totalCustomers: number;
}