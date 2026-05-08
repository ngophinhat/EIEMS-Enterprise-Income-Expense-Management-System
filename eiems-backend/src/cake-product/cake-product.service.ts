import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCakeProductDto } from './dto/create-cake-product.dto';
import { CakeCategory, CakeShape, CakeSize } from '@prisma/client';

@Injectable()
export class CakeProductService {
  constructor(private prisma: PrismaService) {}

  // ─── Tạo sản phẩm bánh ───────────────────────────────────────────────────

  async create(dto: CreateCakeProductDto) {
    this.validateCakeProduct(dto);

    return this.prisma.cakeProduct.create({
      data: {
        category: dto.category,
        name: dto.name,
        shape: dto.shape,
        size: dto.size,
        ageGroup: dto.ageGroup,
        setNumber: dto.setNumber,
        setQuantity: dto.setQuantity,
        isPriceManual: dto.isPriceManual ?? false,
        description: dto.description,
        isActive: dto.isActive ?? true,
        prices: {
          create: dto.prices.map((p) => ({
            shape: p.shape,
            size: p.size,
            price: p.price,
          })),
        },
      },
      include: { prices: true },
    });
  }

  // ─── Lấy tất cả sản phẩm ─────────────────────────────────────────────────

  async findAll(category?: CakeCategory) {
    return this.prisma.cakeProduct.findMany({
      where: {
        isActive: true,
        ...(category && { category }),
      },
      include: { prices: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  // ─── Lấy 1 sản phẩm ──────────────────────────────────────────────────────

  async findOne(id: string) {
    const product = await this.prisma.cakeProduct.findUnique({
      where: { id },
      include: { prices: true },
    });
    if (!product) throw new NotFoundException('Không tìm thấy sản phẩm bánh');
    return product;
  }

  // ─── Cập nhật sản phẩm ───────────────────────────────────────────────────

  async update(id: string, dto: Partial<CreateCakeProductDto>) {
    await this.findOne(id);

    return this.prisma.$transaction(async (tx) => {
      // Nếu có update prices → xóa cũ, tạo mới
      if (dto.prices && dto.prices.length > 0) {
        await tx.cakePrice.deleteMany({ where: { cakeProductId: id } });
        await tx.cakePrice.createMany({
          data: dto.prices.map((p) => ({
            cakeProductId: id,
            shape: p.shape,
            size: p.size,
            price: p.price,
          })),
        });
      }

      return tx.cakeProduct.update({
        where: { id },
        data: {
          name: dto.name,
          shape: dto.shape,
          size: dto.size,
          ageGroup: dto.ageGroup,
          setNumber: dto.setNumber,
          setQuantity: dto.setQuantity,
          isPriceManual: dto.isPriceManual,
          description: dto.description,
          isActive: dto.isActive,
        },
        include: { prices: true },
      });
    });
  }

  // ─── Toggle active ────────────────────────────────────────────────────────

  async toggleActive(id: string) {
    const product = await this.findOne(id);
    return this.prisma.cakeProduct.update({
      where: { id },
      data: { isActive: !product.isActive },
      include: { prices: true },
    });
  }

  // ─── Lookup giá theo shape × size ────────────────────────────────────────
  // Dùng bởi SalesOrder khi tính giá tự động

  async lookupPrice(
    cakeProductId: string,
    shape?: CakeShape,
    size?: CakeSize,
  ): Promise<number> {
    const priceRecord = await this.prisma.cakePrice.findFirst({
      where: {
        cakeProductId,
        shape: shape ?? null,
        size: size ?? null,
      },
    });

    if (!priceRecord) {
      throw new BadRequestException(
        'Không tìm thấy giá cho loại bánh này. Vui lòng kiểm tra shape/size.',
      );
    }

    return Number(priceRecord.price);
  }

  // ─── Validate logic nghiệp vụ ────────────────────────────────────────────

  private validateCakeProduct(dto: CreateCakeProductDto) {
    const isBirthday = dto.category === CakeCategory.BIRTHDAY;
    const isManual =
      dto.category === CakeCategory.BANH_BO ||
      dto.category === CakeCategory.BANH_AN;
    const isSet = (
      [
        CakeCategory.ONG_TAO,
        CakeCategory.LE,
        CakeCategory.THOI_NOI,
        CakeCategory.TET,
        CakeCategory.PLAN,
      ] as CakeCategory[]
    ).includes(dto.category);

    if (isBirthday) {
      if (!dto.shape)
        throw new BadRequestException(
          'Bánh sinh nhật cần có hình dạng (shape)',
        );
      if (!dto.size)
        throw new BadRequestException('Bánh sinh nhật cần có kích cỡ (size)');
      if (dto.prices.length === 0)
        throw new BadRequestException('Bánh sinh nhật cần có bảng giá');
    }

    if (isSet) {
      if (!dto.setNumber)
        throw new BadRequestException('Bánh set cần có số set');
      if (dto.prices.length !== 1)
        throw new BadRequestException('Bánh set chỉ có 1 mức giá cố định');
    }

    if (isManual) {
      if (dto.prices.length > 0)
        throw new BadRequestException(
          'Bánh bò/bánh ăn không cần bảng giá, giá sẽ nhập tay khi tạo đơn',
        );
    }
  }
}
