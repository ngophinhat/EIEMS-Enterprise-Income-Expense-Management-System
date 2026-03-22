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
  Typography,
  Tabs,
  message,
  InputNumber,
  Space,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  InboxOutlined,
  SearchOutlined,
  EyeOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import api from '@/lib/axios';
import type { Transaction, Category, Role, Customer } from '@/types';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('vi-VN').format(amount) + 'đ';

const canArchive = (role: Role) => role === 'ADMIN';
const canEdit = (role: Role) =>
  ['ADMIN', 'ACCOUNTANT', 'STAFF'].includes(role);

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [archived, setArchived] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [selectedType, setSelectedType] = useState<string>('');
  const [logs, setLogs] = useState<
    {
      id: string;
      action: string;
      changedFields: Record<string, { from: unknown; to: unknown }>;
      note?: string;
      createdAt: string;
      performedBy: { fullName: string; role: string };
    }[]
  >([]);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState<
    [dayjs.Dayjs, dayjs.Dayjs] | null
  >(null);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    role: Role;
    fullName: string;
  } | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored)
      setCurrentUser(
        JSON.parse(stored) as { id: string; role: Role; fullName: string },
      );
    void fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [txRes, archRes, catRes, cusRes] = await Promise.all([
        api.get<Transaction[]>('/transactions'),
        api.get<Transaction[]>('/transactions/archived'),
        api.get<Category[]>('/categories'),
        api.get<Customer[]>('/customers'),
      ]);
      setTransactions(txRes.data);
      setArchived(archRes.data);
      setCategories(catRes.data);
      setCustomers(cusRes.data);
    } catch {
      message.error('Không thể tải dữ liệu!');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setSelectedType('');
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (tx: Transaction) => {
    setEditing(tx);
    setSelectedType(tx.type);
    form.setFieldsValue({
      type: tx.type,
      amount: Number(tx.amount),
      note: tx.note,
      categoryId: tx.categoryId,
      transactionDate: dayjs(tx.transactionDate),
    });
    setModalOpen(true);
  };

  const openDetail = async (tx: Transaction) => {
    setSelectedTx(tx);
    setDetailOpen(true);
    try {
      const res = await api.get<typeof logs>(`/transactions/${tx.id}/logs`);
      setLogs(res.data);
    } catch {
      setLogs([]);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        amount: Number(values.amount as number),
        transactionDate: (values.transactionDate as dayjs.Dayjs).toISOString(),
        createdById: currentUser?.id,
      };

      if (editing) {
        await api.patch(`/transactions/${editing.id}`, payload);
        message.success('Cập nhật giao dịch thành công!');
      } else {
        await api.post('/transactions', payload);
        message.success('Tạo giao dịch thành công!');
      }

      setModalOpen(false);
      void fetchAll();
    } catch {
      message.error('Có lỗi xảy ra!');
    }
  };

  const handleArchive = (tx: Transaction) => {
    Modal.confirm({
      title: 'Lưu trữ giao dịch?',
      content:
        'Giao dịch sẽ được lưu trữ và không hiển thị trong danh sách chính.',
      okText: 'Lưu trữ',
      cancelText: 'Huỷ',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await api.patch(`/transactions/${tx.id}/archive`);
          message.success('Đã lưu trữ giao dịch!');
          void fetchAll();
        } catch {
          message.error('Có lỗi xảy ra!');
        }
      },
    });
  };

  const filterTx = (list: Transaction[]) =>
    list.filter((tx) => {
      const matchSearch =
        !search ||
        tx.note?.toLowerCase().includes(search.toLowerCase()) ||
        tx.category?.name?.toLowerCase().includes(search.toLowerCase());
      const matchType = !typeFilter || tx.type === typeFilter;
      const matchDate =
        !dateRange ||
        (dayjs(tx.transactionDate).isAfter(dateRange[0].startOf('day')) &&
          dayjs(tx.transactionDate).isBefore(dateRange[1].endOf('day')));
      return matchSearch && matchType && matchDate;
    });

  const actionLabel: Record<string, string> = {
    CREATE: 'Tạo mới',
    UPDATE: 'Cập nhật',
    ARCHIVE: 'Lưu trữ',
  };

  const columns: ColumnsType<Transaction> = [
    {
      title: 'Ngày',
      dataIndex: 'transactionDate',
      key: 'date',
      width: 110,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
      sorter: (a, b) =>
        dayjs(a.transactionDate).unix() - dayjs(b.transactionDate).unix(),
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type: string) =>
        type === 'INCOME' ? (
          <Tag color="green">Thu</Tag>
        ) : (
          <Tag color="red">Chi</Tag>
        ),
    },
    {
      title: 'Danh mục',
      dataIndex: ['category', 'name'],
      key: 'category',
      width: 120,
      ellipsis: true,
    },
    {
      title: 'Nội dung',
      dataIndex: 'note',
      key: 'note',
      render: (note: string) => note || <Text type="secondary">—</Text>,
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      render: (amount: number, record: Transaction) => (
        <span
          style={{
            fontWeight: 700,
            color: record.type === 'INCOME' ? '#10b981' : '#ef4444',
          }}
        >
          {record.type === 'INCOME' ? '+' : '-'}
          {formatCurrency(Number(amount))}
        </span>
      ),
    },
    {
      title: 'Người tạo',
      dataIndex: ['createdBy', 'fullName'],
      key: 'createdBy',
      width: 130,
    },
    {
      title: 'Khách hàng',
      dataIndex: ['customer', 'name'],
      key: 'customer',
      width: 150,
      ellipsis: true,
      render: (name: string) => name || <Text type="secondary">—</Text>,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => void openDetail(record)}
          />
          {canEdit(currentUser?.role ?? 'STAFF') && (
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEdit(record)}
            />
          )}
          {canArchive(currentUser?.role ?? 'STAFF') && (
            <Button
              size="small"
              danger
              icon={<InboxOutlined />}
              onClick={() => handleArchive(record)}
            />
          )}
        </Space>
      ),
    },
  ];

  const archivedColumns: ColumnsType<Transaction> = [
    ...columns.slice(0, 6),
    {
      title: 'Lưu trữ bởi',
      dataIndex: ['deletedBy', 'fullName'],
      key: 'deletedBy',
      width: 130,
    },
    {
      title: 'Ngày lưu trữ',
      dataIndex: 'deletedAt',
      key: 'deletedAt',
      width: 120,
      render: (date: string) =>
        date ? dayjs(date).format('DD/MM/YYYY') : '—',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Button
          size="small"
          icon={<UndoOutlined />}
          style={{ borderColor: '#10b981', color: '#10b981' }}
          onClick={async () => {
            try {
              await api.patch(`/transactions/${record.id}/unarchive`);
              message.success('Đã khôi phục giao dịch!');
              void fetchAll();
            } catch {
              message.error('Có lỗi xảy ra!');
            }
          }}
        >
          Khôi phục
        </Button>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <Title level={4} style={{ margin: 0, color: '#0f172a' }}>
          Quản lý Thu Chi
        </Title>
        <Text style={{ color: '#94a3b8', fontSize: 13 }}>
          Danh sách tất cả giao dịch trong hệ thống
        </Text>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <Input
          placeholder="Tìm kiếm..."
          prefix={<SearchOutlined />}
          style={{ width: 220, borderRadius: 8 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          placeholder="Loại giao dịch"
          style={{ width: 150, borderRadius: 8 }}
          allowClear
          value={typeFilter || undefined}
          onChange={(val) => setTypeFilter(val ?? '')}
          options={[
            { value: 'INCOME', label: 'Thu nhập' },
            { value: 'EXPENSE', label: 'Chi tiêu' },
          ]}
        />
        <RangePicker
          style={{ borderRadius: 8 }}
          format="DD/MM/YYYY"
          onChange={(dates) =>
            setDateRange(
              dates
                ? [dates[0] as dayjs.Dayjs, dates[1] as dayjs.Dayjs]
                : null,
            )
          }
        />
        {canEdit(currentUser?.role ?? 'STAFF') && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{
              background: '#6366f1',
              borderColor: '#6366f1',
              borderRadius: 8,
            }}
            onClick={openCreate}
          >
            Thêm giao dịch
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs
        defaultActiveKey="active"
        items={[
          {
            key: 'active',
            label: `Hoạt động (${filterTx(transactions).length})`,
            children: (
              <Table
                columns={columns}
                dataSource={filterTx(transactions)}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10, showSizeChanger: true }}
                style={{ borderRadius: 12 }}
              />
            ),
          },
          ...(canArchive(currentUser?.role ?? 'STAFF')
            ? [
                {
                  key: 'archived',
                  label: `Lưu trữ (${archived.length})`,
                  children: (
                    <Table
                      columns={archivedColumns}
                      dataSource={archived}
                      rowKey="id"
                      loading={loading}
                      pagination={{ pageSize: 10 }}
                      style={{ borderRadius: 12 }}
                    />
                  ),
                },
              ]
            : []),
        ]}
      />

      {/* Create/Edit Modal */}
      <Modal
        title={editing ? 'Cập nhật giao dịch' : 'Thêm giao dịch mới'}
        open={modalOpen}
        onOk={() => void handleSubmit()}
        onCancel={() => {
          setModalOpen(false);
          setSelectedType('');
        }}
        okText={editing ? 'Cập nhật' : 'Tạo mới'}
        cancelText="Huỷ"
        okButtonProps={{
          style: { background: '#6366f1', borderColor: '#6366f1' },
        }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="type"
            label="Loại giao dịch"
            rules={[{ required: true, message: 'Chọn loại giao dịch!' }]}
          >
            <Select
              options={[
                { value: 'INCOME', label: '📈 Thu nhập' },
                { value: 'EXPENSE', label: '📉 Chi tiêu' },
              ]}
              onChange={(val) => {
                setSelectedType(val as string);
                form.setFieldValue('categoryId', undefined);
              }}
            />
          </Form.Item>
          <Form.Item
            name="amount"
            label="Số tiền (VNĐ)"
            rules={[{ required: true, message: 'Nhập số tiền!' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
              }
              min={1}
              placeholder="VD: 500000"
            />
          </Form.Item>
          <Form.Item
            name="categoryId"
            label="Danh mục"
            rules={[{ required: true, message: 'Chọn danh mục!' }]}
          >
            <Select
              options={categories
                .filter((c) => !selectedType || c.type === selectedType)
                .map((c) => ({ value: c.id, label: c.name }))}
              placeholder={
                selectedType
                  ? 'Chọn danh mục'
                  : 'Chọn loại giao dịch trước'
              }
              disabled={!selectedType}
            />
          </Form.Item>
          <Form.Item name="customerId" label="Khách hàng">
            <Select
              options={customers.map((c) => ({
                value: c.id,
                label: c.name,
              }))}
              placeholder="Chọn khách hàng (tuỳ chọn)"
              allowClear
            />
          </Form.Item>
          <Form.Item
            name="transactionDate"
            label="Ngày giao dịch"
            rules={[{ required: true, message: 'Chọn ngày!' }]}
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item name="note" label="Ghi chú">
            <Input.TextArea rows={3} placeholder="Ghi chú (tuỳ chọn)" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết giao dịch"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={null}
        width={600}
      >
        {selectedTx && (
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
                <Text type="secondary">Loại</Text>
                <Tag color={selectedTx.type === 'INCOME' ? 'green' : 'red'}>
                  {selectedTx.type === 'INCOME' ? 'Thu nhập' : 'Chi tiêu'}
                </Tag>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                }}
              >
                <Text type="secondary">Số tiền</Text>
                <Text
                  strong
                  style={{
                    color:
                      selectedTx.type === 'INCOME' ? '#10b981' : '#ef4444',
                  }}
                >
                  {selectedTx.type === 'INCOME' ? '+' : '-'}
                  {formatCurrency(Number(selectedTx.amount))}
                </Text>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                }}
              >
                <Text type="secondary">Danh mục</Text>
                <Text>{selectedTx.category?.name}</Text>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                }}
              >
                <Text type="secondary">Ngày</Text>
                <Text>
                  {dayjs(selectedTx.transactionDate).format('DD/MM/YYYY')}
                </Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">Người tạo</Text>
                <Text>{selectedTx.createdBy?.fullName}</Text>
              </div>
            </div>

            {/* Logs */}
            <Title level={5}>Lịch sử thay đổi</Title>
            {logs.length === 0 ? (
              <Text type="secondary">Chưa có lịch sử</Text>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  style={{
                    borderLeft: '3px solid #6366f1',
                    paddingLeft: 12,
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Tag color="purple">{actionLabel[log.action]}</Tag>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {dayjs(log.createdAt).format('DD/MM/YYYY HH:mm')}
                    </Text>
                  </div>
                  <Text style={{ fontSize: 13 }}>
                    bởi <strong>{log.performedBy.fullName}</strong> (
                    {log.performedBy.role})
                  </Text>
                  {log.changedFields &&
                    Object.keys(log.changedFields).length > 0 && (
                      <div style={{ marginTop: 6 }}>
                        {Object.entries(log.changedFields).map(
                          ([field, val]) => {
                            const { from, to } = val as {
                              from: unknown;
                              to: unknown;
                            };
                            return (
                              <div key={field} style={{ fontSize: 12 }}>
                                <Text type="secondary">{field}: </Text>
                                <Text delete type="danger">
                                  {String(from)}
                                </Text>
                                {' → '}
                                <Text type="success">{String(to)}</Text>
                              </div>
                            );
                          },
                        )}
                      </div>
                    )}
                </div>
              ))
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}