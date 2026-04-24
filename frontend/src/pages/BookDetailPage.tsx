import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBook } from '../api/books';
import { useCartStore } from '../store/cartStore';
import type { Book } from '../types';
import { API_URL } from '../api/client';

function getBookCover(book: Book): string {
  if (book.coverImage) {
    if (book.coverImage.startsWith('http')) return book.coverImage;
    return `${API_URL}${book.coverImage}`;
  }
  if (book.isbn) {
    return `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg`;
  }
  return '';
}

export default function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    if (!id) return;
    getBook(+id)
      .then(setBook)
      .catch(() => navigate('/kitaplar'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!book) return;
    addItem(book, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 flex gap-8">
        <div className="w-72 h-96 rounded-xl animate-pulse" style={{ backgroundColor: '#f5e6d3' }} />
        <div className="flex-1 space-y-4">
          {Array(5).fill(0).map((_, i) => <div key={i} className="h-6 rounded animate-pulse" style={{ backgroundColor: '#f5e6d3', width: `${60 + i * 10}%` }} />)}
        </div>
      </div>
    );
  }

  if (!book) return null;

  const cover = getBookCover(book);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <button onClick={() => navigate(-1)} className="mb-6 text-sm flex items-center gap-1 hover:underline" style={{ color: '#8b4513' }}>
        ← Geri Dön
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Cover */}
        <div className="flex justify-center">
          <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ maxWidth: '350px', width: '100%', backgroundColor: '#f5e6d3' }}>
            {cover && !imgError ? (
              <img
                src={cover}
                alt={book.title}
                className="w-full object-cover"
                style={{ aspectRatio: '2/3' }}
                onError={() => setImgError(true)}
                onLoad={(e) => {
                  const img = e.target as HTMLImageElement;
                  if (img.naturalWidth <= 1 || img.naturalHeight <= 1) {
                    setImgError(true);
                  }
                }}
              />
            ) : (
              <div className="w-full flex flex-col items-center justify-center p-8" style={{ aspectRatio: '2/3', background: 'linear-gradient(135deg, #8b4513 0%, #a0522d 50%, #cd853f 100%)' }}>
                <span className="text-6xl mb-4">📖</span>
                <span className="text-white text-xl font-bold text-center leading-tight mb-2" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                  {book.title}
                </span>
                {book.authors && book.authors.length > 0 && (
                  <span className="text-white/70 text-sm text-center">
                    {Array.isArray(book.authors) && book.authors.map((a) => a.name).join(', ')}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div>
          {book.category && (
            <span className="text-sm px-3 py-1 rounded-full" style={{ backgroundColor: '#f5e6d3', color: '#8b4513' }}>
              {book.category.name}
            </span>
          )}
          <h1 className="text-3xl font-bold mt-3 mb-2" style={{ color: '#3e2723', fontFamily: 'Georgia, serif' }}>
            {book.title}
          </h1>
          {book.authors && book.authors.length > 0 && (
            <p className="text-lg mb-4" style={{ color: '#795548' }}>
              {Array.isArray(book.authors) && book.authors.map((a) => a.name).join(', ')}
            </p>
          )}

          <div className="flex items-center gap-4 mb-6">
            <span className="text-4xl font-bold" style={{ color: '#8b4513' }}>
              ₺{Number(book.price).toFixed(2)}
            </span>
            {book.stock > 0 ? (
              <span className="text-sm px-3 py-1 rounded-full font-medium" style={{ backgroundColor: '#e8f5e9', color: '#2e7d32' }}>
                Stokta {book.stock} adet
              </span>
            ) : (
              <span className="text-sm px-3 py-1 rounded-full font-medium" style={{ backgroundColor: '#fde8e8', color: '#c62828' }}>
                Stok Yok
              </span>
            )}
          </div>

          {/* Book info */}
          <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
            {book.isbn && <div style={{ color: '#795548' }}><span className="font-medium">ISBN:</span> {book.isbn}</div>}
            {book.publishYear && <div style={{ color: '#795548' }}><span className="font-medium">Yıl:</span> {book.publishYear}</div>}
            {book.pageCount && <div style={{ color: '#795548' }}><span className="font-medium">Sayfa:</span> {book.pageCount}</div>}
            {book.language && <div style={{ color: '#795548' }}><span className="font-medium">Dil:</span> {book.language}</div>}
          </div>

          {book.stock > 0 && (
            <div className="flex items-center gap-4 mb-6">
              <label className="text-sm font-medium" style={{ color: '#5d4037' }}>Miktar:</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-full font-bold text-lg flex items-center justify-center transition-colors"
                  style={{ backgroundColor: '#f5e6d3', color: '#8b4513' }}
                >
                  -
                </button>
                <span className="w-8 text-center font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(book.stock, quantity + 1))}
                  className="w-8 h-8 rounded-full font-bold text-lg flex items-center justify-center transition-colors"
                  style={{ backgroundColor: '#f5e6d3', color: '#8b4513' }}
                >
                  +
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={handleAddToCart}
              disabled={book.stock === 0}
              className="flex-1 py-3 rounded-xl font-bold text-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: added ? '#4caf50' : '#ff8c00', color: 'white' }}
            >
              {added ? '✓ Sepete Eklendi!' : book.stock === 0 ? 'Stok Yok' : 'Sepete Ekle'}
            </button>
          </div>
        </div>
      </div>

      {/* Description */}
      {book.description && (
        <div className="mt-12 p-8 rounded-2xl" style={{ backgroundColor: '#fff8dc' }}>
          <h2 className="text-xl font-bold mb-4" style={{ color: '#3e2723', fontFamily: 'Georgia, serif' }}>Kitap Hakkında</h2>
          <p className="leading-relaxed" style={{ color: '#5d4037' }}>{book.description}</p>
        </div>
      )}
    </div>
  );
}
