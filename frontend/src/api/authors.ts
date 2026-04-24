import apiClient from './client';
import type { Author } from '../types';

export const getAuthors = () =>
  apiClient.get<Author[]>('/authors').then((r) => r.data);

export const getAuthor = (id: number) =>
  apiClient.get<Author>(`/authors/${id}`).then((r) => r.data);

export const createAuthor = (data: { name: string; biography?: string; country?: string }) =>
  apiClient.post<Author>('/authors', data).then((r) => r.data);
