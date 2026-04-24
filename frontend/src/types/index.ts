export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'customer';
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export interface Author {
  id: number;
  name: string;
  biography?: string;
  country?: string;
}

export interface Book {
  id: number;
  title: string;
  isbn: string;
  description?: string;
  price: number;
  stock: number;
  coverImage?: string;
  publishYear?: number;
  pageCount?: number;
  language: string;
  category?: Category;
  categoryId?: number;
  authors?: Author[];
  createdAt: string;
}

export interface OrderItem {
  id: number;
  bookId: number;
  quantity: number;
  price: number;
  book?: Book;
}

export interface Order {
  id: number;
  userId: number;
  totalPrice: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
  shippingAddress: string;
  orderItems?: OrderItem[];
  user?: User;
}

export interface CartItem {
  book: Book;
  quantity: number;
}

export interface PaginatedBooks {
  items: Book[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DatabaseStats {
  users: number;
  categories: number;
  authors: number;
  books: number;
  orders: number;
  orderItems: number;
  lastUpdated: string;
}
