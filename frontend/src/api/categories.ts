import apiClient from './client';
import type { Category } from '../types';

export const getCategories = () =>
  apiClient.get<Category[]>('/categories').then((r) => r.data);

export const createCategory = (data: { name: string; slug: string; description?: string }) =>
  apiClient.post<Category>('/categories', data).then((r) => r.data);
