import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getBooks } from '../api/books';
import { getCategories } from '../api/categories';
import { getAuthors } from '../api/authors';
import BookCard from '../components/book/BookCard';
import type { Book, Category, Author } from '../types';

export default function BooksPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const page = Number(searchParams.get('page') || 1);
  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('categoryId') || '';
  const authorId = searchParams.get('authorId') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = (searchParams.get('sortOrder') as 'ASC' | 'DESC') || 'DESC';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  useEffect(() => {
    getCategories().then(setCategories);
    getAuthors().then(setAuthors);
  }, []);

  useEffect(() => {
    setLoading(true);
    getBooks({
      page, limit: 12, search: search || undefined,
      categoryId: categoryId ? +categoryId : undefined,
      authorId: authorId ? +authorId : undefined,
      sortBy, sortOrder,
      minPrice: minPrice ? +minPrice : undefined,
      maxPrice: maxPrice ? +maxPrice : undefined,
    }).then((data) => {
      if (data && data.items) setBooks(data.items);
      if (data && typeof data.total === 'number') setTotal(data.total);
      if (data && typeof data.totalPages === 'number') setTotalPages(data.totalPages);
    }).catch(err => {
      console.error("Books data fetch error:", err);
    }).finally(() => setLoading(false));
  }, [searchParams]);

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    next.set('page', '1');
    setSearchParams(next);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="rounded-xl p-4 sticky top-24" style={{ backgroundColor: '#fff8dc', border: '1px solid #f5e6d3' }}>
            <h3 className="font-bold text-lg mb-4" style={{ color: '#3e2723' }}>Filtrele</h3>

            {/* Search */}
            <div className="mb-4">
              <label className="text-sm font-medium mb-1 block" style={{ color: '#5d4037' }}>Arama</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setParam('search', e.target.value)}
                placeholder="Kitap ara..."
                className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none"
                style={{ borderColor: '#a0522d', backgroundColor: '#fffef9' }}
              />
            </div>

            {/* Category */}
            <div className="mb-4">
              <label className="text-sm font-medium mb-1 block" style={{ color: '#5d4037' }}>Kategori</label>
              <select
                value={categoryId}
                onChange={(e) => setParam('categoryId', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none"
                style={{ borderColor: '#a0522d', backgroundColor: '#fffef9' }}
              >
                <option value="">Tümü</option>
                {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {/* Author */}
            <div className="mb-4">
              <label className="text-sm font-medium mb-1 block" style={{ color: '#5d4037' }}>Yazar</label>
              <select
                value={authorId}
                onChange={(e) => setParam('authorId', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none"
                style={{ borderColor: '#a0522d', backgroundColor: '#fffef9' }}
              >
                <option value="">Tümü</option>
                {authors?.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>

            {/* Price Range */}
            <div className="mb-4">
              <label className="text-sm font-medium mb-1 block" style={{ color: '#5d4037' }}>Fiyat Aralığı</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setParam('minPrice', e.target.value)}
                  placeholder="Min"
                  className="w-1/2 px-2 py-2 rounded-lg border text-sm focus:outline-none"
                  style={{ borderColor: '#a0522d', backgroundColor: '#fffef9' }}
                />
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setParam('maxPrice', e.target.value)}
                  placeholder="Max"
                  className="w-1/2 px-2 py-2 rounded-lg border text-sm focus:outline-none"
                  style={{ borderColor: '#a0522d', backgroundColor: '#fffef9' }}
                />
              </div>
            </div>

            {/* Sort */}
            <div className="mb-4">
              <label className="text-sm font-medium mb-1 block" style={{ color: '#5d4037' }}>Sırala</label>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [sb, so] = e.target.value.split('-');
                  const next = new URLSearchParams(searchParams);
                  next.set('sortBy', sb);
                  next.set('sortOrder', so);
                  setSearchParams(next);
                }}
                className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none"
                style={{ borderColor: '#a0522d', backgroundColor: '#fffef9' }}
              >
                <option value="createdAt-DESC">En Yeni</option>
                <option value="createdAt-ASC">En Eski</option>
                <option value="price-ASC">Fiyat (Artan)</option>
                <option value="price-DESC">Fiyat (Azalan)</option>
                <option value="title-ASC">İsim (A-Z)</option>
                <option value="title-DESC">İsim (Z-A)</option>
              </select>
            </div>

            <button
              onClick={() => setSearchParams({})}
              className="w-full py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ backgroundColor: '#f5e6d3', color: '#8b4513' }}
            >
              Filtreleri Temizle
            </button>
          </div>
        </aside>

        {/* Book grid */}
        <main className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm" style={{ color: '#795548' }}>
              {total} kitap bulundu
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array(12).fill(0).map((_, i) => (
                <div key={i} className="rounded-xl h-72 animate-pulse" style={{ backgroundColor: '#f5e6d3' }} />
              ))}
            </div>
          ) : books.length === 0 ? (
            <div className="text-center py-16" style={{ color: '#795548' }}>
              <p className="text-5xl mb-4">📚</p>
              <p className="text-lg">Kitap bulunamadı</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {books?.map((book) => <BookCard key={book.id} book={book} />)}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    const next = new URLSearchParams(searchParams);
                    next.set('page', String(p));
                    setSearchParams(next);
                  }}
                  className="w-10 h-10 rounded-lg font-medium text-sm transition-all"
                  style={{
                    backgroundColor: p === page ? '#8b4513' : '#f5e6d3',
                    color: p === page ? 'white' : '#3e2723',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
