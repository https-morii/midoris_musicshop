import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthenticatedRequest } from '../common/authenticated-request.interface';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartService } from './cart.service';
@UseGuards(JwtAuthGuard) @Controller('cart')
export class CartController {
  constructor(private readonly service:CartService) {}
  @Get() getCart(@Req() req:AuthenticatedRequest) { return this.service.getCart(req.user); }
  @Post('items') addItem(@Req() req:AuthenticatedRequest,@Body() dto:AddCartItemDto) { return this.service.addItem(req.user,dto); }
  @Patch('items/:productId') updateItem(@Req() req:AuthenticatedRequest,@Param('productId',ParseIntPipe) id:number,@Body() dto:UpdateCartItemDto) { return this.service.updateItem(req.user,id,dto); }
  @Delete('items/:productId') removeItem(@Req() req:AuthenticatedRequest,@Param('productId',ParseIntPipe) id:number) { return this.service.removeItem(req.user,id); }
  @Delete() clear(@Req() req:AuthenticatedRequest) { return this.service.clear(req.user); }
}
