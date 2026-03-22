'use client';

import { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import type { LoginResponse } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

const onFinish = async (values: { email: string; password: string }) => {
  setLoading(true);
  try {
    const res = await api.post<LoginResponse>('/auth/login', values);
    localStorage.setItem('accessToken', res.data.accessToken);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    
    message.success('Đăng nhập thành công!');

    // Delay 1.5s trước khi redirect
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const role = res.data.user.role;
    if (role === 'STAFF') {
      router.push('/transactions');
    } else {
      router.push('/dashboard');
    }
  } catch (err: unknown) {
    const error = err as { response?: { data?: { message?: string } } };
    const msg = error.response?.data?.message;

    if (msg === 'Tài khoản đã bị vô hiệu hóa') {
      message.error('Tài khoản của bạn đã bị tạm dừng hoạt động!', 5);
    } else {
      message.error('Email hoặc mật khẩu không đúng!', 5);
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-md">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-xl mb-4">
            <span className="text-white text-2xl font-bold">E</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">EIEMS</h1>
          <p className="text-gray-500 text-sm mt-1">
            Hệ thống quản lý thu chi doanh nghiệp
          </p>
        </div>

        {/* Form */}
        <Form layout="vertical" onFinish={onFinish} autoComplete="off">
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' },
            ]}
          >
            <Input
              prefix={<UserOutlined className="text-gray-400" />}
              placeholder="Nhập email"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Nhập mật khẩu"
              size="large"
            />
          </Form.Item>

          <Form.Item className="mt-6">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              className="w-full"
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}