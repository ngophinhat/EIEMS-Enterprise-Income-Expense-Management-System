import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
});

// Attach JWT token tự động
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(err),
);

export default api;

// ─── Auth ─────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),
  me: () => api.get("/auth/me"),
};

// ─── Sales Orders ──────────────────────────────────────────────────────────
export const salesOrderApi = {
  getAll: (params?: Record<string, string>) =>
    api.get("/sales-orders", { params }),
  getOne: (id: string) => api.get(`/sales-orders/${id}`),
  create: (data: unknown) => api.post("/sales-orders", data),
  updateStatus: (id: string, data: unknown) =>
    api.patch(`/sales-orders/${id}/status`, data),
  updatePayment: (id: string, data: unknown) =>
    api.patch(`/sales-orders/${id}/payment`, data),
  createDebtsfromOrder: (id: string) => api.post(`/sales-orders/${id}/debts`),
  confirmPayment: (id: string, paymentMethod: string) =>
    api.patch(`/sales-orders/${id}/confirm-payment`, { paymentMethod }),
};


// ─── Cake Products ─────────────────────────────────────────────────────────
export const cakeProductApi = {
  getAll: (category?: string) =>
    api.get("/cake-products", { params: category ? { category } : {} }),
  getOne: (id: string) => api.get(`/cake-products/${id}`),
  create: (data: unknown) => api.post("/cake-products", data),
  update: (id: string, data: unknown) => api.patch(`/cake-products/${id}`, data),
  toggleActive: (id: string) => api.patch(`/cake-products/${id}/toggle-active`),
};

// ─── Notifications ─────────────────────────────────────────────────────────
export const notificationApi = {
  getAll: (unread?: boolean) =>
    api.get("/notifications", { params: unread ? { unread: "true" } : {} }),
  countUnread: () => api.get("/notifications/unread-count"),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch("/notifications/read-all"),
};

// ─── Customers ─────────────────────────────────────────────────────────────
export const customerApi = {
  getAll: () => api.get("/customers"),
  getOne: (id: string) => api.get(`/customers/${id}`),
};

// ─── Debts ─────────────────────────────────────────────────────────────────
export const debtApi = {
  getAll: () => api.get("/debts"),
  getOne: (id: string) => api.get(`/debts/${id}`),
  pay: (data: unknown) => api.post("/payments", data),
};

// ─── Transactions ──────────────────────────────────────────────────────────
export const transactionApi = {
  getAll: (params?: Record<string, string>) =>
    api.get("/transactions", { params }),
  create: (data: unknown) => api.post("/transactions", data),
  update: (id: string, data: unknown) => api.patch(`/transactions/${id}`, data),
  archive: (id: string) => api.patch(`/transactions/${id}/archive`),
};

// ─── Reports ───────────────────────────────────────────────────────────────
export const reportApi = {
  dashboard: () => api.get("/reports/dashboard"),
  byDay: (year: number, month: number, day: number) =>
    api.get("/reports/day", { params: { year, month, day } }),
  byMonth: (year: number, month: number) =>
    api.get("/reports/month", { params: { year, month } }),
  byQuarter: (year: number, quarter: number) =>
    api.get("/reports/quarter", { params: { year, quarter } }),
  byYear: (year: number) => api.get("/reports/year", { params: { year } }),
};
