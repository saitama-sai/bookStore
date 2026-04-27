import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getBooks, deleteBook } from '../api/books';
import { getOrders, updateOrderStatus } from '../api/orders';
import { getCategories, createCategory } from '../api/categories';
import { getAuthors, createAuthor } from '../api/authors';
import { useAuthStore } from '../store/authStore';
import type { Book, Order, Category, Author } from '../types';

type Tab = 'books' | 'orders' | 'categories' | 'authors' | 'analytics';

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
  const [selectedBookChartId, setSelectedBookChartId] = useState<number | null>(null);

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
      } else if (tab === 'analytics') {
        const [booksData, ordersData] = await Promise.all([
          getBooks({ limit: 100 }),
          getOrders(),
        ]);
        if (booksData && booksData.items) setBooks(booksData.items);
        if (Array.isArray(ordersData)) setOrders(ordersData as unknown as Order[]);
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
    { id: 'analytics', label: 'Grafikler', icon: '📊' },
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

          {/* Analytics */}
          {tab === 'analytics' && (() => {
            const analyticsData = (Array.isArray(books) ? books : []).map((book) => {
              let unitsSold = 0;
              let earnings = 0;
              
              if (Array.isArray(orders)) {
                orders.forEach((order) => {
                  if (order.status !== 'cancelled') {
                    if (Array.isArray(order.orderItems)) {
                      order.orderItems.forEach((item) => {
                        if (Number(item.bookId) === Number(book.id)) {
                          unitsSold += Number(item.quantity);
                          earnings += Number(item.quantity) * Number(item.price || book.price);
                        }
                      });
                    }
                  }
                });
              }

              return { book, unitsSold, earnings };
            }).sort((a, b) => b.earnings - a.earnings);

            const totalEarnings = analyticsData.reduce((acc, curr) => acc + curr.earnings, 0);
            const totalUnits = analyticsData.reduce((acc, curr) => acc + curr.unitsSold, 0);

            return (
              <div className="space-y-6">
                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-6 rounded-2xl shadow-sm flex items-center justify-between" style={{ backgroundColor: '#fff8dc', border: '1px solid #f5e6d3' }}>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#795548' }}>Toplam Satış Kazancı</p>
                      <h3 className="text-3xl font-bold mt-1" style={{ color: '#2e7d32' }}>₺{totalEarnings.toFixed(2)}</h3>
                    </div>
                    <span className="text-4xl">💰</span>
                  </div>
                  <div className="p-6 rounded-2xl shadow-sm flex items-center justify-between" style={{ backgroundColor: '#fff8dc', border: '1px solid #f5e6d3' }}>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#795548' }}>Satılan Toplam Kitap</p>
                      <h3 className="text-3xl font-bold mt-1" style={{ color: '#1565c0' }}>{totalUnits} Adet</h3>
                    </div>
                    <span className="text-4xl">📚</span>
                  </div>
                </div>

                {/* SVG X/Y Chart */}
                <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: '#fff8dc', border: '1px solid #f5e6d3' }}>
                  <h3 className="text-xl font-bold mb-6" style={{ color: '#3e2723', fontFamily: 'Georgia, serif' }}>Kazanç Grafiği (En Çok Satan 10 Kitap)</h3>
                  
                  {analyticsData.length === 0 ? (
                    <p className="text-center py-12" style={{ color: '#795548' }}>Grafik için veri bulunmuyor.</p>
                  ) : (() => {
                    const topBooks = analyticsData.slice(0, 10);
                    const svgWidth = 700;
                    const svgHeight = 350;
                    const paddingLeft = 70;
                    const paddingBottom = 60;
                    const paddingTop = 30;
                    const paddingRight = 30;
                    
                    const chartWidth = svgWidth - paddingLeft - paddingRight;
                    const chartHeight = svgHeight - paddingTop - paddingBottom;
                    
                    const maxTopEarnings = Math.max(...topBooks.map(b => b.earnings), 1);
                    
                    return (
                      <div className="overflow-x-auto pb-4">
                        <svg width={svgWidth} height={svgHeight} className="mx-auto">
                          <defs>
                            <linearGradient id="barGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#2e7d32" />
                              <stop offset="100%" stopColor="#81c784" />
                            </linearGradient>
                          </defs>

                          {/* Y Axis Guides */}
                          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                            const val = maxTopEarnings * pct;
                            const yPos = svgHeight - paddingBottom - (chartHeight * pct);
                            return (
                              <g key={idx}>
                                <line x1={paddingLeft} y1={yPos} x2={svgWidth - paddingRight} y2={yPos} stroke="#e0cdb0" strokeDasharray="4 4" />
                                <text x={paddingLeft - 10} y={yPos + 4} textAnchor="end" className="text-[10px] font-bold" style={{ fill: '#5d4037' }}>
                                  ₺{val >= 1000 ? `${(val/1000).toFixed(1)}k` : val.toFixed(0)}
                                </text>
                              </g>
                            );
                          })}

                          {/* Axes */}
                          <line x1={paddingLeft} y1={paddingTop} x2={paddingLeft} y2={svgHeight - paddingBottom} stroke="#8b4513" strokeWidth="2" />
                          <line x1={paddingLeft} y1={svgHeight - paddingBottom} x2={svgWidth - paddingRight} y2={svgHeight - paddingBottom} stroke="#8b4513" strokeWidth="2" />

                          {/* Bars */}
                          {topBooks.map((item, index) => {
                            const barWidth = 35;
                            const colWidth = chartWidth / topBooks.length;
                            const xPos = paddingLeft + (index * colWidth) + (colWidth - barWidth) / 2;
                            const barHeight = (item.earnings / maxTopEarnings) * chartHeight;
                            const yPos = svgHeight - paddingBottom - barHeight;

                            return (
                              <g key={item.book.id} className="group">
                                <rect 
                                  x={xPos} 
                                  y={yPos} 
                                  width={barWidth} 
                                  height={barHeight} 
                                  fill="url(#barGrad)" 
                                  rx="4"
                                  className="transition-all duration-500 hover:opacity-80 cursor-pointer"
                                />
                                <text 
                                  x={xPos + barWidth / 2} 
                                  y={yPos - 5} 
                                  textAnchor="middle" 
                                  className="text-[10px] font-bold" 
                                  style={{ fill: '#2e7d32' }}
                                >
                                  ₺{item.earnings.toFixed(0)}
                                </text>
                                <text 
                                  x={xPos + barWidth / 2} 
                                  y={svgHeight - paddingBottom + 15} 
                                  textAnchor="end" 
                                  className="text-[10px] font-medium" 
                                  transform={`rotate(-30, ${xPos + barWidth / 2}, ${svgHeight - paddingBottom + 15})`}
                                  style={{ fill: '#3e2723' }}
                                >
                                  {item.book.title.length > 12 ? `${item.book.title.slice(0, 10)}...` : item.book.title}
                                </text>
                              </g>
                            );
                          })}
                        </svg>
                      </div>
                    );
                  })()}
                </div>

                {/* Overall List Details */}
                <div className="rounded-2xl p-6 shadow-sm mt-6" style={{ backgroundColor: '#fff8dc', border: '1px solid #f5e6d3' }}>
                  <h3 className="text-xl font-bold mb-4" style={{ color: '#3e2723', fontFamily: 'Georgia, serif' }}>Detaylı Satış Listesi</h3>
                  <div className="space-y-4">
                    {analyticsData.map(({ book, unitsSold, earnings }) => {
                      const isExpanded = selectedBookChartId === book.id;
                      
                      // Filtrelenmiş siparişler
                      const bookOrders = (orders || []).filter(o => 
                        o.status !== 'cancelled' && 
                        o.orderItems?.some(item => Number(item.bookId) === Number(book.id))
                      );

                      // Grafik veri noktaları (Aylık Ciro Bazlı)
                      const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
                      const now = new Date();
                      const last5Months: string[] = [];

                      for (let j = 4; j >= 0; j--) {
                        const d = new Date(now.getFullYear(), now.getMonth() - j, 1);
                        last5Months.push(monthNames[d.getMonth()]);
                      }

                      const orderDataPoints = last5Months.map((mLabel) => {
                        let revenue = 0;
                        bookOrders.forEach((o) => {
                          const oDate = new Date(o.orderDate || Date.now());
                          const oMonthName = monthNames[oDate.getMonth()];
                          if (oMonthName === mLabel) {
                            const item = o.orderItems?.find(i => Number(i.bookId) === Number(book.id));
                            revenue += item ? Number(item.quantity) * Number(item.price || book.price) : 0;
                          }
                        });
                        return { label: mLabel, value: revenue };
                      });

                      const maxBookEarnings = Math.max(...orderDataPoints.map(p => p.value), 1);

                      return (
                        <div key={book.id} className="p-3 rounded-lg bg-orange-50/50 border border-orange-100 hover:bg-orange-50 transition-colors">
                          <div 
                            className="flex justify-between items-center cursor-pointer select-none"
                            onClick={() => setSelectedBookChartId(isExpanded ? null : book.id)}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span>📖</span>
                              <span className="font-bold text-sm text-amber-900 truncate">{book.title}</span>
                              <span className="text-[10px] text-amber-600 font-medium">({isExpanded ? '▲ Kapat' : '▼ Grafiği Gör'})</span>
                            </div>
                            <div className="flex gap-4 text-xs font-bold flex-shrink-0">
                              <span style={{ color: '#1565c0' }}>{unitsSold} Adet</span>
                              <span style={{ color: '#2e7d32' }}>₺{earnings.toFixed(2)}</span>
                            </div>
                          </div>

                          {/* Individual Micro Chart */}
                          {isExpanded && (
                            <div className="mt-4 pt-4 border-t border-orange-100/50">
                              {orderDataPoints.length === 0 ? (
                                <p className="text-center text-xs py-2 text-amber-800">Bu kitap için henüz grafik verisi yok.</p>
                              ) : (() => {
                                const mSvgWidth = 500;
                                const mSvgHeight = 160;
                                const mPadLeft = 50;
                                const mPadBottom = 30;
                                const mPadTop = 20;
                                const mPadRight = 20;
                                
                                const mChartWidth = mSvgWidth - mPadLeft - mPadRight;
                                const mChartHeight = mSvgHeight - mPadTop - mPadBottom;

                                return (
                                  <div className="overflow-x-auto py-2 flex justify-center">
                                    <svg width={mSvgWidth} height={mSvgHeight}>
                                      <defs>
                                        <linearGradient id="bookBarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                          <stop offset="0%" stopColor="#1e88e5" />
                                          <stop offset="100%" stopColor="#90caf9" />
                                        </linearGradient>
                                      </defs>

                                      {/* Y Axis Grid Lines */}
                                      {[0, 0.5, 1].map((pct, idx) => {
                                        const val = maxBookEarnings * pct;
                                        const yPos = mSvgHeight - mPadBottom - (mChartHeight * pct);
                                        return (
                                          <g key={idx}>
                                            <line x1={mPadLeft} y1={yPos} x2={mSvgWidth - mPadRight} y2={yPos} stroke="#f0dfc8" strokeDasharray="3 3" />
                                            <text x={mPadLeft - 8} y={yPos + 4} textAnchor="end" className="text-[9px] font-bold" style={{ fill: '#795548' }}>
                                              ₺{val.toFixed(0)}
                                            </text>
                                          </g>
                                        );
                                      })}

                                      {/* Axes */}
                                      <line x1={mPadLeft} y1={mPadTop} x2={mPadLeft} y2={mSvgHeight - mPadBottom} stroke="#a0522d" strokeWidth="1" />
                                      <line x1={mPadLeft} y1={mSvgHeight - mPadBottom} x2={mSvgWidth - mPadRight} y2={mSvgHeight - mPadBottom} stroke="#a0522d" strokeWidth="1" />

                                      {/* Bars */}
                                      {orderDataPoints.map((item, index) => {
                                        const bWidth = 26;
                                        const cWidth = mChartWidth / orderDataPoints.length;
                                        const xPos = mPadLeft + (index * cWidth) + (cWidth - bWidth) / 2;
                                        const bHeight = (item.value / maxBookEarnings) * mChartHeight;
                                        const yPos = mSvgHeight - mPadBottom - bHeight;

                                        return (
                                          <g key={index}>
                                            <rect 
                                              x={xPos} 
                                              y={yPos} 
                                              width={bWidth} 
                                              height={bHeight} 
                                              fill="url(#bookBarGrad)" 
                                              rx="3"
                                              className="hover:opacity-80 transition-all cursor-pointer"
                                            />
                                            <text 
                                              x={xPos + bWidth / 2} 
                                              y={yPos - 4} 
                                              textAnchor="middle" 
                                              className="text-[8px] font-bold" 
                                              style={{ fill: '#1565c0' }}
                                            >
                                              ₺{item.value.toFixed(0)}
                                            </text>
                                            <text 
                                              x={xPos + bWidth / 2} 
                                              y={mSvgHeight - mPadBottom + 12} 
                                              textAnchor="middle" 
                                              className="text-[7px] font-bold" 
                                              style={{ fill: '#5d4037' }}
                                            >
                                              {item.label}
                                            </text>
                                          </g>
                                        );
                                      })}
                                    </svg>
                                  </div>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}

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
