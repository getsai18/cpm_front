import {
  AlertTriangle, RotateCcw, Package, CheckCircle, Layers,
  Trash2, MinusCircle, AlertCircle, Lock, Shirt, TriangleAlert,
} from 'lucide-react';

const ICON_MAP = {
  'alert-triangle': AlertTriangle,
  'triangle-alert': TriangleAlert,
  'rotate-ccw': RotateCcw,
  'package': Package,
  'check-circle': CheckCircle,
  'layers': Layers,
  'trash-2': Trash2,
  'minus-circle': MinusCircle,
  'alert-circle': AlertCircle,
  'lock': Lock,
  'shirt': Shirt,
};

export default function ConfirmModal({ data, onClose }) {
  if (!data) return null;
  const { title, body, confirmLabel, confirmCls, icon, iconCls, hideCancelBtn, onConfirm } = data;
  const IconComp = ICON_MAP[icon] || AlertTriangle;
  const iconTextColor = (confirmCls?.includes('red') !== false) ? 'text-red-600' : 'text-gray-700';

  function handleConfirm() {
    onClose();
    onConfirm && onConfirm();
  }

  return (
    <div
      className="modal-overlay visible"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-box bg-white border border-gray-200 rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="p-6">
          <div className="flex items-start gap-4 mb-5">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${iconCls || 'bg-red-100'}`}>
              <IconComp className={`w-5 h-5 ${iconTextColor}`} />
            </div>
            <div>
              <div className="text-base font-bold text-gray-900 mb-1">{title || '¿Estás seguro?'}</div>
              <div className="text-sm text-gray-500 leading-relaxed">{body}</div>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            {!hideCancelBtn && (
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            )}
            <button
              onClick={handleConfirm}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${confirmCls || 'bg-red-600 hover:bg-red-700 text-white'}`}
            >
              {confirmLabel || 'Confirmar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
