'use client';

import { useEffect, useState, useCallback } from 'react';
import { Row, Col, Spin, Typography, Button, Dropdown } from 'antd';
import {
  PlusOutlined,
  CalendarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  DownOutlined,
} from '@ant-design/icons';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import api from '@/lib/axios';
import type { Dashboard, Transaction, Role } from '@/types';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('vi-VN').format(amount) + 'đ';

const MONTHS = [
  'THÁNG 10',
  'THÁNG 11',
  'THÁNG 12',
  'THÁNG 01',
  'THÁNG 02',
  'THÁNG 03',
];
const PIE_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#94a3b8'];

interface PeriodReport {
  totalIncome: number;
  totalExpense: number;
  profit: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [dashData, setDashData] = useState<Dashboard | null>(null);
  const [periodData, setPeriodData] = useState<PeriodReport | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodLoading, setPeriodLoading] = useState(false);
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    role: Role;
  } | null>(null);

  // Fetch dashboard tổng quan (1 lần)
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored)
      setCurrentUser(JSON.parse(stored) as { id: string; role: Role });

    Promise.all([
      api.get<Dashboard>('/reports/dashboard'),
      api.get<Transaction[]>('/transactions'),
    ])
      .then(([dashRes, txRes]) => {
        setDashData(dashRes.data);
        setTransactions(txRes.data.slice(0, 5));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Fetch data theo period
  const fetchPeriodData = useCallback(async (p: 'month' | 'quarter' | 'year') => {
    setPeriodLoading(true);
    try {
      const year = dayjs().year();
      const month = dayjs().month() + 1;
      const quarter = Math.ceil(month / 3);

      let res;
      if (p === 'month') {
        res = await api.get<PeriodReport>(
          `/reports/month?year=${year}&month=${month}`,
        );
      } else if (p === 'quarter') {
        res = await api.get<PeriodReport>(
          `/reports/quarter?year=${year}&quarter=${quarter}`,
        );
      } else {
        res = await api.get<PeriodReport>(`/reports/year?year=${year}`);
      }
      setPeriodData(res.data);
    } catch {
      setPeriodData(null);
    } finally {
      setPeriodLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchPeriodData(period);
  }, [period, fetchPeriodData]);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '60vh',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  const isOwner = currentUser?.role === 'OWNER';

  // Dùng periodData nếu có, fallback về dashData
  const income = periodData?.totalIncome ?? dashData?.totalIncome ?? 0;
  const expense = periodData?.totalExpense ?? dashData?.totalExpense ?? 0;
  const profit = periodData?.profit ?? dashData?.profit ?? 0;

  const chartData = MONTHS.map((month, i) => ({
    month,
    income: Math.round(income * (0.5 + i * 0.1)),
    expense: Math.round(expense * (0.4 + i * 0.08)),
  }));

  const pieData = [
    { name: 'Thu nhập', value: income },
    { name: 'Chi tiêu', value: expense },
    { name: 'Công nợ', value: dashData?.totalDebts ?? 0 },
    { name: 'Khác', value: Math.abs(profit) * 0.1 },
  ];

  const totalPie = pieData.reduce((a, b) => a + b.value, 0);

  const periodLabel = {
    month: 'Tháng này',
    quarter: 'Quý này',
    year: 'Năm này',
  }[period];

  return (
    <div style={{ padding: '4px 0' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <Title
            level={3}
            style={{ margin: 0, color: '#0f172a', fontWeight: 700 }}
          >
            Tổng quan thu chi
          </Title>
          <Text style={{ color: '#94a3b8', fontSize: 13 }}>
            Thống kê tài chính — {periodLabel} •{' '}
            {new Date().toLocaleDateString('vi-VN')}
          </Text>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Dropdown
            menu={{
              items: [
                { key: 'month', label: 'Tháng này' },
                { key: 'quarter', label: 'Quý này' },
                { key: 'year', label: 'Năm này' },
              ],
              onClick: ({ key }) =>
                setPeriod(key as 'month' | 'quarter' | 'year'),
              selectedKeys: [period],
            }}
            trigger={['click']}
          >
            <Button
              icon={<CalendarOutlined />}
              loading={periodLoading}
              style={{ borderRadius: 8 }}
            >
              {periodLabel}
              <DownOutlined style={{ fontSize: 11, marginLeft: 2 }} />
            </Button>
          </Dropdown>

          {!isOwner && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={{
                borderRadius: 8,
                background: '#6366f1',
                borderColor: '#6366f1',
              }}
              onClick={() => router.push('/transactions')}
            >
              Thêm giao dịch
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={8}>
          <div
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
              borderRadius: 16,
              padding: '28px 24px',
              height: '100%',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(99,102,241,0.3)',
              minHeight: 140,
            }}
          >
            <div
              style={{
                position: 'absolute',
                bottom: -30,
                right: -30,
                width: 130,
                height: 130,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.08)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 20,
                right: 50,
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.06)',
              }}
            />
            <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>
              Tổng số dư — {periodLabel}
            </Text>
            <div
              style={{
                color: 'white',
                fontSize: 26,
                fontWeight: 800,
                margin: '8px 0 16px',
              }}
            >
              {periodLoading ? '...' : formatCurrency(profit)}
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                background: 'rgba(255,255,255,0.2)',
                borderRadius: 20,
                padding: '4px 12px',
              }}
            >
              <ArrowUpOutlined style={{ color: 'white', fontSize: 11 }} />
              <span style={{ color: 'white', fontSize: 12 }}>
                {profit >= 0 ? '+' : ''}
                {income > 0 ? ((profit / income) * 100).toFixed(1) : '0'}%
                lợi nhuận
              </span>
            </div>
          </div>
        </Col>

        <Col xs={24} md={8}>
          <div
            style={{
              background: 'white',
              borderRadius: 16,
              padding: '28px 24px',
              height: '100%',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              minHeight: 140,
            }}
          >
            <Text style={{ color: '#94a3b8', fontSize: 13 }}>
              Tổng thu nhập — {periodLabel}
            </Text>
            <div
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: '#0f172a',
                margin: '8px 0 12px',
              }}
            >
              {periodLoading ? '...' : formatCurrency(income)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <ArrowUpOutlined style={{ color: '#10b981', fontSize: 12 }} />
              <Text style={{ color: '#10b981', fontSize: 13 }}>Thu nhập kỳ này</Text>
            </div>
          </div>
        </Col>

        <Col xs={24} md={8}>
          <div
            style={{
              background: 'white',
              borderRadius: 16,
              padding: '28px 24px',
              height: '100%',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              minHeight: 140,
            }}
          >
            <Text style={{ color: '#94a3b8', fontSize: 13 }}>
              Tổng chi tiêu — {periodLabel}
            </Text>
            <div
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: '#0f172a',
                margin: '8px 0 12px',
              }}
            >
              {periodLoading ? '...' : formatCurrency(expense)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <ArrowDownOutlined style={{ color: '#ef4444', fontSize: 12 }} />
              <Text style={{ color: '#ef4444', fontSize: 13 }}>Chi tiêu kỳ này</Text>
            </div>
          </div>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={16}>
          <div
            style={{
              background: 'white',
              borderRadius: 16,
              padding: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <Title level={5} style={{ margin: 0 }}>
                Xu hướng Tài chính
              </Title>
              <div style={{ display: 'flex', gap: 16 }}>
                {[
                  { label: 'Thu nhập', color: '#6366f1' },
                  { label: 'Chi tiêu', color: '#cbd5e1' },
                ].map((item) => (
                  <span
                    key={item.label}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 13,
                      color: '#64748b',
                    }}
                  >
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: item.color,
                        display: 'inline-block',
                      }}
                    />
                    {item.label}
                  </span>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e2e8f0" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#e2e8f0" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                />
                <YAxis hide />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                  contentStyle={{
                    borderRadius: 8,
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    fontSize: 13,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fill="url(#incomeGrad)"
                  dot={false}
                  activeDot={{ r: 5, fill: '#6366f1' }}
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="#cbd5e1"
                  strokeWidth={2}
                  fill="url(#expenseGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#cbd5e1' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Col>

        <Col xs={24} lg={8}>
          <div
            style={{
              background: 'white',
              borderRadius: 16,
              padding: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              height: '100%',
            }}
          >
            <Title level={5} style={{ margin: '0 0 4px' }}>
              Phân loại chi tiêu
            </Title>
            <Text style={{ color: '#94a3b8', fontSize: 12 }}>
              Dựa trên {dashData?.totalCustomers} khách hàng
            </Text>
            <div style={{ position: 'relative', marginTop: 8 }}>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={72}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={index} fill={PIE_COLORS[index]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                  pointerEvents: 'none',
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: '#94a3b8',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                  }}
                >
                  LỚN NHẤT
                </div>
                <div
                  style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}
                >
                  Thu nhập
                </div>
              </div>
            </div>
            <div style={{ marginTop: 8 }}>
              {pieData.map((item, i) => (
                <div
                  key={item.name}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '5px 0',
                  }}
                >
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 13,
                      color: '#64748b',
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: PIE_COLORS[i],
                        display: 'inline-block',
                      }}
                    />
                    {item.name}
                  </span>
                  <span
                    style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}
                  >
                    {totalPie > 0
                      ? ((item.value / totalPie) * 100).toFixed(0)
                      : 0}
                    %
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Col>
      </Row>

      {/* Giao dịch gần đây - Ẩn với OWNER */}
      {!isOwner && (
        <div
          style={{
            background: 'white',
            borderRadius: 16,
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <Title level={5} style={{ margin: 0 }}>
              Giao dịch gần đây
            </Title>
            <Button
              type="link"
              style={{ color: '#6366f1', padding: 0, fontWeight: 600 }}
              onClick={() => router.push('/transactions')}
            >
              Xem tất cả
            </Button>
          </div>

          {transactions.length === 0 ? (
            <Text style={{ color: '#94a3b8' }}>Chưa có giao dịch nào</Text>
          ) : (
            transactions.map((tx) => (
              <div
                key={tx.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: '#f8fafc',
                  borderRadius: 12,
                  marginBottom: 8,
                }}
              >
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: 12 }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 20,
                      background:
                        tx.type === 'INCOME' ? '#eff6ff' : '#fef2f2',
                    }}
                  >
                    {tx.type === 'INCOME' ? '💰' : '💸'}
                  </div>
                  <div>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 14,
                        color: '#0f172a',
                      }}
                    >
                      {tx.note || tx.category?.name || 'Giao dịch'}
                    </div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>
                      {new Date(tx.transactionDate).toLocaleDateString('vi-VN')}{' '}
                      • {tx.category?.name ?? ''}
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 15,
                    color: tx.type === 'INCOME' ? '#10b981' : '#ef4444',
                  }}
                >
                  {tx.type === 'INCOME' ? '+' : '-'}
                  {formatCurrency(Number(tx.amount))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}