import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthenticatedRequest } from '../common/authenticated-request.interface';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';
@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}
  @Get() findAll() { return this.service.findAll(); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }
  @UseGuards(JwtAuthGuard) @Post() create(@Body() dto: CreateProductDto, @Req() req: AuthenticatedRequest) { return this.service.create(dto, req.user); }
  @UseGuards(JwtAuthGuard) @Patch(':id') update(@Param('id', ParseIntPipe) id:number,@Body() dto:UpdateProductDto,@Req() req:AuthenticatedRequest) { return this.service.update(id,dto,req.user); }
  @UseGuards(JwtAuthGuard) @Delete(':id') remove(@Param('id',ParseIntPipe) id:number,@Req() req:AuthenticatedRequest) { return this.service.remove(id,req.user); }
}
