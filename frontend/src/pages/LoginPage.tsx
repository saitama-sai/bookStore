import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { login } from '../api/auth';
import { useAuthStore } from '../store/authStore';

interface FormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError('');
    try {
      const res = await login(data);
      setAuth(res.user, res.access_token);
      // Force a full page reload to ensure state is fresh and correctly loaded
      window.location.href = '/';
    } catch (err: any) {
      setError(err.response?.data?.message || 'Giriş yapılamadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ backgroundColor: '#fdf6f0' }}>
      <div className="w-full max-w-md">
        <div className="rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8 text-center" style={{ backgroundColor: '#8b4513' }}>
            <span className="text-4xl">📚</span>
            <h1 className="text-2xl font-bold mt-2" style={{ color: '#fff8dc', fontFamily: 'Georgia, serif' }}>Kitabevi</h1>
            <p className="text-sm mt-1" style={{ color: '#f5e6d3' }}>Hesabınıza giriş yapın</p>
          </div>

          <div className="p-8" style={{ backgroundColor: '#fff8dc' }}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#5d4037' }}>Email</label>
                <input
                  {...register('email', { required: 'Email zorunludur' })}
                  type="email"
                  placeholder="ornek@email.com"
                  className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2"
                  style={{ borderColor: '#a0522d', backgroundColor: '#fffef9' }}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#5d4037' }}>Şifre</label>
                <input
                  {...register('password', { required: 'Şifre zorunludur', minLength: { value: 8, message: 'En az 8 karakter' } })}
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2"
                  style={{ borderColor: '#a0522d', backgroundColor: '#fffef9' }}
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              {error && (
                <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: '#fde8e8', color: '#c62828' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-lg transition-all hover:scale-105 disabled:opacity-50"
                style={{ backgroundColor: '#ff8c00', color: 'white' }}
              >
                {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
              </button>
            </form>

            <p className="text-center mt-6 text-sm" style={{ color: '#795548' }}>
              Hesabınız yok mu?{' '}
              <Link to="/kayit" className="font-bold hover:underline" style={{ color: '#8b4513' }}>
                Kayıt Olun
              </Link>
            </p>

            <div className="mt-4 p-3 rounded-lg text-xs" style={{ backgroundColor: '#f5e6d3', color: '#795548' }}>
              Admin: admin@kitabevi.com / Admin123!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
