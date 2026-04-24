import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import HomePage from './pages/HomePage';
import BooksPage from './pages/BooksPage';
import BookDetailPage from './pages/BookDetailPage';
import CartPage from './pages/CartPage';
import OrderPage from './pages/OrderPage';
import OrdersPage from './pages/OrdersPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import AdminResetPage from './pages/AdminResetPage';
import AddBookPage from './pages/AddBookPage';
import { useAuthStore } from './store/authStore';

function KeyboardShortcuts() {
  const navigate = useNavigate();
  const { isAdmin } = useAuthStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && e.key === 'r' && isAdmin()) {
        e.preventDefault();
        navigate('/admin/reset');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate, isAdmin]);

  return null;
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <KeyboardShortcuts />
      <Routes>
        <Route path="/giris" element={<LoginPage />} />
        <Route path="/kayit" element={<RegisterPage />} />
        <Route
          path="*"
          element={
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/kitaplar" element={<BooksPage />} />
                <Route path="/kitaplar/:id" element={<BookDetailPage />} />
                <Route path="/sepet" element={<CartPage />} />
                <Route path="/siparis" element={<OrderPage />} />
                <Route path="/siparislerim" element={<OrdersPage />} />
                <Route path="/siparislerim/:id" element={<OrdersPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/admin/reset" element={<AdminResetPage />} />
                <Route path="/admin/kitap-ekle" element={<AddBookPage />} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
