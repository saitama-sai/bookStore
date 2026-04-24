import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { register as registerUser } from '../api/auth';
import { login } from '../api/auth';
import { useAuthStore } from '../store/authStore';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    if (data.password !== data.confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await registerUser({ email: data.email, password: data.password, firstName: data.firstName, lastName: data.lastName });
      const res = await login({ email: data.email, password: data.password });
      setAuth(res.user, res.access_token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Kayıt yapılamadı');
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
            <p className="text-sm mt-1" style={{ color: '#f5e6d3' }}>Yeni hesap oluşturun</p>
          </div>

          <div className="p-8" style={{ backgroundColor: '#fff8dc' }}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#5d4037' }}>Ad</label>
                  <input
                    {...register('firstName', { required: 'Ad zorunludur' })}
                    placeholder="Adınız"
                    className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                    style={{ borderColor: '#a0522d', backgroundColor: '#fffef9' }}
                  />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#5d4037' }}>Soyad</label>
                  <input
                    {...register('lastName', { required: 'Soyad zorunludur' })}
                    placeholder="Soyadınız"
                    className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                    style={{ borderColor: '#a0522d', backgroundColor: '#fffef9' }}
                  />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#5d4037' }}>Email</label>
                <input
                  {...register('email', { required: 'Email zorunludur' })}
                  type="email"
                  placeholder="ornek@email.com"
                  className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none"
                  style={{ borderColor: '#a0522d', backgroundColor: '#fffef9' }}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#5d4037' }}>Şifre</label>
                <input
                  {...register('password', { required: 'Şifre zorunludur', minLength: { value: 8, message: 'En az 8 karakter' } })}
                  type="password"
                  placeholder="En az 8 karakter"
                  className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none"
                  style={{ borderColor: '#a0522d', backgroundColor: '#fffef9' }}
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#5d4037' }}>Şifre Tekrar</label>
                <input
                  {...register('confirmPassword', { required: 'Şifre tekrarı zorunludur' })}
                  type="password"
                  placeholder="Şifrenizi tekrar girin"
                  className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none"
                  style={{ borderColor: '#a0522d', backgroundColor: '#fffef9' }}
                />
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
                {loading ? 'Kayıt Yapılıyor...' : 'Kayıt Ol'}
              </button>
            </form>

            <p className="text-center mt-6 text-sm" style={{ color: '#795548' }}>
              Hesabınız var mı?{' '}
              <Link to="/giris" className="font-bold hover:underline" style={{ color: '#8b4513' }}>
                Giriş Yapın
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
