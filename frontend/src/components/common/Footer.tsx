import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#3e2723', color: '#f5e6d3' }} className="mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4" style={{ color: '#fff8dc', fontFamily: 'Georgia, serif' }}>
              📚 Kitabevi
            </h3>
            <p className="text-sm" style={{ color: '#c8b08a' }}>
              Türkiye'nin en geniş online kitap mağazası. Binlerce kitap, en iyi fiyatlarla.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4" style={{ color: '#fff8dc' }}>Hızlı Bağlantılar</h4>
            <ul className="space-y-2 text-sm" style={{ color: '#c8b08a' }}>
              <li><Link to="/kitaplar" className="hover:text-orange-400 transition-colors">Tüm Kitaplar</Link></li>
              <li><Link to="/giris" className="hover:text-orange-400 transition-colors">Giriş Yap</Link></li>
              <li><Link to="/kayit" className="hover:text-orange-400 transition-colors">Kayıt Ol</Link></li>
              <li><Link to="/siparislerim" className="hover:text-orange-400 transition-colors">Siparişlerim</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4" style={{ color: '#fff8dc' }}>İletişim</h4>
            <ul className="space-y-2 text-sm" style={{ color: '#c8b08a' }}>
              <li>📧 info@kitabevi.com</li>
              <li>📞 0212 555 0000</li>
              <li>📍 İstanbul, Türkiye</li>
            </ul>
            <div className="flex gap-3 mt-4">
              <span className="text-2xl cursor-pointer hover:text-orange-400 transition-colors">📘</span>
              <span className="text-2xl cursor-pointer hover:text-orange-400 transition-colors">🐦</span>
              <span className="text-2xl cursor-pointer hover:text-orange-400 transition-colors">📸</span>
            </div>
          </div>
        </div>
        <div className="border-t mt-8 pt-6 text-center text-sm" style={{ borderColor: '#5d4037', color: '#c8b08a' }}>
          © 2024 Kitabevi. Tüm hakları saklıdır.
        </div>
      </div>
    </footer>
  );
}
