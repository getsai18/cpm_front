import { RotateCcw } from 'lucide-react';

export default function Topbar({ screen, clienteActivo, pedidoActivo, onGoTo, onRestablecerDatos }) {
  function Breadcrumb() {
    const cl = clienteActivo;
    const ped = pedidoActivo;

    if (screen === 'clientes') {
      return <span className="bc-current">Clientes</span>;
    }
    if (screen === 'pedidos') {
      return (
        <>
          <span className="bc-item" onClick={() => onGoTo('clientes')}>Clientes</span>
          <span className="bc-sep mx-1">›</span>
          <span className="bc-current">{cl?.nombre || ''}</span>
        </>
      );
    }
    if (screen === 'detalle-pedido') {
      return (
        <>
          <span className="bc-item" onClick={() => onGoTo('clientes')}>Clientes</span>
          <span className="bc-sep mx-1">›</span>
          <span className="bc-item" onClick={() => onGoTo('pedidos')}>{cl?.nombre || ''}</span>
          <span className="bc-sep mx-1">›</span>
          <span className="bc-current">{ped?.id || 'Pedido'}</span>
        </>
      );
    }
    if (screen === 'reutilizar') {
      return (
        <>
          <span className="bc-item" onClick={() => onGoTo('clientes')}>Clientes</span>
          <span className="bc-sep mx-1">›</span>
          <span className="bc-item" onClick={() => onGoTo('pedidos')}>{cl?.nombre || ''}</span>
          <span className="bc-sep mx-1">›</span>
          <span className="bc-current">Reutilizar</span>
        </>
      );
    }
    if (screen === 'nueva-orden') {
      return (
        <>
          <span className="bc-item" onClick={() => onGoTo('clientes')}>Clientes</span>
          <span className="bc-sep mx-1">›</span>
          <span className="bc-item" onClick={() => onGoTo('pedidos')}>{cl?.nombre || ''}</span>
          <span className="bc-sep mx-1">›</span>
          <span className="bc-item" onClick={() => onGoTo('detalle-pedido')}>{ped?.id || 'Pedido'}</span>
          <span className="bc-sep mx-1">›</span>
          <span className="bc-current">Nueva orden</span>
        </>
      );
    }
    return <span className="bc-current">{screen}</span>;
  }

  return (
    <div className="flex items-center gap-4 px-6 h-14 bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="font-bold text-sm tracking-tight text-gray-900 flex items-center gap-2">
        CPManager
        <span className="bg-[#050314] text-white text-xs font-semibold px-2 py-0.5 rounded">BETA</span>
      </div>
      <div className="w-px h-5 bg-gray-200"></div>
      <div className="breadcrumb flex items-center gap-1.5 text-sm">
        <Breadcrumb />
      </div>
      <div className="ml-auto flex items-center gap-3">
        <button
          onClick={onRestablecerDatos}
          title="Restablecer datos iniciales"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Restablecer
        </button>
        <div className="w-8 h-8 rounded-full bg-[#050314] flex items-center justify-center text-white text-xs font-semibold">RG</div>
      </div>
    </div>
  );
}
