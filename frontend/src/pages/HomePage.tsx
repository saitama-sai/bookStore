import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getBooks } from '../api/books';
import { getCategories } from '../api/categories';
import BookCard from '../components/book/BookCard';
import type { Book, Category } from '../types';

const HERO_IMAGES = [
  { url: 'https://images.pexels.com/photos/1290141/pexels-photo-1290141.jpeg?auto=compress&cs=tinysrgb&w=1260&h=400&fit=crop', title: 'Yeni Çıkanlar', sub: 'En taze kitapları keşfedin' },
  { url: 'https://images.pexels.com/photos/2055782/pexels-photo-2055782.jpeg?auto=compress&cs=tinysrgb&w=1260&h=400&fit=crop', title: 'Klasik Eserler', sub: 'Dünya edebiyatının şaheserleri' },
  { url: 'https://images.pexels.com/photos/3782235/pexels-photo-3782235.jpeg?auto=compress&cs=tinysrgb&w=1260&h=400&fit=crop', title: 'Bilim Kurgu', sub: 'Geleceğe yolculuk edin' },
];

export default function HomePage() {
  const [featured, setFeatured] = useState<Book[]>([]);
  const [newest, setNewest] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [heroIdx, setHeroIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getBooks({ limit: 8, sortBy: 'price', sortOrder: 'DESC' }),
      getBooks({ limit: 8, sortBy: 'createdAt', sortOrder: 'DESC' }),
      getCategories(),
    ]).then(([feat, new_, cats]) => {
      if (feat && feat.items) setFeatured(feat.items);
      if (new_ && new_.items) setNewest(new_.items);
      if (Array.isArray(cats)) setCategories(cats.slice(0, 5));
    }).catch(err => {
      console.error("Home data fetch error:", err);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setHeroIdx((i) => (i + 1) % HERO_IMAGES.length), 4000);
    return () => clearInterval(timer);
  }, []);

  const hero = HERO_IMAGES[heroIdx];

  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden" style={{ height: '400px' }}>
        <img
          src={hero.url}
          alt="hero"
          className="w-full h-full object-cover transition-all duration-700"
        />
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'linear-gradient(to right, rgba(62,39,35,0.8), rgba(62,39,35,0.3))' }}>
          <div className="text-white text-center px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-4" style={{ fontFamily: 'Georgia, serif', color: '#fff8dc' }}>
              {hero.title}
            </h1>
            <p className="text-xl mb-6" style={{ color: '#f5e6d3' }}>{hero.sub}</p>
            <Link
              to="/kitaplar"
              className="px-8 py-3 rounded-full font-bold text-lg transition-all hover:scale-105"
              style={{ backgroundColor: '#ff8c00', color: 'white' }}
            >
              Kitaplara Göz At
            </Link>
          </div>
        </div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {HERO_IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => setHeroIdx(i)}
              className={`w-3 h-3 rounded-full transition-all ${i === heroIdx ? 'w-8' : ''}`}
              style={{ backgroundColor: i === heroIdx ? '#ff8c00' : 'rgba(255,255,255,0.6)' }}
            />
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6" style={{ color: '#3e2723', fontFamily: 'Georgia, serif' }}>Kategoriler</h2>
        <div className="flex flex-wrap gap-3">
          {categories?.map((cat) => (
            <Link
              key={cat.id}
              to={`/kitaplar?categoryId=${cat.id}`}
              className="px-6 py-3 rounded-full font-medium transition-all hover:scale-105 hover:shadow-md"
              style={{ backgroundColor: '#f5e6d3', color: '#8b4513', border: '2px solid #a0522d' }}
            >
              {cat.name}
            </Link>
          ))}
          <Link
            to="/kitaplar"
            className="px-6 py-3 rounded-full font-medium transition-all hover:scale-105"
            style={{ backgroundColor: '#8b4513', color: '#fff8dc' }}
          >
            Tümü →
          </Link>
        </div>
      </div>

      {/* Featured Books */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold" style={{ color: '#3e2723', fontFamily: 'Georgia, serif' }}>Öne Çıkan Kitaplar</h2>
          <Link to="/kitaplar" className="text-sm font-medium hover:underline" style={{ color: '#8b4513' }}>
            Tümünü Gör →
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="rounded-xl h-72 animate-pulse" style={{ backgroundColor: '#f5e6d3' }} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featured?.map((book) => <BookCard key={book.id} book={book} />)}
          </div>
        )}
      </div>

      {/* Newest Books */}
      <div style={{ backgroundColor: '#fdf6f0' }} className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold" style={{ color: '#3e2723', fontFamily: 'Georgia, serif' }}>Yeni Çıkanlar</h2>
            <Link to="/kitaplar?sortBy=createdAt&sortOrder=DESC" className="text-sm font-medium hover:underline" style={{ color: '#8b4513' }}>
              Tümünü Gör →
            </Link>
          </div>
          {!loading && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {newest?.map((book) => <BookCard key={book.id} book={book} />)}
            </div>
          )}
        </div>
      </div>

      {/* Banner */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div
          className="rounded-2xl p-8 md:p-12 text-center"
          style={{ background: 'linear-gradient(135deg, #8b4513, #a0522d)', color: '#fff8dc' }}
        >
          <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Georgia, serif' }}>
            Hızlı ve Güvenli Teslimat
          </h2>
          <p className="text-lg mb-6" style={{ color: '#f5e6d3' }}>
            Tüm siparişlerinizde ücretsiz kargo fırsatını kaçırmayın!
          </p>
          <Link
            to="/kayit"
            className="inline-block px-8 py-3 rounded-full font-bold transition-all hover:scale-105"
            style={{ backgroundColor: '#ff8c00', color: 'white' }}
          >
            Hemen Üye Ol
          </Link>
        </div>
      </div>
    </div>
  );
}
