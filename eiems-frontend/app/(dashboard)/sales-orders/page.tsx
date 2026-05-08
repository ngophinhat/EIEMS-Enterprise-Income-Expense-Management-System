'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Table, Button, Tag, Space, Select, DatePicker,
  Card, Row, Col, Statistic, Typography,
  message, Modal, Form, Input, Descriptions,
} from 'antd';
import {
  PlusOutlined, EyeOutlined, CheckCircleOutlined,
  CloseCircleOutlined, DollarOutlined, ReloadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { salesOrderApi } from '@/lib/axios';
import {
  SalesOrder, OrderStatus, PaymentStatus,
  ORDER_STATUS_LABEL, ORDER_STATUS_COLOR,
  PAYMENT_STATUS_LABEL, PAYMENT_STATUS_COLOR,
} from '@/types';
import CreateOrderModal from './CreateOrderModal';

const { Title, Text } = Typography;
const { Option } = Select;

export default function SalesOrdersPage() {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<{ role: string } | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOrder, setDetailOrder] = useState<SalesOrder | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [confirmPaymentOpen, setConfirmPaymentOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  const [statusForm] = Form.useForm();
  const [paymentForm] = Form.useForm();

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await salesOrderApi.getAll(filters);
      setOrders(res.data);
    } catch {
      message.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Stats
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.orderStatus === 'PENDING').length,
    confirmed: orders.filter((o) => o.orderStatus === 'CONFIRMED').length,
    delivered: orders.filter((o) => o.orderStatus === 'DELIVERED').length,
    revenue: orders
      .filter((o) => o.paymentStatus === 'PAID')
      .reduce((s, o) => s + Number(o.totalPrice), 0),
  };

  // Update order status
  const handleUpdateStatus = async (values: Record<string, string>) => {
    if (!selectedOrder) return;
    try {
      await salesOrderApi.updateStatus(selectedOrder.id, values);
      message.success('Cập nhật trạng thái thành công');
      setStatusModalOpen(false);
      statusForm.resetFields();
      fetchOrders();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      message.error(e.response?.data?.message ?? 'Lỗi cập nhật');
    }
  };

  // Update payment
  interface PaymentFormValues {
    paymentStatus: string;
    paymentMethod?: 'CASH' | 'BANK_TRANSFER';
    dueDate?: { toISOString: () => string };
    note?: string;
  }

  const handleUpdatePayment = async (values: PaymentFormValues) => {
    if (!selectedOrder) return;
    try {
      const payload = {
        ...values,
        dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
      };
      await salesOrderApi.updatePayment(selectedOrder.id, payload);
      message.success(
        values.paymentStatus === 'DEBT'
          ? '🔴 Đã tạo công nợ thành công'
          : '✅ Cập nhật thanh toán thành công',
      );
      setPaymentModalOpen(false);
      paymentForm.resetFields();
      fetchOrders();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      message.error(e.response?.data?.message ?? 'Lỗi cập nhật');
    }
  };

  const isAdminOrAccountant = user?.role === 'ADMIN' || user?.role === 'ACCOUNTANT';
  const isStaff = user?.role === 'STAFF';

  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'orderCode',
      key: 'orderCode',
      width: 100,
      render: (code: string) => (
        <Text strong style={{ color: '#1677ff' }}>{code}</Text>
      ),
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      render: (_: unknown, r: SalesOrder) => (
        <div>
          <div style={{ fontWeight: 500 }}>{r.customerName}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>{r.customerPhone}</Text>
        </div>
      ),
    },
    {
      title: 'Bánh',
      key: 'cake',
      render: (_: unknown, r: SalesOrder) => (
        <div>
          <div style={{ maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {r.cakeName}
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>SL: {r.quantity}</Text>
        </div>
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (v: number) => (
        <Text strong>{Number(v).toLocaleString('vi-VN')}đ</Text>
      ),
    },
    {
      title: 'Giờ giao',
      key: 'delivery',
      render: (_: unknown, r: SalesOrder) => (
        <div>
          <div>{dayjs(r.deliveryTime).format('HH:mm')}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {dayjs(r.deliveryDate).format('DD/MM/YYYY')}
          </Text>
        </div>
      ),
    },
    {
      title: 'Trạng thái đơn',
      dataIndex: 'orderStatus',
      key: 'orderStatus',
      render: (s: OrderStatus) => (
        <Tag color={ORDER_STATUS_COLOR[s]}>{ORDER_STATUS_LABEL[s]}</Tag>
      ),
    },
    {
      title: 'Thanh toán',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (s: PaymentStatus, r: SalesOrder) => {
        if (r.orderStatus === 'CANCELLED_LOSS' || r.orderStatus === 'CANCELLED_RESALE') {
          return <Text type="secondary">—</Text>;
        }
        return (
          <Tag color={PAYMENT_STATUS_COLOR[s]}>{PAYMENT_STATUS_LABEL[s]}</Tag>
        );
      },
    },
    {
      title: 'Người tạo',
      key: 'createdBy',
      render: (_: unknown, r: SalesOrder) => (
        <Text style={{ fontSize: 12 }}>{r.createdBy?.fullName}</Text>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 160,
      render: (_: unknown, r: SalesOrder) => (
        <Space size={4}>
          {/* Xem chi tiết — tất cả role */}
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => setDetailOrder(r)}
          />

          {/* ADMIN/ACCOUNTANT: Duyệt đơn PENDING */}
          {isAdminOrAccountant && r.orderStatus === 'PENDING' && (
            <Button
              size="small"
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => {
                setSelectedOrder(r);
                statusForm.resetFields();
                setStatusModalOpen(true);
              }}
            >
              Duyệt
            </Button>
          )}

          {/* STAFF + ADMIN/ACCOUNTANT: Cập nhật từ CONFIRMED */}
          {(isStaff || isAdminOrAccountant) && r.orderStatus === 'CONFIRMED' && (
            <Button
              size="small"
              type="dashed"
              style={{ borderColor: '#1677ff', color: '#1677ff' }}
              onClick={() => {
                setSelectedOrder(r);
                statusForm.resetFields();
                setStatusModalOpen(true);
              }}
            >
              Cập nhật
            </Button>
          )}

          {/* ADMIN/ACCOUNTANT: Cancel từ PENDING */}
          {isAdminOrAccountant && r.orderStatus === 'PENDING' && (
            <Button
              size="small"
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => {
                setSelectedOrder(r);
                statusForm.resetFields();
                setStatusModalOpen(true);
              }}
            >
              Hủy
            </Button>
          )}

          {/* STAFF + ADMIN/ACCOUNTANT: Thanh toán sau khi DELIVERED */}
          {(isStaff || isAdminOrAccountant) && r.orderStatus === 'DELIVERED' && r.paymentStatus === 'UNPAID' && (
            <Button
              size="small"
              icon={<DollarOutlined />}
              style={{ borderColor: '#52c41a', color: '#52c41a', fontWeight: 600 }}
              onClick={() => {
                setSelectedOrder(r);
                paymentForm.resetFields();
                setPaymentModalOpen(true);
              }}
            >
              Thanh toán
            </Button>
          )}
          {/* ADMIN/ACCOUNTANT: Xác nhận đã nhận tiền */}
          {isAdminOrAccountant &&
            r.orderStatus === 'DELIVERED' &&
            r.paymentStatus === 'PENDING_CONFIRM' &&
            !r.transactionId && (
            <Button
              size="small"
              type="primary"
              icon={<CheckCircleOutlined />}
              style={{ background: '#52c41a', borderColor: '#52c41a' }}
              onClick={() => {
                setSelectedOrder(r);
                setConfirmPaymentOpen(true);
              }}
            >
              Nhận tiền
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={4} style={{ margin: 0 }}>📋 Phiếu bán hàng</Title>
        {(isStaff || isAdminOrAccountant) && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateOpen(true)}
            style={{ background: '#1a1a2e' }}
          >
            Tạo đơn mới
          </Button>
        )}
      </div>

      {/* Stats */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        {[
          { title: 'Tổng đơn', value: stats.total, color: '#1677ff' },
          { title: 'Chờ xác nhận', value: stats.pending, color: '#faad14' },
          { title: 'Đang làm', value: stats.confirmed, color: '#1677ff' },
          { title: 'Đã giao', value: stats.delivered, color: '#52c41a' },
          {
            title: 'Doanh thu',
            value: stats.revenue.toLocaleString('vi-VN') + 'đ',
            color: '#52c41a',
            isString: true,
          },
        ].map((s) => (
          <Col span={4} key={s.title}>
            <Card size="small" style={{ borderRadius: 8 }}>
              <Statistic
                title={<span style={{ fontSize: 12 }}>{s.title}</span>}
                value={s.value}
                valueStyle={{ color: s.color, fontSize: 20 }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filters */}
      <Card size="small" style={{ marginBottom: 16, borderRadius: 8 }}>
        <Space wrap>
          <Select
            placeholder="Trạng thái đơn"
            allowClear
            style={{ width: 160 }}
            onChange={(v) => setFilters((f) => ({ ...f, orderStatus: v || '' }))}
          >
            {Object.entries(ORDER_STATUS_LABEL).map(([k, v]) => (
              <Option key={k} value={k}>{v}</Option>
            ))}
          </Select>
          <Select
            placeholder="Thanh toán"
            allowClear
            style={{ width: 160 }}
            onChange={(v) => setFilters((f) => ({ ...f, paymentStatus: v || '' }))}
          >
            {Object.entries(PAYMENT_STATUS_LABEL).map(([k, v]) => (
              <Option key={k} value={k}>{v}</Option>
            ))}
          </Select>
          <DatePicker
            placeholder="Ngày giao"
            onChange={(d) =>
              setFilters((f) => ({
                ...f,
                deliveryDate: d ? d.format('YYYY-MM-DD') : '',
              }))
            }
          />
          <Button icon={<ReloadOutlined />} onClick={fetchOrders}>
            Làm mới
          </Button>
        </Space>
      </Card>

      {/* Table */}
      <Card style={{ borderRadius: 8 }} styles={{ body: { padding: 0 } }}>
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={loading}
          size="small"
          pagination={{ pageSize: 15, showSizeChanger: true }}
          rowClassName={(r) => !r.orderStatus.includes('CANCELLED') && r.paymentStatus === 'UNPAID' ? '' : ''}
        />
      </Card>

      {/* Create Order Modal */}
      <CreateOrderModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => { setCreateOpen(false); fetchOrders(); }}
      />

      {/* Update Status Modal */}
      <Modal
        title="Cập nhật trạng thái đơn"
        open={statusModalOpen}
        onCancel={() => { setStatusModalOpen(false); statusForm.resetFields(); }}
        footer={null}
      >
        <Form form={statusForm} layout="vertical" onFinish={handleUpdateStatus}>
          <Form.Item name="orderStatus" label="Trạng thái mới" rules={[{ required: true, message: 'Chọn trạng thái' }]}>
            <Select placeholder="Chọn trạng thái...">
              {/* STAFF chỉ thấy options từ CONFIRMED */}
              {isStaff ? (
                <>
                  {selectedOrder?.orderStatus === 'CONFIRMED' && (
                    <>
                      <Option value="DELIVERED">
                        <span style={{ color: '#52c41a', fontWeight: 600 }}>✅ Đã giao bánh</span>
                      </Option>
                      <Option value="CANCELLED_RESALE">
                        <span style={{ color: '#fa8c16', fontWeight: 600 }}>🔄 Hủy — Đăng bán lại</span>
                      </Option>
                      <Option value="CANCELLED_LOSS">
                        <span style={{ color: '#ff4d4f', fontWeight: 600 }}>❌ Hủy — Mất trắng</span>
                      </Option>
                      <Option value="CANCELLED_LOSS">
                        <span style={{ color: '#ff4d4f', fontWeight: 600 }}>❌ Hủy — Khách không đặt nữa</span>
                      </Option>
                    </>
                  )}
                </>
              ) : (
                // ADMIN/ACCOUNTANT thấy tất cả options hợp lệ
                <>
                  {selectedOrder?.orderStatus === 'PENDING' && (
                    <>
                      <Option value="CONFIRMED">
                        <span style={{ color: '#1677ff', fontWeight: 600 }}>✅ Xác nhận — Bắt đầu làm</span>
                      </Option>
                      <Option value="CANCELLED_LOSS">
                        <span style={{ color: '#ff4d4f', fontWeight: 600 }}>❌ Hủy — Khách không đặt nữa</span>
                      </Option>
                    </>
                  )}
                  {selectedOrder?.orderStatus === 'CONFIRMED' && (
                    <>
                      <Option value="DELIVERED">
                        <span style={{ color: '#52c41a', fontWeight: 600 }}>✅ Đã giao bánh</span>
                      </Option>
                      <Option value="CANCELLED_RESALE">
                        <span style={{ color: '#fa8c16', fontWeight: 600 }}>🔄 Hủy — Đăng bán lại</span>
                      </Option>
                      <Option value="CANCELLED_LOSS">
                        <span style={{ color: '#ff4d4f', fontWeight: 600 }}>❌ Hủy — Mất trắng</span>
                      </Option>
                    </>
                  )}
                </>
              )}
            </Select>
          </Form.Item>

          <Form.Item noStyle shouldUpdate>
            {({ getFieldValue }) =>
              ['CANCELLED_RESALE', 'CANCELLED_LOSS', 'CANCELLED_CUSTOMER'].includes(getFieldValue('orderStatus') as string) ? (
                <Form.Item name="cancelReason" label="Lý do hủy" rules={[{ required: true, message: 'Nhập lý do hủy' }]}>
                  <Input.TextArea rows={2} placeholder="Lý do hủy đơn..." />
                </Form.Item>
              ) : null
            }
          </Form.Item>

          <Button type="primary" htmlType="submit" block style={{ marginTop: 8 }}>
            Xác nhận
          </Button>
        </Form>
      </Modal>

      {/* Update Payment Modal */}
      <Modal
        title={`💰 Thanh toán — ${selectedOrder?.orderCode}`}
        open={paymentModalOpen}
        onCancel={() => { setPaymentModalOpen(false); paymentForm.resetFields(); }}
        footer={null}
        width={500}
      >
        {/* Thông tin đơn hàng */}
        <div style={{ marginBottom: 20, padding: '12px 16px', background: '#f6ffed', borderRadius: 8, border: '1px solid #b7eb8f' }}>
          <Row gutter={8}>
            <Col span={12}>
              <Text type="secondary" style={{ fontSize: 12 }}>Khách hàng</Text>
              <div style={{ fontWeight: 600 }}>{selectedOrder?.customerName}</div>
              <div style={{ fontSize: 12, color: '#666' }}>{selectedOrder?.customerPhone}</div>
            </Col>
            <Col span={12} style={{ textAlign: 'right' }}>
              <Text type="secondary" style={{ fontSize: 12 }}>Tổng tiền</Text>
              <div>
                <Text strong style={{ color: '#52c41a', fontSize: 22 }}>
                  {Number(selectedOrder?.totalPrice ?? 0).toLocaleString('vi-VN')}đ
                </Text>
              </div>
            </Col>
          </Row>
          <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
            🎂 {selectedOrder?.cakeName}
          </div>
        </div>

        <Form form={paymentForm} layout="vertical" onFinish={handleUpdatePayment}>
          {/* 2 lựa chọn rõ ràng */}
          <Form.Item name="paymentStatus" rules={[{ required: true, message: 'Chọn trạng thái' }]}>
            <div style={{ display: 'flex', gap: 12 }}>
              <div
                onClick={() => paymentForm.setFieldsValue({ paymentStatus: 'PAID' })}
                style={{
                  flex: 1, padding: '16px', borderRadius: 10, cursor: 'pointer',
                  border: '2px solid',
                  borderColor: paymentForm.getFieldValue('paymentStatus') === 'PAID' ? '#52c41a' : '#d9d9d9',
                  background: paymentForm.getFieldValue('paymentStatus') === 'PAID' ? '#f6ffed' : '#fff',
                  textAlign: 'center', transition: 'all 0.2s',
                }}
              >
                <div style={{ fontSize: 28 }}>✅</div>
                <div style={{ fontWeight: 600, color: '#52c41a', marginTop: 4 }}>Đã nhận tiền</div>
                <div style={{ fontSize: 12, color: '#666' }}>Tiền mặt / Chuyển khoản</div>
              </div>
              <div
                onClick={() => paymentForm.setFieldsValue({ paymentStatus: 'DEBT' })}
                style={{
                  flex: 1, padding: '16px', borderRadius: 10, cursor: 'pointer',
                  border: '2px solid',
                  borderColor: paymentForm.getFieldValue('paymentStatus') === 'DEBT' ? '#ff4d4f' : '#d9d9d9',
                  background: paymentForm.getFieldValue('paymentStatus') === 'DEBT' ? '#fff1f0' : '#fff',
                  textAlign: 'center', transition: 'all 0.2s',
                }}
              >
                <div style={{ fontSize: 28 }}>🔴</div>
                <div style={{ fontWeight: 600, color: '#ff4d4f', marginTop: 4 }}>Khách nợ</div>
                <div style={{ fontSize: 12, color: '#666' }}>Tạo công nợ</div>
              </div>
            </div>
          </Form.Item>

          {/* Form theo lựa chọn */}
          <Form.Item noStyle shouldUpdate>
            {({ getFieldValue }) => getFieldValue('paymentStatus') === 'DEBT' ? (
              <div style={{ background: '#fff1f0', borderRadius: 8, padding: '16px', border: '1px solid #ffccc7' }}>
                <div style={{ fontWeight: 600, marginBottom: 12, color: '#ff4d4f' }}>
                  🔴 Thông tin công nợ
                </div>
                {/* Thông tin khách hàng (readonly) */}
                <div style={{ marginBottom: 12, padding: '8px 12px', background: '#fff', borderRadius: 6 }}>
                  <Row gutter={8}>
                    <Col span={8}><Text type="secondary" style={{ fontSize: 11 }}>Tên KH</Text><div style={{ fontWeight: 500, fontSize: 13 }}>{selectedOrder?.customerName}</div></Col>
                    <Col span={8}><Text type="secondary" style={{ fontSize: 11 }}>SĐT</Text><div style={{ fontWeight: 500, fontSize: 13 }}>{selectedOrder?.customerPhone}</div></Col>
                    <Col span={8}><Text type="secondary" style={{ fontSize: 11 }}>Số tiền nợ</Text><div style={{ fontWeight: 600, fontSize: 13, color: '#ff4d4f' }}>{Number(selectedOrder?.totalPrice ?? 0).toLocaleString('vi-VN')}đ</div></Col>
                  </Row>
                </div>
                <Form.Item
                  name="dueDate"
                  label="📅 Ngày hẹn trả"
                  rules={[{ required: true, message: 'Chọn ngày hẹn trả' }]}
                  style={{ marginBottom: 8 }}
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                    placeholder="Khách hẹn trả ngày..."
                    disabledDate={(d) => d && d.valueOf() < Date.now()}
                  />
                </Form.Item>
                <Form.Item name="note" label="Ghi chú" style={{ marginBottom: 0 }}>
                  <Input.TextArea rows={2} placeholder="VD: Hẹn trả thứ 6, chờ lương..." />
                </Form.Item>
              </div>
            ) : getFieldValue('paymentStatus') === 'PAID' ? (
              <div style={{ background: '#f6ffed', borderRadius: 8, padding: '16px', border: '1px solid #b7eb8f' }}>
                <div style={{ fontWeight: 600, marginBottom: 12, color: '#52c41a' }}>✅ Hình thức thanh toán</div>
                <Form.Item
                  name="paymentMethod"
                  rules={[{ required: true, message: 'Chọn hình thức thanh toán' }]}
                  style={{ marginBottom: 12 }}
                >
                  <div style={{ display: 'flex', gap: 10 }}>
                    {[
                      { value: 'CASH', icon: '💵', label: 'Tiền mặt', sub: 'Nhận trực tiếp' },
                      { value: 'BANK_TRANSFER', icon: '🏦', label: 'Chuyển khoản', sub: 'Qua ngân hàng' },
                    ].map((m) => (
                      <div
                        key={m.value}
                        onClick={() => paymentForm.setFieldsValue({ paymentMethod: m.value })}
                        style={{
                          flex: 1, padding: '12px', borderRadius: 8, cursor: 'pointer',
                          border: '2px solid',
                          borderColor: getFieldValue('paymentMethod') === m.value ? '#52c41a' : '#d9d9d9',
                          background: getFieldValue('paymentMethod') === m.value ? '#f6ffed' : '#fff',
                          textAlign: 'center',
                        }}
                      >
                        <div style={{ fontSize: 24 }}>{m.icon}</div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{m.label}</div>
                        <div style={{ fontSize: 11, color: '#666' }}>{m.sub}</div>
                      </div>
                    ))}
                  </div>
                </Form.Item>
                <Form.Item name="note" label="Ghi chú (tuỳ chọn)" style={{ marginBottom: 0 }}>
                  <Input.TextArea rows={2} placeholder="Ghi chú thêm nếu có..." />
                </Form.Item>
              </div>
            ) : null}
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            block
            style={{ marginTop: 16, height: 42 }}
          >
            Xác nhận
          </Button>
        </Form>
      </Modal>
      {/* Confirm Payment Modal — ACCOUNTANT xác nhận nhận tiền → ghi thu */}
      <Modal
        title="✓ Xác nhận đã nhận tiền"
        open={confirmPaymentOpen}
        onCancel={() => setConfirmPaymentOpen(false)}
        footer={null}
        width={420}
      >
        <div style={{ 
          marginBottom: 20, padding: '16px', 
          background: '#f6ffed', borderRadius: 8, 
          border: '1px solid #b7eb8f' 
        }}>
          <Row gutter={8}>
            <Col span={14}>
              <Text type="secondary" style={{ fontSize: 12 }}>Khách hàng</Text>
              <div style={{ fontWeight: 600 }}>{selectedOrder?.customerName}</div>
              <div style={{ fontSize: 12, color: '#666' }}>{selectedOrder?.customerPhone}</div>
              <div style={{ fontSize: 12, color: '#666' }}>{selectedOrder?.customer?.address}</div>
            </Col>
            <Col span={10} style={{ textAlign: 'right' }}>
              <Text type="secondary" style={{ fontSize: 12 }}>Số tiền</Text>
              <div>
                <Text strong style={{ color: '#52c41a', fontSize: 20 }}>
                  {Number(selectedOrder?.totalPrice ?? 0).toLocaleString('vi-VN')}đ
                </Text>
              </div>
            </Col>
          </Row>
          <div style={{ marginTop: 6 }}>
            <Tag color={selectedOrder?.paymentMethod === 'CASH' ? 'green' : 'blue'}>
              {selectedOrder?.paymentMethod === 'CASH' ? '💵 Tiền mặt' : '🏦 Chuyển khoản'}
            </Tag>
          </div>
        </div>

        <div style={{ 
          padding: '12px 16px', marginBottom: 16,
          background: '#fffbe6', borderRadius: 8, 
          border: '1px solid #ffe58f',
          fontSize: 13, color: '#614700'
        }}>
          ⚠️ Sau khi xác nhận, hệ thống sẽ tự động tạo <strong>giao dịch THU</strong> trong danh sách.
        </div>

        <Button
          type="primary"
          block
          style={{ background: '#52c41a', borderColor: '#52c41a', height: 42, fontSize: 15 }}
          onClick={async () => {
            if (!selectedOrder) return;
            try {
              await salesOrderApi.confirmPayment(selectedOrder.id, selectedOrder.paymentMethod ?? "cash");
              message.success(`✅ Đã ghi thu ${Number(selectedOrder.totalPrice).toLocaleString('vi-VN')}đ — Đơn ${selectedOrder.orderCode}`);
              setConfirmPaymentOpen(false);
              fetchOrders();
            } catch (err: unknown) {
              const e = err as { response?: { data?: { message?: string } } };
              message.error(e.response?.data?.message ?? 'Lỗi xác nhận');
            }
          }}
        >
          ✓ Xác nhận đã nhận tiền
        </Button>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title={`Chi tiết đơn — ${detailOrder?.orderCode}`}
        open={!!detailOrder}
        onCancel={() => setDetailOrder(null)}
        footer={<Button onClick={() => setDetailOrder(null)}>Đóng</Button>}
        width={620}
      >
        {detailOrder && (
          <div>
            {/* Ảnh mẫu khách gửi */}
            {detailOrder.imageUrl && (
              <div style={{ marginBottom: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>🖼️ Hình mẫu khách gửi</div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={detailOrder.imageUrl}
                  alt="Hình mẫu"
                  style={{
                    maxWidth: '100%', maxHeight: 220,
                    borderRadius: 8, border: '1px solid #f0f0f0',
                    objectFit: 'contain',
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}

            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="Khách hàng" span={2}>
                <div style={{ fontWeight: 600 }}>{detailOrder.customerName}</div>
                <div style={{ fontSize: 12, color: '#666' }}>{detailOrder.customerPhone}</div>
                {detailOrder.customer?.address && (
                  <div style={{ fontSize: 12, color: '#666' }}>{detailOrder.customer.address}</div>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="🎂 Bánh" span={2}>
                {detailOrder.cakeProduct && (
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>
                    {detailOrder.cakeProduct.name}
                  </div>
                )}
                {detailOrder.cakeName
                  ? <Text type="secondary" style={{ fontSize: 13 }}>{detailOrder.cakeName}</Text>
                  : <Text type="secondary">Chưa có mô tả</Text>
                }
              </Descriptions.Item>
              <Descriptions.Item label="Số lượng">{detailOrder.quantity}</Descriptions.Item>
              <Descriptions.Item label="Giờ giao">
                {dayjs(detailOrder.deliveryTime).format('HH:mm DD/MM/YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Giá cơ bản">
                {Number(detailOrder.basePrice).toLocaleString('vi-VN')}đ
              </Descriptions.Item>
              <Descriptions.Item label="Phụ thu NVL">
                {Number(detailOrder.surcharge).toLocaleString('vi-VN')}đ
              </Descriptions.Item>
              <Descriptions.Item label="Phụ kiện">
                {Number(detailOrder.addonPrice).toLocaleString('vi-VN')}đ
                {detailOrder.addonNote && (
                  <Text type="secondary" style={{ fontSize: 12 }}> ({detailOrder.addonNote})</Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Tổng tiền">
                <Text strong style={{ color: '#52c41a', fontSize: 16 }}>
                  {Number(detailOrder.totalPrice).toLocaleString('vi-VN')}đ
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái đơn">
                <Tag color={ORDER_STATUS_COLOR[detailOrder.orderStatus]}>
                  {ORDER_STATUS_LABEL[detailOrder.orderStatus]}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Thanh toán">
                <Tag color={PAYMENT_STATUS_COLOR[detailOrder.paymentStatus]}>
                  {PAYMENT_STATUS_LABEL[detailOrder.paymentStatus]}
                </Tag>
              </Descriptions.Item>
              {detailOrder.note && (
                <Descriptions.Item label="Ghi chú KH" span={2}>
                  <Text italic>{detailOrder.note}</Text>
                </Descriptions.Item>
              )}
              {detailOrder.cancelReason && (
                <Descriptions.Item label="Lý do hủy" span={2}>
                  <Text type="danger">{detailOrder.cancelReason}</Text>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Người tạo" span={2}>
                {detailOrder.createdBy?.fullName}
                <Tag style={{ marginLeft: 8 }} color="blue">{detailOrder.createdBy?.role}</Tag>
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
}