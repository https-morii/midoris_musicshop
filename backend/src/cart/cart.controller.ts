import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthenticatedRequest } from '../common/authenticated-request.interface';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartService } from './cart.service';

@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Req() request: AuthenticatedRequest) {
    return this.cartService.getCart(request.user);
  }

  @Post('items')
  addItem(@Req() request: AuthenticatedRequest, @Body() dto: AddCartItemDto) {
    return this.cartService.addItem(request.user, dto);
  }

  @Patch('items/:productId')
  updateItem(
    @Req() request: AuthenticatedRequest,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(request.user, productId, dto);
  }

  @Delete('items/:productId')
  removeItem(@Req() request: AuthenticatedRequest, @Param('productId', ParseIntPipe) productId: number) {
    return this.cartService.removeItem(request.user, productId);
  }

  @Delete()
  clear(@Req() request: AuthenticatedRequest) {
    return this.cartService.clear(request.user);
  }
}
