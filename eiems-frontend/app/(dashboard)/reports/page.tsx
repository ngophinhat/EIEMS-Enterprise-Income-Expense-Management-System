'use client';

import { useEffect, useState } from 'react';
import {
  Row,
  Col,
  Select,
  DatePicker,
  Typography,
  Spin,
  Tag,
  Table,
  Divider,
  Button,
} from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  FileExcelOutlined,
} from '@ant-design/icons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';
import api from '@/lib/axios';
import type { Transaction, Customer } from '@/types';

const { Title, Text } = Typography;

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('vi-VN').format(amount) + 'đ';

const formatNum = (amount: number) =>
  new Intl.NumberFormat('vi-VN').format(amount);

const formatPercent = (rate: number) => `${(rate * 100).toFixed(0)}%`;

type PeriodType = 'day' | 'month' | 'quarter' | 'year';

interface TaxInfo {
  vatRate: number;
  tndnRate: number;
  incomeBeforeTax: number;
  vatAmount: number;
  tndnAmount: number;
  totalTax: number;
  incomeAfterTax: number;
}

interface ReportData {
  totalIncome: number;
  totalExpense: number;
  profit: number;
  year?: number;
  month?: number;
  day?: number;
  quarter?: number;
  tax?: TaxInfo;
}

interface Debt {
  id: string;
  totalAmount: number;
  remainingAmount: number;
  status: 'UNPAID' | 'PARTIAL' | 'PAID';
  dueDate?: string;
  customer?: Customer;
  createdAt: string;
  updatedAt: string;
}

export default function ReportsPage() {
  const [period, setPeriod] = useState<PeriodType>('month');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedQuarter, setSelectedQuarter] = useState(
    Math.ceil((dayjs().month() + 1) / 3),
  );

  useEffect(() => {
    void fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, selectedDate, selectedQuarter]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const year = selectedDate.year();
      const month = selectedDate.month() + 1;
      const day = selectedDate.date();
      let res;
      if (period === 'day') {
        res = await api.get<ReportData>(
          `/reports/day?year=${year}&month=${month}&day=${day}`,
        );
      } else if (period === 'month') {
        res = await api.get<ReportData>(
          `/reports/month?year=${year}&month=${month}`,
        );
      } else if (period === 'quarter') {
        res = await api.get<ReportData>(
          `/reports/quarter?year=${year}&quarter=${selectedQuarter}`,
        );
      } else {
        res = await api.get<ReportData>(`/reports/year?year=${year}`);
      }
      setReportData(res.data);
    } catch {
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const getPeriodLabel = () => {
    const year = selectedDate.year();
    const month = selectedDate.month() + 1;
    const day = selectedDate.date();
    if (period === 'day') return `Ngày ${day}-${month}-${year}`;
    if (period === 'month') return `Tháng ${month}-${year}`;
    if (period === 'quarter') return `Quý ${selectedQuarter}-${year}`;
    return `Năm ${year}`;
  };

  const getDateRange = (): { start: dayjs.Dayjs; end: dayjs.Dayjs } => {
    const year = selectedDate.year();
    const month = selectedDate.month() + 1;
    const day = selectedDate.date();
    if (period === 'day') {
      const d = dayjs(`${year}-${month}-${day}`);
      return { start: d.startOf('day'), end: d.endOf('day') };
    }
    if (period === 'month') {
      return {
        start: dayjs(`${year}-${month}-01`).startOf('month'),
        end: dayjs(`${year}-${month}-01`).endOf('month'),
      };
    }
    if (period === 'quarter') {
      const startMonth = (selectedQuarter - 1) * 3 + 1;
      const endMonth = startMonth + 2;
      return {
        start: dayjs(`${year}-${startMonth}-01`).startOf('month'),
        end: dayjs(`${year}-${endMonth}-01`).endOf('month'),
      };
    }
    return {
      start: dayjs(`${year}-01-01`).startOf('year'),
      end: dayjs(`${year}-12-31`).endOf('year'),
    };
  };

  const hasTax = period === 'quarter' || period === 'year';

  // ─── EXPORT EXCEL ───────────────────────────────────────────────
  const exportExcel = async () => {
    if (!reportData) return;

    const [txRes, debtRes] = await Promise.all([
      api.get<Transaction[]>('/transactions'),
      api.get<Debt[]>('/debts'),
    ]);

    const { start, end } = getDateRange();
    const txList = txRes.data.filter((tx) => {
      const d = dayjs(tx.transactionDate);
      return d.isAfter(start) && d.isBefore(end);
    });
    const debtList = debtRes.data;

    const wb = XLSX.utils.book_new();

    // ── SHEET 1: TỔNG KẾT TÀI CHÍNH ──────────────────────────────
    const ws1 = XLSX.utils.aoa_to_sheet([]);

    const s1Data = [
      [`BÁO CÁO TỔNG KẾT TÀI CHÍNH`, '', '', '', ''],
      ['Kỳ báo cáo:', getPeriodLabel(), '', '', ''],
      ['Ngày xuất:', dayjs().format('DD/MM/YYYY HH:mm'), '', '', ''],
      ['', '', '', '', ''],
      ['Hạng mục', 'Diễn giải', '', '', 'Giá trị (VNĐ)'],
      [
        '1. TỔNG THU',
        'Doanh thu bán hàng & dịch vụ',
        '',
        '',
        reportData.totalIncome,
      ],
      [
        '2. TỔNG CHI',
        'Chi phí vận hành & Marketing',
        '',
        '',
        reportData.totalExpense,
      ],
      [
        'LỢI NHUẬN TRƯỚC THUẾ',
        '(1) - (2)',
        '',
        '',
        reportData.profit,
      ],
    ];

    if (hasTax && reportData.tax) {
      s1Data.push([
        `Thuế TNDN (${formatPercent(reportData.tax.tndnRate)})`,
        'Ước tính thuế phải nộp',
        '',
        '',
        -reportData.tax.tndnAmount,
      ]);
      s1Data.push([
        `Thuế VAT (${formatPercent(reportData.tax.vatRate)})`,
        'Thuế giá trị gia tăng',
        '',
        '',
        -reportData.tax.vatAmount,
      ]);
      s1Data.push([
        'LỢI NHUẬN SAU THUẾ',
        'Lợi nhuận thực tế giữ lại',
        '',
        '',
        reportData.tax.incomeAfterTax,
      ]);
    }

    // Công nợ chưa thu
    const totalDebt = debtList
      .filter((d) => d.status !== 'PAID')
      .reduce((sum, d) => sum + Number(d.remainingAmount), 0);
    s1Data.push(['', '', '', '', '']);
    s1Data.push([
      'CÔNG NỢ CHƯA THU',
      'Tổng công nợ chưa thanh toán',
      '',
      '',
      totalDebt,
    ]);

    XLSX.utils.sheet_add_aoa(ws1, s1Data, { origin: 'A1' });

    // Merge title row A1:E1
    ws1['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
    ];

    // Column widths
    ws1['!cols'] = [
      { wch: 35 },
      { wch: 50 }, 
      { wch: 25 },
      { wch: 25 },
      { wch: 35 },
    ];

    // Styles
    const greenDark = '1A7341';
    const greenLight = 'E8F5E9';
    const blackHeader = '1C1C1C';
    const white = 'FFFFFF';

    const styleCell = (
      ws: XLSX.WorkSheet,
      addr: string,
      opts: {
        bold?: boolean;
        color?: string;
        bg?: string;
        align?: 'left' | 'center' | 'right';
        numFmt?: string;
        italic?: boolean;
        sz?: number;
      },
    ) => {
      if (!ws[addr]) ws[addr] = { v: '', t: 's' };
      ws[addr].s = {
        font: {
          bold: opts.bold,
          color: { rgb: opts.color ?? '000000' },
          italic: opts.italic,
          sz: opts.sz ?? 11,
          name: 'Arial',
        },
        fill: opts.bg
          ? { fgColor: { rgb: opts.bg }, patternType: 'solid' }
          : undefined,
        alignment: {
          horizontal: opts.align ?? 'left',
          vertical: 'center',
          wrapText: true,
        },
        numFmt: opts.numFmt,
        border: {
          top: { style: 'thin', color: { rgb: 'CCCCCC' } },
          bottom: { style: 'thin', color: { rgb: 'CCCCCC' } },
          left: { style: 'thin', color: { rgb: 'CCCCCC' } },
          right: { style: 'thin', color: { rgb: 'CCCCCC' } },
        },
      };
    };

    // Title row
    styleCell(ws1, 'A1', {
      bold: true,
      color: white,
      bg: greenDark,
      align: 'center',
      sz: 14,
    });

    // Header row (row 5)
    ['A5', 'B5', 'C5', 'D5', 'E5'].forEach((addr) =>
      styleCell(ws1, addr, {
        bold: true,
        color: white,
        bg: blackHeader,
        align: addr === 'E5' ? 'right' : 'left',
      }),
    );

    // Data rows
    const dataRowStart = 5;
    s1Data.slice(dataRowStart).forEach((row, i) => {
      const rowNum = dataRowStart + i + 1;
      const isSpecial =
        (row[0] as string).includes('LỢI NHUẬN') ||
        (row[0] as string).includes('TỔNG') ||
        (row[0] as string).includes('CÔNG NỢ');
      const isGreen = (row[0] as string).includes('SAU THUẾ');

      styleCell(ws1, `A${rowNum}`, {
        bold: isSpecial,
        color: isGreen ? greenDark : '1A1A2E',
        bg: isGreen ? greenLight : undefined,
      });
      styleCell(ws1, `B${rowNum}`, {
        italic: !isSpecial,
        color: '555555',
        bg: isGreen ? greenLight : undefined,
      });
      styleCell(ws1, `E${rowNum}`, {
        bold: isSpecial,
        color: isGreen ? greenDark : Number(row[4]) < 0 ? 'C0392B' : '27AE60',
        bg: isGreen ? greenDark : undefined,
        align: 'right',
        numFmt: '#,##0',
      });
      if (isGreen && ws1[`E${rowNum}`]) {
        ws1[`E${rowNum}`].s.font.color = { rgb: white };
        ws1[`E${rowNum}`].s.font.sz = 13;
      }
    });

    XLSX.utils.book_append_sheet(wb, ws1, 'Tổng kết TC');

    // ── SHEET 2: GIAO DỊCH CHI TIẾT ──────────────────────────────
    const ws2 = XLSX.utils.aoa_to_sheet([]);

    const s2Header = [
      ['DANH SÁCH GIAO DỊCH CHI TIẾT', '', '', '', '', '', '', ''],
      [
        'Ngày',
        'Loại',
        'Danh mục',
        'Nội dung',
        'Số tiền',
        'Người tạo',
        'Khách hàng',
        'SĐT',
      ],
    ];

    const s2Rows = txList.map((tx) => [
      dayjs(tx.transactionDate).format('DD/MM/YYYY'),
      tx.type === 'INCOME' ? 'THU' : 'CHI',
      tx.category?.name ?? '',
      tx.note ?? '',
      Number(tx.amount),
      tx.createdBy?.fullName ?? '',
      tx.customer?.name ?? '',
      tx.customer?.phone ?? '',
    ]);

    XLSX.utils.sheet_add_aoa(ws2, [...s2Header, ...s2Rows], { origin: 'A1' });

    ws2['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }];
    ws2['!cols'] = [
      { wch: 26 },  // Ngày
      { wch: 20 },  // Loại
      { wch: 30 },  // Danh mục
      { wch: 50 },  // Nội dung
      { wch: 32 },  // Số tiền
      { wch: 32 },  // Người tạo
      { wch: 35 },  // Khách hàng
      { wch: 26 },  // SĐT
    ];

    // Title
    styleCell(ws2, 'A1', {
      bold: true,
      color: white,
      bg: blackHeader,
      align: 'center',
      sz: 13,
    });

    // Header row 2
    ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].forEach((col) =>
      styleCell(ws2, `${col}2`, {
        bold: true,
        color: white,
        bg: '2C3E50',
        align: col === 'E' ? 'right' : 'left',
      }),
    );

    // Data rows
    s2Rows.forEach((row, i) => {
      const rowNum = i + 3;
      const isIncome = row[1] === 'THU';
      const bg = i % 2 === 0 ? 'F9F9F9' : 'FFFFFF';

      ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].forEach((col) => {
        const addr = `${col}${rowNum}`;
        styleCell(ws2, addr, {
          bg,
          color:
            col === 'B'
              ? isIncome
                ? '27AE60'
                : 'C0392B'
              : col === 'E'
                ? isIncome
                  ? '27AE60'
                  : 'C0392B'
                : '2C3E50',
          bold: col === 'B' || col === 'E',
          align: col === 'E' ? 'right' : 'left',
          numFmt: col === 'E' ? '#,##0' : undefined,
        });
      });
    });

    XLSX.utils.book_append_sheet(wb, ws2, 'Giao dịch');

    // ── SHEET 3: CÔNG NỢ ─────────────────────────────────────────
    const ws3 = XLSX.utils.aoa_to_sheet([]);

    const s3Header = [
      ['QUẢN LÝ CÔNG NỢ & TRẠNG THÁI', '', '', '', '', ''],
      [
        'Tên khách hàng',
        'SĐT',
        'Hạn thanh toán',
        'Số tiền còn lại',
        'Nợ quá hạn',
        'Trạng thái',
      ],
    ];

    const statusLabel: Record<string, string> = {
      UNPAID: 'CHỜ THANH TOÁN',
      PARTIAL: 'THANH TOÁN 1 PHẦN',
      PAID: 'ĐÃ THANH TOÁN',
    };

    const s3Rows = debtList.map((d) => {
      const isOverdue =
        d.dueDate && dayjs(d.dueDate).isBefore(dayjs()) && d.status !== 'PAID';
      const overdueDays = isOverdue
        ? dayjs().diff(dayjs(d.dueDate), 'day')
        : 0;
      return [
        d.customer?.name ?? '',
        d.customer?.phone ?? '',
        d.dueDate ? dayjs(d.dueDate).format('DD/MM/YYYY') : '—',
        Number(d.remainingAmount),
        isOverdue ? `Quá ${overdueDays} ngày` : '',
        statusLabel[d.status] ?? d.status,
      ];
    });

    XLSX.utils.sheet_add_aoa(ws3, [...s3Header, ...s3Rows], { origin: 'A1' });

    ws3['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }];
      ws3['!cols'] = [
        { wch: 38 },  // Tên KH
        { wch: 26 },  // SĐT
        { wch: 30 },  // Hạn TT
        { wch: 32 },  // Còn lại
        { wch: 28 },  // Quá hạn
        { wch: 34 },  // Trạng thái
      ];

    // Title
    styleCell(ws3, 'A1', {
      bold: true,
      color: white,
      bg: '1565C0',
      align: 'center',
      sz: 13,
    });

    // Header row
    ['A', 'B', 'C', 'D', 'E', 'F'].forEach((col) =>
      styleCell(ws3, `${col}2`, {
        bold: true,
        color: white,
        bg: '1976D2',
        align: col === 'D' ? 'right' : 'left',
      }),
    );

    // Data rows
    s3Rows.forEach((row, i) => {
      const rowNum = i + 3;
      const status = row[5] as string;
      const isOverdue = (row[4] as string).includes('Quá');
      const bg = i % 2 === 0 ? 'F5F9FF' : 'FFFFFF';

      ['A', 'B', 'C', 'D', 'E', 'F'].forEach((col) => {
        const addr = `${col}${rowNum}`;
        let color = '2C3E50';
        if (col === 'D') color = Number(row[3]) > 0 ? '27AE60' : '27AE60';
        if (col === 'E' && isOverdue) color = 'C0392B';
        if (col === 'F') {
          if (status === 'ĐÃ THANH TOÁN') color = '27AE60';
          else if (status === 'CHỜ THANH TOÁN') color = 'E67E22';
          else color = '2980B9';
        }

        styleCell(ws3, addr, {
          bg,
          color,
          bold: col === 'F',
          align: col === 'D' ? 'right' : 'left',
          numFmt: col === 'D' ? '#,##0' : undefined,
        });
      });
    });

    XLSX.utils.book_append_sheet(wb, ws3, 'Công nợ');

    // tạo password chỉ có thể read excel k thể sửa
    ws1['!protect'] = { password: 'phinud', selectLockedCells: true, selectUnlockedCells: true };
    ws2['!protect'] = { password: 'phinud', selectLockedCells: true, selectUnlockedCells: true };
    ws3['!protect'] = { password: 'phinud', selectLockedCells: true, selectUnlockedCells: true };

    // ── SAVE FILE ─────────────────────────────────────────────────
    const buf = XLSX.write(wb, {
      bookType: 'xlsx',
      type: 'array',
      cellStyles: true,
    }) as ArrayBuffer;
    saveAs(
      new Blob([buf], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }),
      `BaoCao_EIEMS_${getPeriodLabel().replace(/ /g, '_')}.xlsx`,
    );
  };

  const chartData = reportData
    ? [
        { name: 'Thu nhập', value: reportData.totalIncome, color: '#10b981' },
        { name: 'Chi tiêu', value: reportData.totalExpense, color: '#ef4444' },
        {
          name: 'Lợi nhuận',
          value: Math.max(reportData.profit, 0),
          color: '#6366f1',
        },
      ]
    : [];

  const taxColumns = [
    { title: 'Loại thuế', dataIndex: 'name', key: 'name' },
    { title: 'Thuế suất', dataIndex: 'rate', key: 'rate', width: 100 },
    { title: 'Cơ sở tính', dataIndex: 'base', key: 'base' },
    {
      title: 'Số tiền thuế',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right' as const,
      render: (amount: number) => (
        <Text strong style={{ color: '#ef4444' }}>
          {formatCurrency(amount)}
        </Text>
      ),
    },
  ];

  const taxTableData = reportData?.tax
    ? [
        {
          key: 'vat',
          name: 'Thuế GTGT (VAT)',
          rate: formatPercent(reportData.tax.vatRate),
          base: formatCurrency(reportData.tax.incomeBeforeTax),
          amount: reportData.tax.vatAmount,
        },
        {
          key: 'tndn',
          name: 'Thuế TNDN',
          rate: formatPercent(reportData.tax.tndnRate),
          base: formatCurrency(Math.max(reportData.profit, 0)),
          amount: reportData.tax.tndnAmount,
        },
      ]
    : [];

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
            Báo cáo Doanh thu
          </Title>
          <Text style={{ color: '#94a3b8', fontSize: 13 }}>
            {getPeriodLabel()}
          </Text>
        </div>
      </div>

      {/* Filters */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          marginBottom: 24,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <Select
          value={period}
          onChange={(val) => setPeriod(val)}
          style={{ width: 140 }}
          options={[
            { value: 'day', label: 'Theo ngày' },
            { value: 'month', label: 'Theo tháng' },
            { value: 'quarter', label: 'Theo quý' },
            { value: 'year', label: 'Theo năm' },
          ]}
        />

        {period === 'day' && (
          <DatePicker
            value={selectedDate}
            onChange={(date) => date && setSelectedDate(date)}
            format="DD/MM/YYYY"
            style={{ width: 160 }}
            disabledDate={(current) => current && current > dayjs().endOf('day')}
          />
        )}

        {period === 'month' && (
          <DatePicker
            picker="month"
            value={selectedDate}
            onChange={(date) => date && setSelectedDate(date)}
            format="MM/YYYY"
            style={{ width: 140 }}
          />
        )}

        {period === 'quarter' && (
          <div style={{ display: 'flex', gap: 8 }}>
            <Select
              value={selectedQuarter}
              onChange={(val) => setSelectedQuarter(val)}
              style={{ width: 110 }}
              options={[
                { value: 1, label: 'Quý 1' },
                { value: 2, label: 'Quý 2' },
                { value: 3, label: 'Quý 3' },
                { value: 4, label: 'Quý 4' },
              ]}
            />
            <DatePicker
              picker="year"
              value={selectedDate}
              onChange={(date) => date && setSelectedDate(date)}
              format="YYYY"
              style={{ width: 100 }}
            />
          </div>
        )}

        {period === 'year' && (
          <DatePicker
            picker="year"
            value={selectedDate}
            onChange={(date) => date && setSelectedDate(date)}
            format="YYYY"
            style={{ width: 100 }}
          />
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
          <Spin size="large" />
        </div>
      ) : reportData ? (
        <>
          {/* Stats Cards */}
          <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
            <Col xs={24} md={8}>
              <div
                style={{
                  background: 'white',
                  borderRadius: 12,
                  padding: '20px 24px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  borderLeft: '4px solid #10b981',
                }}
              >
                <Text style={{ color: '#94a3b8', fontSize: 13 }}>
                  Tổng thu nhập
                </Text>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: '#0f172a',
                    margin: '6px 0',
                  }}
                >
                  {formatCurrency(reportData.totalIncome)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <ArrowUpOutlined style={{ color: '#10b981', fontSize: 12 }} />
                  <Text style={{ color: '#10b981', fontSize: 13 }}>
                    Thu nhập kỳ này
                  </Text>
                </div>
              </div>
            </Col>

            <Col xs={24} md={8}>
              <div
                style={{
                  background: 'white',
                  borderRadius: 12,
                  padding: '20px 24px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  borderLeft: '4px solid #ef4444',
                }}
              >
                <Text style={{ color: '#94a3b8', fontSize: 13 }}>
                  Tổng chi tiêu
                </Text>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: '#0f172a',
                    margin: '6px 0',
                  }}
                >
                  {formatCurrency(reportData.totalExpense)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <ArrowDownOutlined
                    style={{ color: '#ef4444', fontSize: 12 }}
                  />
                  <Text style={{ color: '#ef4444', fontSize: 13 }}>
                    Chi tiêu kỳ này
                  </Text>
                </div>
              </div>
            </Col>

            <Col xs={24} md={8}>
              <div
                style={{
                  background:
                    reportData.profit >= 0
                      ? 'linear-gradient(135deg, #6366f1, #818cf8)'
                      : 'linear-gradient(135deg, #ef4444, #f87171)',
                  borderRadius: 12,
                  padding: '20px 24px',
                  boxShadow: '0 4px 12px rgba(99,102,241,0.25)',
                }}
              >
                <Text
                  style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}
                >
                  Lợi nhuận
                </Text>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: 'white',
                    margin: '6px 0',
                  }}
                >
                  {formatCurrency(reportData.profit)}
                </div>
                <Tag color={reportData.profit >= 0 ? 'success' : 'error'}>
                  {reportData.profit >= 0 ? 'Có lãi' : 'Lỗ'}
                </Tag>
              </div>
            </Col>
          </Row>

          {/* Chart */}
          <div
            style={{
              background: 'white',
              borderRadius: 12,
              padding: 24,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              marginBottom: 20,
            }}
          >
            <Title level={5} style={{ margin: '0 0 16px' }}>
              Biểu đồ thu chi
            </Title>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} barSize={56}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                  contentStyle={{
                    borderRadius: 8,
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
                <Bar dataKey="value" name="Số tiền" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Tax */}
          {hasTax && reportData.tax && (
            <div
              style={{
                background: 'white',
                borderRadius: 12,
                padding: 24,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                marginBottom: 20,
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
                  Thông tin thuế {getPeriodLabel()}
                </Title>
                <Tag color="orange">
                  VAT {formatPercent(reportData.tax.vatRate)} + TNDN{' '}
                  {formatPercent(reportData.tax.tndnRate)}
                </Tag>
              </div>

              <Table
                columns={taxColumns}
                dataSource={taxTableData}
                pagination={false}
                size="small"
                style={{ marginBottom: 16 }}
              />

              <Divider style={{ margin: '12px 0' }} />

              <Row gutter={16} style={{ marginBottom: 12 }}>
                <Col span={12}>
                  <div
                    style={{
                      background: '#f8fafc',
                      borderRadius: 8,
                      padding: '12px 16px',
                    }}
                  >
                    <Text style={{ color: '#94a3b8', fontSize: 13 }}>
                      Doanh thu trước thuế
                    </Text>
                    <div
                      style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}
                    >
                      {formatCurrency(reportData.tax.incomeBeforeTax)}
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div
                    style={{
                      background: '#fef2f2',
                      borderRadius: 8,
                      padding: '12px 16px',
                    }}
                  >
                    <Text style={{ color: '#94a3b8', fontSize: 13 }}>
                      Tổng thuế phải nộp
                    </Text>
                    <div
                      style={{ fontSize: 18, fontWeight: 700, color: '#ef4444' }}
                    >
                      {formatCurrency(reportData.tax.totalTax)}
                    </div>
                  </div>
                </Col>
              </Row>

              <div
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
                  borderRadius: 10,
                  padding: '16px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>
                  Doanh thu sau thuế
                </Text>
                <Text style={{ color: 'white', fontSize: 22, fontWeight: 800 }}>
                  {formatCurrency(reportData.tax.incomeAfterTax)}
                </Text>
              </div>
            </div>
          )}

          {/* Summary + Export */}
          <div
            style={{
              background: 'white',
              borderRadius: 12,
              padding: 24,
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
                Tổng kết {getPeriodLabel()}
              </Title>
              <Button
                type="primary"
                icon={<FileExcelOutlined />}
                style={{ background: '#16a34a', borderColor: '#16a34a' }}
                onClick={() => void exportExcel()}
              >
                Xuất Excel (3 Sheet)
              </Button>
            </div>

            {[
              {
                label: 'Tổng thu nhập',
                value: reportData.totalIncome,
                color: '#10b981',
              },
              {
                label: 'Tổng chi tiêu',
                value: reportData.totalExpense,
                color: '#ef4444',
              },
              {
                label: 'Lợi nhuận gộp',
                value: reportData.profit,
                color: reportData.profit >= 0 ? '#6366f1' : '#ef4444',
              },
              ...(hasTax && reportData.tax
                ? [
                    {
                      label: `Thuế VAT (${formatPercent(reportData.tax.vatRate)})`,
                      value: -reportData.tax.vatAmount,
                      color: '#f59e0b',
                    },
                    {
                      label: `Thuế TNDN (${formatPercent(reportData.tax.tndnRate)})`,
                      value: -reportData.tax.tndnAmount,
                      color: '#f59e0b',
                    },
                    {
                      label: 'Doanh thu sau thuế',
                      value: reportData.tax.incomeAfterTax,
                      color: '#6366f1',
                    },
                  ]
                : []),
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 0',
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <Text style={{ color: '#64748b' }}>{item.label}</Text>
                <Text strong style={{ color: item.color, fontSize: 15 }}>
                  {formatCurrency(item.value)}
                </Text>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: 80, color: '#94a3b8' }}>
          Không có dữ liệu cho kỳ này
        </div>
      )}
    </div>
  );
}