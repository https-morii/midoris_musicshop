import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { CartModule } from './cart/cart.module';
import { ProductsModule } from './products/products.module';
@Module({ imports: [ConfigModule.forRoot({ isGlobal: true }), TypeOrmModule.forRoot({ type: 'sqlite', database: process.env.DATABASE_PATH ?? './data/midori.sqlite', autoLoadEntities: true, synchronize: process.env.NODE_ENV !== 'production' }), AuthModule, ProductsModule, CartModule] })
export class AppModule {}
