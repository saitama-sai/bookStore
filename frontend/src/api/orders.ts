import apiClient from './client';
import type { Order } from '../types';

export const createOrder = (data: { shippingAddress: string; items: { bookId: number; quantity: number }[] }) =>
  apiClient.post<Order>('/orders', data).then((r) => r.data);

export const getOrders = () =>
  apiClient.get<Order[]>('/orders').then((r) => r.data);

export const getOrder = (id: number) =>
  apiClient.get<Order>(`/orders/${id}`).then((r) => r.data);

export const updateOrderStatus = (id: number, status: string) =>
  apiClient.patch<Order>(`/orders/${id}/status`, { status }).then((r) => r.data);
