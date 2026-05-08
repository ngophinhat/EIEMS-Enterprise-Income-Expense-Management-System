"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Layout,
  Menu,
  Badge,
  Button,
  Avatar,
  List,
  Tag,
  Typography,
  Space,
  Drawer,
  Empty,
} from "antd";
import {
  DashboardOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  TeamOutlined,
  BankOutlined,
  BarChartOutlined,
  TagsOutlined,
  BellOutlined,
  LogoutOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import { notificationApi } from "@/lib/axios";
import type { Notification, Role } from "@/types";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const NOTIFICATION_TYPE_COLOR: Record<string, string> = {
  NEW_ORDER: "blue",
  ORDER_CONFIRMED: "cyan",
  ORDER_DELIVERED: "green",
  ORDER_PAID: "success",
  ORDER_CANCELLED: "red",
  DEBT_CREATED: "orange",
};

// Menu items theo role
function getMenuItems(role: Role) {
  const all = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
      roles: ["OWNER", "ADMIN", "ACCOUNTANT"],
    },
    {
      key: "/sales-orders",
      icon: <ShoppingOutlined />,
      label: "Phiếu bán hàng",
      roles: ["STAFF", "ADMIN", "ACCOUNTANT"],
    },
    {
      key: "/transactions",
      icon: <FileTextOutlined />,
      label: "Thu / Chi",
      roles: ["ADMIN", "ACCOUNTANT"],
    },
    {
      key: "/customers",
      icon: <TeamOutlined />,
      label: "Khách hàng",
      roles: ["OWNER", "ADMIN", "ACCOUNTANT", "STAFF"],
    },
    {
      key: "/debts",
      icon: <BankOutlined />,
      label: "Công nợ",
      roles: ["OWNER", "ADMIN", "ACCOUNTANT"],
    },
    {
      key: "/categories",
      icon: <TagsOutlined />,
      label: "Danh mục",
      roles: ["ADMIN", "ACCOUNTANT"],
    },
    {
      key: "/reports",
      icon: <BarChartOutlined />,
      label: "Báo cáo",
      roles: ["ADMIN", "ACCOUNTANT"],
    },
    {
      key: "/users",
      icon: <UserOutlined />,
      label: "Nhân viên",
      roles: ["ADMIN"],
    },
  ];
  return all
    .filter((item) => item.roles.includes(role))
    .map(({ key, icon, label }) => ({ key, icon, label }));
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      router.push("/login");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(JSON.parse(stored));
  }, [router]);

const fetchUnread = useCallback(async () => {
  if (typeof window === 'undefined') return;
  const token = localStorage.getItem('token');
  if (!token) return; // ← đọc localStorage trực tiếp, không phụ thuộc state
  try {
    const res = await notificationApi.countUnread();
    setUnreadCount(res.data as number);
  } catch {}
}, []); // ← deps rỗng

useEffect(() => {
  const token = localStorage.getItem('token');
  if (!token) return; // ← guard bằng localStorage
  // eslint-disable-next-line react-hooks/set-state-in-effect
  void fetchUnread();
  const interval = setInterval(() => void fetchUnread(), 30000);
  return () => clearInterval(interval);
}, [fetchUnread]); // ← deps rỗng, chỉ chạy 1 lần khi mount


  const openNotifications = async () => {
    setNotifOpen(true);
    try {
      const res = await notificationApi.getAll();
      setNotifications(res.data);
    } catch {}
  };

  const markAllRead = async () => {
    await notificationApi.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleNotifClick = async (notif: Notification) => {
    if (!notif.isRead) {
      await notificationApi.markRead(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    if (notif.orderId) {
      router.push(`/sales-orders?highlight=${notif.orderId}`);
      setNotifOpen(false);
    }
  };

  const logout = () => {
    localStorage.clear();
    router.push("/login");
  };

  if (!user) return null;

  const menuItems = getMenuItems(user.role);

  return (
    <Layout style={{ minHeight: "100vh", background: "#f0f2f5" }}>
      {/* Sider */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={220}
        style={{
          background: "#1a1a2e",
          boxShadow: "2px 0 8px rgba(0,0,0,0.15)",
          position: "fixed",
          height: "100vh",
          left: 0,
          top: 0,
          zIndex: 100,
        }}
      >
        {/* Logo */}
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            padding: collapsed ? 0 : "0 20px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <span style={{ fontSize: 22 }}>🎂</span>
          {!collapsed && (
            <span
              style={{
                marginLeft: 10,
                color: "#fff",
                fontWeight: 700,
                fontSize: 15,
                letterSpacing: 0.5,
              }}
            >
              BMSYS Bakery
            </span>
          )}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
          onClick={({ key }) => router.push(key)}
          style={{ background: "transparent", borderRight: 0, marginTop: 8 }}
        />
      </Sider>

      {/* Main layout */}
      <Layout
        style={{ marginLeft: collapsed ? 80 : 220, transition: "margin 0.2s" }}
      >
        {/* Header */}
        <Header
          style={{
            background: "#fff",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            position: "sticky",
            top: 0,
            zIndex: 99,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 16 }}
          />

          <Space size={16}>
            {/* Notification Bell */}
            <Badge count={unreadCount} size="small" offset={[-2, 2]}>
              <Button
                type="text"
                shape="circle"
                icon={<BellOutlined style={{ fontSize: 18 }} />}
                onClick={openNotifications}
              />
            </Badge>

            {/* User info */}
            <Space>
              <Avatar
                style={{ background: "#1a1a2e", fontSize: 13 }}
                size="small"
              >
                {user.fullName?.[0]?.toUpperCase()}
              </Avatar>
              <span style={{ fontWeight: 500, fontSize: 13 }}>
                {user.fullName}
              </span>
              <Tag color="blue" style={{ fontSize: 11 }}>
                {user.role}
              </Tag>
            </Space>

            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={logout}
              danger
            />
          </Space>
        </Header>

        {/* Content */}
        <Content style={{ margin: "24px", minHeight: "calc(100vh - 112px)" }}>
          {children}
        </Content>
      </Layout>

      {/* Notification Drawer */}
      <Drawer
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>🔔 Thông báo</span>
            {unreadCount > 0 && (
              <Button
                size="small"
                icon={<CheckOutlined />}
                onClick={markAllRead}
              >
                Đọc tất cả
              </Button>
            )}
          </div>
        }
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        size="default" 
        styles={{ body: { padding: 0 } }}
      >
        {notifications.length === 0 ? (
          <Empty description="Không có thông báo" style={{ marginTop: 60 }} />
        ) : (
          <List
            dataSource={notifications}
            renderItem={(notif) => (
              <List.Item
                style={{
                  padding: "12px 20px",
                  cursor: notif.orderId ? "pointer" : "default",
                  background: notif.isRead ? "transparent" : "#f0f7ff",
                  borderLeft: notif.isRead ? "none" : "3px solid #1677ff",
                  transition: "background 0.2s",
                }}
                onClick={() => handleNotifClick(notif)}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Tag
                        color={NOTIFICATION_TYPE_COLOR[notif.type] ?? "default"}
                        style={{ fontSize: 11 }}
                      >
                        {notif.type.replace("_", " ")}
                      </Tag>
                      {!notif.isRead && <Badge color="blue" />}
                    </Space>
                  }
                  description={
                    <div>
                      <Text style={{ fontSize: 13 }}>{notif.message}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {dayjs(notif.createdAt).fromNow()}
                      </Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Drawer>
    </Layout>
  );
}
