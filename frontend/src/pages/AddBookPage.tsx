import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { createBook } from '../api/books';
import { getCategories } from '../api/categories';
import { getAuthors } from '../api/authors';
import { useAuthStore } from '../store/authStore';
import type { Category, Author } from '../types';

interface FormFields {
  title: string;
  isbn: string;
  price: number;
  stock: number;
  description: string;
  publishYear: number;
  pageCount: number;
  language: string;
  categoryId: number;
  authorIds: string;
}

export default function AddBookPage() {
  const { user, isAdmin } = useAuthStore();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormFields>({
    defaultValues: { language: 'Türkçe', stock: 0 }
  });

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Lütfen bir görsel dosyası seçin (JPG, PNG, WebP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Dosya boyutu en fazla 5MB olabilir');
      return;
    }
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
    setError('');
  };

  useEffect(() => {
    if (!user || !isAdmin()) { navigate('/giris'); return; }
    Promise.all([getCategories(), getAuthors()]).then(([cats, auths]) => {
      setCategories(cats);
      setAuthors(auths);
    });
  }, []);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            const file = items[i].getAsFile();
            if (file) {
              processImageFile(file);
            }
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const removeCover = () => {
    setCoverFile(null);
    setCoverPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onSubmit = async (data: FormFields) => {
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (k === 'authorIds') {
          const ids = String(v).split(',').map((s) => s.trim()).filter(Boolean);
          ids.forEach((id) => formData.append('authorIds[]', id));
        } else {
          formData.append(k, String(v));
        }
      });
      if (coverFile) {
        formData.append('coverImage', coverFile);
      }
      await createBook(formData);
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Kitap eklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };
  const generateAutoBook = () => {
    const prefixes = ['Gizemli', 'Kayıp', 'Son', 'Kadim', 'Rüzgarlı', 'Gümüş', 'Gece', 'Gölge', 'Saklı', 'Sihirli'];
    const nouns = ['Ada', 'Şehir', 'Gece', 'Yolculuk', 'Anahtar', 'Tapınak', 'Diyar', 'Orman', 'Kule', 'Sır'];
    const title = `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;
    
    let isbn = '978';
    for (let i = 0; i < 10; i++) isbn += Math.floor(Math.random() * 10);

    setValue('title', title);
    setValue('isbn', isbn);
    setValue('price', Number((Math.random() * 120 + 35).toFixed(2)));
    setValue('stock', Math.floor(Math.random() * 45) + 5);
    setValue('publishYear', Math.floor(Math.random() * 45) + 1980);
    setValue('pageCount', Math.floor(Math.random() * 450) + 150);
    setValue('language', Math.random() > 0.8 ? 'İngilizce' : 'Türkçe');
    setValue('description', `${title}, heyecan dolu kurgusuyla okuyucuları büyüleyen sürükleyici bir romandır.`);

    if (categories.length > 0) {
      const randomCat = categories[Math.floor(Math.random() * categories.length)];
      setValue('categoryId', randomCat.id);
    }

    if (authors.length > 0) {
      const randomAuth = authors[Math.floor(Math.random() * authors.length)];
      setValue('authorIds', String(randomAuth.id));
    }

    // Canvas cover creation
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 450;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, 300, 450);
      const colors = ['#2b1055', '#7597de', '#4b134f', '#c94b4b', '#134e5e', '#71b280'];
      grad.addColorStop(0, colors[Math.floor(Math.random() * colors.length)]);
      grad.addColorStop(1, colors[Math.floor(Math.random() * colors.length)]);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 300, 450);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 15;
      for(let i=0; i<12; i++){
        ctx.beginPath();
        ctx.arc(Math.random()*300, Math.random()*450, Math.random()*120, 0, Math.PI*2);
        ctx.stroke();
      }

      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 6;
      ctx.textAlign = 'center';
      
      // Text Wrapping
      ctx.font = 'bold 24px Georgia';
      const words = title.split(' ');
      let line = '';
      let y = 180;
      for(let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + ' ';
        let metrics = ctx.measureText(testLine);
        if (metrics.width > 260 && n > 0) {
          ctx.fillText(line, 150, y);
          line = words[n] + ' ';
          y += 30;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, 150, y);

      ctx.shadowBlur = 0;
      ctx.font = 'italic 14px sans-serif';
      ctx.fillStyle = '#f5e6d3';
      ctx.fillText('Otomatik Üretilen Eser', 150, 400);

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `auto_cover_${Date.now()}.png`, { type: 'image/png' });
          setCoverFile(file);
          setCoverPreview(URL.createObjectURL(file));
        }
      }, 'image/png');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button onClick={() => navigate('/admin')} className="mb-6 text-sm hover:underline" style={{ color: '#8b4513' }}>
        ← Admin Paneline Dön
      </button>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold" style={{ color: '#3e2723', fontFamily: 'Georgia, serif' }}>Yeni Kitap Ekle</h1>
        <button
          type="button"
          onClick={generateAutoBook}
          className="px-4 py-2.5 rounded-xl font-bold text-sm text-white shadow-md transition-all hover:scale-105 active:scale-95"
          style={{ backgroundColor: '#ea580c' }}
        >
          ✨ Rastgele Kitap Üret
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="rounded-xl p-6 space-y-4" style={{ backgroundColor: '#fff8dc', border: '1px solid #f5e6d3' }}>
          
          {/* Cover Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#5d4037' }}>
              Kapak Görseli (Tıklayın, Sürükleyin veya Yapıştırın)
            </label>
            <div className="flex gap-4 items-start">
              {/* Preview */}
              <div
                className="w-32 h-44 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center cursor-pointer transition-all hover:shadow-lg"
                style={{ 
                  backgroundColor: isDragging ? '#fdf6f0' : '#f5e6d3', 
                  border: isDragging ? '2px dashed #ff8c00' : '2px dashed #a0522d',
                  borderStyle: coverPreview ? 'solid' : 'dashed',
                  transform: isDragging ? 'scale(1.03)' : 'none',
                }}
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
              >
                {coverPreview ? (
                  <img src={coverPreview} alt="Kapak önizleme" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-2">
                    <span className="text-3xl block mb-1">📷</span>
                    <span className="text-xs" style={{ color: '#8b4513' }}>Görsel Seç</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors mb-2"
                  style={{ backgroundColor: '#f5e6d3', color: '#8b4513', border: '1px solid #d4a574' }}
                >
                  📁 Dosya Seç
                </button>
                {coverFile && (
                  <div className="flex items-center justify-between">
                    <p className="text-xs truncate" style={{ color: '#795548' }}>
                      {coverFile.name} ({(coverFile.size / 1024).toFixed(0)} KB)
                    </p>
                    <button
                      type="button"
                      onClick={removeCover}
                      className="text-xs text-red-500 hover:text-red-700 font-medium ml-2"
                    >
                      Kaldır
                    </button>
                  </div>
                )}
                {!coverFile && (
                  <p className="text-xs" style={{ color: '#a0866a' }}>
                    JPG, PNG veya WebP formatında, max 5MB. Sürükle-bırak yapabilir veya resmi kopyalayıp sayfadayken direkt (CTRL+V) ile yapıştırabilirsiniz.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#5d4037' }}>Kitap Adı *</label>
            <input {...register('title', { required: 'Kitap adı zorunludur' })}
              className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none"
              style={{ borderColor: '#a0522d', backgroundColor: '#fffef9' }} />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#5d4037' }}>ISBN (13 karakter) *</label>
              <input {...register('isbn', { required: 'ISBN zorunludur', minLength: { value: 13, message: '13 karakter olmalı' }, maxLength: { value: 13, message: '13 karakter olmalı' } })}
                className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none"
                style={{ borderColor: '#a0522d', backgroundColor: '#fffef9' }} />
              {errors.isbn && <p className="text-red-500 text-xs mt-1">{errors.isbn.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#5d4037' }}>Fiyat (₺) *</label>
              <input {...register('price', { required: 'Fiyat zorunludur', min: { value: 0.01, message: 'Fiyat > 0 olmalı' } })}
                type="number" step="0.01"
                className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none"
                style={{ borderColor: '#a0522d', backgroundColor: '#fffef9' }} />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#5d4037' }}>Stok</label>
              <input {...register('stock', { min: { value: 0, message: 'Stok >= 0 olmalı' } })}
                type="number"
                className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none"
                style={{ borderColor: '#a0522d', backgroundColor: '#fffef9' }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#5d4037' }}>Dil</label>
              <input {...register('language')}
                className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none"
                style={{ borderColor: '#a0522d', backgroundColor: '#fffef9' }} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#5d4037' }}>Yayın Yılı</label>
              <input {...register('publishYear')} type="number"
                className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none"
                style={{ borderColor: '#a0522d', backgroundColor: '#fffef9' }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#5d4037' }}>Sayfa Sayısı</label>
              <input {...register('pageCount')} type="number"
                className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none"
                style={{ borderColor: '#a0522d', backgroundColor: '#fffef9' }} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#5d4037' }}>Kategori</label>
            <select {...register('categoryId')}
              className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none"
              style={{ borderColor: '#a0522d', backgroundColor: '#fffef9' }}>
              <option value="">Kategori Seçin</option>
              {Array.isArray(categories) && categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#5d4037' }}>Yazarlar (ID'leri virgülle ayırın)</label>
            <input {...register('authorIds')} placeholder="1, 2, 3"
              className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none"
              style={{ borderColor: '#a0522d', backgroundColor: '#fffef9' }} />
            <p className="text-xs mt-1" style={{ color: '#a0866a' }}>
              Mevcut yazarlar: {Array.isArray(authors) && authors.map((a) => `${a.id}: ${a.name}`).join(', ')}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#5d4037' }}>Açıklama</label>
            <textarea {...register('description')} rows={4}
              className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none resize-none"
              style={{ borderColor: '#a0522d', backgroundColor: '#fffef9' }} />
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: '#fde8e8', color: '#c62828' }}>{error}</div>
        )}

        <div className="flex gap-4">
          <button type="button" onClick={() => navigate('/admin')}
            className="flex-1 py-3 rounded-xl font-bold text-sm transition-colors"
            style={{ backgroundColor: '#f5e6d3', color: '#8b4513' }}>
            İptal
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 py-3 rounded-xl font-bold text-sm text-white transition-all hover:scale-105 disabled:opacity-50"
            style={{ backgroundColor: '#ff8c00' }}>
            {loading ? 'Kaydediliyor...' : 'Kitap Ekle'}
          </button>
        </div>
      </form>
    </div>
  );
}
