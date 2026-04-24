import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Book } from '../book/book.entity';

@Entity('authors')
export class Author {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  biography: string;

  @Column({ nullable: true })
  country: string;

  @ManyToMany(() => Book, (book) => book.authors)
  books: Book[];
}
