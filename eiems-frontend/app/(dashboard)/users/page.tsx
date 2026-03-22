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
} from 'antd';
import {
  PlusOutlined,
  UserOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import api from '@/lib/axios';
import type { User, Role } from '@/types';

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
  if (currentRole === 'ADMIN' && (targetRole === 'ACCOUNTANT' || targetRole === 'STAFF')) return true;
  return false;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
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
      const res = await api.get<User[]>('/users');
      setUsers(res.data);
    } catch {
      message.error('Không thể tải dữ liệu!');
    } finally {
      setLoading(false);
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

  const handleToggle = async (user: User) => {
    const action = user.isActive ? 'dừng hoạt động' : 'kích hoạt';
    Modal.confirm({
      title: `${user.isActive ? 'Dừng hoạt động' : 'Kích hoạt'} tài khoản?`,
      content: `Bạn có chắc muốn ${action} tài khoản của ${user.fullName}?`,
      okText: 'Xác nhận',
      cancelText: 'Huỷ',
      okButtonProps: { danger: user.isActive },
      onOk: async () => {
        try {
          await api.patch(`/users/${user.id}/toggle-active`);
          message.success(
            user.isActive
              ? 'Đã dừng hoạt động tài khoản!'
              : 'Đã kích hoạt tài khoản!',
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

  const columns: ColumnsType<User> = [
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
          currentUser && canToggle(currentUser.role, record.role) &&
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
      render: (_, record) => {
        if (!record.isActive) {
          return (
            <Tag color="red" style={{ fontSize: 11 }}>
              Đã dừng
            </Tag>
          );
        }
        return (
          <Space>
            <Button
              size="small"
              icon={<UserOutlined />}
              onClick={() => {
                Modal.info({
                  title: 'Thông tin tài khoản',
                  content: (
                    <div style={{ marginTop: 12 }}>
                      <p><strong>Họ tên:</strong> {record.fullName}</p>
                      <p><strong>Email:</strong> {record.email}</p>
                      <p><strong>Vai trò:</strong> {roleLabels[record.role]}</p>
                      <p><strong>Ngày tạo:</strong> {dayjs(record.createdAt).format('DD/MM/YYYY')}</p>
                      <p><strong>Trạng thái:</strong> {record.isActive ? 'Hoạt động' : 'Đã dừng'}</p>
                    </div>
                  ),
                });
              }}
            />
          </Space>
        );
      },
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
    </div>
  );
}