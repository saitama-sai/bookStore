import apiClient from './client';
import type { User } from '../types';

export const register = (data: { email: string; password: string; firstName: string; lastName: string }) =>
  apiClient.post('/auth/register', data).then((r) => r.data);

export const login = (data: { email: string; password: string }) =>
  apiClient.post<{ access_token: string; user: User }>('/auth/login', data).then((r) => r.data);

export const getProfile = () =>
  apiClient.get<User>('/auth/profile').then((r) => r.data);
