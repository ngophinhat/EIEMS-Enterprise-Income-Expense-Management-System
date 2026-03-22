'use client';

import { useEffect, useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Typography, Badge } from 'antd';
import {
  DashboardOutlined,
  SwapOutlined,
  TeamOutlined,
  FileTextOutlined,
  BankOutlined,
  AppstoreOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import type { User, Role } from '@/types';

const { Sider, Header, Content } = Layout;
const { Text } = Typography;

const getMenuItems = (role: Role) => {
  const all = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      roles: ['ACCOUNTANT', 'ADMIN', 'OWNER'],
    },
    {
      key: '/transactions',
      icon: <SwapOutlined />,
      label: 'Giao Dịch',
      roles: ['STAFF', 'ACCOUNTANT', 'ADMIN'],
    },
    {
      key: '/customers',
      icon: <TeamOutlined />,
      label: 'Khách hàng',
      roles: ['STAFF', 'ACCOUNTANT', 'ADMIN', 'OWNER'],
    },
    {
      key: '/debts',
      icon: <BankOutlined />,
      label: 'Công nợ',
      roles: ['ACCOUNTANT', 'ADMIN', 'OWNER'],
    },
    {
      key: '/categories',
      icon: <AppstoreOutlined />,
      label: 'Danh mục',
      roles: ['ACCOUNTANT', 'ADMIN'],
    },
    {
      key: '/reports',
      icon: <FileTextOutlined />,
      label: 'Báo cáo',
      roles: ['ACCOUNTANT', 'ADMIN'],
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: 'Nhân viên',
      roles: ['ADMIN', 'OWNER'],
    },
  ];

  return all
    .filter((item) => item.roles.includes(role))
    .map(({ key, icon, label }) => ({ key, icon, label }));
};

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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    if (!stored || !token) {
      router.push('/login');
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(JSON.parse(stored) as User);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (!user) return null;

  const menuItems = getMenuItems(user.role);
  const siderWidth = collapsed ? 80 : 240;

  const userMenuItems = [
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Cài đặt',
    },
    { type: 'divider' as const },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      {/* Sidebar - Fixed */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        width={240}
        style={{
          position: 'fixed',
          height: '100vh',
          left: 0,
          top: 0,
          zIndex: 100,
          background: '#0f172a',
          boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
          overflow: 'hidden',
        }}
      >
        {/* Logo */}
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            padding: collapsed ? '0 24px' : '0 20px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            gap: 10,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(59,130,246,0.4)',
            }}
          >
            <span style={{ color: 'white', fontWeight: 800, fontSize: 16 }}>
              E
            </span>
          </div>
          {!collapsed && (
            <div>
              <div
                style={{
                  color: 'white',
                  fontWeight: 700,
                  fontSize: 15,
                  lineHeight: 1.2,
                }}
              >
                EIEMS
              </div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>
                Quản lý thu chi
              </div>
            </div>
          )}
        </div>

        {/* Menu */}
        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
          onClick={({ key }) => router.push(key)}
          style={{
            background: 'transparent',
            border: 'none',
            marginTop: 8,
            padding: '0 8px',
          }}
          theme="dark"
        />

        {/* User card bottom */}
        {!collapsed && (
          <div
            style={{
              position: 'absolute',
              bottom: 16,
              left: 12,
              right: 12,
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 10,
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer',
            }}
            onClick={handleLogout}
          >
            <Avatar
              size={32}
              style={{ background: roleColors[user.role], flexShrink: 0 }}
            >
              {user.fullName.charAt(0).toUpperCase()}
            </Avatar>
            <div style={{ overflow: 'hidden' }}>
              <div
                style={{
                  color: 'white',
                  fontSize: 12,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user.fullName}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>
                {roleLabels[user.role]}
              </div>
            </div>
            <LogoutOutlined
              style={{
                color: 'rgba(255,255,255,0.3)',
                marginLeft: 'auto',
                fontSize: 12,
              }}
            />
          </div>
        )}
      </Sider>

      {/* Main Layout */}
      <Layout
        style={{
          marginLeft: siderWidth,
          transition: 'margin-left 0.2s',
          minHeight: '100vh',
          background: '#f0f2f5',
        }}
      >
        {/* Header */}
        <Header
          style={{
            background: 'white',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            position: 'sticky',
            top: 0,
            zIndex: 99,
            height: 64,
          }}
        >
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 18,
              color: '#64748b',
              padding: '4px 8px',
              borderRadius: 6,
            }}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Badge count={0} showZero={false}>
              <button
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  width: 36,
                  height: 36,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748b',
                  fontSize: 15,
                }}
              >
                <BellOutlined />
              </button>
            </Badge>

            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              trigger={['click']}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  padding: '6px 10px',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                }}
              >
                <Avatar size={28} style={{ background: roleColors[user.role] }}>
                  {user.fullName.charAt(0).toUpperCase()}
                </Avatar>
                <div>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      display: 'block',
                      lineHeight: 1.2,
                    }}
                  >
                    {user.fullName}
                  </Text>
                  <Text
                    style={{ fontSize: 10, color: '#94a3b8', display: 'block' }}
                  >
                    {roleLabels[user.role]}
                  </Text>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* Content */}
        <Content style={{ margin: 24, minHeight: 'calc(100vh - 112px)' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}