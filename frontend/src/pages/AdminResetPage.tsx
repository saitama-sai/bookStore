import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { resetDatabase, seedDemoData, clearCorruptedData, getDatabaseStats } from '../api/admin';
import { login } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import ConfirmDialog from '../components/common/ConfirmDialog';
import type { DatabaseStats } from '../types';

interface LogEntry {
  time: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

const ADMIN_CREDENTIALS = { email: 'admin@kitabevi.com', password: 'Admin123!' };

export default function AdminResetPage() {
  const { user, isAdmin, setAuth } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [statsError, setStatsError] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [dialog, setDialog] = useState<{ action: 'reset' | 'seed' | 'clear' } | null>(null);

  useEffect(() => {
    if (!user || !isAdmin()) { navigate('/giris'); return; }
    loadStats();
  }, []);

  const reLogin = async () => {
    try {
      const res = await login(ADMIN_CREDENTIALS);
      setAuth(res.user, res.access_token);
      return true;
    } catch {
      return false;
    }
  };

  const loadStats = useCallback(async () => {
    setStatsError(false);
    try {
      const data = await getDatabaseStats();
      setStats(data);
    } catch {
      // Token might be invalid after DB reset, try re-login
      const ok = await reLogin();
      if (ok) {
        try {
          const data = await getDatabaseStats();
          setStats(data);
          return;
        } catch {}
      }
      setStatsError(true);
    }
  }, []);

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    setLogs((prev) => [{ time: new Date().toLocaleString('tr-TR'), message, type }, ...prev.slice(0, 19)]);
  };

  const handleReset = async () => {
    setDialog(null);
    setLoading('reset');
    addLog('Veritabanı sıfırlanıyor...', 'info');
    try {
      const res = await resetDatabase();
      addLog(`Veritabanı sıfırlandı. ${res.categories} kategori oluşturuldu.`, 'success');
      // Re-login since all users were recreated
      await reLogin();
      await loadStats();
    } catch (err: any) {
      addLog(`Hata: ${err.response?.data?.message || err.message}`, 'error');
      // Try re-login even on error since DB may have been partially reset
      await reLogin();
    } finally {
      setLoading(null);
    }
  };

  const handleSeed = async () => {
    setDialog(null);
    setLoading('seed');
    addLog('Demo verileri ekleniyor...', 'info');
    try {
      const res = await seedDemoData();
      addLog(`Demo verisi eklendi: ${res.books} kitap, ${res.authors} yazar, ${res.orders} sipariş.`, 'success');
      // Re-login since all users were recreated  
      await reLogin();
      await loadStats();
    } catch (err: any) {
      addLog(`Hata: ${err.response?.data?.message || err.message}`, 'error');
      await reLogin();
    } finally {
      setLoading(null);
    }
  };

  const handleClear = async () => {
    setDialog(null);
    setLoading('clear');
    addLog('Bozuk veriler temizleniyor...', 'info');
    try {
      const res = await clearCorruptedData();
      addLog(`Temizlendi: ${res.stocklessBooks} stoksuz kitap, ${res.orphanOrders} sahipsiz sipariş, ${res.emptyCategories} boş kategori.`, 'success');
      await loadStats();
    } catch (err: any) {
      addLog(`Hata: ${err.response?.data?.message || err.message}`, 'error');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate('/admin')} className="text-sm hover:underline" style={{ color: '#8b4513' }}>
          ← Admin
        </button>
        <h1 className="text-3xl font-bold" style={{ color: '#3e2723', fontFamily: 'Georgia, serif' }}>
          Veritabanı Yönetimi
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stats */}
        <div className="rounded-2xl p-6" style={{ backgroundColor: '#fff8dc', border: '1px solid #f5e6d3' }}>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: '#3e2723' }}>
            📊 İstatistikler
          </h2>
          {stats ? (
            <div className="space-y-3">
              {[
                { label: 'Toplam Kitap', value: stats.books, icon: '📚' },
                { label: 'Toplam Sipariş', value: stats.orders, icon: '📦' },
                { label: 'Toplam Kullanıcı', value: stats.users, icon: '👥' },
                { label: 'Toplam Yazar', value: stats.authors, icon: '✍️' },
                { label: 'Toplam Kategori', value: stats.categories, icon: '🏷️' },
              ].map(({ label, value, icon }) => (
                <div key={label} className="flex justify-between items-center py-2 border-b" style={{ borderColor: '#f0dfc8' }}>
                  <span className="text-sm" style={{ color: '#5d4037' }}>{icon} {label}</span>
                  <span className="font-bold text-lg" style={{ color: '#8b4513' }}>{value}</span>
                </div>
              ))}
              <p className="text-xs mt-2" style={{ color: '#a0866a' }}>
                Son güncelleme: {new Date(stats.lastUpdated).toLocaleString('tr-TR')}
              </p>
            </div>
          ) : statsError ? (
            <div className="text-center py-8">
              <p className="text-sm mb-2" style={{ color: '#c62828' }}>İstatistikler yüklenemedi</p>
              <button onClick={loadStats} className="text-xs underline" style={{ color: '#8b4513' }}>Tekrar dene</button>
            </div>
          ) : (
            <div className="text-center py-8 text-sm" style={{ color: '#795548' }}>Yükleniyor...</div>
          )}
          <button
            onClick={loadStats}
            disabled={loading !== null}
            className="w-full mt-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            style={{ backgroundColor: '#f5e6d3', color: '#8b4513' }}
          >
            🔄 Yenile
          </button>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          {/* Reset */}
          <div className="rounded-2xl p-5" style={{ backgroundColor: '#fde8e8', border: '1px solid #ffcdd2' }}>
            <h3 className="font-bold mb-1" style={{ color: '#c62828' }}>🗑️ Tüm Verileri Sıfırla</h3>
            <p className="text-xs mb-3" style={{ color: '#b71c1c' }}>
              Uyarı: Bu işlem geri alınamaz! Tüm veriler silinir.
            </p>
            <button
              onClick={() => setDialog({ action: 'reset' })}
              disabled={loading !== null}
              className="w-full py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:scale-105 disabled:opacity-50"
              style={{ backgroundColor: '#c62828' }}
            >
              {loading === 'reset' ? 'Sıfırlanıyor...' : 'Veritabanını Sıfırla'}
            </button>
          </div>

          {/* Seed */}
          <div className="rounded-2xl p-5" style={{ backgroundColor: '#e8f5e9', border: '1px solid #c8e6c9' }}>
            <h3 className="font-bold mb-1" style={{ color: '#2e7d32' }}>✨ Demo Verisi Ekle</h3>
            <p className="text-xs mb-3" style={{ color: '#1b5e20' }}>
              30 kitap, 5 kategori, 10 yazar, 5 müşteri, 15 sipariş ekler.
            </p>
            <button
              onClick={() => setDialog({ action: 'seed' })}
              disabled={loading !== null}
              className="w-full py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:scale-105 disabled:opacity-50"
              style={{ backgroundColor: '#2e7d32' }}
            >
              {loading === 'seed' ? 'Ekleniyor...' : 'Demo Verisi Ekle'}
            </button>
          </div>

          {/* Clear */}
          <div className="rounded-2xl p-5" style={{ backgroundColor: '#fff8e1', border: '1px solid #ffecb3' }}>
            <h3 className="font-bold mb-1" style={{ color: '#e65100' }}>🧹 Bozuk Verileri Temizle</h3>
            <p className="text-xs mb-3" style={{ color: '#bf360c' }}>
              Stoksuz kitaplar, sahipsiz siparişler ve boş kategorileri temizler.
            </p>
            <button
              onClick={() => setDialog({ action: 'clear' })}
              disabled={loading !== null}
              className="w-full py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:scale-105 disabled:opacity-50"
              style={{ backgroundColor: '#e65100' }}
            >
              {loading === 'clear' ? 'Temizleniyor...' : 'Bozuk Verileri Temizle'}
            </button>
          </div>
        </div>
      </div>

      {/* Logs */}
      {logs.length > 0 && (
        <div className="mt-6 rounded-2xl overflow-hidden" style={{ border: '1px solid #f5e6d3' }}>
          <div className="p-4" style={{ backgroundColor: '#3e2723' }}>
            <h2 className="font-bold text-sm" style={{ color: '#fff8dc' }}>📝 İşlem Logları</h2>
          </div>
          <div className="p-4 max-h-48 overflow-y-auto" style={{ backgroundColor: '#1a0f08' }}>
            {logs.map((log, i) => (
              <div key={i} className="flex gap-3 text-xs mb-2 font-mono">
                <span style={{ color: '#795548' }}>{log.time}</span>
                <span style={{ color: log.type === 'success' ? '#4caf50' : log.type === 'error' ? '#f44336' : '#90a4ae' }}>
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {dialog && (
        <ConfirmDialog
          title={
            dialog.action === 'reset' ? 'Veritabanını Sıfırla' :
            dialog.action === 'seed' ? 'Demo Verisi Ekle' :
            'Bozuk Verileri Temizle'
          }
          message={
            dialog.action === 'reset' ? 'Bu işlem geri alınamaz! Tüm kitaplar, siparişler ve kullanıcılar silinecek. Emin misiniz?' :
            dialog.action === 'seed' ? '30 kitap, 10 yazar, 5 kategori ve 15 sipariş eklenecek. Devam etmek istiyor musunuz?' :
            'Stoksuz kitaplar, sahipsiz siparişler ve boş kategoriler silinecek. Devam etmek istiyor musunuz?'
          }
          onConfirm={dialog.action === 'reset' ? handleReset : dialog.action === 'seed' ? handleSeed : handleClear}
          onCancel={() => setDialog(null)}
          danger={dialog.action === 'reset'}
          loading={loading !== null}
        />
      )}
    </div>
  );
}
