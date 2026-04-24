import apiClient from './client';
import type { PaginatedBooks, Book } from '../types';

export interface BookQuery {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number;
  authorId?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  minPrice?: number;
  maxPrice?: number;
}

export const getBooks = (params: BookQuery = {}) =>
  apiClient.get<PaginatedBooks>('/books', { params }).then((r) => r.data);

export const getBook = (id: number) =>
  apiClient.get<Book>(`/books/${id}`).then((r) => r.data);

export const createBook = (data: FormData) =>
  apiClient.post<Book>('/books', data, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);

export const updateBook = (id: number, data: Partial<Book>) =>
  apiClient.patch<Book>(`/books/${id}`, data).then((r) => r.data);

export const deleteBook = (id: number) =>
  apiClient.delete(`/books/${id}`).then((r) => r.data);
