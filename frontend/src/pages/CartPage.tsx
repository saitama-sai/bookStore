import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { API_URL } from '../api/client';

const BOOK_COVERS = [
  'https://images.pexels.com/photos/1148399/pexels-photo-1148399.jpeg?auto=compress&cs=tinysrgb&w=100&h=140&fit=crop',
  'https://images.pexels.com/photos/256450/pexels-photo-256450.jpeg?auto=compress&cs=tinysrgb&w=100&h=140&fit=crop',
  'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=100&h=140&fit=crop',
];

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) { navigate('/giris'); return; }
    navigate('/siparis');
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-6xl mb-4">🛒</p>
        <h2 className="text-2xl font-bold mb-3" style={{ color: '#3e2723' }}>Sepetiniz Boş</h2>
        <p className="mb-6" style={{ color: '#795548' }}>Henüz sepetinize kitap eklemediniz.</p>
        <Link
          to="/kitaplar"
          className="inline-block px-8 py-3 rounded-full font-bold transition-all hover:scale-105"
          style={{ backgroundColor: '#ff8c00', color: 'white' }}
        >
          Kitaplara Göz At
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8" style={{ color: '#3e2723', fontFamily: 'Georgia, serif' }}>
        Sepetim ({items.length} ürün)
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map(({ book, quantity }) => {
            const cover = book.coverImage
              ? `${API_URL}${book.coverImage}`
              : BOOK_COVERS[book.id % BOOK_COVERS.length];
            return (
              <div
                key={book.id}
                className="flex gap-4 p-4 rounded-xl"
                style={{ backgroundColor: '#fff8dc', border: '1px solid #f5e6d3' }}
              >
                <img src={cover} alt={book.title} className="w-16 h-24 object-cover rounded-lg flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <Link to={`/kitaplar/${book.id}`}>
                    <h3 className="font-bold text-sm line-clamp-2 hover:text-orange-600 transition-colors" style={{ color: '#3e2723' }}>
                      {book.title}
                    </h3>
                  </Link>
                  {book.authors && book.authors.length > 0 && (
                    <p className="text-xs mt-1" style={{ color: '#795548' }}>
                      {book.authors.map((a) => a.name).join(', ')}
                    </p>
                  )}
                  <p className="text-sm font-bold mt-2" style={{ color: '#8b4513' }}>
                    ₺{Number(book.price).toFixed(2)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <button
                    onClick={() => removeItem(book.id)}
                    className="text-red-500 hover:text-red-700 text-lg transition-colors"
                  >
                    ✕
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(book.id, quantity - 1)}
                      className="w-7 h-7 rounded-full text-sm font-bold flex items-center justify-center"
                      style={{ backgroundColor: '#f5e6d3', color: '#8b4513' }}
                    >
                      -
                    </button>
                    <span className="w-6 text-center text-sm font-bold">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(book.id, Math.min(book.stock, quantity + 1))}
                      className="w-7 h-7 rounded-full text-sm font-bold flex items-center justify-center"
                      style={{ backgroundColor: '#f5e6d3', color: '#8b4513' }}
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm font-bold" style={{ color: '#3e2723' }}>
                    ₺{(Number(book.price) * quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div>
          <div className="rounded-xl p-6 sticky top-24" style={{ backgroundColor: '#fff8dc', border: '1px solid #f5e6d3' }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: '#3e2723' }}>Sipariş Özeti</h2>
            {items.map(({ book, quantity }) => (
              <div key={book.id} className="flex justify-between text-sm mb-2" style={{ color: '#795548' }}>
                <span className="line-clamp-1 flex-1 mr-2">{book.title}</span>
                <span>₺{(Number(book.price) * quantity).toFixed(2)}</span>
              </div>
            ))}
            <hr className="my-4" style={{ borderColor: '#e0cdb0' }} />
            <div className="flex justify-between font-bold text-lg mb-6" style={{ color: '#3e2723' }}>
              <span>Toplam</span>
              <span>₺{total().toFixed(2)}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full py-3 rounded-xl font-bold text-lg transition-all hover:scale-105"
              style={{ backgroundColor: '#ff8c00', color: 'white' }}
            >
              Siparişi Tamamla
            </button>
            <Link
              to="/kitaplar"
              className="block text-center mt-3 text-sm hover:underline"
              style={{ color: '#8b4513' }}
            >
              Alışverişe Devam Et
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
