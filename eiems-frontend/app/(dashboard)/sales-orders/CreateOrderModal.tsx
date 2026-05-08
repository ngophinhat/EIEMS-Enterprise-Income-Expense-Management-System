'use client';

import React, { useEffect, useState, useRef, ReactNode } from 'react';
import {
  Modal, Form, Input, InputNumber, Select,
  Button, Space, Divider, Typography,
  DatePicker, Row, Col, Alert, message, Spin, Tag,
} from 'antd';

import { salesOrderApi, cakeProductApi, customerApi } from '@/lib/axios';
import {
  CakeProduct, CakeCategory, CakeShape, CakeSize, AgeGroup,
  CAKE_CATEGORY_LABEL, CAKE_SHAPE_LABEL, CAKE_SIZE_LABEL, AGE_GROUP_LABEL,
} from '@/types';

const { Option } = Select;
const { Text } = Typography;

interface Customer {
  [x: string]: ReactNode; id: string; name: string; phone: string; address: string;
}

interface FormValues {
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  cakeProductId?: string;
  cakeName: string;
  quantity?: number;
  basePrice?: number;
  surcharge?: number;
  addonPrice?: number;
  addonNote?: string;
  deliveryTime?: { toISOString: () => string };
  note?: string;
  imageUrl?: string;
}

interface Props { open: boolean; onClose: () => void; onSuccess: () => void; }

// ─── Button group selector ────────────────────────────────────────────────────
function ButtonGroup<T extends string>({
  label, options, value, onChange,
}: {
  label: string;
  options: Record<T, string>;
  value: T | null;
  onChange: (v: T) => void;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 13, color: '#666', marginBottom: 6 }}>{label}</div>
      <Space wrap>
        {(Object.entries(options) as [T, string][]).map(([k, v]) => (
          <Button
            key={k}
            size="small"
            type={value === k ? 'primary' : 'default'}
            style={{
              borderRadius: 20,
              borderColor: value === k ? '#1a1a2e' : '#d9d9d9',
              background: value === k ? '#1a1a2e' : '#fff',
              color: value === k ? '#fff' : '#333',
              fontWeight: value === k ? 600 : 400,
            }}
            onClick={() => onChange(k)}
          >
            {v}
          </Button>
        ))}
      </Space>
    </div>
  );
}

export default function CreateOrderModal({ open, onClose, onSuccess }: Props) {
  const [form] = Form.useForm<FormValues>();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<CakeProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<CakeProduct[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CakeCategory | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<CakeProduct | null>(null);
  const [calculatedPrice, setCalculatedPrice] = useState<number>(0);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Birthday selectors
  const [bdShape, setBdShape] = useState<CakeShape | null>(null);
  const [bdSize, setBdSize] = useState<CakeSize | null>(null);
  const [bdAge, setBdAge] = useState<AgeGroup | null>(null);

  const productsRef = useRef<CakeProduct[]>([]);
  productsRef.current = products;

  useEffect(() => {
    if (open) {
      cakeProductApi.getAll().then((r) => setProducts(r.data)).catch(() => {});
      customerApi.getAll().then((r) => setCustomers(r.data)).catch(() => {});
    }
  }, [open]);

  // Reset birthday selectors when category changes
  useEffect(() => {
    setBdShape(null);
    setBdSize(null);
    setBdAge(null);
    setSelectedProduct(null);
    setCalculatedPrice(0);

    if (selectedCategory) {
      setFilteredProducts(productsRef.current.filter((p) => p.category === selectedCategory));
    } else {
      setFilteredProducts([]);
    }
    if (open) form.setFieldsValue({ cakeProductId: undefined });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, open]);

  // Auto-select birthday product when all 3 criteria selected
  useEffect(() => {
    if (selectedCategory !== 'BIRTHDAY' || !bdShape || !bdSize || !bdAge) return;

    const match = productsRef.current.find(
      (p) =>
        p.category === 'BIRTHDAY' &&
        p.shape === bdShape &&
        p.size === bdSize &&
        p.ageGroup === bdAge,
    );

    if (match) {
      setSelectedProduct(match);
      form.setFieldsValue({ cakeProductId: match.id });
      const price = match.prices.length > 0 ? Number(match.prices[0].price) : 0;
      setCalculatedPrice(price);
      form.setFieldsValue({ basePrice: price });
      recalcTotal(price);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bdShape, bdSize, bdAge, selectedCategory]);

  const handleProductSelect = (productId: string) => {
    const product = productsRef.current.find((p) => p.id === productId);
    setSelectedProduct(product ?? null);

    if (product && !product.isPriceManual && product.prices.length > 0) {
      const price = Number(product.prices[0].price);
      setCalculatedPrice(price);
      form.setFieldsValue({ basePrice: price });
      recalcTotal(price);
    } else {
      setCalculatedPrice(0);
      form.setFieldsValue({ basePrice: undefined });
    }
  };

  const recalcTotal = (base?: number, surcharge?: number, addon?: number, qty?: number) => {
    const b = base ?? (form.getFieldValue('basePrice') as number) ?? 0;
    const s = surcharge ?? (form.getFieldValue('surcharge') as number) ?? 0;
    const a = addon ?? (form.getFieldValue('addonPrice') as number) ?? 0;
    const q = qty ?? (form.getFieldValue('quantity') as number) ?? 1;
    setTotalPrice((b + s + a) * q);
  };

  const handleCustomerSelect = (customerId: string) => {
    const c = customers.find((cu) => cu.id === customerId);
    if (c) form.setFieldsValue({ 
      customerName: c.name, 
      customerPhone: c.phone,
      customerAddress: c.address,
    });
  };

  const handleSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      await salesOrderApi.create({
        ...values,
        deliveryTime: values.deliveryTime?.toISOString(),
        ...(isBirthday && {
          shape: bdShape,
          size: bdSize,
          ageGroup: bdAge,
        }),
      });
      void message.success('Tạo đơn hàng thành công! 🎂');
      form.resetFields();
      setSelectedCategory(null);
      setSelectedProduct(null);
      setCalculatedPrice(0);
      setTotalPrice(0);
      setBdShape(null);
      setBdSize(null);
      setBdAge(null);
      onSuccess();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      void message.error(e.response?.data?.message ?? 'Lỗi tạo đơn');
    } finally {
      setLoading(false);
    }
  };

  const isBirthday = selectedCategory === 'BIRTHDAY';
  const isManual = selectedProduct?.isPriceManual;

  const filterCustomerOption = (input: string, option: { children?: React.ReactNode } | undefined) =>
    String(option?.children ?? '').toLowerCase().includes(input.toLowerCase());

  // Giá sinh nhật preview theo shape đã chọn
  const bdPriceHint: Record<string, Record<string, number>> = {
    SQUARE: { SIZE_16: 180000, SIZE_20: 200000, SIZE_24: 220000 },
    ROUND:  { SIZE_16: 140000, SIZE_20: 160000, SIZE_24: 180000 },
    HEART:  { SIZE_16: 140000, SIZE_20: 160000, SIZE_24: 180000 },
  };

  return (
    <Modal
      title="🎂 Tạo phiếu bán hàng"
      open={open}
      onCancel={onClose}
      footer={null}
      width={680}
      destroyOnHidden
    >
      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ quantity: 1, surcharge: 0, addonPrice: 0 }}
        >
          {/* ── Khách hàng ── */}
          <Divider orientationMargin={0} style={{ fontSize: 13 }}>👤 Khách hàng</Divider>
          <Row gutter={12}>
            <Col span={24}>
              <Form.Item label="Tìm khách cũ (tuỳ chọn)" name="customerId">
                <Select
                  showSearch allowClear
                  placeholder="Tìm theo tên hoặc SĐT..."
                  filterOption={filterCustomerOption}
                  onChange={handleCustomerSelect}
                  style={{ width: '100%' }}
                >
                  {customers.map((c) => (
                    <Option key={c.id} value={c.id}>{c.name} — {c.phone} - {c.address}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="customerName" label="Tên khách hàng"
                rules={[{ required: true, message: 'Nhập tên khách' }]}>
                <Input placeholder="Nguyễn Văn A" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="customerPhone" label="Số điện thoại"
                rules={[{ required: true, message: 'Nhập SĐT' }]}>
                <Input placeholder="0123456789" />
              </Form.Item>
            </Col>
            <Col span ={24}>
              <Form.Item name="customerAddress" label="Địa chỉ"
                rules={[{ required: true, message: 'Nhập địa chỉ' }]}>
                <Input placeholder="123 Đường ABC, Quận XYZ" />
              </Form.Item>
            </Col>
          </Row>

          {/* ── Thông tin bánh ── */}
          <Divider orientationMargin={0} style={{ fontSize: 13 }}>🎂 Thông tin bánh</Divider>

          {/* Loại bánh */}
          <Form.Item label="Loại bánh" required>
            <Select
              placeholder="Chọn loại bánh"
              onChange={(v: CakeCategory) => setSelectedCategory(v)}
              allowClear onClear={() => setSelectedCategory(null)}
              style={{ width: '100%' }}
            >
              {Object.entries(CAKE_CATEGORY_LABEL).map(([k, v]) => (
                <Option key={k} value={k}>{v}</Option>
              ))}
            </Select>
          </Form.Item>

          {/* Birthday: button group selectors */}
          {isBirthday && (
            <div style={{
              background: '#f8f9ff',
              border: '1px solid #e8eaff',
              borderRadius: 12,
              padding: '16px 16px 8px',
              marginBottom: 16,
            }}>
              <ButtonGroup<CakeShape>
                label="🔷 Hình dạng"
                options={CAKE_SHAPE_LABEL}
                value={bdShape}
                onChange={setBdShape}
              />
              <ButtonGroup<CakeSize>
                label="📏 Kích cỡ"
                options={CAKE_SIZE_LABEL}
                value={bdSize}
                onChange={setBdSize}
              />
              <ButtonGroup<AgeGroup>
                label="👤 Đối tượng"
                options={AGE_GROUP_LABEL}
                value={bdAge}
                onChange={setBdAge}
              />

              {/* Price preview */}
              {bdShape && bdSize && (
                <div style={{ marginTop: 4, marginBottom: 8 }}>
                  <Tag color="green" style={{ fontSize: 13 }}>
                    💰 Giá: {(bdPriceHint[bdShape]?.[bdSize] ?? 0).toLocaleString('vi-VN')}đ
                  </Tag>
                </div>
              )}

              {/* Selected summary */}
              {bdShape && bdSize && bdAge && selectedProduct && (
                <Alert
                  type="info"
                  title={
                    <Text style={{ fontSize: 12 }}>
                      ✅ Đã chọn: <strong>{selectedProduct.name}</strong>
                    </Text>
                  }
                  style={{ marginTop: 4 }}
                />
              )}
              {bdShape && bdSize && bdAge && !selectedProduct && (
                <Alert
                  type="warning"
                  title={
                    <Text style={{ fontSize: 12 }}>
                      ⚠️ Không tìm thấy sản phẩm phù hợp
                    </Text>
                  }
                  style={{ marginTop: 4 }}
                />
              )}
            </div>
          )}

          {/* Non-birthday: dropdown chọn sản phẩm */}
          {!isBirthday && selectedCategory && (
            <Form.Item name="cakeProductId" label="Chọn sản phẩm">
              <Select
                placeholder="Chọn sản phẩm..."
                onChange={handleProductSelect}
                allowClear
              >
                {filteredProducts.map((p) => (
                  <Option key={p.id} value={p.id}>
                    {p.name}
                    {!p.isPriceManual && p.prices[0] && (
                      <span style={{ color: '#52c41a', marginLeft: 8 }}>
                        {Number(p.prices[0].price).toLocaleString('vi-VN')}đ
                      </span>
                    )}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}
          <Form.Item name="cakeProductId" hidden><Input /></Form.Item>

          <Form.Item name="cakeName" label="Mô tả bánh">
            <Input.TextArea
              rows={2}
              placeholder={isBirthday
                ? 'VD: màu xanh pastel, viết tên An, hoa hồng...'
                : 'Mô tả chi tiết bánh...'}
            />
          </Form.Item>

          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="quantity" label="Số lượng">
                <InputNumber
                  min={1} style={{ width: '100%' }}
                  onChange={(v) => recalcTotal(undefined, undefined, undefined, Number(v) || 1)}
                />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item name="deliveryTime" label="Giờ giao (mặc định +2h)">
                <DatePicker
                  showTime format="DD/MM/YYYY HH:mm"
                  style={{ width: '100%' }} placeholder="Mặc định +2h"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* ── Giá ── */}
          <Divider orientationMargin={0} style={{ fontSize: 13 }}>💰 Giá</Divider>
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item
                name="basePrice"
                label={isManual ? 'Giá bánh' : 'Giá cơ bản'}
                rules={isManual ? [{ required: true, message: 'Nhập giá' }] : []}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={(v) => `${v ?? ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  disabled={!isManual && calculatedPrice > 0}
                  placeholder={isManual ? 'Nhập giá...' : ''}
                  addonAfter="đ"
                  onChange={(v) => recalcTotal(Number(v) || 0)}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="surcharge" label="Phụ thu NVL">
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={(v) => `${v ?? ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  addonAfter="đ"
                  onChange={(v) => recalcTotal(undefined, Number(v) || 0)}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="addonPrice" label="Phụ kiện">
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={(v) => `${v ?? ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  addonAfter="đ"
                  onChange={(v) => recalcTotal(undefined, undefined, Number(v) || 0)}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="addonNote" label="Ghi chú phụ kiện">
            <Input placeholder="VD: Hộp 15k, nến 5k, topper 20k..." />
          </Form.Item>

          {totalPrice > 0 && (
            <Alert
              type="success"
              message={
                <Space>
                  <span>Tổng tiền ước tính:</span>
                  <Text strong style={{ fontSize: 18, color: '#52c41a' }}>
                    {totalPrice.toLocaleString('vi-VN')}đ
                  </Text>
                </Space>
              }
              style={{ marginBottom: 16 }}
            />
          )}

          {/* ── Ghi chú ── */}
          <Row gutter={12}>
            <Col span={24}>
              <Form.Item name="note" label="Yêu cầu đặc biệt">
                <Input.TextArea rows={2} placeholder="Dị ứng, yêu cầu riêng của khách..." />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="imageUrl" label="Link hình mẫu (URL)">
                <Input placeholder="https://... hoặc link drive ảnh khách gửi" />
              </Form.Item>
            </Col>
          </Row>

          <Divider />
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={onClose}>Hủy</Button>
            <Button
              type="primary" htmlType="submit"
              style={{ background: '#1a1a2e' }}
              loading={loading}
            >
              Tạo đơn hàng
            </Button>
          </Space>
        </Form>
      </Spin>
    </Modal>
  );
}