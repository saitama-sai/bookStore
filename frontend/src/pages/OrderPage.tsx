import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { createOrder } from '../api/orders';
import { useCartStore } from '../store/cartStore';

interface FormData {
  shippingAddress: string;
}

export default function OrderPage() {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  if (items.length === 0) {
    navigate('/sepet');
    return null;
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError('');
    try {
      const order = await createOrder({
        shippingAddress: data.shippingAddress,
        items: Array.isArray(items) ? items.map((i) => ({ bookId: i.book.id, quantity: i.quantity })) : [],
      });
      clearCart();
      navigate(`/siparislerim/${order.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Sipariş oluşturulurken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8" style={{ color: '#3e2723', fontFamily: 'Georgia, serif' }}>
        Siparişi Tamamla
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold mb-4" style={{ color: '#3e2723' }}>Teslimat Bilgileri</h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: '#5d4037' }}>
                Teslimat Adresi
              </label>
              <textarea
                {...register('shippingAddress', { required: 'Adres zorunludur' })}
                rows={4}
                placeholder="İl, İlçe, Mahalle, Cadde/Sokak, No, Daire"
                className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 resize-none"
                style={{ borderColor: '#a0522d', backgroundColor: '#fffef9' }}
              />
              {errors.shippingAddress && (
                <p className="text-red-500 text-xs mt-1">{errors.shippingAddress.message}</p>
              )}
            </div>

            {error && (
              <div className="p-3 rounded-lg mb-4 text-sm" style={{ backgroundColor: '#fde8e8', color: '#c62828' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 disabled:opacity-50"
              style={{ backgroundColor: '#ff8c00', color: 'white' }}
            >
              {loading ? 'Sipariş Oluşturuluyor...' : `Siparişi Ver (₺${total().toFixed(2)})`}
            </button>
          </form>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4" style={{ color: '#3e2723' }}>Sepet Özeti</h2>
          <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: '#fff8dc', border: '1px solid #f5e6d3' }}>
            {Array.isArray(items) && items.map(({ book, quantity }) => (
              <div key={book.id} className="flex justify-between text-sm" style={{ color: '#5d4037' }}>
                <span className="line-clamp-1 flex-1 mr-2">{book.title} x{quantity}</span>
                <span className="font-medium">₺{(Number(book.price) * quantity).toFixed(2)}</span>
              </div>
            ))}
            <hr style={{ borderColor: '#e0cdb0' }} />
            <div className="flex justify-between font-bold" style={{ color: '#3e2723' }}>
              <span>Toplam</span>
              <span>₺{total().toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
