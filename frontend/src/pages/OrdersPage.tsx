import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getOrders, getOrder } from '../api/orders';
import type { Order } from '../types';

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Beklemede', color: '#e65100', bg: '#fff3e0' },
  processing: { label: 'Hazırlanıyor', color: '#1565c0', bg: '#e3f2fd' },
  shipped: { label: 'Kargoda', color: '#6a1b9a', bg: '#f3e5f5' },
  delivered: { label: 'Teslim Edildi', color: '#2e7d32', bg: '#e8f5e9' },
  cancelled: { label: 'İptal Edildi', color: '#c62828', bg: '#fde8e8' },
};

export default function OrdersPage() {
  const { id } = useParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getOrder(+id).then(setOrder).finally(() => setLoading(false));
    } else {
      getOrders().then(res => {
        if (Array.isArray(res)) setOrders(res);
        else if (res && (res as any).items) setOrders((res as any).items);
      }).finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-12 text-center" style={{ color: '#795548' }}>Yükleniyor...</div>;
  }

  if (id && order) {
    const status = STATUS_LABELS[order.status];
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link to="/siparislerim" className="text-sm mb-6 flex items-center gap-1 hover:underline" style={{ color: '#8b4513' }}>
          ← Siparişlerime Dön
        </Link>
        <div className="rounded-2xl overflow-hidden shadow-lg" style={{ border: '1px solid #f5e6d3' }}>
          <div className="p-6" style={{ backgroundColor: '#fff8dc' }}>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold" style={{ color: '#3e2723' }}>Sipariş #{order.id}</h1>
                <p className="text-sm mt-1" style={{ color: '#795548' }}>
                  {new Date(order.orderDate).toLocaleDateString('tr-TR')}
                </p>
              </div>
              <span className="px-4 py-2 rounded-full text-sm font-bold" style={{ backgroundColor: status.bg, color: status.color }}>
                {status.label}
              </span>
            </div>
          </div>
          <div className="p-6">
            <h2 className="font-bold mb-3" style={{ color: '#3e2723' }}>Sipariş Detayları</h2>
            <div className="space-y-3">
              {Array.isArray(order.orderItems) && order.orderItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b" style={{ borderColor: '#f5e6d3' }}>
                  <div>
                    <p className="font-medium text-sm" style={{ color: '#3e2723' }}>{item.book?.title || 'Kitap'}</p>
                    <p className="text-xs" style={{ color: '#795548' }}>Adet: {item.quantity}</p>
                  </div>
                  <p className="font-bold" style={{ color: '#8b4513' }}>₺{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-bold text-lg mt-4" style={{ color: '#3e2723' }}>
              <span>Toplam</span>
              <span>₺{Number(order.totalPrice).toFixed(2)}</span>
            </div>
            {order.shippingAddress && (
              <div className="mt-4 p-4 rounded-lg text-sm" style={{ backgroundColor: '#fdf6f0', color: '#5d4037' }}>
                <span className="font-medium">Teslimat Adresi:</span> {order.shippingAddress}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8" style={{ color: '#3e2723', fontFamily: 'Georgia, serif' }}>
        Siparişlerim
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-16" style={{ color: '#795548' }}>
          <p className="text-5xl mb-4">📦</p>
          <p className="text-lg">Henüz sipariş vermediniz.</p>
          <Link to="/kitaplar" className="inline-block mt-4 px-6 py-2 rounded-full font-medium" style={{ backgroundColor: '#ff8c00', color: 'white' }}>
            Alışverişe Başla
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {Array.isArray(orders) && orders.map((o) => {
            const status = STATUS_LABELS[o.status];
            return (
              <Link
                key={o.id}
                to={`/siparislerim/${o.id}`}
                className="block rounded-xl p-5 transition-all hover:shadow-md hover:-translate-y-0.5"
                style={{ backgroundColor: '#fff8dc', border: '1px solid #f5e6d3' }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold" style={{ color: '#3e2723' }}>Sipariş #{o.id}</p>
                    <p className="text-sm mt-1" style={{ color: '#795548' }}>
                      {new Date(o.orderDate).toLocaleDateString('tr-TR')} • {o.orderItems?.length || 0} ürün
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-bold" style={{ color: '#8b4513' }}>₺{Number(o.totalPrice).toFixed(2)}</span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: status.bg, color: status.color }}>
                      {status.label}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
