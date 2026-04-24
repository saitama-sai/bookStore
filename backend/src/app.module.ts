import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { CategoryModule } from './category/category.module';
import { AuthorModule } from './author/author.module';
import { BookModule } from './book/book.module';
import { OrderModule } from './order/order.module';
import { AdminModule } from './admin/admin.module';
import { User } from './user/user.entity';
import { Category } from './category/category.entity';
import { Author } from './author/author.entity';
import { Book } from './book/book.entity';
import { Order } from './order/order.entity';
import { OrderItem } from './order/order-item.entity';
import { SeedService } from './admin/seed.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: join(process.cwd(), 'kitabevi.db'),
      entities: [User, Category, Author, Book, Order, OrderItem],
      synchronize: true,
      logging: false,
    }),
    AuthModule,
    UserModule,
    CategoryModule,
    AuthorModule,
    BookModule,
    OrderModule,
    AdminModule,
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private seedService: SeedService) {}

  async onModuleInit() {
    await this.seedService.seedInitialData();
  }
}
