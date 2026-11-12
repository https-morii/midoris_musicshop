import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthUser } from '../common/auth-user.interface';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './product.entity';

@Injectable()
export class ProductsService {
  constructor(@InjectRepository(Product) private readonly products: Repository<Product>) {}

  findAll() {
    return this.products.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: number) {
    const product = await this.products.findOneBy({ id });
    if (!product) throw new NotFoundException('Produto não encontrado.');
    return product;
  }

  async create(dto: CreateProductDto, user: AuthUser) {
    if (user.role !== 'vendedor') throw new ForbiddenException('Somente vendedores podem anunciar produtos.');
    return this.products.save(this.products.create({
      ...dto,
      description: dto.description ?? null,
      imageUrl: dto.imageUrl ?? null,
      sellerId: user.id,
    }));
  }

  async update(id: number, dto: UpdateProductDto, user: AuthUser) {
    const product = await this.findOne(id);
    this.assertOwner(product, user);
    Object.assign(product, dto);
    return this.products.save(product);
  }

  async remove(id: number, user: AuthUser) {
    const product = await this.findOne(id);
    this.assertOwner(product, user);
    await this.products.remove(product);
    return { deleted: true, id };
  }

  private assertOwner(product: Product, user: AuthUser) {
    if (product.sellerId !== user.id) throw new ForbiddenException('Você só pode alterar seus próprios anúncios.');
  }
}
