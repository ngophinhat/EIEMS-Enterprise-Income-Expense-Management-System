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
  Typography,
  message,
  Switch,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import api from '@/lib/axios';
import type { Category, Role } from '@/types';

const { Title, Text } = Typography;

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
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
      const res = await api.get<Category[]>('/categories');
      setCategories(res.data);
    } catch {
      message.error('Không thể tải dữ liệu!');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    form.setFieldsValue({ name: cat.name, type: cat.type });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await api.patch(`/categories/${editing.id}`, values);
        message.success('Cập nhật danh mục thành công!');
      } else {
        await api.post('/categories', values);
        message.success('Thêm danh mục thành công!');
      }
      setModalOpen(false);
      void fetchAll();
    } catch {
      message.error('Có lỗi xảy ra!');
    }
  };

  const handleToggle = async (cat: Category) => {
    try {
      await api.patch(`/categories/${cat.id}`, { isActive: !cat.isActive });
      message.success(
        !cat.isActive ? 'Đã bật danh mục!' : 'Đã tắt danh mục!',
      );
      void fetchAll();
    } catch {
      message.error('Có lỗi xảy ra!');
    }
  };

  const filtered = categories.filter((c) => {
    const matchSearch =
      !search || c.name.toLowerCase().includes(search.toLowerCase());
    const matchType = !typeFilter || c.type === typeFilter;
    return matchSearch && matchType;
  });

  const columns: ColumnsType<Category> = [
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record) => (
        <Text
          strong
          style={{ color: record.isActive ? '#0f172a' : '#94a3b8' }}
        >
          {name}
        </Text>
      ),
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) =>
        type === 'INCOME' ? (
          <Tag color="green">Thu nhập</Tag>
        ) : (
          <Tag color="red">Chi tiêu</Tag>
        ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 110,
      render: (isActive: boolean, record) => (
        <Switch
          checked={isActive}
          onChange={() => void handleToggle(record)}
          checkedChildren="Bật"
          unCheckedChildren="Tắt"
          disabled={record.isSystem}
        />
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 80,
      render: (_, record) =>
        !record.isSystem ? (
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEdit(record)}
          />
        ) : (
          <Text type="secondary" style={{ fontSize: 12 }}>
            —
          </Text>
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

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <Input
          placeholder="Tìm kiếm danh mục..."
          prefix={<SearchOutlined />}
          style={{ width: 250, borderRadius: 8 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          placeholder="Loại danh mục"
          style={{ width: 160 }}
          allowClear
          value={typeFilter || undefined}
          onChange={(val) => setTypeFilter(val ?? '')}
          options={[
            { value: 'INCOME', label: 'Thu nhập' },
            { value: 'EXPENSE', label: 'Chi tiêu' },
          ]}
        />
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
          Thêm danh mục
        </Button>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={filtered}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10, showSizeChanger: true }}
        style={{ borderRadius: 12, background: 'white' }}
        rowClassName={(record) => (!record.isActive ? 'opacity-50' : '')}
      />

      {/* Create/Edit Modal */}
      <Modal
        title={editing ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}
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
            label="Tên danh mục"
            rules={[{ required: true, message: 'Nhập tên danh mục!' }]}
          >
            <Input placeholder="VD: Ăn uống, Lương, Điện nước..." />
          </Form.Item>
          <Form.Item
            name="type"
            label="Loại"
            rules={[{ required: true, message: 'Chọn loại!' }]}
          >
            <Select
              options={[
                { value: 'INCOME', label: '📈 Thu nhập' },
                { value: 'EXPENSE', label: '📉 Chi tiêu' },
              ]}
              placeholder="Chọn loại danh mục"
              disabled={!!editing}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}