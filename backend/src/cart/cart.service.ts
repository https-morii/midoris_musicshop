import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthUser } from '../common/auth-user.interface';
import { Product } from '../products/product.entity';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartItem } from './cart-item.entity';
@Injectable()
export class CartService {
  constructor(@InjectRepository(CartItem) private readonly items:Repository<CartItem>,@InjectRepository(Product) private readonly products:Repository<Product>) {}
  async getCart(user:AuthUser) { const items=await this.items.find({where:{userId:user.id},relations:{product:true},order:{createdAt:'ASC'}}); const responseItems=items.map(({product,quantity})=>({product,quantity,subtotal:Number((product.price*quantity).toFixed(2))})); return {items:responseItems,totalItems:items.reduce((t,i)=>t+i.quantity,0),total:Number(responseItems.reduce((t,i)=>t+i.subtotal,0).toFixed(2))}; }
  async addItem(user:AuthUser,dto:AddCartItemDto) { const product=await this.products.findOneBy({id:dto.productId}); if(!product) throw new NotFoundException('Produto não encontrado.'); if(product.sellerId===user.id) throw new ForbiddenException('Você não pode adicionar seu próprio produto ao carrinho.'); let item=await this.items.findOneBy({userId:user.id,productId:product.id}); if(item) item.quantity+=dto.quantity??1; else item=this.items.create({userId:user.id,productId:product.id,quantity:dto.quantity??1}); await this.items.save(item); return this.getCart(user); }
  async updateItem(user:AuthUser,id:number,dto:UpdateCartItemDto) { const item=await this.items.findOneBy({userId:user.id,productId:id}); if(!item) throw new NotFoundException('Item não encontrado no carrinho.'); item.quantity=dto.quantity; await this.items.save(item); return this.getCart(user); }
  async removeItem(user:AuthUser,id:number) { const result=await this.items.delete({userId:user.id,productId:id}); if(!result.affected) throw new NotFoundException('Item não encontrado no carrinho.'); return this.getCart(user); }
  async clear(user:AuthUser) { await this.items.delete({userId:user.id}); return {items:[],totalItems:0,total:0}; }
}
