'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Tag,
  Space,
  Typography,
  message,
  InputNumber,
  Progress,
  Tabs,
} from 'antd';
import {
  PlusOutlined,
  EyeOutlined,
  SearchOutlined,
  ExclamationCircleOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import api from '@/lib/axios';
import type { Customer, Role } from '@/types';

const { Title, Text } = Typography;

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('vi-VN').format(amount) + 'đ';

type DebtStatus = 'UNPAID' | 'PARTIAL' | 'PAID';

interface Payment {
  id: string;
  amount: number;
  paymentDate: string;
  note?: string;
  receivedBy: { fullName: string };
}

interface Debt {
  id: string;
  totalAmount: number;
  remainingAmount: number;
  status: DebtStatus;
  dueDate?: string;
  customerId: string;
  customer?: Customer;
  payments?: Payment[];
  createdAt: string;
  updatedAt: string;
}

const statusConfig: Record<DebtStatus, { color: string; label: string }> = {
  UNPAID: { color: 'red', label: 'Chưa thanh toán' },
  PARTIAL: { color: 'orange', label: 'Thanh toán 1 phần' },
  PAID: { color: 'green', label: 'Đã tất toán' },
};

const sortDebts = (list: Debt[]) => {
  const order = { UNPAID: 0, PARTIAL: 1, PAID: 2 };
  return [...list].sort((a, b) => {
    if (order[a.status] !== order[b.status])
      return order[a.status] - order[b.status];
    return dayjs(b.updatedAt).unix() - dayjs(a.updatedAt).unix();
  });
};

const isReadOnly = (role: Role) => role === 'OWNER';

export default function DebtsPage() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [search, setSearch] = useState('');
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    role: Role;
  } | null>(null);
  const [createForm] = Form.useForm();
  const [paymentForm] = Form.useForm();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored)
      setCurrentUser(JSON.parse(stored) as { id: string; role: Role });
    void fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [debtRes, cusRes] = await Promise.all([
        api.get<Debt[]>('/debts'),
        api.get<Customer[]>('/customers'),
      ]);
      setDebts(sortDebts(debtRes.data));
      setCustomers(cusRes.data);
    } catch {
      message.error('Không thể tải dữ liệu!');
    } finally {
      setLoading(false);
    }
  };

  const openDetail = async (debt: Debt) => {
    try {
      const res = await api.get<Debt>(`/debts/${debt.id}`);
      setSelectedDebt(res.data);
      setDetailOpen(true);
    } catch {
      message.error('Không thể tải chi tiết!');
    }
  };

  const handleCreate = async () => {
    try {
      const values = await createForm.validateFields();
      await api.post('/debts', {
        ...values,
        totalAmount: Number(values.totalAmount as number),
        dueDate: values.dueDate
          ? (values.dueDate as dayjs.Dayjs).toISOString()
          : undefined,
      });
      message.success('Thêm công nợ thành công!');
      setCreateOpen(false);
      createForm.resetFields();
      void fetchAll();
    } catch {
      message.error('Có lỗi xảy ra!');
    }
  };

  const handlePayment = async () => {
    if (!selectedDebt) return;
    try {
      const values = await paymentForm.validateFields();
      await api.post('/payments', {
        debtId: selectedDebt.id,
        amount: Number(values.amount as number),
        note: values.note as string,
        paymentDate: new Date().toISOString(),
        receivedById: currentUser?.id,
      });
      message.success('Thanh toán thành công!');
      setPaymentOpen(false);
      paymentForm.resetFields();
      void fetchAll();
      const res = await api.get<Debt>(`/debts/${selectedDebt.id}`);
      setSelectedDebt(res.data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      message.error(error.response?.data?.message ?? 'Có lỗi xảy ra!');
    }
  };

  const activeDebts = debts.filter(
    (d) =>
      d.status !== 'PAID' &&
      (!search ||
        d.customer?.name?.toLowerCase().includes(search.toLowerCase())),
  );

  const paidDebts = debts.filter(
    (d) =>
      d.status === 'PAID' &&
      (!search ||
        d.customer?.name?.toLowerCase().includes(search.toLowerCase())),
  );

  const overdueDebts = debts.filter(
    (d) =>
      d.dueDate &&
      dayjs(d.dueDate).isBefore(dayjs()) &&
      d.status !== 'PAID' &&
      (!search ||
        d.customer?.name?.toLowerCase().includes(search.toLowerCase())),
  );

  const columns: ColumnsType<Debt> = [
    {
      title: 'Khách hàng',
      dataIndex: ['customer', 'name'],
      key: 'customer',
      render: (name: string, record) => (
        <div>
          <Text strong>{name}</Text>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>
            {record.customer?.phone}
          </div>
        </div>
      ),
    },
    {
      title: 'Tổng nợ',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number) => (
        <Text strong>{formatCurrency(Number(amount))}</Text>
      ),
    },
    {
      title: 'Còn lại',
      key: 'remaining',
      render: (_, record) => {
        const total = Number(record.totalAmount);
        const remaining = Number(record.remainingAmount);
        const paid = total - remaining;
        const percent = total > 0 ? Math.round((paid / total) * 100) : 0;
        return (
          <div style={{ minWidth: 130 }}>
            <Text
              style={{
                color: remaining > 0 ? '#ef4444' : '#10b981',
                fontWeight: 700,
              }}
            >
              {formatCurrency(remaining)}
            </Text>
            <Progress
              percent={percent}
              size="small"
              showInfo={false}
              strokeColor="#10b981"
              style={{ marginTop: 4 }}
            />
          </div>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: DebtStatus) => (
        <Tag color={statusConfig[status].color}>
          {statusConfig[status].label}
        </Tag>
      ),
    },
    {
      title: 'Hạn trả',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date: string, record) => {
        if (!date) return <Text type="secondary">—</Text>;
        const isOverdue =
          dayjs(date).isBefore(dayjs()) && record.status !== 'PAID';
        return (
          <span style={{ color: isOverdue ? '#ef4444' : '#0f172a' }}>
            {isOverdue && (
              <ExclamationCircleOutlined style={{ marginRight: 4 }} />
            )}
            {dayjs(date).format('DD/MM/YYYY')}
          </span>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 130,
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => void openDetail(record)}
          />
          {record.status !== 'PAID' &&
            !isReadOnly(currentUser?.role ?? 'OWNER') && (
              <Button
                size="small"
                icon={<DollarOutlined />}
                style={{ color: '#10b981', borderColor: '#10b981' }}
                onClick={() => {
                  setSelectedDebt(record);
                  paymentForm.resetFields();
                  setPaymentOpen(true);
                }}
              >
                Thanh toán
              </Button>
            )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <div>
          <Title level={4} style={{ margin: 0, color: '#0f172a' }}>
            Quản lý Công nợ
          </Title>
          <Text style={{ color: '#94a3b8', fontSize: 13 }}>
            {overdueDebts.length > 0 && (
              <span style={{ color: '#ef4444', fontWeight: 600 }}>
                ⚠ {overdueDebts.length} công nợ quá hạn •{' '}
              </span>
            )}
            Tổng {debts.length} công nợ
          </Text>
        </div>
        {!isReadOnly(currentUser?.role ?? 'OWNER') && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{
              background: '#6366f1',
              borderColor: '#6366f1',
              borderRadius: 8,
            }}
            onClick={() => {
              createForm.resetFields();
              setCreateOpen(true);
            }}
          >
            Thêm công nợ
          </Button>
        )}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="Tìm theo tên khách hàng..."
          prefix={<SearchOutlined />}
          style={{ width: 280, borderRadius: 8 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <Tabs
        defaultActiveKey="active"
        items={[
          {
            key: 'active',
            label: `Đang nợ (${activeDebts.length})`,
            children: (
              <Table
                columns={columns}
                dataSource={activeDebts}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
              />
            ),
          },
          {
            key: 'overdue',
            label: (
              <span>
                Quá hạn{' '}
                {overdueDebts.length > 0 && (
                  <Tag color="red">{overdueDebts.length}</Tag>
                )}
              </span>
            ),
            children: (
              <Table
                columns={columns}
                dataSource={overdueDebts}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
              />
            ),
          },
          {
            key: 'paid',
            label: `Đã tất toán (${paidDebts.length})`,
            children: (
              <Table
                columns={columns}
                dataSource={paidDebts}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
              />
            ),
          },
        ]}
      />

      {/* Create Modal */}
      <Modal
        title="Thêm công nợ mới"
        open={createOpen}
        onOk={() => void handleCreate()}
        onCancel={() => setCreateOpen(false)}
        okText="Thêm mới"
        cancelText="Huỷ"
        okButtonProps={{
          style: { background: '#6366f1', borderColor: '#6366f1' },
        }}
      >
        <Form form={createForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="customerId"
            label="Khách hàng"
            rules={[{ required: true, message: 'Chọn khách hàng!' }]}
          >
            <Select
              showSearch
              placeholder="Chọn khách hàng"
              options={customers.map((c) => ({
                value: c.id,
                label: `${c.name} - ${c.phone}`,
              }))}
              filterOption={(input, option) =>
                (option?.label ?? '')
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            />
          </Form.Item>
          <Form.Item
            name="totalAmount"
            label="Số tiền nợ (VNĐ)"
            rules={[{ required: true, message: 'Nhập số tiền!' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
              }
              min={1}
              placeholder="VD: 5000000"
            />
          </Form.Item>
          <Form.Item name="dueDate" label="Hạn trả">
            <DatePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              placeholder="Chọn ngày hạn trả (tuỳ chọn)"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết công nợ"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={
          selectedDebt?.status !== 'PAID' &&
          !isReadOnly(currentUser?.role ?? 'OWNER') ? (
            <Button
              type="primary"
              icon={<DollarOutlined />}
              style={{ background: '#10b981', borderColor: '#10b981' }}
              onClick={() => {
                paymentForm.resetFields();
                setPaymentOpen(true);
                setDetailOpen(false);
              }}
            >
              Thanh toán
            </Button>
          ) : null
        }
        width={600}
      >
        {selectedDebt && (
          <div>
            <div
              style={{
                background: '#f8fafc',
                borderRadius: 10,
                padding: 16,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                }}
              >
                <Text type="secondary">Khách hàng</Text>
                <Text strong>{selectedDebt.customer?.name}</Text>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                }}
              >
                <Text type="secondary">Tổng nợ</Text>
                <Text strong>
                  {formatCurrency(Number(selectedDebt.totalAmount))}
                </Text>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                }}
              >
                <Text type="secondary">Còn lại</Text>
                <Text strong style={{ color: '#ef4444' }}>
                  {formatCurrency(Number(selectedDebt.remainingAmount))}
                </Text>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                }}
              >
                <Text type="secondary">Trạng thái</Text>
                <Tag color={statusConfig[selectedDebt.status].color}>
                  {statusConfig[selectedDebt.status].label}
                </Tag>
              </div>
              {selectedDebt.dueDate && (
                <div
                  style={{ display: 'flex', justifyContent: 'space-between' }}
                >
                  <Text type="secondary">Hạn trả</Text>
                  <Text
                    style={{
                      color: dayjs(selectedDebt.dueDate).isBefore(dayjs())
                        ? '#ef4444'
                        : '#0f172a',
                    }}
                  >
                    {dayjs(selectedDebt.dueDate).format('DD/MM/YYYY')}
                  </Text>
                </div>
              )}
            </div>

            <Title level={5}>Lịch sử thanh toán</Title>
            {!selectedDebt.payments?.length ? (
              <Text type="secondary">Chưa có thanh toán nào</Text>
            ) : (
              selectedDebt.payments.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    background: '#f0fdf4',
                    borderRadius: 8,
                    marginBottom: 8,
                    borderLeft: '3px solid #10b981',
                  }}
                >
                  <div>
                    <Text strong style={{ color: '#10b981' }}>
                      +{formatCurrency(Number(p.amount))}
                    </Text>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>
                      {dayjs(p.paymentDate).format('DD/MM/YYYY')} •{' '}
                      {p.receivedBy?.fullName}
                    </div>
                    {p.note && (
                      <div style={{ fontSize: 12, color: '#64748b' }}>
                        {p.note}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </Modal>

      {/* Payment Modal */}
      <Modal
        title="Thanh toán công nợ"
        open={paymentOpen}
        onOk={() => void handlePayment()}
        onCancel={() => setPaymentOpen(false)}
        okText="Xác nhận thanh toán"
        cancelText="Huỷ"
        okButtonProps={{
          style: { background: '#10b981', borderColor: '#10b981' },
        }}
      >
        {selectedDebt && (
          <div
            style={{
              background: '#f0fdf4',
              borderRadius: 8,
              padding: 12,
              marginBottom: 16,
            }}
          >
            <Text type="secondary">Còn lại cần thanh toán: </Text>
            <Text strong style={{ color: '#ef4444' }}>
              {formatCurrency(Number(selectedDebt.remainingAmount))}
            </Text>
          </div>
        )}
        <Form form={paymentForm} layout="vertical">
          <Form.Item
            name="amount"
            label="Số tiền thanh toán (VNĐ)"
            rules={[
              { required: true, message: 'Nhập số tiền!' },
              {
                validator: (_, value: number) => {
                  if (value > Number(selectedDebt?.remainingAmount ?? 0)) {
                    return Promise.reject(
                      'Số tiền không được vượt quá số nợ còn lại!',
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
              }
              min={1}
              max={Number(selectedDebt?.remainingAmount ?? 0)}
            />
          </Form.Item>
          <Form.Item name="note" label="Ghi chú">
            <Input.TextArea rows={2} placeholder="Ghi chú (tuỳ chọn)" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}