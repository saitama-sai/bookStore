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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        <div className={`p-6 ${danger ? 'bg-red-50' : 'bg-orange-50'}`}>
          <h3 className={`text-xl font-bold ${danger ? 'text-red-700' : 'text-orange-700'}`}>{title}</h3>
        </div>
        <div className="p-6">
          <p className="text-gray-700">{message}</p>
        </div>
        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2 rounded-lg border font-medium transition-colors hover:bg-gray-100"
          >
            İptal
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-2 rounded-lg font-medium text-white transition-colors ${
              danger ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-500 hover:bg-orange-600'
            } disabled:opacity-50`}
          >
            {loading ? 'İşleniyor...' : 'Onayla'}
          </button>
        </div>
      </div>
    </div>
  );
}
