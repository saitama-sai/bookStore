import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions } from 'typeorm';
import { Book } from './book.entity';
import { Author } from '../author/author.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
    @InjectRepository(Author)
    private authorRepository: Repository<Author>,
  ) {}

  async findAll(query: any) {
    const { page = 1, limit = 12, search, categoryId, authorId, sortBy = 'createdAt', sortOrder = 'DESC', minPrice, maxPrice } = query;

    const qb = this.bookRepository.createQueryBuilder('book')
      .leftJoinAndSelect('book.category', 'category')
      .leftJoinAndSelect('book.authors', 'authors')
      .where('book.deletedAt IS NULL');

    if (search) {
      qb.andWhere('(book.title LIKE :search OR book.isbn LIKE :search)', { search: `%${search}%` });
    }
    if (categoryId) {
      qb.andWhere('book.categoryId = :categoryId', { categoryId });
    }
    if (authorId) {
      qb.andWhere('authors.id = :authorId', { authorId });
    }
    if (minPrice) {
      qb.andWhere('book.price >= :minPrice', { minPrice });
    }
    if (maxPrice) {
      qb.andWhere('book.price <= :maxPrice', { maxPrice });
    }

    const validSortFields = ['createdAt', 'price', 'title', 'publishYear'];
    const field = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    qb.orderBy(`book.${field}`, sortOrder === 'ASC' ? 'ASC' : 'DESC');

    const skip = (page - 1) * limit;
    qb.skip(skip).take(+limit);

    const [items, total] = await qb.getManyAndCount();
    return {
      items,
      total,
      page: +page,
      limit: +limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const book = await this.bookRepository.findOne({
      where: { id },
      relations: ['category', 'authors'],
    });
    if (!book) throw new NotFoundException('Kitap bulunamadı');
    return book;
  }

  async create(dto: CreateBookDto) {
    const { authorIds, ...bookData } = dto;
    const book = this.bookRepository.create(bookData);

    if (authorIds && authorIds.length > 0) {
      const authors = await this.authorRepository.findByIds(authorIds);
      book.authors = authors;
    }

    return this.bookRepository.save(book);
  }

  async update(id: number, dto: UpdateBookDto) {
    const book = await this.findOne(id);
    const { authorIds, ...bookData } = dto;

    Object.assign(book, bookData);

    if (authorIds !== undefined) {
      const authors = await this.authorRepository.findByIds(authorIds);
      book.authors = authors;
    }

    return this.bookRepository.save(book);
  }

  async remove(id: number) {
    const book = await this.findOne(id);
    await this.bookRepository.softDelete(id);
    return { message: 'Kitap silindi' };
  }
}
