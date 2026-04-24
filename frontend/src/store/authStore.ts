import { create } from 'zustand';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  isAdmin: () => boolean;
}

const storedUser = localStorage.getItem('user');
const storedToken = localStorage.getItem('token');

const getInitialUser = () => {
  try {
    if (!storedUser || storedUser === 'undefined' || storedUser === 'null') return null;
    return JSON.parse(storedUser);
  } catch (e) {
    localStorage.removeItem('user');
    return null;
  }
};

const getInitialToken = () => {
  if (!storedToken || storedToken === 'undefined' || storedToken === 'null') return null;
  return storedToken;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: getInitialUser(),
  token: getInitialToken(),
  setAuth: (user, token) => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    if (token) localStorage.setItem('token', token);
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
  isAdmin: () => {
    const user = get().user;
    return user?.role === 'admin';
  },
}));
