'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Typography,
  Tag,
  Space,
  message,
  Descriptions,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  SearchOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import api from '@/lib/axios';
import type { Customer, Transaction, Role } from '@/types';

const { Title, Text } = Typography;

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('vi-VN').format(amount) + 'đ';

const canEdit = (role: Role) => ['ADMIN', 'ACCOUNTANT', 'STAFF'].includes(role);
const canCreate = (role: Role) => ['ADMIN', 'ACCOUNTANT', 'STAFF'].includes(role);

interface CustomerWithCount extends Customer {
  _count: { transactions: number; debts: number };
  transactions?: Transaction[];
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerWithCount | null>(null);
  const [editing, setEditing] = useState<CustomerWithCount | null>(null);
  const [search, setSearch] = useState('');
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    role: Role;
  } | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored)
      setCurrentUser(JSON.parse(stored) as { id: string; role: Role });
    void fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await api.get<CustomerWithCount[]>('/customers');
      setCustomers(res.data);
    } catch {
      message.error('Không thể tải dữ liệu!');
    } finally {
      setLoading(false);
    }
  };

  const openDetail = async (customer: CustomerWithCount) => {
    try {
      const res = await api.get<CustomerWithCount>(`/customers/${customer.id}`);
      setSelectedCustomer(res.data);
      setDetailOpen(true);
    } catch {
      message.error('Không thể tải chi tiết!');
    }
  };

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (customer: CustomerWithCount) => {
    setEditing(customer);
    form.setFieldsValue({
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await api.patch(`/customers/${editing.id}`, values);
        message.success('Cập nhật khách hàng thành công!');
      } else {
        await api.post('/customers', values);
        message.success('Thêm khách hàng thành công!');
      }
      setModalOpen(false);
      void fetchAll();
    } catch {
      message.error('Có lỗi xảy ra!');
    }
  };

  const filtered = customers.filter(
    (c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search),
  );

  const columns: ColumnsType<CustomerWithCount> = [
    {
      title: 'Tên khách hàng',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string) => (
        <span>
          <PhoneOutlined style={{ marginRight: 6, color: '#6366f1' }} />
          {phone}
        </span>
      ),
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
      render: (address: string) =>
        address ? (
          <span>
            <EnvironmentOutlined style={{ marginRight: 6, color: '#f59e0b' }} />
            {address}
          </span>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: 'Số giao dịch',
      key: 'transactions',
      align: 'center',
      render: (_, record) => (
        <Tag color="blue">{record._count?.transactions ?? 0}</Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 100,
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
        </Space>
      ),
    },
  ];

  const txColumns: ColumnsType<Transaction> = [
    {
      title: 'Ngày',
      dataIndex: 'transactionDate',
      key: 'date',
      width: 110,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: 70,
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
    },
    {
      title: 'Nội dung',
      dataIndex: 'note',
      key: 'note',
      ellipsis: true,
      render: (note: string) => note || <Text type="secondary">—</Text>,
    },
    {
      title: 'Người tạo',
      dataIndex: ['createdBy', 'fullName'],
      key: 'createdBy',
      width: 120,
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
      </div>

      {/* Search */}
      <div style={{ marginBottom: 16, marginTop: 16, display: 'flex', gap: 12 }}>
        <Input
          placeholder="Tìm theo tên hoặc số điện thoại..."
          prefix={<SearchOutlined />}
          style={{ width: 300, borderRadius: 8 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {canCreate(currentUser?.role ?? 'STAFF') && (
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
            Thêm khách hàng
          </Button>
        )}
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={filtered}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10, showSizeChanger: true }}
        style={{ borderRadius: 12, background: 'white' }}
      />

      {/* Create/Edit Modal */}
      <Modal
        title={editing ? 'Cập nhật khách hàng' : 'Thêm khách hàng mới'}
        open={modalOpen}
        onOk={() => void handleSubmit()}
        onCancel={() => setModalOpen(false)}
        okText={editing ? 'Cập nhật' : 'Thêm mới'}
        cancelText="Huỷ"
        okButtonProps={{
          style: { background: '#6366f1', borderColor: '#6366f1' },
        }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label="Tên khách hàng"
            rules={[{ required: true, message: 'Nhập tên khách hàng!' }]}
          >
            <Input placeholder="VD: Nguyễn Văn A" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[{ required: true, message: 'Nhập số điện thoại!' }]}
          >
            <Input placeholder="VD: 0901234567" />
          </Form.Item>
          <Form.Item name="address" label="Địa chỉ">
            <Input.TextArea rows={2} placeholder="Địa chỉ (tuỳ chọn)" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết khách hàng"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={null}
        width={800}
      >
        {selectedCustomer && (
          <div>
            {/* Info */}
            <Descriptions
              bordered
              size="small"
              column={2}
              style={{ marginBottom: 20 }}
            >
              <Descriptions.Item label="Tên">
                {selectedCustomer.name}
              </Descriptions.Item>
              <Descriptions.Item label="Điện thoại">
                {selectedCustomer.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ" span={2}>
                {selectedCustomer.address || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Số giao dịch">
                <Tag color="blue">
                  {selectedCustomer._count?.transactions ?? 0}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Số công nợ">
                <Tag color="orange">
                  {selectedCustomer._count?.debts ?? 0}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            {/* Transactions */}
            <Title level={5} style={{ marginBottom: 12 }}>
              Lịch sử giao dịch
            </Title>
            <Table
              columns={txColumns}
              dataSource={selectedCustomer.transactions ?? []}
              rowKey="id"
              size="small"
              pagination={{ pageSize: 5 }}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}