import apiClient from './client';
import type { DatabaseStats } from '../types';

export const resetDatabase = () =>
  apiClient.post('/admin/reset-database').then((r) => r.data);

export const seedDemoData = () =>
  apiClient.post('/admin/seed-demo-data').then((r) => r.data);

export const clearCorruptedData = () =>
  apiClient.post('/admin/clear-corrupted-data').then((r) => r.data);

export const getDatabaseStats = () =>
  apiClient.get<DatabaseStats>('/admin/database-stats').then((r) => r.data);
