import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Category } from '../category/category.entity';
import { Author } from '../author/author.entity';

@Entity('books')
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ unique: true })
  isbn: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ default: 0 })
  stock: number;

  @Column({ nullable: true })
  coverImage: string;

  @Column({ nullable: true })
  publishYear: number;

  @Column({ nullable: true })
  pageCount: number;

  @Column({ default: 'Türkçe' })
  language: string;

  @ManyToOne(() => Category, (category) => category.books, { nullable: true })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ nullable: true })
  categoryId: number;

  @ManyToMany(() => Author, (author) => author.books, { cascade: true })
  @JoinTable({
    name: 'book_authors',
    joinColumn: { name: 'bookId' },
    inverseJoinColumn: { name: 'authorId' },
  })
  authors: Author[];

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
