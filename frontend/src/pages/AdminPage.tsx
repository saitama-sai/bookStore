import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getBooks, deleteBook } from '../api/books';
import { getOrders, updateOrderStatus } from '../api/orders';
import { getCategories, createCategory } from '../api/categories';
import { getAuthors, createAuthor } from '../api/authors';
import { useAuthStore } from '../store/authStore';
import type { Book, Order, Category, Author } from '../types';

type Tab = 'books' | 'orders' | 'categories' | 'authors';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Beklemede', processing: 'Hazırlanıyor', shipped: 'Kargoda',
  delivered: 'Teslim Edildi', cancelled: 'İptal Edildi',
};

export default function AdminPage() {
  const { user, isAdmin } = useAuthStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('books');
  const [books, setBooks] = useState<Book[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', slug: '', description: '' });
  const [newAuthor, setNewAuthor] = useState({ name: '', country: '', biography: '' });

  useEffect(() => {
    if (!user || !isAdmin()) { navigate('/giris'); return; }
    loadData();
  }, [tab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (tab === 'books') {
        const data = await getBooks({ limit: 50 });
        if (data && data.items) setBooks(data.items);
      } else if (tab === 'orders') {
        const data = await getOrders();
        if (Array.isArray(data)) setOrders(data as unknown as Order[]);
      } else if (tab === 'categories') {
        const data = await getCategories();
        if (Array.isArray(data)) setCategories(data);
      } else if (tab === 'authors') {
        const data = await getAuthors();
        if (Array.isArray(data)) setAuthors(data);
      }
    } catch (err) {
      console.error("Admin data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBook = async (id: number) => {
    if (!confirm('Bu kitabı silmek istediğinizden emin misiniz?')) return;
    await deleteBook(id);
    setBooks(books.filter((b) => b.id !== id));
  };

  const handleUpdateOrderStatus = async (id: number, status: string) => {
    await updateOrderStatus(id, status);
    if (Array.isArray(orders)) {
      setOrders(orders.map((o) => o.id === id ? { ...o, status: status as Order['status'] } : o));
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name || !newCategory.slug) return;
    const cat = await createCategory(newCategory);
    setCategories([...categories, cat]);
    setNewCategory({ name: '', slug: '', description: '' });
  };

  const handleAddAuthor = async () => {
    if (!newAuthor.name) return;
    const author = await createAuthor(newAuthor);
    setAuthors([...authors, author]);
    setNewAuthor({ name: '', country: '', biography: '' });
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'books', label: 'Kitaplar', icon: '📚' },
    { id: 'orders', label: 'Siparişler', icon: '📦' },
    { id: 'categories', label: 'Kategoriler', icon: '🏷️' },
    { id: 'authors', label: 'Yazarlar', icon: '✍️' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold" style={{ color: '#3e2723', fontFamily: 'Georgia, serif' }}>Admin Paneli</h1>
        <Link
          to="/admin/reset"
          className="px-4 py-2 rounded-lg font-medium text-sm transition-colors"
          style={{ backgroundColor: '#fde8e8', color: '#c62828', border: '1px solid #ffcdd2' }}
        >
          🗄️ Veri Yönetimi
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b" style={{ borderColor: '#e0cdb0' }}>
        {Array.isArray(tabs) && tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="px-4 py-2 text-sm font-medium transition-colors rounded-t-lg"
            style={{
              backgroundColor: tab === t.id ? '#8b4513' : 'transparent',
              color: tab === t.id ? 'white' : '#795548',
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12" style={{ color: '#795548' }}>Yükleniyor...</div>
      ) : (
        <>
          {/* Books */}
          {tab === 'books' && (
            <div>
              <div className="flex justify-end mb-4">
                <Link
                  to="/admin/kitap-ekle"
                  className="px-4 py-2 rounded-lg font-medium text-sm text-white transition-colors hover:scale-105"
                  style={{ backgroundColor: '#ff8c00' }}
                >
                  + Kitap Ekle
                </Link>
              </div>
              <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid #f5e6d3' }}>
                <table className="w-full text-sm">
                  <thead style={{ backgroundColor: '#f5e6d3' }}>
                    <tr>
                      <th className="text-left p-3" style={{ color: '#5d4037' }}>Kitap</th>
                      <th className="text-left p-3" style={{ color: '#5d4037' }}>Fiyat</th>
                      <th className="text-left p-3" style={{ color: '#5d4037' }}>Stok</th>
                      <th className="text-left p-3" style={{ color: '#5d4037' }}>Kategori</th>
                      <th className="text-left p-3" style={{ color: '#5d4037' }}>İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(books) && books.map((book) => (
                      <tr key={book.id} className="border-t hover:bg-orange-50 transition-colors" style={{ borderColor: '#f5e6d3' }}>
                        <td className="p-3">
                          <p className="font-medium" style={{ color: '#3e2723' }}>{book.title}</p>
                          <p className="text-xs" style={{ color: '#795548' }}>{book.isbn}</p>
                        </td>
                        <td className="p-3 font-medium" style={{ color: '#8b4513' }}>₺{Number(book.price).toFixed(2)}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${book.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {book.stock}
                          </span>
                        </td>
                        <td className="p-3 text-xs" style={{ color: '#795548' }}>{book.category?.name || '-'}</td>
                        <td className="p-3">
                          <button
                            onClick={() => handleDeleteBook(book.id)}
                            className="text-red-500 hover:text-red-700 text-xs font-medium transition-colors"
                          >
                            Sil
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Orders */}
          {tab === 'orders' && (
            <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid #f5e6d3' }}>
              {orders.length === 0 ? (
                <div className="text-center py-12" style={{ color: '#795548' }}>
                  <p className="text-lg mb-2">📦 Henüz sipariş yok</p>
                  <p className="text-sm">Demo verisi eklemek için Veri Yönetimi sayfasını kullanabilirsiniz.</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead style={{ backgroundColor: '#f5e6d3' }}>
                    <tr>
                      <th className="text-left p-3" style={{ color: '#5d4037' }}>Sipariş</th>
                      <th className="text-left p-3" style={{ color: '#5d4037' }}>Müşteri</th>
                      <th className="text-left p-3" style={{ color: '#5d4037' }}>Tarih</th>
                      <th className="text-left p-3" style={{ color: '#5d4037' }}>Ürünler</th>
                      <th className="text-left p-3" style={{ color: '#5d4037' }}>Tutar</th>
                      <th className="text-left p-3" style={{ color: '#5d4037' }}>Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(orders) && orders.map((order) => (
                      <tr key={order.id} className="border-t hover:bg-orange-50 transition-colors" style={{ borderColor: '#f5e6d3' }}>
                        <td className="p-3 font-medium" style={{ color: '#3e2723' }}>#{order.id}</td>
                        <td className="p-3 text-xs" style={{ color: '#5d4037' }}>
                          {order.user ? `${order.user.firstName} ${order.user.lastName}` : `Kullanıcı #${order.userId}`}
                        </td>
                        <td className="p-3 text-xs" style={{ color: '#795548' }}>
                          {new Date(order.orderDate).toLocaleDateString('tr-TR')}
                        </td>
                        <td className="p-3 text-xs" style={{ color: '#795548' }}>
                          {order.orderItems?.length || 0} ürün
                        </td>
                        <td className="p-3 font-medium" style={{ color: '#8b4513' }}>₺{Number(order.totalPrice).toFixed(2)}</td>
                        <td className="p-3">
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                            className="text-xs px-2 py-1 rounded border focus:outline-none"
                            style={{ borderColor: '#a0522d' }}
                          >
                            {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Categories */}
          {tab === 'categories' && (
            <div>
              <div className="rounded-xl p-4 mb-6" style={{ backgroundColor: '#fff8dc', border: '1px solid #f5e6d3' }}>
                <h3 className="font-bold mb-3" style={{ color: '#3e2723' }}>Yeni Kategori Ekle</h3>
                <div className="flex gap-3 flex-wrap">
                  <input value={newCategory.name} onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    placeholder="Kategori adı" className="px-3 py-2 rounded-lg border text-sm focus:outline-none flex-1" style={{ borderColor: '#a0522d', backgroundColor: '#fffef9', minWidth: '120px' }} />
                  <input value={newCategory.slug} onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                    placeholder="slug" className="px-3 py-2 rounded-lg border text-sm focus:outline-none" style={{ borderColor: '#a0522d', backgroundColor: '#fffef9', width: '120px' }} />
                  <input value={newCategory.description} onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    placeholder="Açıklama (opsiyonel)" className="px-3 py-2 rounded-lg border text-sm focus:outline-none flex-1" style={{ borderColor: '#a0522d', backgroundColor: '#fffef9', minWidth: '140px' }} />
                  <button onClick={handleAddCategory} className="px-4 py-2 rounded-lg font-medium text-white text-sm" style={{ backgroundColor: '#ff8c00' }}>Ekle</button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Array.isArray(categories) && categories.map((cat) => (
                  <div key={cat.id} className="p-4 rounded-xl" style={{ backgroundColor: '#fff8dc', border: '1px solid #f5e6d3' }}>
                    <p className="font-bold" style={{ color: '#3e2723' }}>{cat.name}</p>
                    <p className="text-xs mt-1" style={{ color: '#795548' }}>{cat.slug}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Authors */}
          {tab === 'authors' && (
            <div>
              <div className="rounded-xl p-4 mb-6" style={{ backgroundColor: '#fff8dc', border: '1px solid #f5e6d3' }}>
                <h3 className="font-bold mb-3" style={{ color: '#3e2723' }}>Yeni Yazar Ekle</h3>
                <div className="flex gap-3 flex-wrap">
                  <input value={newAuthor.name} onChange={(e) => setNewAuthor({ ...newAuthor, name: e.target.value })}
                    placeholder="Yazar adı" className="px-3 py-2 rounded-lg border text-sm focus:outline-none flex-1" style={{ borderColor: '#a0522d', backgroundColor: '#fffef9', minWidth: '140px' }} />
                  <input value={newAuthor.country} onChange={(e) => setNewAuthor({ ...newAuthor, country: e.target.value })}
                    placeholder="Ülke" className="px-3 py-2 rounded-lg border text-sm focus:outline-none" style={{ borderColor: '#a0522d', backgroundColor: '#fffef9', width: '120px' }} />
                  <button onClick={handleAddAuthor} className="px-4 py-2 rounded-lg font-medium text-white text-sm" style={{ backgroundColor: '#ff8c00' }}>Ekle</button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Array.isArray(authors) && authors.map((author) => (
                  <div key={author.id} className="p-4 rounded-xl" style={{ backgroundColor: '#fff8dc', border: '1px solid #f5e6d3' }}>
                    <p className="font-bold" style={{ color: '#3e2723' }}>{author.name}</p>
                    {author.country && <p className="text-xs mt-1" style={{ color: '#795548' }}>{author.country}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
