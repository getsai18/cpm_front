import { X } from 'lucide-react';
import AdjuntoItem from '../AdjuntoItem';
import { esc, displayStatus, statusBadgeCls } from '../../utils/helpers';

export default function OrdenDetalleModal({ visible, ordenId, pedidoActivo, onClose, onQuitarAdjunto }) {
  if (!visible || !ordenId || !pedidoActivo) return null;

  const o = pedidoActivo.ordenes.find(ord => ord.id === ordenId);
  if (!o) return null;

  const stCls = statusBadgeCls(o.status);

  const campos = [
    ['Estado', o.status ? <span key="st" className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${stCls}`}>{displayStatus(o.status)}</span> : null],
    ['Tipo de diseño', o.tipoDiseno || null],
    ['Disciplina', o.disciplina || null],
    ['Categoría', o.categoria || null],
    ['Tipo de solicitud', o.tipoSolicitud || null],
    ['Observaciones', o.observaciones || null],
  ].filter(([, v]) => v);

  const grupos = { hombre: [], mujer: [], niño: [] };
  (o.clothes || []).forEach(c => { if (grupos[c.conf.type]) grupos[c.conf.type].push(c); });
  const totalPiezas = (o.clothes || []).reduce((s, c) => s + (c.conf.tot || 0), 0);

  const areas = o.config?.areas || [];
  const adjuntos = pedidoActivo?.adjuntos || [];

  return (
    <div
      className="modal-overlay visible"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-box bg-white border border-gray-200 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <div className="text-base font-bold text-gray-900">{o.id}</div>
            <div className="code-box mt-1.5 text-xs py-1.5 px-3" style={{display:'inline-block'}}>{o.code || '—'}</div>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg ml-4 flex-shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Info general */}
          <div className="mb-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Información general</div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              {campos.map(([k, v]) => (
                <div key={k}>
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-0.5">{k}</div>
                  <div className="text-sm font-medium text-gray-900">{v}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 mb-5"></div>

          {/* Prendas */}
          <div className="mb-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
              Prendas y cantidades
              {totalPiezas > 0 && <span className="ml-2 font-bold text-green-600">{totalPiezas} piezas</span>}
            </div>
            {Object.entries({ Hombre: 'hombre', Mujer: 'mujer', Niño: 'niño' }).map(([label, key]) => {
              const items = grupos[key];
              if (!items.length) return null;
              return (
                <div key={key}>
                  <div className="cloth-group-title">{label}</div>
                  <div className="cloth-resumen-grid">
                    {items.map(c => (
                      <div key={c.id} className="cloth-resumen-card">
                        <div className="cloth-resumen-qty">{c.conf.tot}</div>
                        <div className="cloth-resumen-detail">
                          <div className="cloth-resumen-name">{c.name}</div>
                          <div className="cloth-resumen-talla">Talla {c.conf.size}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {!o.clothes?.length && <div className="text-sm text-gray-400">Sin prendas registradas</div>}
          </div>

          <div className="border-t border-gray-100 mb-5"></div>

          {/* Áreas */}
          <div className="mb-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Áreas y actividades</div>
            {areas.length === 0 ? (
              <div className="text-sm text-gray-400">Sin áreas configuradas</div>
            ) : areas.map((a, ai) => (
              <div key={ai} className="mb-4">
                <div className="text-xs font-semibold text-gray-700 mb-2 pb-1.5 border-b border-gray-100">{a.area}</div>
                {(a.actividades || []).length === 0
                  ? <div className="text-xs text-gray-400">Sin actividades</div>
                  : (a.actividades || []).map((act, li) => (
                    <div key={li} className="text-xs mb-1.5">
                      <span className="text-gray-500 font-medium">{act.actividad}: </span>
                      {(act.tags || []).length > 0
                        ? (act.tags || []).map((t, ti) => (
                          <span key={ti} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 mr-1">{t.opcion}</span>
                        ))
                        : <span className="text-gray-300">Sin opciones</span>
                      }
                    </div>
                  ))
                }
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 mb-5"></div>

          {/* Adjuntos */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Archivos adjuntos</div>
            {adjuntos.length === 0 ? (
              <div className="text-sm text-gray-400">Sin archivos adjuntos</div>
            ) : (
              <div className="adjunto-grid">
                {adjuntos.map((a, i) => (
                  <AdjuntoItem key={a.id || i} adjunto={a} index={i} scope="pedido-readonly" onQuitar={onQuitarAdjunto} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end px-6 py-3 border-t border-gray-100 flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50">Cerrar</button>
        </div>
      </div>
    </div>
  );
}
