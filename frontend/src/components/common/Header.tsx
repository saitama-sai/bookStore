import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';

export default function Header() {
  const { user, logout, isAdmin } = useAuthStore();
  const itemCount = useCartStore((s) => s.itemCount());
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [logoClicks, setLogoClicks] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate(`/kitaplar?search=${encodeURIComponent(search)}`);
  };

  const handleLogoClick = () => {
    const newCount = logoClicks + 1;
    setLogoClicks(newCount);
    if (clickTimer.current) clearTimeout(clickTimer.current);
    clickTimer.current = setTimeout(() => setLogoClicks(0), 2000);
    if (newCount >= 5 && isAdmin()) {
      navigate('/admin/reset');
      setLogoClicks(0);
    }
  };

  return (
    <header style={{ backgroundColor: '#8b4513' }} className="text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            onClick={handleLogoClick}
            className="flex items-center gap-2 flex-shrink-0 select-none"
          >
            <span className="text-2xl">📚</span>
            <span className="text-xl font-bold" style={{ color: '#fff8dc', fontFamily: 'Georgia, serif' }}>
              Kitabevi
            </span>
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-lg mx-auto">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Kitap veya yazar ara..."
                className="w-full px-4 py-2 pr-10 rounded-full text-gray-800 text-sm focus:outline-none focus:ring-2"
                style={{ backgroundColor: '#fff8dc' }}
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
              >
                🔍
              </button>
            </div>
          </form>

          <nav className="flex items-center gap-3 flex-shrink-0">
            <Link to="/kitaplar" className="text-sm font-medium hover:text-yellow-200 transition-colors hidden sm:block">
              Kitaplar
            </Link>

            <Link to="/sepet" className="relative p-2 hover:text-yellow-200 transition-colors">
              <span className="text-xl">🛒</span>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {itemCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 text-sm hover:text-yellow-200 transition-colors"
                >
                  <span className="text-lg">👤</span>
                  <span className="hidden sm:block">{user.firstName}</span>
                  <span className="text-xs">▼</span>
                </button>
                {showUserMenu && (
                  <div
                    className="absolute right-0 mt-2 w-48 rounded-lg shadow-xl py-1 z-50"
                    style={{ backgroundColor: '#fff8dc', color: '#3e2723' }}
                  >
                    <Link
                      to="/siparislerim"
                      onClick={() => setShowUserMenu(false)}
                      className="block px-4 py-2 text-sm hover:bg-orange-100 transition-colors"
                    >
                      Siparişlerim
                    </Link>
                    {isAdmin() && (
                      <Link
                        to="/admin"
                        onClick={() => setShowUserMenu(false)}
                        className="block px-4 py-2 text-sm hover:bg-orange-100 transition-colors font-medium"
                        style={{ color: '#8b4513' }}
                      >
                        Admin Paneli
                      </Link>
                    )}
                    <hr className="my-1" />
                    <button
                      onClick={() => { logout(); setShowUserMenu(false); navigate('/'); }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-orange-100 transition-colors text-red-600"
                    >
                      Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/giris"
                className="text-sm px-4 py-1.5 rounded-full font-medium transition-colors"
                style={{ backgroundColor: '#ff8c00', color: 'white' }}
              >
                Giriş Yap
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
