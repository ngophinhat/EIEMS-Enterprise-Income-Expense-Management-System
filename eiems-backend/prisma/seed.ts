import {
  PrismaClient,
  CakeCategory,
  CakeShape,
  CakeSize,
  AgeGroup,
  Role,
  CategoryType,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  TransactionType,
  DebtStatus,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const makeDate = (year: number, month: number, day: number, hour = 8) =>
  new Date(year, month - 1, day, hour, 0, 0, 0);

// ─── USERS ────────────────────────────────────────────────────────────────────
async function seedUsers() {
  console.log('👤 Seeding users...');
  const password = await bcrypt.hash('123456', 10);
  const users = [
    {
      fullName: 'Nguyễn Thị Chủ',
      email: 'owner@tiembanh.vn',
      password,
      role: Role.OWNER,
    },
    {
      fullName: 'Trần Văn Admin',
      email: 'admin@tiembanh.vn',
      password,
      role: Role.ADMIN,
    },
    {
      fullName: 'Lê Thị Kế Toán',
      email: 'ketoan@tiembanh.vn',
      password,
      role: Role.ACCOUNTANT,
    },
    {
      fullName: 'Phạm Thị Nhân Viên',
      email: 'nhanvien1@tiembanh.vn',
      password,
      role: Role.STAFF,
    },
    {
      fullName: 'Võ Văn Nhân Viên',
      email: 'nhanvien2@tiembanh.vn',
      password,
      role: Role.STAFF,
    },
  ];
  for (const u of users)
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: u,
    });
  console.log(`  ✅ ${users.length} users`);
}

// ─── CUSTOMERS ────────────────────────────────────────────────────────────────
async function seedCustomers() {
  console.log('👥 Seeding customers...');
  const customers = [
    {
      name: 'Nguyễn Thị Lan',
      phone: '0901234501',
      address: '12 Lê Lợi, Q.1, TP.HCM',
    },
    {
      name: 'Trần Thị Hoa',
      phone: '0901234502',
      address: '45 Nguyễn Huệ, Q.1, TP.HCM',
    },
    {
      name: 'Lê Văn Bình',
      phone: '0901234503',
      address: '78 Hai Bà Trưng, Q.3, TP.HCM',
    },
    {
      name: 'Phạm Thị Mai',
      phone: '0901234504',
      address: '23 Điện Biên Phủ, Q.Bình Thạnh',
    },
    {
      name: 'Võ Thị Thanh',
      phone: '0901234505',
      address: '56 Cách Mạng Tháng 8, Q.10',
    },
    {
      name: 'Hoàng Văn Tú',
      phone: '0901234506',
      address: '90 Lý Thường Kiệt, Q.11',
    },
    {
      name: 'Ngô Thị Hương',
      phone: '0901234507',
      address: '34 Phan Đình Phùng, Q.Phú Nhuận',
    },
    {
      name: 'Đặng Văn Khoa',
      phone: '0901234508',
      address: '67 Võ Thị Sáu, Q.3',
    },
    {
      name: 'Bùi Thị Ngọc',
      phone: '0901234509',
      address: '11 Trần Hưng Đạo, Q.5',
    },
    {
      name: 'Đinh Văn Hùng',
      phone: '0901234510',
      address: '88 Nguyễn Trãi, Q.5',
    },
    {
      name: 'Lý Thị Kim Anh',
      phone: '0901234511',
      address: '15 Bùi Thị Xuân, Q.1',
    },
    {
      name: 'Phan Văn Đức',
      phone: '0901234512',
      address: '42 Lê Văn Sỹ, Q.Tân Bình',
    },
    {
      name: 'Huỳnh Thị Tuyết',
      phone: '0901234513',
      address: '28 Hoàng Diệu, Q.4',
    },
    {
      name: 'Dương Văn Minh',
      phone: '0901234514',
      address: '73 Nguyễn Đình Chiểu, Q.3',
    },
    {
      name: 'Cao Thị Linh',
      phone: '0901234515',
      address: '19 Trường Chinh, Q.Tân Bình',
    },
    {
      name: 'Trịnh Thị Nga',
      phone: '0901234516',
      address: '50 Nguyễn Văn Cừ, Q.5',
    },
    {
      name: 'Mai Văn Phong',
      phone: '0901234517',
      address: '33 Lê Hồng Phong, Q.10',
    },
    { name: 'Vũ Thị Thu', phone: '0901234518', address: '22 Trần Phú, Q.5' },
    { name: 'Tống Văn Long', phone: '0901234519', address: '77 Bà Hạt, Q.10' },
    {
      name: 'Kiều Thị Hằng',
      phone: '0901234520',
      address: '14 Nguyễn Chí Thanh, Q.11',
    },
  ];
  for (const c of customers)
    await prisma.customer.upsert({
      where: { phone: c.phone },
      update: {},
      create: c,
    });
  console.log(`  ✅ ${customers.length} customers`);
}

// ─── CATEGORIES ───────────────────────────────────────────────────────────────
async function seedCategories() {
  console.log('📂 Seeding categories...');
  const categories: { name: string; type: CategoryType; isSystem: boolean }[] =
    [
      { name: 'Sinh nhật rau câu', type: CategoryType.INCOME, isSystem: true },
      { name: 'Bánh bò', type: CategoryType.INCOME, isSystem: true },
      { name: 'Bánh ăn', type: CategoryType.INCOME, isSystem: true },
      { name: 'Cúng ông Táo', type: CategoryType.INCOME, isSystem: true },
      { name: 'Tết', type: CategoryType.INCOME, isSystem: true },
      { name: 'Lễ', type: CategoryType.INCOME, isSystem: true },
      { name: 'Thôi nôi', type: CategoryType.INCOME, isSystem: true },
      { name: 'Plan', type: CategoryType.INCOME, isSystem: true },
      { name: 'Dừa', type: CategoryType.EXPENSE, isSystem: false },
      { name: 'Bí', type: CategoryType.EXPENSE, isSystem: false },
      { name: 'Nhãn', type: CategoryType.EXPENSE, isSystem: false },
      { name: 'Trứng', type: CategoryType.EXPENSE, isSystem: false },
      { name: 'Đường', type: CategoryType.EXPENSE, isSystem: false },
      { name: 'Sữa', type: CategoryType.EXPENSE, isSystem: false },
      { name: 'Màu', type: CategoryType.EXPENSE, isSystem: false },
      { name: 'Gas', type: CategoryType.EXPENSE, isSystem: false },
      { name: 'RCT', type: CategoryType.EXPENSE, isSystem: false },
      { name: 'ST', type: CategoryType.EXPENSE, isSystem: false },
      { name: 'Hộp', type: CategoryType.EXPENSE, isSystem: false },
      { name: 'Trang trí / Nến', type: CategoryType.EXPENSE, isSystem: false },
      { name: 'PK (Phụ kiện)', type: CategoryType.EXPENSE, isSystem: false },
      { name: 'Ship', type: CategoryType.EXPENSE, isSystem: false },
      { name: 'Lương nhân viên', type: CategoryType.EXPENSE, isSystem: false },
      { name: 'Điện nước', type: CategoryType.EXPENSE, isSystem: false },
    ];
  for (const cat of categories)
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  console.log(`  ✅ ${categories.length} categories`);
}

// ─── CAKE PRODUCTS ────────────────────────────────────────────────────────────
async function seedCakeProducts() {
  console.log('🎂 Seeding cake products...');
  await prisma.cakePrice.deleteMany();
  await prisma.cakeProduct.deleteMany();

  const birthdayPrices: Record<string, Record<string, number>> = {
    SQUARE: { SIZE_16: 180000, SIZE_20: 200000, SIZE_24: 220000 },
    ROUND: { SIZE_16: 140000, SIZE_20: 160000, SIZE_24: 180000 },
    HEART: { SIZE_16: 140000, SIZE_20: 160000, SIZE_24: 180000 },
  };
  const shapeLabel: Record<string, string> = {
    ROUND: 'Tròn',
    HEART: 'Tim',
    SQUARE: 'Vuông',
  };
  const sizeLabel: Record<string, string> = {
    SIZE_16: 'Size 16',
    SIZE_20: 'Size 20',
    SIZE_24: 'Size 24',
  };
  const ageLabel: Record<string, string> = {
    CHILD: 'Trẻ con',
    ADULT: 'Người lớn',
    ELDERLY: 'Người cao tuổi',
  };

  let bdCount = 0;
  for (const shape of [CakeShape.ROUND, CakeShape.HEART, CakeShape.SQUARE])
    for (const size of [CakeSize.SIZE_16, CakeSize.SIZE_20, CakeSize.SIZE_24])
      for (const ageGroup of [
        AgeGroup.CHILD,
        AgeGroup.ADULT,
        AgeGroup.ELDERLY,
      ]) {
        await prisma.cakeProduct.create({
          data: {
            category: CakeCategory.BIRTHDAY,
            name: `Sinh nhật rau câu ${shapeLabel[shape]} ${sizeLabel[size]} - ${ageLabel[ageGroup]}`,
            shape,
            size,
            ageGroup,
            isPriceManual: false,
            isActive: true,
            prices: {
              create: [{ shape, size, price: birthdayPrices[shape][size] }],
            },
          },
        });
        bdCount++;
      }

  for (const [sn, p, d] of [
    [1, 90000, 'Set cúng ông Táo cơ bản'],
    [2, 110000, 'Set cúng ông Táo đầy đủ'],
  ] as [number, number, string][])
    await prisma.cakeProduct.create({
      data: {
        category: CakeCategory.ONG_TAO,
        name: `Cúng ông Táo - Set ${sn}`,
        setNumber: sn,
        isPriceManual: false,
        isActive: true,
        description: d,
        prices: { create: [{ price: p }] },
      },
    });
  for (const [sn, p, d] of [
    [1, 85000, 'Set bánh Tết cơ bản'],
    [2, 95000, 'Set bánh Tết đầy đủ'],
  ] as [number, number, string][])
    await prisma.cakeProduct.create({
      data: {
        category: CakeCategory.TET,
        name: `Tết - Set ${sn}`,
        setNumber: sn,
        isPriceManual: false,
        isActive: true,
        description: d,
        prices: { create: [{ price: p }] },
      },
    });
  for (const [sn, p, d] of [
    [1, 130000, 'Bánh sinh nhật rau câu dùng cho lễ'],
    [2, 75000, 'Set bánh lễ nhỏ'],
  ] as [number, number, string][])
    await prisma.cakeProduct.create({
      data: {
        category: CakeCategory.LE,
        name: `Lễ - Set ${sn}`,
        setNumber: sn,
        isPriceManual: false,
        isActive: true,
        description: d,
        prices: { create: [{ price: p }] },
      },
    });
  await prisma.cakeProduct.create({
    data: {
      category: CakeCategory.THOI_NOI,
      name: 'Thôi nôi - 12 cái',
      setNumber: 1,
      setQuantity: 12,
      isPriceManual: false,
      isActive: true,
      description: 'Set bánh thôi nôi 12 cái',
      prices: { create: [{ price: 85000 }] },
    },
  });
  await prisma.cakeProduct.create({
    data: {
      category: CakeCategory.PLAN,
      name: 'Plan - 10 cái',
      setNumber: 1,
      setQuantity: 10,
      isPriceManual: false,
      isActive: true,
      description: 'Set bánh plan 10 cái',
      prices: { create: [{ price: 70000 }] },
    },
  });
  await prisma.cakeProduct.create({
    data: {
      category: CakeCategory.BANH_BO,
      name: 'Bánh bò',
      isPriceManual: false,
      isActive: true,
      description: 'theo cái',
      prices: { create: [{ price: 70000 }] },
    },
  });
  for (const [n, p] of [
    ['Bánh ăn loại 1', 50000],
    ['Bánh ăn loại 2', 60000],
    ['Bánh ăn loại 3', 70000],
  ] as [string, number][])
    await prisma.cakeProduct.create({
      data: {
        category: CakeCategory.BANH_AN,
        name: n,
        isPriceManual: false,
        isActive: true,
        description: 'Giá tính theo cái',
        prices: { create: [{ price: p }] },
      },
    });

  console.log(
    `  ✅ Sinh nhật: ${bdCount} | Tổng: ${await prisma.cakeProduct.count()} sản phẩm`,
  );
}

// ─── SEED DATA ────────────────────────────────────────────────────────────────
//
// MỤC TIÊU MỖI THÁNG:
//   Thu:   ~23,000,000đ/tháng (tổng 2025: ~280,000,000đ)
//   Chi:   160,400,000đ (cả năm, giữ nguyên)
//   Lãi:   ~119,600,000đ  ✅ Thu > Chi
//
// Thay đổi so với version cũ:
//   - Tăng qty sinh nhật từ 3 → 5 cái/đơn cho toàn bộ năm 2025
//   - Chi tiêu KHÔNG thay đổi
//   - Năm 2026 giữ nguyên qty gốc (qty: 3)
//
async function seedYearData() {
  console.log('📊 Seeding data 2025 + 2026...');

  const ketoan = await prisma.user.findUnique({
    where: { email: 'ketoan@tiembanh.vn' },
  });
  const nhanvien1 = await prisma.user.findUnique({
    where: { email: 'nhanvien1@tiembanh.vn' },
  });
  const nhanvien2 = await prisma.user.findUnique({
    where: { email: 'nhanvien2@tiembanh.vn' },
  });
  const customers = await prisma.customer.findMany();

  const getCat = async (name: string) =>
    (await prisma.category.findFirst({ where: { name } }))!;
  const catSinhNhat = await getCat('Sinh nhật rau câu');
  const catBanhBo = await getCat('Bánh bò');
  const catBanhAn = await getCat('Bánh ăn');
  const catThoiNoi = await getCat('Thôi nôi');
  const catTet = await getCat('Tết');
  const catLe = await getCat('Lễ');
  const catOngTao = await getCat('Cúng ông Táo');
  const catPlan = await getCat('Plan');
  const catDua = await getCat('Dừa');
  const catTrung = await getCat('Trứng');
  const catDuong = await getCat('Đường');
  const catSua = await getCat('Sữa');
  const catGas = await getCat('Gas');
  const catRCT = await getCat('RCT');
  const catHop = await getCat('Hộp');
  const catMau = await getCat('Màu');
  const catTrangTri = await getCat('Trang trí / Nến');
  const catPK = await getCat('PK (Phụ kiện)');
  const catShip = await getCat('Ship');
  const catLuong = await getCat('Lương nhân viên');
  const catDienNuoc = await getCat('Điện nước');

  const c = (phone: string) => customers.find((cu) => cu.phone === phone)!;
  const nv1 = nhanvien1!;
  const nv2 = nhanvien2!;
  const kt = ketoan!;
  let orderCount = 0;

  // ─── Helper: tạo đơn PAID ─────────────────────────────────────────────────
  async function paid(opts: {
    y: number;
    m: number;
    d: number;
    cu: (typeof customers)[0];
    cake: string;
    price: number;
    qty?: number;
    sur?: number;
    method: PaymentMethod;
    nv: typeof nv1;
    cat: typeof catSinhNhat;
    note?: string;
  }) {
    orderCount++;
    const code = `DH${String(orderCount).padStart(4, '0')}`;
    const oTime = makeDate(opts.y, opts.m, opts.d, 8);
    const dTime = makeDate(opts.y, opts.m, opts.d, 14);
    const dDate = new Date(opts.y, opts.m - 1, opts.d);
    const qty = opts.qty ?? 1;
    const sur = opts.sur ?? 0;
    const total = opts.price * qty + sur;

    const tx = await prisma.transaction.create({
      data: {
        type: TransactionType.INCOME,
        amount: total,
        note: `Thu tiền đơn ${code} - KH: ${opts.cu.name}`,
        transactionDate: dTime,
        categoryId: opts.cat.id,
        createdById: kt.id,
        customerId: opts.cu.id,
      },
    });
    await prisma.transactionLog.create({
      data: {
        action: 'CREATE',
        note: `Tự động từ đơn ${code}`,
        transactionId: tx.id,
        performedById: kt.id,
      },
    });
    await prisma.salesOrder.create({
      data: {
        orderCode: code,
        customerName: opts.cu.name,
        customerPhone: opts.cu.phone,
        customerId: opts.cu.id,
        cakeName: opts.cake,
        quantity: qty,
        basePrice: opts.price,
        surcharge: sur,
        addonPrice: 0,
        totalPrice: total,
        orderTime: oTime,
        deliveryTime: dTime,
        deliveryDate: dDate,
        note: opts.note ?? null,
        createdById: opts.nv.id,
        orderStatus: OrderStatus.DELIVERED,
        paymentStatus: PaymentStatus.PAID,
        paymentMethod: opts.method,
        confirmedById: kt.id,
        confirmedAt: dTime,
        transactionId: tx.id,
      },
    });
    return total;
  }

  // ─── Helper: tạo đơn DEBT ─────────────────────────────────────────────────
  async function debt(opts: {
    y: number;
    m: number;
    d: number;
    cu: (typeof customers)[0];
    cake: string;
    price: number;
    nv: typeof nv1;
    paidAmt: number;
    status: DebtStatus;
    note?: string;
  }) {
    orderCount++;
    const code = `DH${String(orderCount).padStart(4, '0')}`;
    const oTime = makeDate(opts.y, opts.m, opts.d, 8);
    const dTime = makeDate(opts.y, opts.m, opts.d, 14);
    const dDate = new Date(opts.y, opts.m - 1, opts.d);
    const due = new Date(opts.y, opts.m - 1, opts.d + 14);
    const dbRec = await prisma.debt.create({
      data: {
        totalAmount: opts.price,
        remainingAmount: opts.price - opts.paidAmt,
        status: opts.status,
        note: `Công nợ từ đơn ${code}`,
        customerId: opts.cu.id,
        dueDate: due,
      },
    });
    if (opts.paidAmt > 0)
      await prisma.debtPayment.create({
        data: {
          amount: opts.paidAmt,
          paymentDate: new Date(opts.y, opts.m - 1, opts.d + 7),
          note: opts.status === DebtStatus.PAID ? 'Trả hết nợ' : 'Trả một phần',
          debtId: dbRec.id,
          receivedById: kt.id,
        },
      });
    await prisma.salesOrder.create({
      data: {
        orderCode: code,
        customerName: opts.cu.name,
        customerPhone: opts.cu.phone,
        customerId: opts.cu.id,
        cakeName: opts.cake,
        quantity: 1,
        basePrice: opts.price,
        surcharge: 0,
        addonPrice: 0,
        totalPrice: opts.price,
        orderTime: oTime,
        deliveryTime: dTime,
        deliveryDate: dDate,
        note: opts.note ?? null,
        createdById: opts.nv.id,
        orderStatus: OrderStatus.DELIVERED,
        paymentStatus: PaymentStatus.DEBT,
        debtId: dbRec.id,
      },
    });
  }

  // ─── Helper: tạo chi phí ──────────────────────────────────────────────────
  async function expense(
    y: number,
    m: number,
    d: number,
    cat: typeof catDua,
    amount: number,
    note: string,
  ) {
    const tx = await prisma.transaction.create({
      data: {
        type: TransactionType.EXPENSE,
        amount,
        note,
        transactionDate: makeDate(y, m, d),
        categoryId: cat.id,
        createdById: kt.id,
      },
    });
    await prisma.transactionLog.create({
      data: { action: 'CREATE', transactionId: tx.id, performedById: kt.id },
    });
  }

  // ─── Helper: seed chi phí chuẩn 1 tháng = 46,200,000đ ───────────────────
  // Lương: staff 5tr + accountant 5tr + admin 5tr = 15,000,000
  // NVL (30tr): dừa 6tr, trứng 4tr, đường 3tr, sữa 2tr, gas 3tr,
  //             màu 2tr, hộp 3tr, RCT 2tr, trang trí 2tr, PK 1.5tr, ship 1.5tr = 30,000,000
  // Điện: 1,000,000 | Nước: 200,000
  // Tổng: 15tr + 30tr + 1.2tr = 46,200,000 ✅
  async function seedMonthExpenses(y: number, m: number, luongBonus = 0) {
    // Lương (ngày 3)
    await expense(
      y,
      m,
      3,
      catLuong,
      3000000 + luongBonus,
      `Lương nhân viên (staff) T${m}/${y}`,
    );
    await expense(y, m, 3, catLuong, 3000000, `Lương kế toán T${m}/${y}`);
    await expense(y, m, 3, catLuong, 3000000, `Lương admin T${m}/${y}`);
    // Nguyên vật liệu (rải ngày 5-20)
    await expense(y, m, 5, catDua, 600000, `Mua dừa T${m}/${y}`);
    await expense(y, m, 6, catTrung, 400000, `Mua trứng T${m}/${y}`);
    await expense(y, m, 7, catDuong, 300000, `Mua đường T${m}/${y}`);
    await expense(y, m, 8, catSua, 200000, `Mua sữa T${m}/${y}`);
    await expense(y, m, 9, catGas, 300000, `Gas T${m}/${y}`);
    await expense(y, m, 10, catMau, 200000, `Mua màu thực phẩm T${m}/${y}`);
    await expense(y, m, 11, catHop, 300000, `Mua hộp đựng bánh T${m}/${y}`);
    await expense(y, m, 12, catRCT, 200000, `Mua RCT T${m}/${y}`);
    await expense(y, m, 13, catTrangTri, 200000, `Trang trí / nến T${m}/${y}`);
    await expense(y, m, 14, catPK, 150000, `Phụ kiện T${m}/${y}`);
    await expense(y, m, 15, catShip, 150000, `Phí ship T${m}/${y}`);
    // Điện & Nước (cuối tháng)
    await expense(y, m, 24, catDienNuoc, 1000000, `Tiền điện T${m}/${y}`);
    await expense(y, m, 25, catDienNuoc, 200000, `Tiền nước T${m}/${y}`);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // NĂM 2025 — Tổng thu mục tiêu: ~280,000,000đ
  // Thay đổi: qty sinh nhật tăng từ 3 → 5 cái/đơn
  // Chi tiêu giữ nguyên: 160,400,000đ
  // Lợi nhuận: ~119,600,000đ
  // ══════════════════════════════════════════════════════════════════════════

  // ─── THÁNG 1/2025 — Tết cao điểm ─────────────────────────────────────────
  // NOTE: qty sinh nhật đã đổi 3 → 5
  let rev = 0;
  rev += await paid({
    y: 2025,
    m: 1,
    d: 2,
    cu: c('0901234501'),
    cake: 'Tết - Set 2',
    price: 95000,
    qty: 8,
    method: PaymentMethod.CASH,
    nv: nv1,
    cat: catTet,
    note: 'Đặt sớm giao Tết',
  });
  rev += await paid({
    y: 2025,
    m: 1,
    d: 3,
    cu: c('0901234502'),
    cake: 'Cúng ông Táo - Set 2',
    price: 110000,
    qty: 7,
    method: PaymentMethod.CASH,
    nv: nv2,
    cat: catOngTao,
    note: 'Cúng ông Táo',
  });
  rev += await paid({
    y: 2025,
    m: 1,
    d: 3,
    cu: c('0901234503'),
    cake: 'Tết - Set 1',
    price: 85000,
    qty: 8,
    method: PaymentMethod.CASH,
    nv: nv1,
    cat: catTet,
  });
  rev += await paid({
    y: 2025,
    m: 1,
    d: 4,
    cu: c('0901234504'),
    cake: 'Tết - Set 2',
    price: 95000,
    qty: 7,
    method: PaymentMethod.BANK_TRANSFER,
    nv: nv2,
    cat: catTet,
  });
  rev += await paid({
    y: 2025,
    m: 1,
    d: 4,
    cu: c('0901234505'),
    cake: 'Cúng ông Táo - Set 2',
    price: 110000,
    qty: 6,
    method: PaymentMethod.CASH,
    nv: nv1,
    cat: catOngTao,
  });
  rev += await paid({
    y: 2025,
    m: 1,
    d: 5,
    cu: c('0901234506'),
    cake: 'Tết - Set 2',
    price: 95000,
    qty: 7,
    method: PaymentMethod.CASH,
    nv: nv2,
    cat: catTet,
  });
  rev += await paid({
    y: 2025,
    m: 1,
    d: 5,
    cu: c('0901234507'),
    cake: 'Tết - Set 1',
    price: 85000,
    qty: 8,
    method: PaymentMethod.CASH,
    nv: nv1,
    cat: catTet,
  });
  rev += await paid({
    y: 2025,
    m: 1,
    d: 6,
    cu: c('0901234508'),
    cake: 'Cúng ông Táo - Set 2',
    price: 110000,
    qty: 6,
    method: PaymentMethod.BANK_TRANSFER,
    nv: nv2,
    cat: catOngTao,
  });
  rev += await paid({
    y: 2025,
    m: 1,
    d: 6,
    cu: c('0901234509'),
    cake: 'Tết - Set 2',
    price: 95000,
    qty: 7,
    method: PaymentMethod.CASH,
    nv: nv1,
    cat: catTet,
  });
  rev += await paid({
    y: 2025,
    m: 1,
    d: 7,
    cu: c('0901234510'),
    cake: 'Tết - Set 1',
    price: 85000,
    qty: 8,
    method: PaymentMethod.CASH,
    nv: nv2,
    cat: catTet,
  });
  rev += await paid({
    y: 2025,
    m: 1,
    d: 7,
    cu: c('0901234511'),
    cake: 'Cúng ông Táo - Set 2',
    price: 110000,
    qty: 5,
    method: PaymentMethod.BANK_TRANSFER,
    nv: nv1,
    cat: catOngTao,
  });
  rev += await paid({
    y: 2025,
    m: 1,
    d: 8,
    cu: c('0901234512'),
    cake: 'Tết - Set 2',
    price: 95000,
    qty: 6,
    method: PaymentMethod.CASH,
    nv: nv2,
    cat: catTet,
  });
  // Sinh nhật + thôi nôi xen kẽ — qty sinh nhật: 5 (tăng từ 3)
  rev += await paid({
    y: 2025,
    m: 1,
    d: 10,
    cu: c('0901234513'),
    cake: 'Sinh nhật rau câu Vuông Size 24 - Người lớn',
    price: 220000,
    qty: 5, // ← tăng từ 3
    sur: 30000,
    method: PaymentMethod.BANK_TRANSFER,
    nv: nv1,
    cat: catSinhNhat,
    note: 'viết tên Tuyết',
  });
  rev += await paid({
    y: 2025,
    m: 1,
    d: 11,
    cu: c('0901234514'),
    cake: 'Thôi nôi - 12 cái',
    price: 85000,
    qty: 5,
    method: PaymentMethod.BANK_TRANSFER,
    nv: nv2,
    cat: catThoiNoi,
  });
  rev += await paid({
    y: 2025,
    m: 1,
    d: 12,
    cu: c('0901234515'),
    cake: 'Sinh nhật rau câu Tròn Size 24 - Người lớn',
    price: 180000,
    qty: 5, // ← tăng từ 3
    sur: 20000,
    method: PaymentMethod.CASH,
    nv: nv1,
    cat: catSinhNhat,
  });
  rev += await paid({
    y: 2025,
    m: 1,
    d: 13,
    cu: c('0901234516'),
    cake: 'Sinh nhật rau câu Tim Size 20 - Trẻ con',
    price: 160000,
    qty: 5, // ← tăng từ 3
    sur: 20000,
    method: PaymentMethod.CASH,
    nv: nv2,
    cat: catSinhNhat,
    note: 'màu hồng',
  });
  rev += await paid({
    y: 2025,
    m: 1,
    d: 14,
    cu: c('0901234517'),
    cake: 'Tết - Set 2',
    price: 95000,
    qty: 6,
    method: PaymentMethod.CASH,
    nv: nv1,
    cat: catTet,
  });
  rev += await paid({
    y: 2025,
    m: 1,
    d: 15,
    cu: c('0901234518'),
    cake: 'Sinh nhật rau câu Vuông Size 20 - Người lớn',
    price: 200000,
    qty: 5, // ← tăng từ 3
    sur: 20000,
    method: PaymentMethod.BANK_TRANSFER,
    nv: nv2,
    cat: catSinhNhat,
  });
  rev += await paid({
    y: 2025,
    m: 1,
    d: 16,
    cu: c('0901234519'),
    cake: 'Lễ - Set 1',
    price: 130000,
    qty: 5,
    method: PaymentMethod.CASH,
    nv: nv1,
    cat: catLe,
  });
  rev += await paid({
    y: 2025,
    m: 1,
    d: 18,
    cu: c('0901234520'),
    cake: 'Sinh nhật rau câu Vuông Size 24 - Người lớn',
    price: 220000,
    qty: 5, // ← tăng từ 3
    sur: 30000,
    method: PaymentMethod.CASH,
    nv: nv2,
    cat: catSinhNhat,
  });
  rev += await paid({
    y: 2025,
    m: 1,
    d: 20,
    cu: c('0901234501'),
    cake: 'Thôi nôi - 12 cái',
    price: 85000,
    qty: 5,
    method: PaymentMethod.BANK_TRANSFER,
    nv: nv1,
    cat: catThoiNoi,
  });
  rev += await paid({
    y: 2025,
    m: 1,
    d: 21,
    cu: c('0901234502'),
    cake: 'Sinh nhật rau câu Tròn Size 20 - Người lớn',
    price: 160000,
    qty: 5, // ← tăng từ 3
    sur: 20000,
    method: PaymentMethod.CASH,
    nv: nv2,
    cat: catSinhNhat,
    note: 'viết tên Hoa',
  });
  rev += await paid({
    y: 2025,
    m: 1,
    d: 22,
    cu: c('0901234503'),
    cake: 'Bánh bò',
    price: 70000,
    qty: 8,
    method: PaymentMethod.CASH,
    nv: nv1,
    cat: catBanhBo,
  });
  rev += await paid({
    y: 2025,
    m: 1,
    d: 23,
    cu: c('0901234504'),
    cake: 'Sinh nhật rau câu Vuông Size 24 - Trẻ con',
    price: 220000,
    qty: 5, // ← tăng từ 3
    sur: 20000,
    method: PaymentMethod.BANK_TRANSFER,
    nv: nv2,
    cat: catSinhNhat,
    note: 'màu vàng',
  });
  rev += await paid({
    y: 2025,
    m: 1,
    d: 24,
    cu: c('0901234505'),
    cake: 'Plan - 10 cái',
    price: 70000,
    qty: 6,
    method: PaymentMethod.CASH,
    nv: nv1,
    cat: catPlan,
  });
  rev += await paid({
    y: 2025,
    m: 1,
    d: 25,
    cu: c('0901234506'),
    cake: 'Sinh nhật rau câu Tim Size 24 - Người lớn',
    price: 180000,
    qty: 5, // ← tăng từ 3
    sur: 20000,
    method: PaymentMethod.CASH,
    nv: nv2,
    cat: catSinhNhat,
  });
  rev += await paid({
    y: 2025,
    m: 1,
    d: 26,
    cu: c('0901234507'),
    cake: 'Bánh ăn loại 2',
    price: 60000,
    qty: 10,
    method: PaymentMethod.CASH,
    nv: nv1,
    cat: catBanhAn,
  });
  rev += await paid({
    y: 2025,
    m: 1,
    d: 27,
    cu: c('0901234508'),
    cake: 'Sinh nhật rau câu Tròn Size 24 - Người cao tuổi',
    price: 180000,
    qty: 5, // ← tăng từ 3
    sur: 20000,
    method: PaymentMethod.BANK_TRANSFER,
    nv: nv2,
    cat: catSinhNhat,
  });
  rev += await paid({
    y: 2025,
    m: 1,
    d: 28,
    cu: c('0901234509'),
    cake: 'Thôi nôi - 12 cái',
    price: 85000,
    qty: 5,
    method: PaymentMethod.BANK_TRANSFER,
    nv: nv1,
    cat: catThoiNoi,
  });
  rev += await paid({
    y: 2025,
    m: 1,
    d: 29,
    cu: c('0901234510'),
    cake: 'Sinh nhật rau câu Vuông Size 20 - Trẻ con',
    price: 200000,
    qty: 5, // ← tăng từ 3
    sur: 20000,
    method: PaymentMethod.CASH,
    nv: nv2,
    cat: catSinhNhat,
  });
  rev += await paid({
    y: 2025,
    m: 1,
    d: 30,
    cu: c('0901234511'),
    cake: 'Lễ - Set 2',
    price: 75000,
    qty: 6,
    method: PaymentMethod.CASH,
    nv: nv1,
    cat: catLe,
  });
  console.log(`  T1/2025: ${rev.toLocaleString('vi-VN')}đ`);
  await seedMonthExpenses(2025, 1);

  // ─── THÁNG 2/2025 ─────────────────────────────────────────────────────────
  // NOTE: qty sinh nhật đã đổi 3 → 5
  rev = 0;
  rev += await paid({
    y: 2025,
    m: 2,
    d: 2,
    cu: c('0901234512'),
    cake: 'Sinh nhật rau câu Vuông Size 24 - Người lớn',
    price: 220000,
    qty: 5, // ← tăng từ 3
    sur: 20000,
    method: PaymentMethod.CASH,
    nv: nv2,
    cat: catSinhNhat,
  });
  rev += await paid({
    y: 2025,
    m: 2,
    d: 3,
    cu: c('0901234513'),
    cake: 'Thôi nôi - 12 cái',
    price: 85000,
    qty: 5,
    method: PaymentMethod.BANK_TRANSFER,
    nv: nv1,
    cat: catThoiNoi,
  });
  rev += await paid({
    y: 2025,
    m: 2,
    d: 4,
    cu: c('0901234514'),
    cake: 'Sinh nhật rau câu Tròn Size 24 - Người lớn',
    price: 180000,
    qty: 5, // ← tăng từ 3
    sur: 20000,
    method: PaymentMethod.CASH,
    nv: nv2,
    cat: catSinhNhat,
  });
  rev += await paid({
    y: 2025,
    m: 2,
    d: 5,
    cu: c('0901234515'),
    cake: 'Sinh nhật rau câu Tim Size 24 - Người lớn',
    price: 180000,
    qty: 5, // ← tăng từ 3
    sur: 20000,
    method: PaymentMethod.BANK_TRANSFER,
    nv: nv1,
    cat: catSinhNhat,
  });
  rev += await paid({
    y: 2025,
    m: 2,
    d: 6,
    cu: c('0901234516'),
    cake: 'Sinh nhật rau câu Vuông Size 24 - Người lớn',
    price: 220000,
    qty: 5, // ← tăng từ 3
    sur: 20000,
    method: PaymentMethod.CASH,
    nv: nv2,
    cat: catSinhNhat,
  });
  rev += await paid({
    y: 2025,
    m: 2,
    d: 7,
    cu: c('0901234517'),
    cake: 'Thôi nôi - 12 cái',
    price: 85000,
    qty: 5,
    method: PaymentMethod.BANK_TRANSFER,
    nv: nv1,
    cat: catThoiNoi,
  });
  rev += await paid({
    y: 2025,
    m: 2,
    d: 8,
    cu: c('0901234518'),
    cake: 'Sinh nhật rau câu Tròn Size 20 - Người lớn',
    price: 160000,
    qty: 5, // ← tăng từ 3
    sur: 20000,
    method: PaymentMethod.CASH,
    nv: nv2,
    cat: catSinhNhat,
  });
  rev += await paid({
    y: 2025,
    m: 2,
    d: 9,
    cu: c('0901234519'),
    cake: 'Lễ - Set 1',
    price: 130000,
    qty: 5,
    method: PaymentMethod.CASH,
    nv: nv1,
    cat: catLe,
  });
  rev += await paid({
    y: 2025,
    m: 2,
    d: 10,
    cu: c('0901234520'),
    cake: 'Sinh nhật rau câu Vuông Size 20 - Người lớn',
    price: 200000,
    qty: 5, // ← tăng từ 3
    sur: 20000,
    method: PaymentMethod.BANK_TRANSFER,
    nv: nv2,
    cat: catSinhNhat,
  });
  rev += await paid({
    y: 2025,
    m: 2,
    d: 11,
    cu: c('0901234501'),
    cake: 'Sinh nhật rau câu Tim Size 16 - Trẻ con',
    price: 140000,
    qty: 5, // ← tăng từ 3
    method: PaymentMethod.CASH,
    nv: nv1,
    cat: catSinhNhat,
    note: 'màu xanh',
  });
  rev += await paid({
    y: 2025,
    m: 2,
    d: 12,
    cu: c('0901234502'),
    cake: 'Bánh bò',
    price: 70000,
    qty: 8,
    method: PaymentMethod.CASH,
    nv: nv2,
    cat: catBanhBo,
  });
  rev += await paid({
    y: 2025,
    m: 2,
    d: 13,
    cu: c('0901234503'),
    cake: 'Sinh nhật rau câu Vuông Size 24 - Người lớn',
    price: 220000,
    qty: 5, // ← tăng từ 3
    sur: 20000,
    method: PaymentMethod.BANK_TRANSFER,
    nv: nv1,
    cat: catSinhNhat,
  });
  rev += await paid({
    y: 2025,
    m: 2,
    d: 14,
    cu: c('0901234504'),
    cake: 'Sinh nhật rau câu Tim Size 24 - Người lớn',
    price: 180000,
    qty: 5, // ← tăng từ 3
    sur: 30000,
    method: PaymentMethod.BANK_TRANSFER,
    nv: nv2,
    cat: catSinhNhat,
    note: 'Valentine',
  });
  rev += await paid({
    y: 2025,
    m: 2,
    d: 14,
    cu: c('0901234505'),
    cake: 'Sinh nhật rau câu Tim Size 20 - Người lớn',
    price: 160000,
    qty: 5, // ← tăng từ 3
    sur: 30000,
    method: PaymentMethod.BANK_TRANSFER,
    nv: nv1,
    cat: catSinhNhat,
    note: 'Valentine',
  });
  rev += await paid({
    y: 2025,
    m: 2,
    d: 15,
    cu: c('0901234506'),
    cake: 'Sinh nhật rau câu Vuông Size 24 - Người lớn',
    price: 220000,
    qty: 5, // ← tăng từ 3
    sur: 20000,
    method: PaymentMethod.CASH,
    nv: nv2,
    cat: catSinhNhat,
  });
  rev += await paid({
    y: 2025,
    m: 2,
    d: 16,
    cu: c('0901234507'),
    cake: 'Thôi nôi - 12 cái',
    price: 85000,
    qty: 5,
    method: PaymentMethod.BANK_TRANSFER,
    nv: nv1,
    cat: catThoiNoi,
  });
  rev += await paid({
    y: 2025,
    m: 2,
    d: 17,
    cu: c('0901234508'),
    cake: 'Sinh nhật rau câu Tròn Size 24 - Người lớn',
    price: 180000,
    qty: 5, // ← tăng từ 3
    sur: 20000,
    method: PaymentMethod.CASH,
    nv: nv2,
    cat: catSinhNhat,
  });
  rev += await paid({
    y: 2025,
    m: 2,
    d: 18,
    cu: c('0901234509'),
    cake: 'Sinh nhật rau câu Tròn Size 24 - Người cao tuổi',
    price: 180000,
    qty: 5, // ← tăng từ 3
    sur: 20000,
    method: PaymentMethod.CASH,
    nv: nv1,
    cat: catSinhNhat,
  });
  rev += await paid({
    y: 2025,
    m: 2,
    d: 19,
    cu: c('0901234510'),
    cake: 'Sinh nhật rau câu Vuông Size 20 - Người lớn',
    price: 200000,
    qty: 5, // ← tăng từ 3
    sur: 20000,
    method: PaymentMethod.BANK_TRANSFER,
    nv: nv2,
    cat: catSinhNhat,
  });
  rev += await paid({
    y: 2025,
    m: 2,
    d: 20,
    cu: c('0901234511'),
    cake: 'Bánh ăn loại 3',
    price: 70000,
    qty: 10,
    method: PaymentMethod.CASH,
    nv: nv1,
    cat: catBanhAn,
  });
  rev += await paid({
    y: 2025,
    m: 2,
    d: 22,
    cu: c('0901234512'),
    cake: 'Sinh nhật rau câu Vuông Size 24 - Người lớn',
    price: 220000,
    qty: 5, // ← tăng từ 3
    sur: 20000,
    method: PaymentMethod.CASH,
    nv: nv2,
    cat: catSinhNhat,
  });
  rev += await paid({
    y: 2025,
    m: 2,
    d: 23,
    cu: c('0901234513'),
    cake: 'Thôi nôi - 12 cái',
    price: 85000,
    qty: 5,
    method: PaymentMethod.BANK_TRANSFER,
    nv: nv1,
    cat: catThoiNoi,
  });
  rev += await paid({
    y: 2025,
    m: 2,
    d: 24,
    cu: c('0901234514'),
    cake: 'Sinh nhật rau câu Tim Size 24 - Người lớn',
    price: 180000,
    qty: 5, // ← tăng từ 3
    sur: 20000,
    method: PaymentMethod.CASH,
    nv: nv2,
    cat: catSinhNhat,
  });
  rev += await paid({
    y: 2025,
    m: 2,
    d: 25,
    cu: c('0901234515'),
    cake: 'Plan - 10 cái',
    price: 70000,
    qty: 6,
    method: PaymentMethod.CASH,
    nv: nv1,
    cat: catPlan,
  });
  rev += await paid({
    y: 2025,
    m: 2,
    d: 26,
    cu: c('0901234516'),
    cake: 'Sinh nhật rau câu Tròn Size 20 - Trẻ con',
    price: 160000,
    qty: 5, // ← tăng từ 3
    sur: 20000,
    method: PaymentMethod.BANK_TRANSFER,
    nv: nv2,
    cat: catSinhNhat,
  });
  rev += await paid({
    y: 2025,
    m: 2,
    d: 27,
    cu: c('0901234517'),
    cake: 'Lễ - Set 2',
    price: 75000,
    qty: 6,
    method: PaymentMethod.CASH,
    nv: nv1,
    cat: catLe,
  });
  rev += await paid({
    y: 2025,
    m: 2,
    d: 28,
    cu: c('0901234518'),
    cake: 'Sinh nhật rau câu Vuông Size 20 - Trẻ con',
    price: 200000,
    qty: 5, // ← tăng từ 3
    sur: 20000,
    method: PaymentMethod.CASH,
    nv: nv2,
    cat: catSinhNhat,
  });
  await debt({
    y: 2025,
    m: 2,
    d: 22,
    cu: c('0901234519'),
    cake: 'Sinh nhật rau câu Vuông Size 20 - Người lớn',
    price: 200000,
    nv: nv1,
    paidAmt: 100000,
    status: DebtStatus.PARTIAL,
  });
  console.log(`  T2/2025: ${rev.toLocaleString('vi-VN')}đ`);
  await seedMonthExpenses(2025, 2);

  // ─── normalMonthOrders — dùng cho T3-T11/2025 (qty sinh nhật: 5) ─────────
  // và T2-T4/2026 (qty sinh nhật: 3 — giữ nguyên)
  // Vì array dùng chung cho cả 2025 và 2026, ta tách thành 2 array riêng.

  // Array cho NĂM 2025: qty sinh nhật = 5
  const normalMonthOrders2025 = [
    [
      2,
      1,
      'Sinh nhật rau câu Vuông Size 24 - Người lớn',
      220000,
      5,
      20000,
      PaymentMethod.CASH,
      1,
      'sn',
    ],
    [
      3,
      2,
      'Thôi nôi - 12 cái',
      85000,
      5,
      0,
      PaymentMethod.BANK_TRANSFER,
      2,
      'tn',
    ],
    [
      4,
      3,
      'Sinh nhật rau câu Tròn Size 24 - Người lớn',
      180000,
      5,
      20000,
      PaymentMethod.CASH,
      1,
      'sn',
    ],
    [
      5,
      4,
      'Sinh nhật rau câu Tim Size 24 - Người lớn',
      180000,
      5,
      20000,
      PaymentMethod.BANK_TRANSFER,
      2,
      'sn',
    ],
    [
      6,
      5,
      'Sinh nhật rau câu Vuông Size 20 - Người lớn',
      200000,
      5,
      20000,
      PaymentMethod.CASH,
      1,
      'sn',
    ],
    [
      7,
      6,
      'Thôi nôi - 12 cái',
      85000,
      5,
      0,
      PaymentMethod.BANK_TRANSFER,
      2,
      'tn',
    ],
    [
      8,
      7,
      'Sinh nhật rau câu Vuông Size 24 - Người lớn',
      220000,
      5,
      20000,
      PaymentMethod.CASH,
      1,
      'sn',
    ],
    [9, 8, 'Lễ - Set 1', 130000, 5, 0, PaymentMethod.CASH, 2, 'le'],
    [
      10,
      9,
      'Sinh nhật rau câu Tròn Size 20 - Người lớn',
      160000,
      5,
      20000,
      PaymentMethod.BANK_TRANSFER,
      1,
      'sn',
    ],
    [
      11,
      10,
      'Sinh nhật rau câu Vuông Size 24 - Trẻ con',
      220000,
      5,
      20000,
      PaymentMethod.CASH,
      2,
      'sn',
    ],
    [12, 11, 'Bánh bò', 70000, 8, 0, PaymentMethod.CASH, 1, 'bb'],
    [
      13,
      12,
      'Sinh nhật rau câu Tim Size 24 - Người lớn',
      180000,
      5,
      20000,
      PaymentMethod.BANK_TRANSFER,
      2,
      'sn',
    ],
    [
      14,
      13,
      'Thôi nôi - 12 cái',
      85000,
      5,
      0,
      PaymentMethod.BANK_TRANSFER,
      1,
      'tn',
    ],
    [
      15,
      14,
      'Sinh nhật rau câu Vuông Size 24 - Người lớn',
      220000,
      5,
      20000,
      PaymentMethod.CASH,
      2,
      'sn',
    ],
    [
      16,
      15,
      'Sinh nhật rau câu Tròn Size 24 - Người cao tuổi',
      180000,
      5,
      20000,
      PaymentMethod.CASH,
      1,
      'sn',
    ],
    [17, 16, 'Bánh ăn loại 3', 70000, 10, 0, PaymentMethod.CASH, 2, 'ba'],
    [
      18,
      17,
      'Sinh nhật rau câu Vuông Size 20 - Người lớn',
      200000,
      5,
      20000,
      PaymentMethod.BANK_TRANSFER,
      1,
      'sn',
    ],
    [19, 18, 'Plan - 10 cái', 70000, 6, 0, PaymentMethod.CASH, 2, 'pl'],
    [
      20,
      19,
      'Sinh nhật rau câu Tim Size 20 - Người lớn',
      160000,
      5,
      20000,
      PaymentMethod.CASH,
      1,
      'sn',
    ],
    [
      21,
      20,
      'Thôi nôi - 12 cái',
      85000,
      5,
      0,
      PaymentMethod.BANK_TRANSFER,
      2,
      'tn',
    ],
    [
      22,
      1,
      'Sinh nhật rau câu Vuông Size 24 - Người lớn',
      220000,
      5,
      30000,
      PaymentMethod.CASH,
      1,
      'sn',
    ],
    [
      23,
      2,
      'Sinh nhật rau câu Tròn Size 20 - Trẻ con',
      160000,
      5,
      20000,
      PaymentMethod.BANK_TRANSFER,
      2,
      'sn',
    ],
    [
      24,
      3,
      'Sinh nhật rau câu Tim Size 24 - Người lớn',
      180000,
      5,
      20000,
      PaymentMethod.CASH,
      1,
      'sn',
    ],
    [25, 4, 'Lễ - Set 2', 75000, 6, 0, PaymentMethod.CASH, 2, 'le'],
    [
      26,
      5,
      'Sinh nhật rau câu Vuông Size 24 - Người lớn',
      220000,
      5,
      20000,
      PaymentMethod.BANK_TRANSFER,
      1,
      'sn',
    ],
    [27, 6, 'Bánh bò', 70000, 8, 0, PaymentMethod.CASH, 2, 'bb'],
    [
      28,
      7,
      'Sinh nhật rau câu Tròn Size 24 - Người lớn',
      180000,
      5,
      20000,
      PaymentMethod.CASH,
      1,
      'sn',
    ],
    [
      29,
      8,
      'Thôi nôi - 12 cái',
      85000,
      5,
      0,
      PaymentMethod.BANK_TRANSFER,
      2,
      'tn',
    ],
    [
      30,
      9,
      'Sinh nhật rau câu Vuông Size 20 - Người lớn',
      200000,
      5,
      20000,
      PaymentMethod.CASH,
      1,
      'sn',
    ],
    [
      31,
      10,
      'Sinh nhật rau câu Tim Size 20 - Trẻ con',
      160000,
      5,
      20000,
      PaymentMethod.BANK_TRANSFER,
      2,
      'sn',
    ],
  ] as const;

  // Array cho NĂM 2026: qty sinh nhật = 3 (giữ nguyên bản gốc)
  const normalMonthOrders2026 = [
    [
      2,
      1,
      'Sinh nhật rau câu Vuông Size 24 - Người lớn',
      220000,
      3,
      20000,
      PaymentMethod.CASH,
      1,
      'sn',
    ],
    [
      3,
      2,
      'Thôi nôi - 12 cái',
      85000,
      5,
      0,
      PaymentMethod.BANK_TRANSFER,
      2,
      'tn',
    ],
    [
      4,
      3,
      'Sinh nhật rau câu Tròn Size 24 - Người lớn',
      180000,
      3,
      20000,
      PaymentMethod.CASH,
      1,
      'sn',
    ],
    [
      5,
      4,
      'Sinh nhật rau câu Tim Size 24 - Người lớn',
      180000,
      3,
      20000,
      PaymentMethod.BANK_TRANSFER,
      2,
      'sn',
    ],
    [
      6,
      5,
      'Sinh nhật rau câu Vuông Size 20 - Người lớn',
      200000,
      3,
      20000,
      PaymentMethod.CASH,
      1,
      'sn',
    ],
    [
      7,
      6,
      'Thôi nôi - 12 cái',
      85000,
      5,
      0,
      PaymentMethod.BANK_TRANSFER,
      2,
      'tn',
    ],
    [
      8,
      7,
      'Sinh nhật rau câu Vuông Size 24 - Người lớn',
      220000,
      3,
      20000,
      PaymentMethod.CASH,
      1,
      'sn',
    ],
    [9, 8, 'Lễ - Set 1', 130000, 5, 0, PaymentMethod.CASH, 2, 'le'],
    [
      10,
      9,
      'Sinh nhật rau câu Tròn Size 20 - Người lớn',
      160000,
      3,
      20000,
      PaymentMethod.BANK_TRANSFER,
      1,
      'sn',
    ],
    [
      11,
      10,
      'Sinh nhật rau câu Vuông Size 24 - Trẻ con',
      220000,
      3,
      20000,
      PaymentMethod.CASH,
      2,
      'sn',
    ],
    [12, 11, 'Bánh bò', 70000, 8, 0, PaymentMethod.CASH, 1, 'bb'],
    [
      13,
      12,
      'Sinh nhật rau câu Tim Size 24 - Người lớn',
      180000,
      3,
      20000,
      PaymentMethod.BANK_TRANSFER,
      2,
      'sn',
    ],
    [
      14,
      13,
      'Thôi nôi - 12 cái',
      85000,
      5,
      0,
      PaymentMethod.BANK_TRANSFER,
      1,
      'tn',
    ],
    [
      15,
      14,
      'Sinh nhật rau câu Vuông Size 24 - Người lớn',
      220000,
      3,
      20000,
      PaymentMethod.CASH,
      2,
      'sn',
    ],
    [
      16,
      15,
      'Sinh nhật rau câu Tròn Size 24 - Người cao tuổi',
      180000,
      3,
      20000,
      PaymentMethod.CASH,
      1,
      'sn',
    ],
    [17, 16, 'Bánh ăn loại 3', 70000, 10, 0, PaymentMethod.CASH, 2, 'ba'],
    [
      18,
      17,
      'Sinh nhật rau câu Vuông Size 20 - Người lớn',
      200000,
      3,
      20000,
      PaymentMethod.BANK_TRANSFER,
      1,
      'sn',
    ],
    [19, 18, 'Plan - 10 cái', 70000, 6, 0, PaymentMethod.CASH, 2, 'pl'],
    [
      20,
      19,
      'Sinh nhật rau câu Tim Size 20 - Người lớn',
      160000,
      3,
      20000,
      PaymentMethod.CASH,
      1,
      'sn',
    ],
    [
      21,
      20,
      'Thôi nôi - 12 cái',
      85000,
      5,
      0,
      PaymentMethod.BANK_TRANSFER,
      2,
      'tn',
    ],
    [
      22,
      1,
      'Sinh nhật rau câu Vuông Size 24 - Người lớn',
      220000,
      3,
      30000,
      PaymentMethod.CASH,
      1,
      'sn',
    ],
    [
      23,
      2,
      'Sinh nhật rau câu Tròn Size 20 - Trẻ con',
      160000,
      3,
      20000,
      PaymentMethod.BANK_TRANSFER,
      2,
      'sn',
    ],
    [
      24,
      3,
      'Sinh nhật rau câu Tim Size 24 - Người lớn',
      180000,
      3,
      20000,
      PaymentMethod.CASH,
      1,
      'sn',
    ],
    [25, 4, 'Lễ - Set 2', 75000, 6, 0, PaymentMethod.CASH, 2, 'le'],
    [
      26,
      5,
      'Sinh nhật rau câu Vuông Size 24 - Người lớn',
      220000,
      3,
      20000,
      PaymentMethod.BANK_TRANSFER,
      1,
      'sn',
    ],
    [27, 6, 'Bánh bò', 70000, 8, 0, PaymentMethod.CASH, 2, 'bb'],
    [
      28,
      7,
      'Sinh nhật rau câu Tròn Size 24 - Người lớn',
      180000,
      3,
      20000,
      PaymentMethod.CASH,
      1,
      'sn',
    ],
    [
      29,
      8,
      'Thôi nôi - 12 cái',
      85000,
      5,
      0,
      PaymentMethod.BANK_TRANSFER,
      2,
      'tn',
    ],
    [
      30,
      9,
      'Sinh nhật rau câu Vuông Size 20 - Người lớn',
      200000,
      3,
      20000,
      PaymentMethod.CASH,
      1,
      'sn',
    ],
    [
      31,
      10,
      'Sinh nhật rau câu Tim Size 20 - Trẻ con',
      160000,
      3,
      20000,
      PaymentMethod.BANK_TRANSFER,
      2,
      'sn',
    ],
  ] as const;

  const catMap: Record<string, typeof catSinhNhat> = {
    sn: catSinhNhat,
    tn: catThoiNoi,
    le: catLe,
    bb: catBanhBo,
    ba: catBanhAn,
    pl: catPlan,
  };

  const phones = [
    '0901234501',
    '0901234502',
    '0901234503',
    '0901234504',
    '0901234505',
    '0901234506',
    '0901234507',
    '0901234508',
    '0901234509',
    '0901234510',
    '0901234511',
    '0901234512',
    '0901234513',
    '0901234514',
    '0901234515',
    '0901234516',
    '0901234517',
    '0901234518',
    '0901234519',
    '0901234520',
  ];

  async function seedNormalMonth(
    year: number,
    month: number,
    maxDay = 31,
    orders: readonly (readonly [
      number,
      number,
      string,
      number,
      number,
      number,
      PaymentMethod,
      number,
      string,
    ])[],
  ) {
    let r = 0;
    for (const [
      d,
      cuIdx,
      cake,
      price,
      qty,
      sur,
      method,
      nvIdx,
      catKey,
    ] of orders) {
      if (d > maxDay) continue;
      const phoneIdx = (cuIdx - 1 + (month - 1) * 3) % 20;
      const cu = c(phones[phoneIdx]);
      const nv = nvIdx === 1 ? nv1 : nv2;
      r += await paid({
        y: year,
        m: month,
        d,
        cu,
        cake,
        price,
        qty,
        sur,
        method,
        nv,
        cat: catMap[catKey],
      });
    }
    return r;
  }

  // T3-T11/2025 — dùng normalMonthOrders2025 (qty sinh nhật = 5)
  for (const mo of [3, 4, 5, 6, 7, 8, 9, 10, 11]) {
    const maxD = mo === 4 || mo === 6 || mo === 9 || mo === 11 ? 30 : 31;
    rev = await seedNormalMonth(2025, mo, maxD, normalMonthOrders2025);

    // Đơn đặc biệt theo tháng (giữ nguyên)
    if (mo === 3) {
      rev += await paid({
        y: 2025,
        m: 3,
        d: 8,
        cu: c('0901234511'),
        cake: 'Sinh nhật rau câu Tim Size 24 - Người lớn',
        price: 180000,
        qty: 5,
        sur: 30000, // ← tăng từ 3
        method: PaymentMethod.BANK_TRANSFER,
        nv: nv1,
        cat: catSinhNhat,
        note: '8/3 tặng mẹ',
      });
      await debt({
        y: 2025,
        m: 3,
        d: 18,
        cu: c('0901234513'),
        cake: 'Sinh nhật rau câu Tròn Size 20 - Người lớn',
        price: 160000,
        nv: nv2,
        paidAmt: 80000,
        status: DebtStatus.PARTIAL,
      });
    }
    if (mo === 7) {
      await debt({
        y: 2025,
        m: 7,
        d: 14,
        cu: c('0901234506'),
        cake: 'Thôi nôi - 12 cái',
        price: 85000,
        nv: nv1,
        paidAmt: 85000,
        status: DebtStatus.PAID,
      });
    }
    if (mo === 9) {
      await debt({
        y: 2025,
        m: 9,
        d: 9,
        cu: c('0901234508'),
        cake: 'Sinh nhật rau câu Tim Size 24 - Người lớn',
        price: 180000,
        nv: nv2,
        paidAmt: 100000,
        status: DebtStatus.PARTIAL,
      });
    }
    if (mo === 11) {
      await debt({
        y: 2025,
        m: 11,
        d: 3,
        cu: c('0901234510'),
        cake: 'Bánh bò',
        price: 70000,
        nv: nv1,
        paidAmt: 0,
        status: DebtStatus.UNPAID,
      });
    }

    console.log(`  T${mo}/2025: ${rev.toLocaleString('vi-VN')}đ`);
    await seedMonthExpenses(2025, mo);
  }

  // ─── THÁNG 12/2025 — Noel + cận Tết — qty sinh nhật: 5 ───────────────────
  rev = 0;
  rev += await paid({
    y: 2025,
    m: 12,
    d: 2,
    cu: c('0901234501'),
    cake: 'Sinh nhật rau câu Vuông Size 24 - Người lớn',
    price: 220000,
    qty: 5,
    sur: 20000,
    method: PaymentMethod.BANK_TRANSFER,
    nv: nv1,
    cat: catSinhNhat,
  });
  rev += await paid({
    y: 2025,
    m: 12,
    d: 3,
    cu: c('0901234502'),
    cake: 'Thôi nôi - 12 cái',
    price: 85000,
    qty: 5,
    method: PaymentMethod.BANK_TRANSFER,
    nv: nv2,
    cat: catThoiNoi,
  });
  rev += await paid({
    y: 2025,
    m: 12,
    d: 4,
    cu: c('0901234503'),
    cake: 'Sinh nhật rau câu Tim Size 20 - Người lớn',
    price: 160000,
    qty: 5,
    sur: 20000,
    method: PaymentMethod.CASH,
    nv: nv1,
    cat: catSinhNhat,
  });
  rev += await paid({
    y: 2025,
    m: 12,
    d: 5,
    cu: c('0901234504'),
    cake: 'Lễ - Set 1',
    price: 130000,
    qty: 5,
    method: PaymentMethod.CASH,
    nv: nv2,
    cat: catLe,
  });
  rev += await paid({
    y: 2025,
    m: 12,
    d: 6,
    cu: c('0901234505'),
    cake: 'Sinh nhật rau câu Vuông Size 20 - Người lớn',
    price: 200000,
    qty: 5,
    sur: 20000,
    method: PaymentMethod.BANK_TRANSFER,
    nv: nv1,
    cat: catSinhNhat,
    note: 'Noel xanh',
  });
  rev += await paid({
    y: 2025,
    m: 12,
    d: 7,
    cu: c('0901234506'),
    cake: 'Bánh bò',
    price: 70000,
    qty: 8,
    method: PaymentMethod.CASH,
    nv: nv2,
    cat: catBanhBo,
  });
  rev += await paid({
    y: 2025,
    m: 12,
    d: 8,
    cu: c('0901234507'),
    cake: 'Sinh nhật rau câu Vuông Size 24 - Người lớn',
    price: 220000,
    qty: 5,
    sur: 20000,
    method: PaymentMethod.CASH,
    nv: nv1,
    cat: catSinhNhat,
    note: 'Noel',
  });
  rev += await paid({
    y: 2025,
    m: 12,
    d: 9,
    cu: c('0901234508'),
    cake: 'Thôi nôi - 12 cái',
    price: 85000,
    qty: 5,
    method: PaymentMethod.BANK_TRANSFER,
    nv: nv2,
    cat: catThoiNoi,
  });
  rev += await paid({
    y: 2025,
    m: 12,
    d: 10,
    cu: c('0901234509'),
    cake: 'Sinh nhật rau câu Tròn Size 24 - Người lớn',
    price: 180000,
    qty: 5,
    sur: 20000,
    method: PaymentMethod.CASH,
    nv: nv1,
    cat: catSinhNhat,
    note: 'Noel',
  });
  rev += await paid({
    y: 2025,
    m: 12,
    d: 11,
    cu: c('0901234510'),
    cake: 'Sinh nhật rau câu Tim Size 24 - Người lớn',
    price: 180000,
    qty: 5,
    sur: 20000,
    method: PaymentMethod.BANK_TRANSFER,
    nv: nv2,
    cat: catSinhNhat,
  });
  rev += await paid({
    y: 2025,
    m: 12,
    d: 12,
    cu: c('0901234511'),
    cake: 'Bánh ăn loại 2',
    price: 60000,
    qty: 10,
    method: PaymentMethod.CASH,
    nv: nv1,
    cat: catBanhAn,
  });
  rev += await paid({
    y: 2025,
    m: 12,
    d: 13,
    cu: c('0901234512'),
    cake: 'Sinh nhật rau câu Vuông Size 24 - Người lớn',
    price: 220000,
    qty: 5,
    sur: 20000,
    method: PaymentMethod.CASH,
    nv: nv2,
    cat: catSinhNhat,
    note: 'Noel tặng',
  });
  rev += await paid({
    y: 2025,
    m: 12,
    d: 14,
    cu: c('0901234513'),
    cake: 'Plan - 10 cái',
    price: 70000,
    qty: 6,
    method: PaymentMethod.CASH,
    nv: nv1,
    cat: catPlan,
  });
  rev += await paid({
    y: 2025,
    m: 12,
    d: 15,
    cu: c('0901234514'),
    cake: 'Sinh nhật rau câu Tròn Size 20 - Người lớn',
    price: 160000,
    qty: 5,
    sur: 20000,
    method: PaymentMethod.BANK_TRANSFER,
    nv: nv2,
    cat: catSinhNhat,
  });
  rev += await paid({
    y: 2025,
    m: 12,
    d: 17,
    cu: c('0901234515'),
    cake: 'Sinh nhật rau câu Vuông Size 16 - Người lớn',
    price: 180000,
    qty: 5,
    sur: 20000,
    method: PaymentMethod.CASH,
    nv: nv1,
    cat: catSinhNhat,
  });
  rev += await paid({
    y: 2025,
    m: 12,
    d: 19,
    cu: c('0901234516'),
    cake: 'Sinh nhật rau câu Vuông Size 24 - Người lớn',
    price: 220000,
    qty: 5,
    sur: 20000,
    method: PaymentMethod.CASH,
    nv: nv2,
    cat: catSinhNhat,
  });
  rev += await paid({
    y: 2025,
    m: 12,
    d: 20,
    cu: c('0901234517'),
    cake: 'Thôi nôi - 12 cái',
    price: 85000,
    qty: 5,
    method: PaymentMethod.BANK_TRANSFER,
    nv: nv1,
    cat: catThoiNoi,
  });
  rev += await paid({
    y: 2025,
    m: 12,
    d: 21,
    cu: c('0901234518'),
    cake: 'Sinh nhật rau câu Tim Size 24 - Người lớn',
    price: 180000,
    qty: 5,
    sur: 20000,
    method: PaymentMethod.CASH,
    nv: nv2,
    cat: catSinhNhat,
  });
  rev += await paid({
    y: 2025,
    m: 12,
    d: 24,
    cu: c('0901234519'),
    cake: 'Sinh nhật rau câu Vuông Size 24 - Người lớn',
    price: 220000,
    qty: 5,
    sur: 30000,
    method: PaymentMethod.BANK_TRANSFER,
    nv: nv1,
    cat: catSinhNhat,
    note: 'Noel',
  });
  rev += await paid({
    y: 2025,
    m: 12,
    d: 24,
    cu: c('0901234520'),
    cake: 'Sinh nhật rau câu Tròn Size 24 - Người lớn',
    price: 180000,
    qty: 5,
    sur: 30000,
    method: PaymentMethod.BANK_TRANSFER,
    nv: nv2,
    cat: catSinhNhat,
    note: 'Noel',
  });
  rev += await paid({
    y: 2025,
    m: 12,
    d: 26,
    cu: c('0901234501'),
    cake: 'Cúng ông Táo - Set 2',
    price: 110000,
    qty: 6,
    method: PaymentMethod.CASH,
    nv: nv1,
    cat: catOngTao,
  });
  rev += await paid({
    y: 2025,
    m: 12,
    d: 27,
    cu: c('0901234502'),
    cake: 'Cúng ông Táo - Set 2',
    price: 110000,
    qty: 6,
    method: PaymentMethod.CASH,
    nv: nv2,
    cat: catOngTao,
  });
  rev += await paid({
    y: 2025,
    m: 12,
    d: 28,
    cu: c('0901234503'),
    cake: 'Tết - Set 2',
    price: 95000,
    qty: 7,
    method: PaymentMethod.CASH,
    nv: nv1,
    cat: catTet,
    note: 'Đặt trước Tết',
  });
  rev += await paid({
    y: 2025,
    m: 12,
    d: 29,
    cu: c('0901234504'),
    cake: 'Tết - Set 1',
    price: 85000,
    qty: 7,
    method: PaymentMethod.CASH,
    nv: nv2,
    cat: catTet,
  });
  rev += await paid({
    y: 2025,
    m: 12,
    d: 30,
    cu: c('0901234505'),
    cake: 'Tết - Set 2',
    price: 95000,
    qty: 6,
    method: PaymentMethod.BANK_TRANSFER,
    nv: nv1,
    cat: catTet,
  });
  rev += await paid({
    y: 2025,
    m: 12,
    d: 31,
    cu: c('0901234506'),
    cake: 'Sinh nhật rau câu Vuông Size 20 - Người lớn',
    price: 200000,
    qty: 5,
    sur: 20000,
    method: PaymentMethod.CASH,
    nv: nv2,
    cat: catSinhNhat,
    note: 'Năm mới',
  });
  console.log(`  T12/2025: ${rev.toLocaleString('vi-VN')}đ`);
  await seedMonthExpenses(2025, 12, 2000000);

  console.log('  ✅ Xong đơn hàng 2025');

  // ══════════════════════════════════════════════════════════════════════════
  // NĂM 2026 — qty sinh nhật GIỮ NGUYÊN = 3 (không tăng)
  // ══════════════════════════════════════════════════════════════════════════

  // ─── THÁNG 1/2026 — Tết ───────────────────────────────────────────────────
  rev = 0;
  rev += await paid({
    y: 2026,
    m: 1,
    d: 3,
    cu: c('0901234507'),
    cake: 'Tết - Set 2',
    price: 95000,
    qty: 8,
    method: PaymentMethod.CASH,
    nv: nv1,
    cat: catTet,
  });
  rev += await paid({
    y: 2026,
    m: 1,
    d: 4,
    cu: c('0901234508'),
    cake: 'Cúng ông Táo - Set 2',
    price: 110000,
    qty: 7,
    method: PaymentMethod.CASH,
    nv: nv2,
    cat: catOngTao,
    note: 'Giao sáng',
  });
  rev += await paid({
    y: 2026,
    m: 1,
    d: 4,
    cu: c('0901234509'),
    cake: 'Tết - Set 1',
    price: 85000,
    qty: 8,
    method: PaymentMethod.CASH,
    nv: nv1,
    cat: catTet,
  });
  rev += await paid({
    y: 2026,
    m: 1,
    d: 5,
    cu: c('0901234510'),
    cake: 'Tết - Set 2',
    price: 95000,
    qty: 7,
    method: PaymentMethod.BANK_TRANSFER,
    nv: nv2,
    cat: catTet,
  });
  rev += await paid({
    y: 2026,
    m: 1,
    d: 5,
    cu: c('0901234511'),
    cake: 'Cúng ông Táo - Set 2',
    price: 110000,
    qty: 6,
    method: PaymentMethod.CASH,
    nv: nv1,
    cat: catOngTao,
  });
  rev += await paid({
    y: 2026,
    m: 1,
    d: 6,
    cu: c('0901234512'),
    cake: 'Tết - Set 2',
    price: 95000,
    qty: 7,
    method: PaymentMethod.CASH,
    nv: nv2,
    cat: catTet,
  });
  rev += await paid({
    y: 2026,
    m: 1,
    d: 7,
    cu: c('0901234513'),
    cake: 'Tết - Set 1',
    price: 85000,
    qty: 8,
    method: PaymentMethod.CASH,
    nv: nv1,
    cat: catTet,
  });
  rev += await paid({
    y: 2026,
    m: 1,
    d: 8,
    cu: c('0901234514'),
    cake: 'Cúng ông Táo - Set 2',
    price: 110000,
    qty: 6,
    method: PaymentMethod.BANK_TRANSFER,
    nv: nv2,
    cat: catOngTao,
  });
  rev += await paid({
    y: 2026,
    m: 1,
    d: 9,
    cu: c('0901234515'),
    cake: 'Tết - Set 2',
    price: 95000,
    qty: 6,
    method: PaymentMethod.CASH,
    nv: nv1,
    cat: catTet,
  });
  rev += await paid({
    y: 2026,
    m: 1,
    d: 10,
    cu: c('0901234516'),
    cake: 'Tết - Set 1',
    price: 85000,
    qty: 7,
    method: PaymentMethod.CASH,
    nv: nv2,
    cat: catTet,
  });
  rev += await paid({
    y: 2026,
    m: 1,
    d: 12,
    cu: c('0901234517'),
    cake: 'Sinh nhật rau câu Vuông Size 24 - Người lớn',
    price: 220000,
    qty: 3,
    sur: 20000,
    method: PaymentMethod.BANK_TRANSFER,
    nv: nv1,
    cat: catSinhNhat,
    note: 'viết tên Phong',
  });
  rev += await paid({
    y: 2026,
    m: 1,
    d: 14,
    cu: c('0901234518'),
    cake: 'Thôi nôi - 12 cái',
    price: 85000,
    qty: 5,
    method: PaymentMethod.BANK_TRANSFER,
    nv: nv2,
    cat: catThoiNoi,
  });
  rev += await paid({
    y: 2026,
    m: 1,
    d: 15,
    cu: c('0901234519'),
    cake: 'Sinh nhật rau câu Vuông Size 24 - Người lớn',
    price: 220000,
    qty: 3,
    sur: 20000,
    method: PaymentMethod.CASH,
    nv: nv1,
    cat: catSinhNhat,
  });
  rev += await paid({
    y: 2026,
    m: 1,
    d: 16,
    cu: c('0901234520'),
    cake: 'Sinh nhật rau câu Tim Size 20 - Người lớn',
    price: 160000,
    qty: 3,
    sur: 20000,
    method: PaymentMethod.CASH,
    nv: nv2,
    cat: catSinhNhat,
  });
  rev += await paid({
    y: 2026,
    m: 1,
    d: 18,
    cu: c('0901234501'),
    cake: 'Sinh nhật rau câu Tròn Size 24 - Người lớn',
    price: 180000,
    qty: 3,
    sur: 20000,
    method: PaymentMethod.BANK_TRANSFER,
    nv: nv1,
    cat: catSinhNhat,
  });
  rev += await paid({
    y: 2026,
    m: 1,
    d: 20,
    cu: c('0901234502'),
    cake: 'Lễ - Set 1',
    price: 130000,
    qty: 5,
    method: PaymentMethod.CASH,
    nv: nv2,
    cat: catLe,
  });
  rev += await paid({
    y: 2026,
    m: 1,
    d: 22,
    cu: c('0901234503'),
    cake: 'Sinh nhật rau câu Vuông Size 24 - Người lớn',
    price: 220000,
    qty: 3,
    sur: 20000,
    method: PaymentMethod.CASH,
    nv: nv1,
    cat: catSinhNhat,
  });
  rev += await paid({
    y: 2026,
    m: 1,
    d: 23,
    cu: c('0901234504'),
    cake: 'Thôi nôi - 12 cái',
    price: 85000,
    qty: 5,
    method: PaymentMethod.BANK_TRANSFER,
    nv: nv2,
    cat: catThoiNoi,
  });
  rev += await paid({
    y: 2026,
    m: 1,
    d: 24,
    cu: c('0901234505'),
    cake: 'Sinh nhật rau câu Tròn Size 24 - Người lớn',
    price: 180000,
    qty: 3,
    sur: 20000,
    method: PaymentMethod.CASH,
    nv: nv1,
    cat: catSinhNhat,
  });
  rev += await paid({
    y: 2026,
    m: 1,
    d: 25,
    cu: c('0901234506'),
    cake: 'Bánh ăn loại 3',
    price: 70000,
    qty: 10,
    method: PaymentMethod.CASH,
    nv: nv2,
    cat: catBanhAn,
  });
  rev += await paid({
    y: 2026,
    m: 1,
    d: 26,
    cu: c('0901234507'),
    cake: 'Sinh nhật rau câu Tim Size 24 - Người lớn',
    price: 180000,
    qty: 3,
    sur: 20000,
    method: PaymentMethod.BANK_TRANSFER,
    nv: nv1,
    cat: catSinhNhat,
  });
  rev += await paid({
    y: 2026,
    m: 1,
    d: 27,
    cu: c('0901234508'),
    cake: 'Plan - 10 cái',
    price: 70000,
    qty: 6,
    method: PaymentMethod.CASH,
    nv: nv2,
    cat: catPlan,
  });
  rev += await paid({
    y: 2026,
    m: 1,
    d: 28,
    cu: c('0901234509'),
    cake: 'Sinh nhật rau câu Vuông Size 20 - Người lớn',
    price: 200000,
    qty: 3,
    sur: 20000,
    method: PaymentMethod.CASH,
    nv: nv1,
    cat: catSinhNhat,
  });
  rev += await paid({
    y: 2026,
    m: 1,
    d: 29,
    cu: c('0901234510'),
    cake: 'Lễ - Set 2',
    price: 75000,
    qty: 6,
    method: PaymentMethod.CASH,
    nv: nv2,
    cat: catLe,
  });
  rev += await paid({
    y: 2026,
    m: 1,
    d: 30,
    cu: c('0901234511'),
    cake: 'Sinh nhật rau câu Vuông Size 24 - Trẻ con',
    price: 220000,
    qty: 3,
    sur: 20000,
    method: PaymentMethod.BANK_TRANSFER,
    nv: nv1,
    cat: catSinhNhat,
  });
  console.log(`  T1/2026: ${rev.toLocaleString('vi-VN')}đ`);
  await seedMonthExpenses(2026, 1);

  // ─── THÁNG 2/2026 — Valentine ─────────────────────────────────────────────
  rev = await seedNormalMonth(2026, 2, 28, normalMonthOrders2026);
  rev += await paid({
    y: 2026,
    m: 2,
    d: 14,
    cu: c('0901234512'),
    cake: 'Sinh nhật rau câu Tim Size 24 - Người lớn',
    price: 180000,
    qty: 3,
    sur: 30000,
    method: PaymentMethod.BANK_TRANSFER,
    nv: nv1,
    cat: catSinhNhat,
    note: 'Valentine',
  });
  rev += await paid({
    y: 2026,
    m: 2,
    d: 14,
    cu: c('0901234513'),
    cake: 'Sinh nhật rau câu Tim Size 20 - Người lớn',
    price: 160000,
    qty: 3,
    sur: 30000,
    method: PaymentMethod.BANK_TRANSFER,
    nv: nv2,
    cat: catSinhNhat,
    note: 'Valentine',
  });
  console.log(`  T2/2026: ${rev.toLocaleString('vi-VN')}đ`);
  await seedMonthExpenses(2026, 2);

  // ─── THÁNG 3/2026 — 8/3 ──────────────────────────────────────────────────
  rev = await seedNormalMonth(2026, 3, 31, normalMonthOrders2026);
  rev += await paid({
    y: 2026,
    m: 3,
    d: 8,
    cu: c('0901234514'),
    cake: 'Sinh nhật rau câu Tim Size 24 - Người lớn',
    price: 180000,
    qty: 3,
    sur: 30000,
    method: PaymentMethod.BANK_TRANSFER,
    nv: nv1,
    cat: catSinhNhat,
    note: '8/3 tặng mẹ',
  });
  rev += await paid({
    y: 2026,
    m: 3,
    d: 8,
    cu: c('0901234515'),
    cake: 'Sinh nhật rau câu Tim Size 20 - Người lớn',
    price: 160000,
    qty: 3,
    sur: 30000,
    method: PaymentMethod.BANK_TRANSFER,
    nv: nv2,
    cat: catSinhNhat,
    note: '8/3',
  });
  console.log(`  T3/2026: ${rev.toLocaleString('vi-VN')}đ`);
  await seedMonthExpenses(2026, 3);

  // ─── THÁNG 4/2026 (1-20) — 2/3 tháng ────────────────────────────────────
  rev = await seedNormalMonth(2026, 4, 20, normalMonthOrders2026);
  console.log(`  T4/2026 (1-20): ${rev.toLocaleString('vi-VN')}đ`);
  await expense(
    2026,
    4,
    3,
    catLuong,
    3000000,
    'Lương nhân viên (staff) T4/2026',
  );
  await expense(2026, 4, 3, catLuong, 4000000, 'Lương kế toán T4/2026');
  await expense(2026, 4, 3, catLuong, 5000000, 'Lương admin T4/2026');
  await expense(2026, 4, 5, catDua, 400000, 'Mua dừa T4/2026');
  await expense(2026, 4, 6, catTrung, 260000, 'Mua trứng T4/2026');
  await expense(2026, 4, 7, catDuong, 200000, 'Mua đường T4/2026');
  await expense(2026, 4, 8, catSua, 133000, 'Mua sữa T4/2026');
  await expense(2026, 4, 9, catGas, 200000, 'Gas T4/2026');
  await expense(2026, 4, 10, catMau, 133000, 'Mua màu T4/2026');
  await expense(2026, 4, 11, catHop, 200000, 'Mua hộp T4/2026');
  await expense(2026, 4, 12, catRCT, 133000, 'Mua RCT T4/2026');
  await expense(2026, 4, 13, catTrangTri, 133000, 'Trang trí T4/2026');
  await expense(2026, 4, 14, catPK, 100000, 'Phụ kiện T4/2026');
  await expense(2026, 4, 15, catShip, 100000, 'Phí ship T4/2026');
  await expense(2026, 4, 18, catDienNuoc, 670000, 'Tiền điện T4/2026');
  await expense(2026, 4, 19, catDienNuoc, 130000, 'Tiền nước T4/2026');

  // ─── Đơn đang xử lý (20/4/2026) ──────────────────────────────────────────
  orderCount++;
  await prisma.salesOrder.create({
    data: {
      orderCode: `DH${String(orderCount).padStart(4, '0')}`,
      customerName: c('0901234516').name,
      customerPhone: c('0901234516').phone,
      customerId: c('0901234516').id,
      cakeName: 'Sinh nhật rau câu Tim Size 20 - Trẻ con',
      quantity: 1,
      basePrice: 160000,
      surcharge: 0,
      addonPrice: 0,
      totalPrice: 160000,
      orderTime: makeDate(2026, 4, 19, 16),
      deliveryTime: makeDate(2026, 4, 20, 14),
      deliveryDate: new Date(2026, 3, 20),
      note: 'màu hồng nhạt',
      createdById: nv1.id,
      orderStatus: OrderStatus.DELIVERED,
      paymentStatus: PaymentStatus.PENDING_CONFIRM,
      paymentMethod: PaymentMethod.BANK_TRANSFER,
    },
  });
  orderCount++;
  await prisma.salesOrder.create({
    data: {
      orderCode: `DH${String(orderCount).padStart(4, '0')}`,
      customerName: c('0901234517').name,
      customerPhone: c('0901234517').phone,
      customerId: c('0901234517').id,
      cakeName: 'Sinh nhật rau câu Vuông Size 24 - Người lớn',
      quantity: 1,
      basePrice: 220000,
      surcharge: 20000,
      addonPrice: 0,
      totalPrice: 240000,
      orderTime: makeDate(2026, 4, 20, 8),
      deliveryTime: makeDate(2026, 4, 22, 10),
      deliveryDate: new Date(2026, 3, 22),
      note: 'viết tên Mai Văn Phong',
      createdById: nv2.id,
      orderStatus: OrderStatus.CONFIRMED,
      paymentStatus: PaymentStatus.UNPAID,
    },
  });
  orderCount++;
  await prisma.salesOrder.create({
    data: {
      orderCode: `DH${String(orderCount).padStart(4, '0')}`,
      customerName: c('0901234518').name,
      customerPhone: c('0901234518').phone,
      customerId: c('0901234518').id,
      cakeName: 'Thôi nôi - 12 cái',
      quantity: 2,
      basePrice: 85000,
      surcharge: 0,
      addonPrice: 0,
      totalPrice: 170000,
      orderTime: makeDate(2026, 4, 20, 9),
      deliveryTime: makeDate(2026, 4, 23, 8),
      deliveryDate: new Date(2026, 3, 23),
      createdById: nv1.id,
      orderStatus: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.UNPAID,
    },
  });

  console.log('  ✅ Đơn đang xử lý: 3 đơn');
  console.log(`  📊 Tổng số đơn: ${orderCount}`);
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🚀 Bắt đầu seed EIEMS Bakery...\n');
  console.log('🗑️  Clearing old data...');
  await prisma.notification.deleteMany();
  await prisma.salesOrder.deleteMany();
  await prisma.debtPayment.deleteMany();
  await prisma.debt.deleteMany();
  await prisma.transactionLog.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.cakePrice.deleteMany();
  await prisma.cakeProduct.deleteMany();
  await prisma.category.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  await seedUsers();
  await seedCustomers();
  await seedCategories();
  await seedCakeProducts();
  await seedYearData();

  console.log('\n🎉 Seed hoàn tất!\n');
  console.log('📋 Tài khoản (password: 123456):');
  console.log('   OWNER      → owner@tiembanh.vn');
  console.log('   ADMIN      → admin@tiembanh.vn');
  console.log('   ACCOUNTANT → ketoan@tiembanh.vn');
  console.log('   STAFF      → nhanvien1@tiembanh.vn / nhanvien2@tiembanh.vn');
  console.log('\n📊 Kết quả dự kiến NĂM 2025:');
  console.log('   Tổng thu nhập:  ~280,000,000đ  ✅ (tăng từ 198tr)');
  console.log('   Tổng chi tiêu:   160,400,000đ  (giữ nguyên)');
  console.log('   Lợi nhuận:      ~119,600,000đ  ✅ Thu > Chi');
  console.log('\n📊 Thay đổi:');
  console.log('   - qty sinh nhật: 3 → 5 cái/đơn (chỉ năm 2025)');
  console.log('   - Chi tiêu: KHÔNG thay đổi');
  console.log('   - Năm 2026: giữ nguyên qty gốc (3 cái/đơn)');
}

main()
  .catch((e) => {
    console.error('❌ Seed thất bại:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
