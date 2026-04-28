interface Props {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
  loading?: boolean;
}

export default function ConfirmDialog({ title, message, onConfirm, onCancel, danger, loading }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden border" style={{ backgroundColor: '#ffffff', borderColor: '#e0cda9' }}>
        <div className={`p-6 ${danger ? 'bg-red-50' : 'bg-orange-50'}`} style={{ backgroundColor: danger ? '#fef2f2' : '#fffaf0' }}>
          <h3 className="text-xl font-bold" style={{ color: danger ? '#b91c1c' : '#c2410c', fontFamily: 'Georgia, serif' }}>{title}</h3>
        </div>
        <div className="p-6">
          <p className="text-stone-800 font-medium text-sm leading-relaxed">{message}</p>
        </div>
        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl border font-bold text-sm transition-all hover:bg-stone-100 disabled:opacity-50"
            style={{ color: '#5d4037', borderColor: '#d7ccc8', backgroundColor: '#faf8f5' }}
          >
            İptal
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-50 hover:opacity-90"
            style={{ backgroundColor: danger ? '#dc2626' : '#ea580c' }}
          >
            {loading ? 'İşleniyor...' : 'Onayla'}
          </button>
        </div>
      </div>
    </div>
  );
}
