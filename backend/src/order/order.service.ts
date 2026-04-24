import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './order.entity';
import { OrderItem } from './order-item.entity';
import { Book } from '../book/book.entity';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
  ) {}

  async create(userId: number, dto: CreateOrderDto) {
    let totalPrice = 0;
    const itemsData: { book: Book; quantity: number; price: number }[] = [];

    for (const item of dto.items) {
      const book = await this.bookRepository.findOne({ where: { id: item.bookId } });
      if (!book) throw new NotFoundException(`Kitap bulunamadı: ${item.bookId}`);
      if (book.stock < item.quantity) {
        throw new BadRequestException(`Yetersiz stok: ${book.title} (Mevcut: ${book.stock})`);
      }
      totalPrice += +book.price * item.quantity;
      itemsData.push({ book, quantity: item.quantity, price: +book.price });
    }

    const order = this.orderRepository.create({
      userId,
      totalPrice,
      shippingAddress: dto.shippingAddress,
      status: OrderStatus.PENDING,
    });
    const savedOrder = await this.orderRepository.save(order);

    for (const item of itemsData) {
      const orderItem = this.orderItemRepository.create({
        orderId: savedOrder.id,
        bookId: item.book.id,
        quantity: item.quantity,
        price: item.price,
      });
      await this.orderItemRepository.save(orderItem);
      await this.bookRepository.update(item.book.id, { stock: item.book.stock - item.quantity });
    }

    return this.findOne(savedOrder.id, userId);
  }

  async findUserOrders(userId: number) {
    return this.orderRepository.find({
      where: { userId },
      relations: ['orderItems', 'orderItems.book'],
      order: { orderDate: 'DESC' },
    });
  }

  async findAllOrders() {
    return this.orderRepository.find({
      relations: ['orderItems', 'orderItems.book', 'user'],
      order: { orderDate: 'DESC' },
    });
  }

  async findOne(id: number, userId?: number) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['orderItems', 'orderItems.book', 'orderItems.book.authors', 'user'],
    });
    if (!order) throw new NotFoundException('Sipariş bulunamadı');
    if (userId && order.userId !== userId) throw new ForbiddenException('Bu siparişe erişim izniniz yok');
    return order;
  }

  async updateStatus(id: number, status: OrderStatus) {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Sipariş bulunamadı');
    order.status = status;
    return this.orderRepository.save(order);
  }
}
