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

let initialUser = null;
try {
  initialUser = storedUser && storedUser !== 'undefined' ? JSON.parse(storedUser) : null;
} catch (e) {
  console.error("Failed to parse stored user", e);
  localStorage.removeItem('user');
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: initialUser,
  token: storedToken,
  setAuth: (user, token) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
  isAdmin: () => get().user?.role === 'admin',
}));
