import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { SeedService } from './seed.service';
import { User } from '../user/user.entity';
import { Category } from '../category/category.entity';
import { Author } from '../author/author.entity';
import { Book } from '../book/book.entity';
import { Order } from '../order/order.entity';
import { OrderItem } from '../order/order-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Category, Author, Book, Order, OrderItem])],
  controllers: [AdminController],
  providers: [AdminService, SeedService],
  exports: [SeedService],
})
export class AdminModule {}
