import { create } from 'zustand';
import type { Book, CartItem } from '../types';

interface CartState {
  items: CartItem[];
  addItem: (book: Book, quantity?: number) => void;
  removeItem: (bookId: number) => void;
  updateQuantity: (bookId: number, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (book, quantity = 1) => {
    const items = get().items;
    const existing = items.find((i) => i.book.id === book.id);
    if (existing) {
      set({
        items: items.map((i) =>
          i.book.id === book.id
            ? { ...i, quantity: Math.min(i.quantity + quantity, book.stock) }
            : i,
        ),
      });
    } else {
      set({ items: [...items, { book, quantity }] });
    }
  },
  removeItem: (bookId) => {
    set({ items: get().items.filter((i) => i.book.id !== bookId) });
  },
  updateQuantity: (bookId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(bookId);
      return;
    }
    set({
      items: get().items.map((i) =>
        i.book.id === bookId ? { ...i, quantity } : i,
      ),
    });
  },
  clearCart: () => set({ items: [] }),
  total: () => get().items.reduce((sum, i) => sum + +i.book.price * i.quantity, 0),
  itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}));
