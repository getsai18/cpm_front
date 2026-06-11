import { ChevronLeft, Plus, Eye } from 'lucide-react';
import { displayStatus, statusBadgeCls } from '../utils/helpers';

export default function PedidosScreen({ clienteActivo, onGoTo, onCrearPedidoNuevo, onVerDetallePedido, onReutilizarDiseno }) {
  if (!clienteActivo) return null;
  const pedidos = clienteActivo.pedidos;

  return (
    <div>
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{clienteActivo.nombre}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {clienteActivo.totalPedidos} pedido{clienteActivo.totalPedidos !== 1 ? 's' : ''} · Tel: {clienteActivo.telefono}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onGoTo('clientes')}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Clientes
          </button>
          <button
            onClick={onCrearPedidoNuevo}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#050314] text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4" /> Nuevo pedido
          </button>
        </div>
      </div>

      {pedidos.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">📦</div>
          <div className="text-sm">No hay pedidos registrados</div>
        </div>
      ) : (
        pedidos.map(p => {
          const totalOrd = p.ordenes.length;
          const totalKits = p.kits.length;
          const stCls = statusBadgeCls(p.status);
          return (
            <div key={p.id} className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center gap-4 mb-2.5 hover:border-gray-300 transition-colors pedido-card">
              <div className="font-mono text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg whitespace-nowrap">{p.id}</div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-900">{p.fecha}</div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {totalOrd} orden{totalOrd !== 1 ? 'es' : ''}
                  {totalKits > 0 ? ` · ${totalKits} kit${totalKits !== 1 ? 's' : ''}` : ''}
                </div>
              </div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${stCls}`}>
                {displayStatus(p.status)}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => onVerDetallePedido(p.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" /> Ver detalle
                </button>
                {totalOrd > 0 && (
                  <button
                    onClick={() => onReutilizarDiseno(p.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    ♻ Reutilizar
                  </button>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
