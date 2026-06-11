import { useState } from 'react';
import { X } from 'lucide-react';

export default function KitModal({ visible, onClose, onConfirm }) {
  const [nombre, setNombre] = useState('');

  function handleConfirm() {
    if (!nombre.trim()) return;
    onConfirm(nombre.trim());
    setNombre('');
  }

  function handleClose() {
    setNombre('');
    onClose();
  }

  return (
    <div
      className={`modal-overlay${visible ? ' visible' : ''}`}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="modal-box bg-white border border-gray-200 rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <div className="text-base font-bold text-gray-900">Nuevo kit</div>
            <div className="text-xs text-gray-400 mt-0.5">Un kit agrupa varias órdenes</div>
          </div>
          <button onClick={handleClose} className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5">
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1.5">Nombre del kit</label>
          <input
            type="text"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            placeholder="Ej. Juego completo, Portero…"
            className="field-input"
          />
        </div>
        <div className="flex justify-end gap-2 px-5 pb-5">
          <button onClick={handleClose} className="px-4 py-2 text-sm font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50">Cancelar</button>
          <button onClick={handleConfirm} className="px-4 py-2 text-sm font-medium bg-[#050314] text-white rounded-lg hover:bg-gray-800">Crear kit</button>
        </div>
      </div>
    </div>
  );
}
