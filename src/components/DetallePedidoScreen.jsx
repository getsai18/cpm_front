import { ChevronLeft, Trash2, Layers, Plus, Eye, ChevronRight, Upload, Lock, CheckCircle, ClipboardList } from 'lucide-react';
import AdjuntoItem from './AdjuntoItem';
import { displayStatus, statusBadgeCls, pedidoVencido } from '../utils/helpers';

function OrdenRow({ o, onVerDetalle }) {
  const totalPiezas = o.clothes.reduce((s, c) => s + (c.conf.tot || 0), 0);
  const stCls = statusBadgeCls(o.status);
  return (
    <div
      className="orden-row cursor-pointer hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors"
      onClick={() => onVerDetalle(o.id)}
      title="Ver detalle de la orden"
    >
      <span className="font-mono text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md whitespace-nowrap">ORDEN</span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-gray-900">{o.id}</div>
        <div className="text-xs text-gray-400 mt-0.5">{totalPiezas} piezas · {o.clothes.length} tipo{o.clothes.length !== 1 ? 's' : ''} de prenda</div>
      </div>
      {o.status && <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${stCls}`}>{displayStatus(o.status)}</span>}
      <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
    </div>
  );
}

function OrdenRowKit({ o, kitId, onVerDetalle, onQuitarOrden }) {
  const totalPiezas = o.clothes.reduce((s, c) => s + (c.conf.tot || 0), 0);
  const stCls = statusBadgeCls(o.status);
  return (
    <div
      className="orden-row bg-gray-50 cursor-pointer hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors"
      onClick={() => onVerDetalle(o.id)}
      title="Ver detalle de la orden"
    >
      <span className="font-mono text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md whitespace-nowrap">ORDEN</span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-gray-900">{o.id}</div>
        <div className="text-xs text-gray-400 mt-0.5">{totalPiezas} piezas · {o.clothes.length} tipo{o.clothes.length !== 1 ? 's' : ''} de prenda</div>
      </div>
      {o.status && <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${stCls}`}>{displayStatus(o.status)}</span>}
      <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
      <button
        onClick={e => { e.stopPropagation(); onQuitarOrden(o.id, kitId); }}
        className="px-2.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 ml-1"
      >
        Quitar
      </button>
    </div>
  );
}

function KitBlock({ k, pedidoActivo, puedoAgregar, onVerDetalle, onQuitarOrden, onAbrirOrdenesKit, onCrearOrdenKit, onEliminarKit }) {
  const ordenesDelKit = k.ordenIds.map(oid => pedidoActivo.ordenes.find(o => o.id === oid)).filter(Boolean);
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 mb-2">
      <div className="flex items-center gap-2.5 mb-2 flex-wrap">
        <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide">Kit</span>
        <span className="text-sm font-semibold text-gray-900">{k.nombre}</span>
        <span className="text-xs text-gray-400 ml-auto">{k.fecha} · {ordenesDelKit.length} orden{ordenesDelKit.length !== 1 ? 'es' : ''}</span>
        {ordenesDelKit.length === 0 && (
          <button
            onClick={() => onEliminarKit(k.id)}
            className="px-2 py-1 text-xs font-medium text-red-500 border border-red-200 rounded-lg hover:bg-red-50 ml-1"
          >
            <Trash2 className="w-3 h-3 inline" /> Eliminar kit
          </button>
        )}
        {puedoAgregar ? (
          <>
            <button onClick={() => onAbrirOrdenesKit(k.id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50 ml-2">
              + Agregar existente
            </button>
            <button onClick={() => onCrearOrdenKit(k.id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#050314] text-white rounded-lg hover:bg-gray-800">
              + Nueva orden
            </button>
          </>
        ) : (
          <span className="text-xs text-red-500 ml-2 flex items-center gap-1">🔒 Bloqueado</span>
        )}
      </div>
      <div className="kit-ordenes">
        {ordenesDelKit.length === 0
          ? <div className="text-xs text-gray-400 py-1">Sin órdenes asignadas</div>
          : ordenesDelKit.map(o => (
            <OrdenRowKit key={o.id} o={o} kitId={k.id} onVerDetalle={onVerDetalle} onQuitarOrden={onQuitarOrden} />
          ))
        }
      </div>
    </div>
  );
}

export default function DetallePedidoScreen({
  pedidoActivo, clienteActivo,
  onGoTo, onVerDetalleOrden,
  onIniciarNuevaOrden, onAbrirModalKit,
  onAbrirModalOrdenesKit, onCrearOrdenParaKit,
  onEliminarKit, onQuitarOrdenDeKit,
  onEliminarPedidoActivo, onConfirmarPedido,
  onGuardarFechaLimite,
  onHandleAdjuntosPedido, onQuitarAdjunto,
}) {
  if (!pedidoActivo || !clienteActivo) return null;

  const p = pedidoActivo;
  const vencido = pedidoVencido(p);
  const esCerrado = p.status === 'Cerrado' || p.status === 'Entregado';
  const puedoAgregar = !vencido && !esCerrado;
  const vacio = p.ordenes.length === 0 && p.kits.length === 0;
  const stCls = statusBadgeCls(p.status);

  const ordenesEnKit = new Set(p.kits.flatMap(k => k.ordenIds));
  const ordenesSueltas = p.ordenes.filter(o => !ordenesEnKit.has(o.id));

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{p.id}</h1>
          <p className="text-sm text-gray-500 mt-1">{p.fecha} · {clienteActivo.nombre}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onGoTo('pedidos')}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Pedidos
          </button>
          {vacio && !p.confirmado && (
            <button
              onClick={onEliminarPedidoActivo}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Eliminar
            </button>
          )}
          {puedoAgregar && (
            <button
              onClick={onAbrirModalKit}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Layers className="w-4 h-4" /> Agregar kit
            </button>
          )}
          {puedoAgregar && (
            <button
              onClick={onIniciarNuevaOrden}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#050314] text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Plus className="w-4 h-4" /> Agregar orden
            </button>
          )}
        </div>
      </div>

      {/* Vencido / Cerrado Banner */}
      {esCerrado ? (
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-600 mb-4">
          <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div className="text-xs leading-relaxed"><strong className="font-semibold block">Pedido cerrado</strong>Este pedido está cerrado y no admite más órdenes ni kits.</div>
        </div>
      ) : vencido ? (
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 mb-4">
          <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div className="text-xs leading-relaxed"><strong className="font-semibold block">Fecha límite vencida</strong>No se pueden agregar más órdenes ni kits a este pedido.</div>
        </div>
      ) : null}

      {/* Detalle grid */}
      <div className="detalle-grid">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1.5">Pedido</div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-base font-bold text-gray-900">{p.id}</span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${stCls}`}>{displayStatus(p.status)}</span>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1.5">Fecha de creación</div>
          <div className="text-base font-semibold text-gray-900">{p.fecha}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1.5">Fecha límite</div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              defaultValue={p.fechaLimite || ''}
              key={p.fechaLimite || 'empty'}
              onChange={e => onGuardarFechaLimite(e.target.value)}
              disabled={esCerrado}
              className="flex-1 text-sm px-3 py-1.5 bg-white border border-gray-200 rounded-lg outline-none focus:border-gray-400 text-gray-900 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
            />
            {esCerrado
              ? <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-500">Bloqueada</span>
              : vencido
              ? <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-50 text-red-700">Vencida</span>
              : p.fechaLimite
              ? <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-green-50 text-green-700">Vigente</span>
              : null
            }
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1.5">Cliente / Órdenes</div>
          <div className="text-sm font-semibold text-gray-900">{clienteActivo.nombre}</div>
          <div className="text-xs text-gray-400 mt-0.5">{p.ordenes.length} orden{p.ordenes.length !== 1 ? 'es' : ''} · {p.kits.length} kit{p.kits.length !== 1 ? 's' : ''}</div>
        </div>
      </div>

      {/* Confirmar pedido */}
      <div className="flex justify-end mb-4">
        {!p.confirmado ? (
          <button
            onClick={onConfirmarPedido}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4" /> Confirmar pedido
          </button>
        ) : (
          <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-green-50 text-green-700 rounded-lg border border-green-200">
            <CheckCircle className="w-4 h-4" /> Pedido confirmado · En producción
          </span>
        )}
      </div>

      {/* Adjuntos */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Archivos adjuntos</div>
        <div className="adjuntos-layout">
          <div>
            <div
              className="border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
              onClick={() => document.getElementById('dp-adj-input').click()}
            >
              <Upload className="w-7 h-7 text-gray-400 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-500">Agregar imágenes</div>
              <div className="text-xs text-gray-400 mt-1">PNG, JPG, PDF, DOCX, TXT…</div>
            </div>
            <input
              type="file"
              id="dp-adj-input"
              multiple
              accept="image/*,.pdf,.txt,.doc,.docx"
              className="hidden"
              onChange={onHandleAdjuntosPedido}
            />
          </div>
          <div>
            {p.adjuntos.length === 0 ? (
              <div className="text-sm text-gray-400">Sin archivos adjuntos</div>
            ) : (
              <div className="adjunto-grid">
                {p.adjuntos.map((a, i) => (
                  <AdjuntoItem key={a.id || i} adjunto={a} index={i} scope="pedido" onQuitar={onQuitarAdjunto} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Órdenes sueltas */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">Órdenes</div>
          {puedoAgregar
            ? <button onClick={onIniciarNuevaOrden} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#050314] text-white rounded-lg hover:bg-gray-800">
                <Plus className="w-3.5 h-3.5" /> Nueva orden
              </button>
            : <span className="text-xs text-red-500 flex items-center gap-1">🔒 No se pueden agregar órdenes</span>
          }
        </div>
        {ordenesSueltas.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <ClipboardList className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <div className="text-sm">Sin órdenes todavía</div>
          </div>
        ) : ordenesSueltas.map(o => (
          <OrdenRow key={o.id} o={o} onVerDetalle={onVerDetalleOrden} />
        ))}
      </div>

      {/* Kits */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">Kits</div>
          {puedoAgregar
            ? <button onClick={onAbrirModalKit} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                <Layers className="w-3.5 h-3.5" /> Nuevo kit
              </button>
            : <span className="text-xs text-red-500 flex items-center gap-1">🔒 No se pueden agregar kits</span>
          }
        </div>
        {p.kits.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Layers className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <div className="text-sm">Sin kits todavía</div>
          </div>
        ) : p.kits.map(k => (
          <KitBlock
            key={k.id}
            k={k}
            pedidoActivo={p}
            puedoAgregar={puedoAgregar}
            onVerDetalle={onVerDetalleOrden}
            onQuitarOrden={onQuitarOrdenDeKit}
            onAbrirOrdenesKit={onAbrirModalOrdenesKit}
            onCrearOrdenKit={onCrearOrdenParaKit}
            onEliminarKit={onEliminarKit}
          />
        ))}
      </div>
    </div>
  );
}
