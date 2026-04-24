import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from '../user/user.entity';
import { Category } from '../category/category.entity';
import { Author } from '../author/author.entity';
import { Book } from '../book/book.entity';
import { Order, OrderStatus } from '../order/order.entity';
import { OrderItem } from '../order/order-item.entity';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
    @InjectRepository(Author)
    private authorRepo: Repository<Author>,
    @InjectRepository(Book)
    private bookRepo: Repository<Book>,
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepo: Repository<OrderItem>,
    private dataSource: DataSource,
  ) {}

  private async clearAllTables() {
    // Use raw SQL to avoid TypeORM's empty criteria restriction
    await this.dataSource.query('DELETE FROM order_items');
    await this.dataSource.query('DELETE FROM orders');
    await this.dataSource.query('DELETE FROM book_authors');
    await this.dataSource.query('DELETE FROM books');
    await this.dataSource.query('DELETE FROM authors');
    await this.dataSource.query('DELETE FROM categories');
    await this.dataSource.query('DELETE FROM users');
  }

  async resetDatabase() {
    await this.clearAllTables();

    const adminPassword = await bcrypt.hash('Admin123!', 10);
    await this.userRepo.save(
      this.userRepo.create({
        email: 'admin@kitabevi.com',
        password: adminPassword,
        firstName: 'Admin',
        lastName: 'Kullanıcı',
        role: UserRole.ADMIN,
      }),
    );

    const categories = await this.seedCategories();
    return {
      message: 'Veritabanı sıfırlandı',
      admin: 'admin@kitabevi.com / Admin123!',
      categories: categories.length,
    };
  }

  async seedCategories() {
    const cats = [
      { name: 'Roman', slug: 'roman', description: 'Türk ve dünya edebiyatından romanlar' },
      { name: 'Bilim Kurgu', slug: 'bilim-kurgu', description: 'Bilim kurgu ve fantastik eserler' },
      { name: 'Tarih', slug: 'tarih', description: 'Tarih ve biyografi kitapları' },
      { name: 'Felsefe', slug: 'felsefe', description: 'Felsefe ve düşünce kitapları' },
      { name: 'Çocuk', slug: 'cocuk', description: 'Çocuk kitapları ve masallar' },
    ];
    return this.categoryRepo.save(cats.map((c) => this.categoryRepo.create(c)));
  }

  async seedDemoData() {
    // Clear existing data first to avoid UNIQUE constraint violations
    await this.clearAllTables();

    // Create admin user
    const adminPassword = await bcrypt.hash('Admin123!', 10);
    await this.userRepo.save(
      this.userRepo.create({
        email: 'admin@kitabevi.com',
        password: adminPassword,
        firstName: 'Admin',
        lastName: 'Kullanıcı',
        role: UserRole.ADMIN,
      }),
    );

    // Seed categories
    const categories = await this.seedCategories();

    const authorData = [
      { name: 'Orhan Pamuk', biography: 'Nobel ödüllü Türk yazar', country: 'Türkiye' },
      { name: 'Ahmet Hamdi Tanpınar', biography: 'Türk edebiyatının önemli ismi', country: 'Türkiye' },
      { name: 'Yaşar Kemal', biography: 'Dünyaca ünlü Türk yazar', country: 'Türkiye' },
      { name: 'Sabahattin Ali', biography: 'Türk hikaye ve roman yazarı', country: 'Türkiye' },
      { name: 'Reşat Nuri Güntekin', biography: 'Türk roman yazarı', country: 'Türkiye' },
      { name: 'George Orwell', biography: 'İngiliz yazar ve gazeteci', country: 'İngiltere' },
      { name: 'Franz Kafka', biography: 'Çek-Alman yazar', country: 'Çek Cumhuriyeti' },
      { name: 'Albert Camus', biography: 'Fransız yazar ve filozofu', country: 'Fransa' },
      { name: 'Fyodor Dostoyevski', biography: 'Rus romancı', country: 'Rusya' },
      { name: 'Leo Tolstoy', biography: 'Rus yazar', country: 'Rusya' },
    ];

    const authors = await this.authorRepo.save(
      authorData.map((a) => this.authorRepo.create(a)),
    );

    const getCat = (name: string) => categories.find((c) => c.name === name) || categories[0];

    const booksData = [
      { title: 'Kar', isbn: '9789750802690', price: 45.90, stock: 25, publishYear: 2002, pageCount: 480, coverImage: 'https://covers.openlibrary.org/b/isbn/9789750802690-M.jpg', category: getCat('Roman'), authors: [authors[0]] },
      { title: 'Benim Adım Kırmızı', isbn: '9789750802683', price: 52.50, stock: 18, publishYear: 1998, pageCount: 592, coverImage: 'https://covers.openlibrary.org/b/isbn/9789750802683-M.jpg', category: getCat('Roman'), authors: [authors[0]] },
      { title: 'Huzur', isbn: '9789753630108', price: 38.90, stock: 30, publishYear: 1949, pageCount: 344, coverImage: 'https://covers.openlibrary.org/b/isbn/9789753630108-M.jpg', category: getCat('Roman'), authors: [authors[1]] },
      { title: 'İnce Memed', isbn: '9789750718533', price: 42.00, stock: 22, publishYear: 1955, pageCount: 448, coverImage: 'https://covers.openlibrary.org/b/isbn/9789750718533-M.jpg', category: getCat('Roman'), authors: [authors[2]] },
      { title: 'Kürk Mantolu Madonna', isbn: '9789750736186', price: 35.00, stock: 40, publishYear: 1943, pageCount: 168, coverImage: 'https://covers.openlibrary.org/b/isbn/9789750736186-M.jpg', category: getCat('Roman'), authors: [authors[3]] },
      { title: 'Çalıkuşu', isbn: '9789754580662', price: 40.00, stock: 35, publishYear: 1922, pageCount: 480, coverImage: 'https://covers.openlibrary.org/b/isbn/9789754580662-M.jpg', category: getCat('Roman'), authors: [authors[4]] },
      { title: '1984', isbn: '9780451524935', price: 48.90, stock: 50, publishYear: 1949, pageCount: 352, coverImage: 'https://covers.openlibrary.org/b/isbn/9780451524935-M.jpg', category: getCat('Bilim Kurgu'), authors: [authors[5]] },
      { title: 'Hayvan Çiftliği', isbn: '9780451526342', price: 30.00, stock: 45, publishYear: 1945, pageCount: 144, coverImage: 'https://covers.openlibrary.org/b/isbn/9780451526342-M.jpg', category: getCat('Bilim Kurgu'), authors: [authors[5]] },
      { title: 'Dönüşüm', isbn: '9780486290300', price: 28.50, stock: 38, publishYear: 1915, pageCount: 128, coverImage: 'https://covers.openlibrary.org/b/isbn/9780486290300-M.jpg', category: getCat('Felsefe'), authors: [authors[6]] },
      { title: 'Dava', isbn: '9780805209990', price: 32.00, stock: 28, publishYear: 1925, pageCount: 256, coverImage: 'https://covers.openlibrary.org/b/isbn/9780805209990-M.jpg', category: getCat('Felsefe'), authors: [authors[6]] },
      { title: 'Yabancı', isbn: '9780679720201', price: 29.90, stock: 42, publishYear: 1942, pageCount: 144, coverImage: 'https://covers.openlibrary.org/b/isbn/9780679720201-M.jpg', category: getCat('Felsefe'), authors: [authors[7]] },
      { title: 'Veba', isbn: '9780679720218', price: 38.00, stock: 32, publishYear: 1947, pageCount: 336, coverImage: 'https://covers.openlibrary.org/b/isbn/9780679720218-M.jpg', category: getCat('Roman'), authors: [authors[7]] },
      { title: 'Suç ve Ceza', isbn: '9780486415871', price: 55.00, stock: 20, publishYear: 1866, pageCount: 672, coverImage: 'https://covers.openlibrary.org/b/isbn/9780486415871-M.jpg', category: getCat('Roman'), authors: [authors[8]] },
      { title: 'Karamazov Kardeşler', isbn: '9780374528379', price: 65.00, stock: 15, publishYear: 1880, pageCount: 896, coverImage: 'https://covers.openlibrary.org/b/isbn/9780374528379-M.jpg', category: getCat('Roman'), authors: [authors[8]] },
      { title: 'Savaş ve Barış', isbn: '9780199232765', price: 75.00, stock: 12, publishYear: 1869, pageCount: 1296, coverImage: 'https://covers.openlibrary.org/b/isbn/9780199232765-M.jpg', category: getCat('Tarih'), authors: [authors[9]] },
      { title: 'Anna Karenina', isbn: '9780143035008', price: 60.00, stock: 18, publishYear: 1878, pageCount: 864, coverImage: 'https://covers.openlibrary.org/b/isbn/9780143035008-M.jpg', category: getCat('Roman'), authors: [authors[9]] },
      { title: 'Küçük Prens', isbn: '9780156012195', price: 22.00, stock: 80, publishYear: 1943, pageCount: 96, coverImage: 'https://covers.openlibrary.org/b/isbn/9780156012195-M.jpg', category: getCat('Çocuk'), authors: [authors[7]] },
      { title: 'Alice Harikalar Diyarında', isbn: '9780141439761', price: 25.00, stock: 45, publishYear: 1865, pageCount: 192, coverImage: 'https://covers.openlibrary.org/b/isbn/9780141439761-M.jpg', category: getCat('Çocuk'), authors: [authors[5]] },
      { title: 'Dune', isbn: '9780441172719', price: 55.00, stock: 20, publishYear: 1965, pageCount: 896, coverImage: 'https://covers.openlibrary.org/b/isbn/9780441172719-M.jpg', category: getCat('Bilim Kurgu'), authors: [authors[5]] },
      { title: 'Cesur Yeni Dünya', isbn: '9780060850524', price: 45.00, stock: 30, publishYear: 1932, pageCount: 311, coverImage: 'https://covers.openlibrary.org/b/isbn/9780060850524-M.jpg', category: getCat('Bilim Kurgu'), authors: [authors[6]] },
      { title: 'Otomatik Portakal', isbn: '9780393312836', price: 40.00, stock: 25, publishYear: 1962, pageCount: 240, coverImage: 'https://covers.openlibrary.org/b/isbn/9780393312836-M.jpg', category: getCat('Bilim Kurgu'), authors: [authors[7]] },
      { title: 'Fahrenheit 451', isbn: '9781451673319', price: 35.00, stock: 33, publishYear: 1953, pageCount: 249, coverImage: 'https://covers.openlibrary.org/b/isbn/9781451673319-M.jpg', category: getCat('Bilim Kurgu'), authors: [authors[5]] },
      { title: 'Yeraltından Notlar', isbn: '9780679734529', price: 28.00, stock: 40, publishYear: 1864, pageCount: 136, coverImage: 'https://covers.openlibrary.org/b/isbn/9780679734529-M.jpg', category: getCat('Felsefe'), authors: [authors[8]] },
      { title: 'Don Kişot', isbn: '9780060934347', price: 70.00, stock: 15, publishYear: 1605, pageCount: 982, coverImage: 'https://covers.openlibrary.org/b/isbn/9780060934347-M.jpg', category: getCat('Roman'), authors: [authors[9]] },
      { title: 'Sefiller', isbn: '9780451419439', price: 65.00, stock: 12, publishYear: 1862, pageCount: 1232, coverImage: 'https://covers.openlibrary.org/b/isbn/9780451419439-M.jpg', category: getCat('Roman'), authors: [authors[7]] },
      { title: 'Hobbit', isbn: '9780547928227', price: 42.00, stock: 55, publishYear: 1937, pageCount: 300, coverImage: 'https://covers.openlibrary.org/b/isbn/9780547928227-M.jpg', category: getCat('Çocuk'), authors: [authors[9]] },
      { title: 'Uçurtma Avcısı', isbn: '9781594631931', price: 38.00, stock: 28, publishYear: 2003, pageCount: 371, coverImage: 'https://covers.openlibrary.org/b/isbn/9781594631931-M.jpg', category: getCat('Roman'), authors: [authors[3]] },
      { title: 'Simyacı', isbn: '9780062315007', price: 32.00, stock: 65, publishYear: 1988, pageCount: 208, coverImage: 'https://covers.openlibrary.org/b/isbn/9780062315007-M.jpg', category: getCat('Felsefe'), authors: [authors[4]] },
      { title: 'Yüzüklerin Efendisi', isbn: '9780618640157', price: 85.00, stock: 18, publishYear: 1954, pageCount: 1178, coverImage: 'https://covers.openlibrary.org/b/isbn/9780618640157-M.jpg', category: getCat('Bilim Kurgu'), authors: [authors[9]] },
      { title: 'Sherlock Holmes', isbn: '9780553212419', price: 30.00, stock: 42, publishYear: 1892, pageCount: 307, coverImage: 'https://covers.openlibrary.org/b/isbn/9780553212419-M.jpg', category: getCat('Roman'), authors: [authors[2]] },
    ];

    const books = [];
    for (const bd of booksData) {
      const book = this.bookRepo.create({
        title: bd.title,
        isbn: bd.isbn,
        price: bd.price,
        stock: bd.stock,
        publishYear: bd.publishYear,
        pageCount: bd.pageCount,
        language: 'Türkçe',
        categoryId: bd.category.id,
        coverImage: bd.coverImage,
      });
      book.authors = bd.authors;
      books.push(await this.bookRepo.save(book));
    }

    const customerPassword = await bcrypt.hash('Customer123!', 10);
    const customers = await this.userRepo.save([
      this.userRepo.create({ email: 'ali@test.com', password: customerPassword, firstName: 'Ali', lastName: 'Yılmaz', role: UserRole.CUSTOMER }),
      this.userRepo.create({ email: 'ayse@test.com', password: customerPassword, firstName: 'Ayşe', lastName: 'Kara', role: UserRole.CUSTOMER }),
      this.userRepo.create({ email: 'mehmet@test.com', password: customerPassword, firstName: 'Mehmet', lastName: 'Demir', role: UserRole.CUSTOMER }),
      this.userRepo.create({ email: 'fatma@test.com', password: customerPassword, firstName: 'Fatma', lastName: 'Çelik', role: UserRole.CUSTOMER }),
      this.userRepo.create({ email: 'hasan@test.com', password: customerPassword, firstName: 'Hasan', lastName: 'Şahin', role: UserRole.CUSTOMER }),
    ]);

    const statuses = [OrderStatus.PENDING, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED, OrderStatus.CANCELLED];
    const addresses = ['İstanbul, Kadıköy', 'Ankara, Çankaya', 'İzmir, Konak', 'Bursa, Nilüfer', 'Antalya, Muratpaşa'];

    for (let i = 0; i < 15; i++) {
      const customer = customers[i % customers.length];
      const bookCount = Math.floor(Math.random() * 3) + 1;
      const selectedBooks = [...books].sort(() => 0.5 - Math.random()).slice(0, bookCount);

      let total = 0;
      const order = await this.orderRepo.save(
        this.orderRepo.create({
          userId: customer.id,
          totalPrice: 0,
          status: statuses[i % statuses.length],
          shippingAddress: addresses[i % addresses.length],
        }),
      );

      for (const book of selectedBooks) {
        const qty = Math.floor(Math.random() * 3) + 1;
        await this.orderItemRepo.save(
          this.orderItemRepo.create({
            orderId: order.id,
            bookId: book.id,
            quantity: qty,
            price: +book.price,
          }),
        );
        total += +book.price * qty;
      }

      await this.orderRepo.update(order.id, { totalPrice: total });
    }

    return {
      message: 'Demo verisi eklendi',
      categories: categories.length,
      authors: authors.length,
      books: books.length,
      customers: customers.length,
      orders: 15,
    };
  }

  async clearCorruptedData() {
    const stats = { stocklessBooks: 0, orphanOrders: 0, orphanItems: 0, emptyCategories: 0 };

    // Soft-delete books with zero stock
    const stocklessBooks = await this.bookRepo.find({ where: { stock: 0 } });
    for (const book of stocklessBooks) {
      await this.bookRepo.softDelete(book.id);
      stats.stocklessBooks++;
    }

    // Delete orphan order items (book deleted or doesn't exist)
    const orphanItemRows: any[] = await this.dataSource.query(
      `SELECT oi.id FROM order_items oi LEFT JOIN books b ON oi.bookId = b.id WHERE b.id IS NULL OR b.deletedAt IS NOT NULL`,
    );
    for (const row of orphanItemRows) {
      await this.dataSource.query('DELETE FROM order_items WHERE id = ?', [row.id]);
      stats.orphanItems++;
    }

    // Delete orphan orders (user doesn't exist)
    const orphanOrderRows: any[] = await this.dataSource.query(
      `SELECT o.id FROM orders o LEFT JOIN users u ON o.userId = u.id WHERE u.id IS NULL`,
    );
    for (const row of orphanOrderRows) {
      await this.dataSource.query('DELETE FROM order_items WHERE orderId = ?', [row.id]);
      await this.dataSource.query('DELETE FROM orders WHERE id = ?', [row.id]);
      stats.orphanOrders++;
    }

    // Delete empty categories
    const allCategories: any[] = await this.dataSource.query(
      `SELECT c.id, COUNT(b.id) as bookCount FROM categories c LEFT JOIN books b ON b.categoryId = c.id AND b.deletedAt IS NULL GROUP BY c.id HAVING bookCount = 0`,
    );
    for (const cat of allCategories) {
      await this.dataSource.query('DELETE FROM categories WHERE id = ?', [cat.id]);
      stats.emptyCategories++;
    }

    return { message: 'Bozuk veriler temizlendi', ...stats };
  }

  async getDatabaseStats() {
    const [users, categories, authors, books, orders, orderItems] = await Promise.all([
      this.userRepo.count(),
      this.categoryRepo.count(),
      this.authorRepo.count(),
      this.bookRepo.count(),
      this.orderRepo.count(),
      this.orderItemRepo.count(),
    ]);

    return {
      users,
      categories,
      authors,
      books,
      orders,
      orderItems,
      lastUpdated: new Date(),
    };
  }

  async seedInitialData() {
    const adminExists = await this.userRepo.findOne({ where: { email: 'admin@kitabevi.com' } });
    if (adminExists) return;

    const adminPassword = await bcrypt.hash('Admin123!', 10);
    await this.userRepo.save(
      this.userRepo.create({
        email: 'admin@kitabevi.com',
        password: adminPassword,
        firstName: 'Admin',
        lastName: 'Kullanıcı',
        role: UserRole.ADMIN,
      }),
    );

    const categories = await this.seedCategories();

    const authorData = [
      { name: 'Orhan Pamuk', biography: 'Nobel ödüllü Türk yazar', country: 'Türkiye' },
      { name: 'George Orwell', biography: 'İngiliz yazar', country: 'İngiltere' },
      { name: 'Franz Kafka', biography: 'Çek-Alman yazar', country: 'Çek Cumhuriyeti' },
    ];
    const authors = await this.authorRepo.save(
      authorData.map((a) => this.authorRepo.create(a)),
    );

    const getCat = (name: string) => categories.find((c) => c.name === name) || categories[0];

    const sampleBooks = [
      { title: 'Kar', isbn: '9789750802690', price: 45.90, stock: 25, publishYear: 2002, pageCount: 480, coverImage: 'https://covers.openlibrary.org/b/isbn/9789750802690-M.jpg', category: getCat('Roman'), author: authors[0] },
      { title: '1984', isbn: '9780451524935', price: 48.90, stock: 50, publishYear: 1949, pageCount: 352, coverImage: 'https://covers.openlibrary.org/b/isbn/9780451524935-M.jpg', category: getCat('Bilim Kurgu'), author: authors[1] },
      { title: 'Dönüşüm', isbn: '9780486290300', price: 28.50, stock: 38, publishYear: 1915, pageCount: 128, coverImage: 'https://covers.openlibrary.org/b/isbn/9780486290300-M.jpg', category: getCat('Felsefe'), author: authors[2] },
      { title: 'Benim Adım Kırmızı', isbn: '9789750802683', price: 52.50, stock: 18, publishYear: 1998, pageCount: 592, coverImage: 'https://covers.openlibrary.org/b/isbn/9789750802683-M.jpg', category: getCat('Roman'), author: authors[0] },
      { title: 'Hayvan Çiftliği', isbn: '9780451526342', price: 30.00, stock: 45, publishYear: 1945, pageCount: 144, coverImage: 'https://covers.openlibrary.org/b/isbn/9780451526342-M.jpg', category: getCat('Bilim Kurgu'), author: authors[1] },
      { title: 'Dava', isbn: '9780805209990', price: 32.00, stock: 28, publishYear: 1925, pageCount: 256, coverImage: 'https://covers.openlibrary.org/b/isbn/9780805209990-M.jpg', category: getCat('Felsefe'), author: authors[2] },
      { title: 'Küçük Prens', isbn: '9780156012195', price: 22.00, stock: 80, publishYear: 1943, pageCount: 96, coverImage: 'https://covers.openlibrary.org/b/isbn/9780156012195-M.jpg', category: getCat('Çocuk'), author: authors[0] },
      { title: 'Suç ve Ceza', isbn: '9780486415871', price: 55.00, stock: 20, publishYear: 1866, pageCount: 672, coverImage: 'https://covers.openlibrary.org/b/isbn/9780486415871-M.jpg', category: getCat('Tarih'), author: authors[1] },
      { title: 'Cesur Yeni Dünya', isbn: '9780060850524', price: 45.00, stock: 30, publishYear: 1932, pageCount: 311, coverImage: 'https://covers.openlibrary.org/b/isbn/9780060850524-M.jpg', category: getCat('Bilim Kurgu'), author: authors[2] },
      { title: 'Simyacı', isbn: '9780062315007', price: 32.00, stock: 65, publishYear: 1988, pageCount: 208, coverImage: 'https://covers.openlibrary.org/b/isbn/9780062315007-M.jpg', category: getCat('Roman'), author: authors[0] },
    ];

    for (const bd of sampleBooks) {
      const book = this.bookRepo.create({
        title: bd.title,
        isbn: bd.isbn,
        price: bd.price,
        stock: bd.stock,
        publishYear: bd.publishYear,
        pageCount: bd.pageCount,
        language: 'Türkçe',
        categoryId: bd.category.id,
        coverImage: bd.coverImage,
      });
      book.authors = [bd.author];
      await this.bookRepo.save(book);
    }
  }
}
