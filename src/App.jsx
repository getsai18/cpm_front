import { useState, useRef } from 'react';
import Topbar from './components/Topbar';
import ClientesScreen from './components/ClientesScreen';
import PedidosScreen from './components/PedidosScreen';
import DetallePedidoScreen from './components/DetallePedidoScreen';
import ReutilizarScreen from './components/ReutilizarScreen';
import NuevaOrdenScreen from './components/NuevaOrdenScreen';
import ConfirmModal from './components/modals/ConfirmModal';
import OrdenDetalleModal from './components/modals/OrdenDetalleModal';
import ActividadesModal from './components/modals/ActividadesModal';
import KitModal from './components/modals/KitModal';
import KitOrdenesModal from './components/modals/KitOrdenesModal';
import {
  getMockClientesInitial, guardarLS, cargarLS,
  areasConfig, getCatalogoActividad,
  LS_KEY, LS_KEY_OIDS,
} from './data/catalogos';
import { pedidoVencido, tipoSolicitudLimpio, generarCodigo } from './utils/helpers';

function initClientes() {
  const stored = cargarLS();
  return stored ? stored.clientes : getMockClientesInitial();
}
function initCounters() {
  const stored = cargarLS();
  return stored?.counters || { ordenIdCounter: 10, pedidoIdCounter: 60 };
}

export default function App() {
  // ─── Data ───────────────────────────────────────────────
  const [clientes, setClientes] = useState(() => initClientes());
  const countersRef = useRef(initCounters());

  // ─── Navigation ─────────────────────────────────────────
  const [screen, setScreen] = useState('clientes');
  const [clienteActivoId, setClienteActivoId] = useState(null);
  const [pedidoActivoId, setPedidoActivoId] = useState(null);

  const clienteActivo = clientes.find(c => c.id === clienteActivoId) || null;
  const pedidoActivo = clienteActivo?.pedidos.find(p => p.id === pedidoActivoId) || null;

  // ─── Nueva Orden form state ──────────────────────────────
  const [esReutilizado, setEsReutilizado] = useState(false);
  const [snapshotOriginal, setSnapshotOriginal] = useState(null);
  const [tipoDiseno, setTipoDiseno] = useState('Nuevo');
  const [prendasSeleccionadas, setPrendasSeleccionadas] = useState(['Playera']);
  const [clothesData, setClothesData] = useState([]);
  const [adjuntosData, setAdjuntosData] = useState([]);
  const [areasActivas, setAreasActivas] = useState(null);
  const [substepActual, setSubstepActual] = useState(1);
  const [maxSubstep, setMaxSubstep] = useState(1);
  const [generoSeleccionado, setGeneroSeleccionado] = useState('');
  const [kitDestino, setKitDestino] = useState(null);
  const [disciplina, setDisciplina] = useState('');
  const [categoria, setCategoria] = useState('');
  const [tipoSolicitud, setTipoSolicitud] = useState('');
  const [observaciones, setObservaciones] = useState('');

  // ─── Modals ─────────────────────────────────────────────
  const [confirmModal, setConfirmModal] = useState(null);
  const [ordenDetalleOrdenId, setOrdenDetalleOrdenId] = useState(null);
  const [actividadesModalAreaIdx, setActividadesModalAreaIdx] = useState(null);
  const [kitOrdenesModalKitId, setKitOrdenesModalKitId] = useState(null);
  const [kitModalVisible, setKitModalVisible] = useState(false);

  // ─── Helpers ────────────────────────────────────────────
  function gs() {
    return guardarLS(clientes, countersRef.current);
  }
  function guardar(newClientes) {
    guardarLS(newClientes, countersRef.current);
  }

  function showConfirm({ title, body, confirmLabel, confirmCls, icon, iconCls, onConfirm, hideCancelBtn }) {
    setConfirmModal({ title, body, confirmLabel, confirmCls, icon, iconCls, onConfirm, hideCancelBtn });
  }
  function showAlert(title, body, icon = 'alert-circle') {
    showConfirm({
      title,
      body,
      confirmLabel: 'Entendido',
      confirmCls: 'bg-[#050314] hover:bg-gray-800 text-white',
      icon,
      iconCls: 'bg-gray-100',
      hideCancelBtn: true,
      onConfirm: () => {},
    });
  }

  function updateCliente(clienteId, updater) {
    setClientes(prev => {
      const next = prev.map(c => c.id === clienteId ? updater(c) : c);
      guardarLS(next, countersRef.current);
      return next;
    });
  }
  function updatePedido(clienteId, pedidoId, updater) {
    updateCliente(clienteId, c => ({
      ...c,
      pedidos: c.pedidos.map(p => p.id === pedidoId ? updater(p) : p),
    }));
  }

  // ─── Navigation ─────────────────────────────────────────
  function goTo(screenName) {
    setScreen(screenName);
    window.scrollTo(0, 0);
  }

  // ─── SCREEN: CLIENTES ───────────────────────────────────
  function verPedidos(clienteId) {
    setClienteActivoId(clienteId);
    goTo('pedidos');
  }
  function crearPedidoDesdeCliente(clienteId) {
    setClienteActivoId(clienteId);
    crearPedidoNuevo(clienteId);
  }

  // ─── SCREEN: PEDIDOS ────────────────────────────────────
  function crearPedidoNuevo(forClienteId) {
    const cid = forClienteId || clienteActivoId;
    const cl = clientes.find(c => c.id === cid);
    showConfirm({
      title: 'Crear nuevo pedido',
      body: `Se creará un pedido vacío para ${cl?.nombre || 'el cliente'}. Podrás agregar órdenes y kits después.`,
      confirmLabel: 'Crear pedido',
      confirmCls: 'bg-[#050314] hover:bg-gray-800 text-white',
      icon: 'package',
      iconCls: 'bg-gray-100',
      onConfirm: () => _ejecutarCrearPedido(cid),
    });
  }
  function _ejecutarCrearPedido(cid) {
    countersRef.current.pedidoIdCounter++;
    const hoy = new Date();
    const fStr = hoy.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
    const idStr = `PED-${hoy.getFullYear()}-${String(countersRef.current.pedidoIdCounter).padStart(3, '0')}`;
    const nuevoPedido = { id: idStr, fecha: fStr, fechaLimite: '', status: 'Borrador', confirmado: false, adjuntos: [], kits: [], ordenes: [] };
    setClientes(prev => {
      const next = prev.map(c => {
        if (c.id !== cid) return c;
        return {
          ...c,
          pedidos: [nuevoPedido, ...c.pedidos],
          totalPedidos: c.totalPedidos + 1,
          ultimoPedido: fStr,
        };
      });
      guardarLS(next, countersRef.current);
      return next;
    });
    setClienteActivoId(cid);
    setPedidoActivoId(idStr);
    goTo('detalle-pedido');
  }

  // ─── SCREEN: DETALLE PEDIDO ─────────────────────────────
  function verDetallePedido(pedidoId) {
    setPedidoActivoId(pedidoId);
    goTo('detalle-pedido');
  }
  function guardarFechaLimite(val) {
    updatePedido(clienteActivoId, pedidoActivoId, p => ({ ...p, fechaLimite: val }));
  }
  function confirmarPedido() {
    if (!pedidoActivo?.ordenes.length) {
      showAlert('Pedido vacío', 'El pedido debe tener al menos una orden antes de confirmarse.', 'alert-circle');
      return;
    }
    showConfirm({
      title: 'Confirmar pedido',
      body: 'Al confirmar, el pedido pasará a estado Producción. Aún podrás agregar órdenes y kits mientras la fecha límite esté vigente.',
      confirmLabel: 'Confirmar pedido',
      confirmCls: 'bg-green-600 hover:bg-green-700 text-white',
      icon: 'check-circle',
      iconCls: 'bg-green-100',
      onConfirm: () => {
        updatePedido(clienteActivoId, pedidoActivoId, p => ({ ...p, confirmado: true, status: 'Producción' }));
      },
    });
  }
  function eliminarPedidoActivo() {
    const p = pedidoActivo;
    if (!p) return;
    if (p.ordenes.length > 0 || p.kits.length > 0) return;
    showConfirm({
      title: 'Eliminar pedido',
      body: `¿Eliminar el pedido ${p.id}? Esta acción no se puede deshacer.`,
      confirmLabel: 'Eliminar',
      confirmCls: 'bg-red-600 hover:bg-red-700 text-white',
      icon: 'trash-2',
      iconCls: 'bg-red-100',
      onConfirm: () => {
        updateCliente(clienteActivoId, c => ({
          ...c,
          pedidos: c.pedidos.filter(ped => ped.id !== pedidoActivoId),
          totalPedidos: Math.max(0, c.totalPedidos - 1),
        }));
        setPedidoActivoId(null);
        goTo('pedidos');
      },
    });
  }

  // ─── ADJUNTOS PEDIDO ────────────────────────────────────
  function handleAdjuntosPedido(event) {
    const files = Array.from(event.target.files);
    if (!files.length) return;
    let pending = files.length;
    const nuevos = [];
    files.forEach(f => {
      const reader = new FileReader();
      reader.onload = e => {
        nuevos.push({ id: 'ADJ-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6), nombre: f.name, type: f.type, size: f.size, dataUrl: e.target.result });
        pending--;
        if (pending === 0) {
          updatePedido(clienteActivoId, pedidoActivoId, p => ({
            ...p, adjuntos: [...p.adjuntos, ...nuevos],
          }));
        }
      };
      reader.readAsDataURL(f);
    });
    event.target.value = '';
  }
  function quitarAdjunto(idx, scope) {
    if (scope === 'pedido') {
      updatePedido(clienteActivoId, pedidoActivoId, p => ({
        ...p, adjuntos: p.adjuntos.filter((_, i) => i !== idx),
      }));
    } else if (scope === 'orden') {
      setAdjuntosData(prev => prev.filter((_, i) => i !== idx));
    } else {
      setAdjuntosData(prev => prev.filter((_, i) => i !== idx));
    }
  }

  // ─── KITS ───────────────────────────────────────────────
  function abrirModalKit() {
    const p = pedidoActivo;
    if (p && (pedidoVencido(p) || p.status === 'Cerrado' || p.status === 'Entregado')) {
      showAlert('Pedido bloqueado', 'El pedido está cerrado o su fecha límite venció. No se pueden agregar más kits.', 'lock');
      return;
    }
    setKitModalVisible(true);
  }
  function confirmarNuevoKit(nombre) {
    setKitModalVisible(false);
    showConfirm({
      title: 'Crear kit',
      body: `Se creará el kit "${nombre}" en este pedido.`,
      confirmLabel: 'Crear kit',
      confirmCls: 'bg-[#050314] hover:bg-gray-800 text-white',
      icon: 'layers',
      iconCls: 'bg-purple-100',
      onConfirm: () => {
        const hoy = new Date();
        const fStr = hoy.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
        updatePedido(clienteActivoId, pedidoActivoId, p => ({
          ...p, kits: [...p.kits, { id: 'KIT-' + Date.now(), nombre, fecha: fStr, ordenIds: [] }],
        }));
      },
    });
  }
  function eliminarKit(kitId) {
    const p = pedidoActivo;
    const kit = p?.kits.find(k => k.id === kitId);
    if (!kit) return;
    if (kit.ordenIds.length > 0) {
      showAlert('Kit con órdenes', 'Solo se pueden eliminar kits vacíos.', 'alert-circle');
      return;
    }
    showConfirm({
      title: 'Eliminar kit',
      body: `¿Eliminar el kit "${kit.nombre}"? Esta acción no se puede deshacer.`,
      confirmLabel: 'Eliminar',
      confirmCls: 'bg-red-600 hover:bg-red-700 text-white',
      icon: 'trash-2',
      iconCls: 'bg-red-100',
      onConfirm: () => {
        updatePedido(clienteActivoId, pedidoActivoId, p => ({
          ...p, kits: p.kits.filter(k => k.id !== kitId),
        }));
      },
    });
  }
  function quitarOrdenDeKit(ordenId, kitId) {
    const p = pedidoActivo;
    const kit = p?.kits.find(k => k.id === kitId);
    if (!kit) return;
    showConfirm({
      title: 'Quitar orden del kit',
      body: `¿Quitar la orden ${ordenId} del kit "${kit.nombre}"? La orden seguirá existiendo en el pedido.`,
      confirmLabel: 'Quitar del kit',
      confirmCls: 'bg-red-600 hover:bg-red-700 text-white',
      icon: 'minus-circle',
      iconCls: 'bg-red-100',
      onConfirm: () => {
        updatePedido(clienteActivoId, pedidoActivoId, p => ({
          ...p,
          kits: p.kits.map(k => k.id === kitId ? { ...k, ordenIds: k.ordenIds.filter(id => id !== ordenId) } : k),
        }));
      },
    });
  }
  function abrirModalOrdenesKit(kitId) {
    setKitOrdenesModalKitId(kitId);
  }
  function confirmarAgregarOrdenesKit(kitId, selectedOrdenIds) {
    const p = pedidoActivo;
    if (p && (pedidoVencido(p) || p.status === 'Cerrado' || p.status === 'Entregado')) {
      setKitOrdenesModalKitId(null);
      showAlert('Pedido bloqueado', 'El pedido está cerrado o su fecha límite venció.', 'lock');
      return;
    }
    updatePedido(clienteActivoId, pedidoActivoId, p => ({
      ...p,
      kits: p.kits.map(k => {
        if (k.id !== kitId) return k;
        const newIds = [...k.ordenIds];
        selectedOrdenIds.forEach(id => { if (!newIds.includes(id)) newIds.push(id); });
        return { ...k, ordenIds: newIds };
      }),
    }));
    setKitOrdenesModalKitId(null);
  }

  // ─── NUEVA ORDEN ────────────────────────────────────────
  function iniciarNuevaOrden() {
    const p = pedidoActivo;
    if (p && (pedidoVencido(p) || p.status === 'Cerrado' || p.status === 'Entregado')) {
      showAlert('Pedido bloqueado', 'El pedido está cerrado o su fecha límite venció.');
      return;
    }
    setKitDestino(null);
    initNuevaOrden(false);
    goTo('nueva-orden');
  }
  function crearOrdenParaKit(kitId) {
    const p = pedidoActivo;
    if (p && (pedidoVencido(p) || p.status === 'Cerrado' || p.status === 'Entregado')) {
      showAlert('Pedido bloqueado', 'El pedido está cerrado o su fecha límite venció.');
      return;
    }
    setKitDestino(kitId);
    initNuevaOrden(false);
    goTo('nueva-orden');
  }
  function initNuevaOrden(reutilizar) {
    if (!pedidoActivo && !pedidoActivoId) return;
    const p = clientes.find(c => c.id === clienteActivoId)?.pedidos.find(p => p.id === pedidoActivoId);
    if (!p) return;
    const orden = reutilizar ? p?.ordenes[0] : null;

    const newPrendas = reutilizar
      ? (orden?.clothes?.map(c => c.name).filter((v, i, a) => a.indexOf(v) === i) || ['Playera'])
      : ['Playera'];
    setPrendasSeleccionadas(newPrendas);
    setClothesData([]);
    setAdjuntosData(p ? [...(p.adjuntos || [])] : []);

    if (reutilizar && orden?.config?.areas?.length) {
      setAreasActivas(areasConfig.map(a => {
        const savedArea = orden.config.areas.find(sa => sa.area === a.nombre);
        if (savedArea) {
          const actividades = savedArea.actividades.map(sa => {
            const def = getCatalogoActividad(sa.actividad);
            if (!def) return null;
            return { ...JSON.parse(JSON.stringify(def)), selectedOptions: sa.tags?.map(t => t.opcion) || [] };
          }).filter(Boolean);
          return { ...a, activa: true, actividades };
        }
        return { ...a, activa: false, actividades: [] };
      }));
    } else {
      setAreasActivas(areasConfig.map(a => ({ ...a, activa: false, actividades: [] })));
    }

    setEsReutilizado(reutilizar);
    setTipoDiseno(reutilizar ? 'Pasado' : 'Nuevo');
    setSnapshotOriginal(reutilizar ? { disciplina: '', prendas: newPrendas.slice().sort().join(',') } : null);
    setSubstepActual(1);
    setMaxSubstep(1);
    setGeneroSeleccionado('');
    setDisciplina('');
    setCategoria('');
    setTipoSolicitud('');
    setObservaciones('');
  }

  function goSubstep(n) {
    const newMax = Math.max(maxSubstep, n);
    setMaxSubstep(newMax);
    setSubstepActual(n);
    window.scrollTo(0, 0);
  }
  function goSubstepNav(n) {
    if (n > maxSubstep) return;
    goSubstep(n);
  }

  function salirNuevaOrden() {
    const tieneDatos = clothesData.length > 0
      || (areasActivas && areasActivas.some(a => a.activa))
      || disciplina.trim();
    if (tieneDatos) {
      showConfirm({
        title: 'Descartar cambios',
        body: 'Tienes información capturada. ¿Salir y descartar los cambios?',
        confirmLabel: 'Salir y descartar',
        confirmCls: 'bg-red-600 hover:bg-red-700 text-white',
        icon: 'alert-triangle',
        iconCls: 'bg-yellow-100',
        onConfirm: () => { setKitDestino(null); goTo('detalle-pedido'); },
      });
    } else {
      setKitDestino(null);
      goTo('detalle-pedido');
    }
  }

  function confirmarOrden() {
    const p = pedidoActivo;
    if (p && pedidoVencido(p)) {
      showAlert('Pedido vencido', 'La fecha límite de este pedido ya venció. No se puede confirmar la orden.', 'lock');
      return;
    }
    if (!clothesData.length) {
      showAlert('Sin prendas', 'Debes agregar al menos una prenda antes de confirmar la orden.', 'shirt');
      return;
    }
    const faltantes = [];
    if (!disciplina.trim()) faltantes.push('Disciplina');
    if (!categoria) faltantes.push('Categoría');
    if (!tipoSolicitud.trim()) faltantes.push('Tipo de solicitud');
    if (faltantes.length) {
      showAlert('Información incompleta', `Completa los campos obligatorios: ${faltantes.join(', ')}.`, 'alert-circle');
      return;
    }
    showConfirm({
      title: 'Confirmar orden',
      body: `La orden quedará como pendiente en el pedido ${pedidoActivo?.id}. Verifica el resumen antes de continuar.`,
      confirmLabel: 'Confirmar orden',
      confirmCls: 'bg-[#050314] hover:bg-gray-800 text-white',
      icon: 'check-circle',
      iconCls: 'bg-gray-100',
      onConfirm: _ejecutarConfirmarOrden,
    });
  }
  function _ejecutarConfirmarOrden() {
    const code = generarCodigo(disciplina, tipoSolicitud, pedidoActivo?.id);
    countersRef.current.ordenIdCounter++;
    const tipoSol = tipoSolicitudLimpio(tipoSolicitud);
    const p = pedidoActivo;
    const maxOrdNum = p.ordenes.reduce((mx, o) => {
      const m = o.id.match(/-(\d+)$/);
      return m ? Math.max(mx, parseInt(m[1])) : mx;
    }, 0);
    const nuevaOrden = {
      id: `ORD-${p.id.replace('PED-', '')}-${String(maxOrdNum + 1).padStart(3, '0')}`,
      code,
      status: 'Pendiente',
      disciplina,
      categoria,
      tipoSolicitud: tipoSol,
      tipoDiseno,
      observaciones,
      config: {
        areas: (areasActivas || []).filter(a => a.activa).map(a => ({
          area: a.nombre,
          actividades: a.actividades.map(act => ({
            actividad: act.nombre,
            tags: (act.selectedOptions || []).map(op => ({ opcion: op })),
          })),
        })),
      },
      clothes: JSON.parse(JSON.stringify(clothesData)),
    };
    const currentKitDestino = kitDestino;
    updatePedido(clienteActivoId, pedidoActivoId, ped => {
      const newOrdenes = [...ped.ordenes, nuevaOrden];
      let newKits = ped.kits;
      if (currentKitDestino) {
        newKits = ped.kits.map(k =>
          k.id === currentKitDestino && !k.ordenIds.includes(nuevaOrden.id)
            ? { ...k, ordenIds: [...k.ordenIds, nuevaOrden.id] }
            : k
        );
      }
      return { ...ped, ordenes: newOrdenes, kits: newKits };
    });
    setKitDestino(null);
    goTo('detalle-pedido');
  }

  // ─── REUTILIZAR ─────────────────────────────────────────
  function reutilizarDiseno(pedidoId) {
    setPedidoActivoId(pedidoId);
    goTo('reutilizar');
  }
  function confirmarReutilizar() {
    initNuevaOrden(true);
    goTo('nueva-orden');
  }

  // ─── ADJUNTOS ORDEN ─────────────────────────────────────
  function handleAdjuntos(event) {
    const files = Array.from(event.target.files);
    if (!files.length) return;
    let pending = files.length;
    files.forEach(f => {
      const reader = new FileReader();
      reader.onload = e => {
        const obj = {
          id: 'ADJ-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
          nombre: f.name,
          type: f.type,
          size: f.size,
          dataUrl: e.target.result,
        };
        setAdjuntosData(prev => [...prev, obj]);
        updatePedido(clienteActivoId, pedidoActivoId, p => {
          if (p.adjuntos.find(a => a.id === obj.id)) return p;
          return { ...p, adjuntos: [...p.adjuntos, obj] };
        });
        pending--;
      };
      reader.readAsDataURL(f);
    });
    event.target.value = '';
  }

  // ─── VER DETALLE ORDEN (modal) ───────────────────────────
  function verDetalleOrden(ordenId) {
    setOrdenDetalleOrdenId(ordenId);
  }

  // ─── RESTABLECER ────────────────────────────────────────
  function restablecerDatos() {
    showConfirm({
      title: 'Restablecer datos',
      body: 'Se borrarán todos los cambios guardados y se cargarán los datos iniciales. Esta acción no se puede deshacer.',
      confirmLabel: 'Restablecer',
      confirmCls: 'bg-red-600 hover:bg-red-700 text-white',
      icon: 'rotate-ccw',
      iconCls: 'bg-red-100',
      onConfirm: () => {
        localStorage.removeItem(LS_KEY);
        localStorage.removeItem(LS_KEY_OIDS);
        location.reload();
      },
    });
  }

  // ─── ACTIVIDADES MODAL ───────────────────────────────────
  function abrirModalActividades(areaIdx) {
    setActividadesModalAreaIdx(areaIdx);
  }
  function confirmarAgregarActividades(areaIdx, selectedNames) {
    setAreasActivas(prev => prev.map((a, i) => {
      if (i !== areaIdx) return a;
      const nuevas = selectedNames
        .map(nombre => {
          const def = getCatalogoActividad(nombre);
          if (!def || a.actividades.some(act => act.nombre === def.nombre)) return null;
          return { ...JSON.parse(JSON.stringify(def)), selectedOptions: [] };
        })
        .filter(Boolean);
      return { ...a, actividades: [...a.actividades, ...nuevas] };
    }));
    setActividadesModalAreaIdx(null);
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Topbar
        screen={screen}
        clienteActivo={clienteActivo}
        pedidoActivo={pedidoActivo}
        onGoTo={goTo}
        onRestablecerDatos={restablecerDatos}
      />

      <div className="flex-1 py-8 px-8 max-w-6xl w-full mx-auto">
        {screen === 'clientes' && (
          <ClientesScreen
            clientes={clientes}
            onVerPedidos={verPedidos}
            onCrearPedidoDesdeCliente={crearPedidoDesdeCliente}
          />
        )}
        {screen === 'pedidos' && (
          <PedidosScreen
            clienteActivo={clienteActivo}
            onGoTo={goTo}
            onCrearPedidoNuevo={() => crearPedidoNuevo()}
            onVerDetallePedido={verDetallePedido}
            onReutilizarDiseno={reutilizarDiseno}
          />
        )}
        {screen === 'detalle-pedido' && (
          <DetallePedidoScreen
            pedidoActivo={pedidoActivo}
            clienteActivo={clienteActivo}
            onGoTo={goTo}
            onVerDetalleOrden={verDetalleOrden}
            onIniciarNuevaOrden={iniciarNuevaOrden}
            onAbrirModalKit={abrirModalKit}
            onAbrirModalOrdenesKit={abrirModalOrdenesKit}
            onCrearOrdenParaKit={crearOrdenParaKit}
            onEliminarKit={eliminarKit}
            onQuitarOrdenDeKit={quitarOrdenDeKit}
            onEliminarPedidoActivo={eliminarPedidoActivo}
            onConfirmarPedido={confirmarPedido}
            onGuardarFechaLimite={guardarFechaLimite}
            onHandleAdjuntosPedido={handleAdjuntosPedido}
            onQuitarAdjunto={quitarAdjunto}
          />
        )}
        {screen === 'reutilizar' && (
          <ReutilizarScreen
            pedidoActivo={pedidoActivo}
            onGoTo={goTo}
            onConfirmarReutilizar={confirmarReutilizar}
          />
        )}
        {screen === 'nueva-orden' && (
          <NuevaOrdenScreen
            pedidoActivo={pedidoActivo}
            kitDestino={kitDestino}
            esReutilizado={esReutilizado}
            tipoDiseno={tipoDiseno}
            setTipoDiseno={setTipoDiseno}
            prendasSeleccionadas={prendasSeleccionadas}
            setPrendasSeleccionadas={setPrendasSeleccionadas}
            clothesData={clothesData}
            setClothesData={setClothesData}
            adjuntosData={adjuntosData}
            areasActivas={areasActivas}
            setAreasActivas={setAreasActivas}
            substepActual={substepActual}
            maxSubstep={maxSubstep}
            generoSeleccionado={generoSeleccionado}
            setGeneroSeleccionado={setGeneroSeleccionado}
            disciplina={disciplina}
            setDisciplina={setDisciplina}
            categoria={categoria}
            setCategoria={setCategoria}
            tipoSolicitud={tipoSolicitud}
            setTipoSolicitud={setTipoSolicitud}
            observaciones={observaciones}
            setObservaciones={setObservaciones}
            snapshotOriginal={snapshotOriginal}
            onSalirNuevaOrden={salirNuevaOrden}
            onConfirmarOrden={confirmarOrden}
            onAbrirModalActividades={abrirModalActividades}
            onHandleAdjuntos={handleAdjuntos}
            onQuitarAdjunto={quitarAdjunto}
            onGoSubstep={goSubstep}
            onGoSubstepNav={goSubstepNav}
            onShowAlert={showAlert}
          />
        )}
      </div>

      {/* Modals */}
      {confirmModal && (
        <ConfirmModal
          data={confirmModal}
          onClose={() => setConfirmModal(null)}
        />
      )}
      <OrdenDetalleModal
        visible={!!ordenDetalleOrdenId}
        ordenId={ordenDetalleOrdenId}
        pedidoActivo={pedidoActivo}
        onClose={() => setOrdenDetalleOrdenId(null)}
        onQuitarAdjunto={quitarAdjunto}
      />
      <ActividadesModal
        visible={actividadesModalAreaIdx !== null}
        areaIdx={actividadesModalAreaIdx}
        areasActivas={areasActivas}
        onClose={() => setActividadesModalAreaIdx(null)}
        onConfirmar={confirmarAgregarActividades}
      />
      <KitModal
        visible={kitModalVisible}
        onClose={() => setKitModalVisible(false)}
        onConfirm={confirmarNuevoKit}
      />
      <KitOrdenesModal
        visible={!!kitOrdenesModalKitId}
        kitId={kitOrdenesModalKitId}
        pedidoActivo={pedidoActivo}
        onClose={() => setKitOrdenesModalKitId(null)}
        onConfirmar={confirmarAgregarOrdenesKit}
      />
    </div>
  );
}
