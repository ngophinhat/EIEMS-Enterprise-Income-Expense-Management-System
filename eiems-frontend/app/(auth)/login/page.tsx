"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Form, Input, Button, Card, Typography, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { authApi } from "../../../lib/axios";

const { Title, Text } = Typography;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const res = await authApi.login(values.email, values.password);
      const { accessToken, user } = res.data;
      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(user));

      // Redirect theo role
      if (user.role === "STAFF") {
        router.push("/sales-orders");
      } else {
        router.push("/dashboard");
      }
    } catch (e) {
      if (e && typeof e === 'object' && 'response' in e) {
        const axiosErr = e as { response?: { data?: { message?: string }; status?: number } };
        const msg = axiosErr.response?.data?.message ?? 'Đăng nhập thất bại';
        void message.error(Array.isArray(msg) ? msg[0] : msg);
      } else {
        void message.error('Không thể kết nối server');
      }
    }finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div style={{ width: "100%", maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>🎂</div>
          <Title
            level={2}
            style={{
              color: "#fff",
              margin: 0,
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            BMSYS Bakery
          </Title>
          <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>
            Hệ thống quản lý chi tiêu tiệm bánh
          </Text>
        </div>

        <Card
          style={{
            borderRadius: 16,
            boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
            border: "none",
          }}
        >
          <Title
            level={4}
            style={{ textAlign: "center", marginBottom: 28, color: "#1a1a2e" }}
          >
            Đăng nhập
          </Title>
          <Form layout="vertical" onFinish={handleLogin} size="large">
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Nhập email" },
                { type: "email", message: "Email không hợp lệ" },
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ color: "#aaa" }} />}
                placeholder="email@example.com"
              />
            </Form.Item>
            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[{ required: true, message: "Nhập mật khẩu" }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: "#aaa" }} />}
                placeholder="••••••"
              />
            </Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              style={{
                background: "#1a1a2e",
                height: 44,
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 600,
                marginTop: 8,
              }}
            >
              Đăng nhập
            </Button>
          </Form>
        </Card>
      </div>
    </div>
  );
}
