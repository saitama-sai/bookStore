import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Author } from './author.entity';
import { CreateAuthorDto } from './dto/create-author.dto';

@Injectable()
export class AuthorService {
  constructor(
    @InjectRepository(Author)
    private authorRepository: Repository<Author>,
  ) {}

  findAll() {
    return this.authorRepository.find();
  }

  async findOne(id: number) {
    const author = await this.authorRepository.findOne({
      where: { id },
      relations: ['books', 'books.category'],
    });
    if (!author) throw new NotFoundException('Yazar bulunamadı');
    return author;
  }

  create(dto: CreateAuthorDto) {
    const author = this.authorRepository.create(dto);
    return this.authorRepository.save(author);
  }
}
