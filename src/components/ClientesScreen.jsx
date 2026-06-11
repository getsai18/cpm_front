import { useState } from 'react';
import { Search, Eye, Plus } from 'lucide-react';

export default function ClientesScreen({ clientes, onVerPedidos, onCrearPedidoDesdeCliente }) {
  const [filtro, setFiltro] = useState('');

  const filtrados = clientes.filter(c =>
    c.nombre.toLowerCase().includes(filtro.toLowerCase()) || c.telefono.includes(filtro)
  );

  return (
    <div style={{overflow: 'auto'}}>
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
          <p className="text-sm text-gray-500 mt-1">Selecciona un cliente para ver sus pedidos</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar cliente…"
              value={filtro}
              onChange={e => setFiltro(e.target.value)}
              className="pl-9 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:border-gray-400 w-64"
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Cliente</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Teléfono</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Último pedido</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Pedidos</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className="text-center py-16 text-gray-400">
                    <div className="text-4xl mb-3">🔍</div>
                    <div className="text-sm">No se encontraron clientes</div>
                  </div>
                </td>
              </tr>
            ) : filtrados.map(c => (
              <tr key={c.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-semibold text-gray-900 text-sm">{c.nombre}</td>
                <td className="px-4 py-3 text-gray-500 text-sm">{c.telefono}</td>
                <td className="px-4 py-3 text-gray-500 text-sm">{c.ultimoPedido}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700">
                    {c.totalPedidos} pedido{c.totalPedidos !== 1 ? 's' : ''}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onVerPedidos(c.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> Ver pedidos
                    </button>
                    <button
                      onClick={() => onCrearPedidoDesdeCliente(c.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#050314] text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Pedido
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
