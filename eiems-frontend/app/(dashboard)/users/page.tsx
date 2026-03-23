'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Space,
  Typography,
  message,
  Switch,
  Avatar,
  Tabs,
  Descriptions,
} from 'antd';
import {
  PlusOutlined,
  EyeOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import api from '@/lib/axios';
import type { User, Role, Transaction } from '@/types';

const { Title, Text } = Typography;

const roleColors: Record<Role, string> = {
  OWNER: '#f59e0b',
  ADMIN: '#3b82f6',
  ACCOUNTANT: '#10b981',
  STAFF: '#8b5cf6',
};

const roleLabels: Record<Role, string> = {
  OWNER: 'Chủ sở hữu',
  ADMIN: 'Quản trị viên',
  ACCOUNTANT: 'Kế toán',
  STAFF: 'Nhân viên',
};

const getRoleOptions = (currentRole: Role) => {
  if (currentRole === 'OWNER') {
    return [
      { value: 'ADMIN', label: 'Quản trị viên' },
      { value: 'ACCOUNTANT', label: 'Kế toán' },
      { value: 'STAFF', label: 'Nhân viên' },
    ];
  }
  return [
    { value: 'ACCOUNTANT', label: 'Kế toán' },
    { value: 'STAFF', label: 'Nhân viên' },
  ];
};

const canToggle = (currentRole: Role, targetRole: Role) => {
  if (targetRole === 'OWNER') return false;
  if (currentRole === 'OWNER') return true;
  if (
    currentRole === 'ADMIN' &&
    (targetRole === 'ACCOUNTANT' || targetRole === 'STAFF')
  )
    return true;
  return false;
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('vi-VN').format(amount) + 'đ';

interface UserWithCount extends User {
  _count?: { createdTransactions: number };
}

interface TransactionLog {
  id: string;
  action: string;
  createdAt: string;
  changedFields: Record<string, { from: unknown; to: unknown }>;
  transaction?: {
    id: string;
    note?: string;
    amount: number;
    type: string;
  };
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithCount | null>(null);
  const [userTx, setUserTx] = useState<Transaction[]>([]);
  const [userLogs, setUserLogs] = useState<TransactionLog[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setCurrentUser(JSON.parse(stored) as User);
    void fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await api.get<UserWithCount[]>('/users');
      setUsers(res.data);
    } catch {
      message.error('Không thể tải dữ liệu!');
    } finally {
      setLoading(false);
    }
  };

  const openDetail = async (user: UserWithCount) => {
    setSelectedUser(user);
    setDetailOpen(true);
    setDetailLoading(true);
    setUserTx([]);
    setUserLogs([]);
    try {
      const [txRes, logRes] = await Promise.all([
        api.get<Transaction[]>(`/users/${user.id}/transactions`),
        api.get<TransactionLog[]>(`/users/${user.id}/logs`),
      ]);
      setUserTx(txRes.data);
      setUserLogs(logRes.data);
    } catch {
      setUserTx([]);
      setUserLogs([]);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      await api.post('/auth/register', values);
      message.success('Tạo tài khoản thành công!');
      setModalOpen(false);
      form.resetFields();
      void fetchAll();
    } catch {
      message.error('Có lỗi xảy ra! Email có thể đã tồn tại.');
    }
  };

  const handleToggle = async (user: UserWithCount) => {
    Modal.confirm({
      title: `${user.isActive ? 'Dừng hoạt động' : 'Kích hoạt'} tài khoản?`,
      content: `Bạn có chắc muốn ${user.isActive ? 'dừng hoạt động' : 'kích hoạt'} tài khoản của ${user.fullName}?`,
      okText: 'Xác nhận',
      cancelText: 'Huỷ',
      okButtonProps: { danger: user.isActive },
      onOk: async () => {
        try {
          await api.patch(`/users/${user.id}/toggle-active`);
          message.success(
            user.isActive ? 'Đã dừng hoạt động!' : 'Đã kích hoạt!',
          );
          void fetchAll();
        } catch {
          message.error('Có lỗi xảy ra!');
        }
      },
    });
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      !search ||
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const columns: ColumnsType<UserWithCount> = [
    {
      title: 'Nhân viên',
      key: 'user',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar
            size={36}
            style={{
              background: record.isActive
                ? roleColors[record.role]
                : '#94a3b8',
              flexShrink: 0,
            }}
          >
            {record.fullName.charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <Text
              strong
              style={{ color: record.isActive ? '#0f172a' : '#94a3b8' }}
            >
              {record.fullName}
            </Text>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      width: 150,
      render: (role: Role) => (
        <Tag color={roleColors[role]}>{roleLabels[role]}</Tag>
      ),
    },
    {
      title: 'Số GD',
      key: 'txCount',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <Tag color="blue">{record._count?.createdTransactions ?? 0}</Tag>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 130,
      render: (isActive: boolean, record) => {
        const canToggleThis =
          currentUser &&
          canToggle(currentUser.role, record.role) &&
          record.id !== currentUser.id;
        return (
          <Switch
            checked={isActive}
            onChange={() => void handleToggle(record)}
            checkedChildren="Hoạt động"
            unCheckedChildren="Đã dừng"
            disabled={!canToggleThis}
          />
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 80,
      render: (_, record) => (
        <Button
          size="small"
          icon={<EyeOutlined />}
          onClick={() => void openDetail(record)}
        />
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
    },
    {
      title: 'Nội dung',
      dataIndex: 'note',
      key: 'note',
      ellipsis: true,
      render: (note: string) => note || <Text type="secondary">—</Text>,
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      render: (amount: number, record: Transaction) => (
        <Text
          strong
          style={{ color: record.type === 'INCOME' ? '#10b981' : '#ef4444' }}
        >
          {record.type === 'INCOME' ? '+' : '-'}
          {formatCurrency(Number(amount))}
        </Text>
      ),
    },
  ];

  const actionLabel: Record<string, string> = {
    CREATE: 'Tạo mới',
    UPDATE: 'Cập nhật',
    ARCHIVE: 'Lưu trữ',
  };

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
            Quản lý Nhân viên
          </Title>
          <Text style={{ color: '#94a3b8', fontSize: 13 }}>
            Tổng {users.length} tài khoản •{' '}
            {users.filter((u) => !u.isActive).length} đã dừng hoạt động
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{
            background: '#6366f1',
            borderColor: '#6366f1',
            borderRadius: 8,
          }}
          onClick={() => {
            form.resetFields();
            setModalOpen(true);
          }}
        >
          Thêm tài khoản
        </Button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <Input
          placeholder="Tìm theo tên hoặc email..."
          prefix={<SearchOutlined />}
          style={{ width: 280, borderRadius: 8 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          placeholder="Vai trò"
          style={{ width: 160 }}
          allowClear
          value={roleFilter || undefined}
          onChange={(val) => setRoleFilter(val ?? '')}
          options={[
            { value: 'OWNER', label: 'Chủ sở hữu' },
            { value: 'ADMIN', label: 'Quản trị viên' },
            { value: 'ACCOUNTANT', label: 'Kế toán' },
            { value: 'STAFF', label: 'Nhân viên' },
          ]}
        />
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={filtered}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10, showSizeChanger: true }}
        style={{ borderRadius: 12, background: 'white' }}
        rowClassName={(record) => (!record.isActive ? 'opacity-60' : '')}
      />

      {/* Create Modal */}
      <Modal
        title="Thêm tài khoản mới"
        open={modalOpen}
        onOk={() => void handleCreate()}
        onCancel={() => setModalOpen(false)}
        okText="Tạo tài khoản"
        cancelText="Huỷ"
        okButtonProps={{
          style: { background: '#6366f1', borderColor: '#6366f1' },
        }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[{ required: true, message: 'Nhập họ tên!' }]}
          >
            <Input placeholder="VD: Nguyễn Văn A" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' },
            ]}
          >
            <Input placeholder="VD: nhanvien@company.com" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              { required: true, message: 'Nhập mật khẩu!' },
              { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự!' },
            ]}
          >
            <Input.Password placeholder="Tối thiểu 6 ký tự" />
          </Form.Item>
          <Form.Item
            name="role"
            label="Vai trò"
            rules={[{ required: true, message: 'Chọn vai trò!' }]}
          >
            <Select
              options={currentUser ? getRoleOptions(currentUser.role) : []}
              placeholder="Chọn vai trò"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar
              size={40}
              style={{
                background: selectedUser
                  ? roleColors[selectedUser.role]
                  : '#94a3b8',
              }}
            >
              {selectedUser?.fullName.charAt(0).toUpperCase()}
            </Avatar>
            <div>
              <div style={{ fontWeight: 700 }}>{selectedUser?.fullName}</div>
              <div
                style={{ fontSize: 12, color: '#94a3b8', fontWeight: 400 }}
              >
                {selectedUser ? roleLabels[selectedUser.role] : ''}
              </div>
            </div>
          </div>
        }
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={null}
        width={820}
      >
        {selectedUser && (
          <div>
            {/* Info */}
            <Descriptions
              bordered
              size="small"
              column={2}
              style={{ marginBottom: 16 }}
            >
              <Descriptions.Item label="Email">
                {selectedUser.email}
              </Descriptions.Item>
              <Descriptions.Item label="Vai trò">
                <Tag color={roleColors[selectedUser.role]}>
                  {roleLabels[selectedUser.role]}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={selectedUser.isActive ? 'green' : 'red'}>
                  {selectedUser.isActive ? 'Hoạt động' : 'Đã dừng'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {dayjs(selectedUser.createdAt).format('DD/MM/YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Tổng giao dịch">
                <Tag color="blue">
                  {selectedUser._count?.createdTransactions ?? 0}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            {/* Tabs */}
            <Tabs
              defaultActiveKey="transactions"
              items={[
                {
                  key: 'transactions',
                  label: `Giao dịch đã tạo (${userTx.length})`,
                  children: (
                    <Table
                      columns={txColumns}
                      dataSource={userTx}
                      rowKey="id"
                      loading={detailLoading}
                      size="small"
                      pagination={{ pageSize: 5 }}
                    />
                  ),
                },
                {
                  key: 'logs',
                  label: `Lịch sử chỉnh sửa (${userLogs.length})`,
                  children: (
                    <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                      {detailLoading ? null : userLogs.length === 0 ? (
                        <Text type="secondary">Chưa có lịch sử chỉnh sửa</Text>
                      ) : (
                        userLogs.map((log) => (
                          <div
                            key={log.id}
                            style={{
                              borderLeft: '3px solid #6366f1',
                              paddingLeft: 12,
                              marginBottom: 12,
                              paddingBottom: 8,
                              borderBottom: '1px solid #f1f5f9',
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: 4,
                              }}
                            >
                              <Space>
                                <Tag color="purple">
                                  {actionLabel[log.action] ?? log.action}
                                </Tag>
                                {log.transaction && (
                                  <Text
                                    style={{
                                      fontSize: 12,
                                      color: '#64748b',
                                    }}
                                  >
                                    {log.transaction.note ??
                                      formatCurrency(
                                        Number(log.transaction.amount),
                                      )}
                                  </Text>
                                )}
                              </Space>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {dayjs(log.createdAt).format(
                                  'DD/MM/YYYY HH:mm',
                                )}
                              </Text>
                            </div>
                            {log.changedFields &&
                              Object.keys(log.changedFields).length > 0 && (
                                <div>
                                  {Object.entries(log.changedFields).map(
                                    ([field, val]) => {
                                      const { from, to } = val as {
                                        from: unknown;
                                        to: unknown;
                                      };
                                      return (
                                        <div
                                          key={field}
                                          style={{ fontSize: 12 }}
                                        >
                                          <Text type="secondary">
                                            {field}:{' '}
                                          </Text>
                                          <Text delete type="danger">
                                            {String(from)}
                                          </Text>
                                          {' → '}
                                          <Text type="success">
                                            {String(to)}
                                          </Text>
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
                  ),
                },
              ]}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}