import { ChevronLeft } from 'lucide-react';

export default function ReutilizarScreen({ pedidoActivo, onGoTo, onConfirmarReutilizar }) {
  if (!pedidoActivo) return null;

  const orden = pedidoActivo.ordenes[0];

  return (
    <div>
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reutilizar diseño</h1>
          <p className="text-sm text-gray-500 mt-1">Se copiará la configuración del pedido seleccionado</p>
        </div>
        <button
          onClick={() => onGoTo('pedidos')}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <ChevronLeft className="w-4 h-4" /> Volver
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold text-gray-900">Diseño de {pedidoActivo.id}</div>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-green-50 text-green-700">Listo para reutilizar</span>
        </div>
        <div className="resumen-grid">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Código origen</div>
            <div className="font-mono text-xs text-indigo-600">{orden?.code}</div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Prendas</div>
            <div className="text-sm text-gray-700">{orden?.clothes?.map(c => c.name).join(', ')}</div>
          </div>
        </div>
        <div className="border-t border-gray-100 mt-3 pt-3 text-xs text-gray-500">
          Se copiarán: tipos de prenda y configuración de áreas. Las cantidades deberán capturarse nuevamente.
        </div>
      </div>

      <div className="flex gap-2 justify-end mt-4">
        <button
          onClick={() => onGoTo('pedidos')}
          className="px-4 py-2 text-sm font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirmarReutilizar}
          className="px-4 py-2 text-sm font-medium bg-[#050314] text-white rounded-lg hover:bg-gray-800"
        >
          Crear nueva orden con este diseño
        </button>
      </div>
    </div>
  );
}
