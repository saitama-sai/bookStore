import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import type { Book } from '../../types';

function getBookCover(book: Book): string {
  if (book.coverImage) {
    if (book.coverImage.startsWith('http')) return book.coverImage;
    return `http://localhost:3000${book.coverImage}`;
  }
  if (book.isbn) {
    return `https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg`;
  }
  return '';
}

interface Props {
  book: Book;
}

export default function BookCard({ book }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const [imgError, setImgError] = useState(false);
  const coverUrl = getBookCover(book);

  return (
    <div
      className="rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
      style={{ backgroundColor: '#fff8dc', border: '1px solid #f5e6d3' }}
    >
      <Link to={`/kitaplar/${book.id}`} className="relative overflow-hidden block" style={{ height: '220px', backgroundColor: '#f5e6d3' }}>
        {coverUrl && !imgError ? (
          <img
            src={coverUrl}
            alt={book.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
            onError={() => setImgError(true)}
            onLoad={(e) => {
              const img = e.target as HTMLImageElement;
              // Open Library returns 1x1 pixel for missing covers
              if (img.naturalWidth <= 1 || img.naturalHeight <= 1) {
                setImgError(true);
              }
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #8b4513 0%, #a0522d 50%, #cd853f 100%)' }}>
            <span className="text-4xl mb-2">📖</span>
            <span className="text-white text-sm font-bold text-center leading-tight" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
              {book.title}
            </span>
            {book.authors && book.authors.length > 0 && (
              <span className="text-white/70 text-xs mt-1 text-center">
                {book.authors[0].name}
              </span>
            )}
          </div>
        )}
        {book.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold text-sm bg-red-600 px-3 py-1 rounded-full">Tükendi</span>
          </div>
        )}
        {book.stock > 0 && book.stock <= 5 && (
          <div className="absolute top-2 right-2">
            <span className="text-white text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: '#ff8c00' }}>
              Son {book.stock}!
            </span>
          </div>
        )}
      </Link>
      <div className="p-4 flex flex-col flex-1">
        <Link to={`/kitaplar/${book.id}`}>
          <h3 className="font-bold text-sm leading-tight mb-1 line-clamp-2 hover:text-orange-600 transition-colors" style={{ color: '#3e2723' }}>
            {book.title}
          </h3>
        </Link>
        {book.authors && book.authors.length > 0 && (
          <p className="text-xs mb-2" style={{ color: '#795548' }}>
            {book.authors.map((a) => a.name).join(', ')}
          </p>
        )}
        {book.category && (
          <span className="text-xs px-2 py-0.5 rounded-full mb-2 self-start" style={{ backgroundColor: '#f5e6d3', color: '#8b4513' }}>
            {book.category.name}
          </span>
        )}
        <div className="mt-auto flex items-center justify-between">
          <span className="text-lg font-bold" style={{ color: '#8b4513' }}>
            ₺{Number(book.price).toFixed(2)}
          </span>
          <button
            onClick={() => addItem(book)}
            disabled={book.stock === 0}
            className="text-xs px-3 py-1.5 rounded-full font-medium text-white transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: book.stock === 0 ? '#ccc' : '#ff8c00' }}
          >
            {book.stock === 0 ? 'Tükendi' : 'Sepete Ekle'}
          </button>
        </div>
      </div>
    </div>
  );
}
