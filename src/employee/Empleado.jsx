import React, { useState, useEffect, useRef } from 'react';
import { getDoc, setDoc } from '../storage';
import { db } from '../db';

// ==========================================
// DATOS INICIALES POR DEFECTO (MOCK DATA V5)
// ==========================================
const DEFAULT_PEDIDOS = [
  {
    id: 'PED-001', equipo: 'Tigres FC', disciplina: 'Fútbol', entrega: '2026-06-11', prioridad: true, progreso: 65, ordenes: [
      {
        id: 'ORD-001A', nombre: 'Uniforme local', prendas: ['Jersey x11', 'Short x11', 'Medias x11'], estado: 'En progreso', actividades: [
          { area: 'Sublimación', nombre: 'Impresión de escudos', tipo: 'Tipo: Sublimación', completada: true },
          { area: 'Sublimación', nombre: 'Impresión de números', tipo: 'Tipo: 3D', completada: false },
          { area: 'Costura', nombre: 'Ensamble de piezas', tipo: '', completada: false }
        ]
      },
      {
        id: 'ORD-001B', nombre: 'Uniforme visita', prendas: ['Jersey x11', 'Short x11'], estado: 'En progreso', actividades: [
          { area: 'DTF', nombre: 'Estampado DTF', tipo: 'Tipo: DTF', completada: false },
          { area: 'Costura', nombre: 'Ensamble de piezas', tipo: '', completada: false }
        ]
      }
    ]
  },
  {
    id: 'PED-002', equipo: 'Águilas Basketball', disciplina: 'Basketball', entrega: '2026-06-18', prioridad: false, progreso: 30, ordenes: [
      {
        id: 'ORD-002A', nombre: 'Jersey local', prendas: ['Jersey x12', 'Short x12'], estado: 'En progreso', actividades: [
          { area: 'Sublimación', nombre: 'Impresión de escudos', tipo: 'Tipo: Sublimación', completada: false },
          { area: 'Costura', nombre: 'Ensamble de piezas', tipo: '', completada: false }
        ]
      }
    ]
  },
  {
    id: 'PED-003', equipo: 'Lobos Volleyball', disciplina: 'Volleyball', entrega: '2026-06-25', prioridad: false, progreso: 10, ordenes: [
      {
        id: 'ORD-003A', nombre: 'Uniforme damas', prendas: ['Jersey x8', 'Short x8'], estado: 'Pendiente', actividades: [
          { area: 'Sublimación', nombre: 'Impresión de logos', tipo: 'Tipo: UPT', completada: false }
        ]
      }
    ]
  },
  {
    id: 'PED-004', equipo: 'Rayos FC', disciplina: 'Fútbol', entrega: '2026-06-30', prioridad: false, progreso: 80, ordenes: [
      {
        id: 'ORD-004A', nombre: 'Set portero', prendas: ['Jersey portero x2', 'Pantalón x2'], estado: 'Completado', actividades: [
          { area: 'Sublimación', nombre: 'Impresión especial', tipo: 'Tipo: DTF', completada: true },
          { area: 'Costura', font: '', nombre: 'Ensamble', tipo: '', completada: true }
        ]
      }
    ]
  }
];

const DEFAULT_INCIDENCIAS = [
  { id: 'INC-001', pedido: 'PED-001', equipo: 'Tigres FC', orden: 'ORD-001A', areaReporta: 'Sublimación', areaAsignada: 'Costura', desc: 'Talla incorrecta en jersey #7', acciones: 'Rehacer pieza con medidas correctas', severidad: 'Alta', fecha: '2026-06-07', resuelta: false, tipo: 'enviadas' },
  { id: 'INC-002', pedido: 'PED-002', equipo: 'Águilas Basketball', orden: 'ORD-002A', areaReporta: 'Costura', areaAsignada: 'Sublimación', desc: 'Color desvanecido en escudo lateral', acciones: 'Reimpresión con calibración de tinta', severidad: 'Media', fecha: '2026-06-08', resuelta: false, tipo: 'recibidas' }
];

const AREA_EMPLEADO = 'Sublimación';
const SEV_BADGE = { Alta: 'badge-incident', Media: 'badge-priority', Baja: 'badge-pending' };

export default function CPManagerEmployee() {
  // --- ESTADOS DE NAVEGACIÓN Y SELECCIÓN ---
  const [currentView, setCurrentView] = useState('pedidos'); 
  const [currentPedido, setCurrentPedido] = useState(null);
  const [currentOrden, setCurrentOrden] = useState(null);
  const [incFilter, setIncFilter] = useState('enviadas'); 

  // --- ESTADOS CON PERSISTENCIA POUCH ---
  const [pedidos, setPedidos] = useState(DEFAULT_PEDIDOS);
  const [incidencias, setIncidencias] = useState(DEFAULT_INCIDENCIAS);
  const loadedRef = useRef(false);
  const pedidosRef = useRef(pedidos);
  const incidenciasRef = useRef(incidencias);
  useEffect(() => { pedidosRef.current = pedidos; }, [pedidos]);
  useEffect(() => { incidenciasRef.current = incidencias; }, [incidencias]);

  // --- ESTADOS DEL MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formAreaResp, setFormAreaResp] = useState('');
  const [formSeveridad, setFormSeveridad] = useState(''); 
  const [formDesc, setFormDesc] = useState('');
  const [formAcciones, setFormAcciones] = useState('');

  // --- ESTADO DEL TOAST ---
  const [toast, setToast] = useState({ visible: false, msg: '', color: '', bg: '' });

  // --- SINCRONIZACIÓN Y GUARDADO AUTOMÁTICO ---
  useEffect(() => {
    Promise.all([
      getDoc('cp_v5_pedidos', null),
      getDoc('cp_v5_incidencias', null),
    ]).then(([savedPedidos, savedIncidencias]) => {
      loadedRef.current = true;
      if (savedPedidos) setPedidos(savedPedidos);
      if (savedIncidencias) setIncidencias(savedIncidencias);
    });
  }, []);

  useEffect(() => {
    if (loadedRef.current) setDoc('cp_v5_pedidos', pedidos).catch(console.warn);
  }, [pedidos]);

  useEffect(() => {
    if (loadedRef.current) setDoc('cp_v5_incidencias', incidencias).catch(console.warn);
  }, [incidencias]);

  // Escuchador en tiempo real para cambios externos (desde otros roles/pestañas)
  useEffect(() => {
    const feed = db.changes({ live: true, since: 'now', include_docs: true })
      .on('change', (change) => {
        if (change.id === 'cp_v5_pedidos' && change.doc?.data) {
          const incoming = JSON.stringify(change.doc.data);
          if (incoming !== JSON.stringify(pedidosRef.current)) setPedidos(change.doc.data);
        }
        if (change.id === 'cp_v5_incidencias' && change.doc?.data) {
          const incoming = JSON.stringify(change.doc.data);
          if (incoming !== JSON.stringify(incidenciasRef.current)) setIncidencias(change.doc.data);
        }
      });
    return () => feed.cancel();
  }, []);

  // Contadores dinámicos para los badges de la interfaz
  const incidenciasPendientesTotales = incidencias.filter(i => !i.resuelta).length;
  const filteredIncidencias = incidencias.filter(i => i.tipo === incFilter);

  // --- EFECTO DE SINCRONIZACIÓN DE SELECCIÓN ---
  useEffect(() => {
    if (currentPedido) {
      const pActualizado = pedidos.find(p => p.id === currentPedido.id);
      if (!pActualizado) {
        setCurrentPedido(null);
        setCurrentOrden(null);
        setCurrentView('pedidos');
        return;
      }
      setCurrentPedido(pActualizado);
      if (currentOrden) {
        const oActualizada = pActualizado.ordenes.find(o => o.id === currentOrden.id);
        setCurrentOrden(oActualizada ?? null);
      }
    }
  }, [pedidos]);

  // --- MANEJADORES DE LÓGICA ---
  const showToast = (msg, color, bg) => {
    setToast({ visible: true, msg, color, bg });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  };

  const handleOpenPedido = (pedidoId) => {
    const pedido = pedidos.find(p => p.id === pedidoId);
    if (!pedido) return;
    setCurrentPedido(pedido);
    setCurrentOrden(pedido.ordenes[0] || null);
    setCurrentView('actividades');
  };

  const toggleActividad = (ordenId, actIdx) => {
    setPedidos(prevPedidos => prevPedidos.map(p => {
      if (p.id !== currentPedido.id) return p;
      const nuevasOrdenes = p.ordenes.map(o => {
        if (o.id !== ordenId) return o;
        const nuevasActividades = o.actividades.map((a, idx) => 
          idx === actIdx ? { ...a, completada: !a.completada } : a
        );
        return { ...o, actividades: nuevasActividades };
      });
      return { ...p, ordenes: nuevasOrdenes };
    }));
  };

  const handleResolverIncidencia = (id) => {
    setIncidencias(prev => prev.map(inc => inc.id === id ? { ...inc, resuelta: true } : inc));
    showToast(`Incidencia ${id} marcada como resuelta`, '#085041', '#E1F5EE');
  };

  const handleOpenModal = () => {
    if (!currentPedido || !currentOrden) return;
    setFormAreaResp('');
    setFormSeveridad('');
    setFormDesc('');
    setFormAcciones('');
    setIsModalOpen(true);
  };

  const handleSubmitIncident = () => {
    if (!formAreaResp || !formDesc.trim() || !formAcciones.trim() || !formSeveridad) {
      showToast('Completa todos los campos requeridos', '#A32D2D', '#FCEBEB');
      return;
    }

    const newInc = {
      id: `INC-00${incidencias.length + 1}`,
      pedido: currentPedido.id,
      equipo: currentPedido.equipo,
      orden: currentOrden.id,
      areaReporta: AREA_EMPLEADO,
      areaAsignada: formAreaResp,
      desc: formDesc.trim(),
      acciones: formAcciones.trim(),
      severidad: formSeveridad.charAt(0).toUpperCase() + formSeveridad.slice(1),
      fecha: new Date().toISOString().slice(0, 10),
      resuelta: false,
      tipo: 'enviadas'
    };

    setIncidencias(prev => [...prev, newInc]);
    setIsModalOpen(false);
    showToast(`Incidencia enviada a ${formAreaResp}`, '#085041', '#E1F5EE');
  };

  // --- RENDERS DE VISTA ---
  const renderPedidosView = () => (
    <div className={`view ${currentView === 'pedidos' ? 'active' : ''}`}>
      <div className="topbar">
        <div>
          <div className="page-title">Mis pedidos asignados</div>
          <div className="page-subtitle">Pedidos con actividades pendientes para tu área</div>
        </div>
        <span className="badge badge-progress">
          <i className="ti ti-clock" style={{ fontSize: '12px', marginRight: '3px' }}></i>
          {pedidos.length} activos
        </span>
      </div>
      <div className="content">
        {pedidos.map(p => {
          const days = Math.ceil((new Date(p.entrega) - new Date()) / 86400000);
          return (
            <div key={p.id} className={`order-card ${p.prioridad ? 'priority' : ''}`} onClick={() => handleOpenPedido(p.id)}>
              <div style={{ display: 'flex', alignItems: 'center', justifycontent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                  <i className="ti ti-clipboard-list" style={{ fontSize: '14px', verticalAlign: '-2px', marginRight: '4px' }}></i>
                  {p.id} — {p.equipo}
                </span>
                <span className={`badge ${p.prioridad ? 'badge-priority' : 'badge-pending'}`}>
                  {p.prioridad ? '⚑ Prioritario' : `${days} días`}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                <span className="tag"><i className="ti ti-ball-football" style={{ fontSize: '11px' }}></i>{p.disciplina}</span>
                <span className="tag"><i className="ti ti-calendar" style={{ fontSize: '11px' }}></i>Entrega: {p.entrega}</span>
                <span className="tag">{p.ordenes.length} órdenes</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${p.progreso}%` }}></div>
              </div>
              <div className="progress-label">{p.progreso}% completado</div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderActividadesView = () => {
    if (!currentPedido) return null;
    const totalActividades = currentOrden ? currentOrden.actividades.length : 0;
    const completadasCount = currentOrden ? currentOrden.actividades.filter(a => a.completada).length : 0;
    const porcentajeProgreso = totalActividades > 0 ? Math.round((completadasCount / totalActividades) * 100) : 0;

    return (
      <div className={`view ${currentView === 'actividades' ? 'active' : ''}`}>
        <div className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="back-btn" onClick={() => setCurrentView('pedidos')}>
              <i className="ti ti-arrow-left"></i> Volver
            </button>
            <div style={{ width: '1px', height: '20px', background: 'var(--color-border-tertiary)' }}></div>
            <div>
              <div className="page-title">{currentPedido.id} — {currentPedido.equipo}</div>
              <div className="page-subtitle">{currentPedido.disciplina} · {currentPedido.ordenes.length} órdenes</div>
            </div>
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'hidden', padding: '14px 18px', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div className="acts-grid">
            
            {/* Columna Órdenes */}
            <div className="col-panel">
              <div className="col-header">Órdenes <span className="col-count">{currentPedido.ordenes.length}</span></div>
              <div className="col-body">
                {currentPedido.ordenes.map(o => (
                  <div key={o.id} className={`act-item ${currentOrden && currentOrden.id === o.id ? 'selected' : ''}`} onClick={() => setCurrentOrden(o)}>
                    <div className="act-item-area">{o.id}</div>
                    <div className="act-item-name">{o.nombre}</div>
                    <span className={`badge ${o.estado === 'Completado' ? 'badge-done' : o.estado === 'En progreso' ? 'badge-progress' : 'badge-pending'}`} style={{ fontSize: '11px' }}>
                      {o.estado}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Columna Actividades Tareas */}
            <div className="col-panel">
              <div className="col-header">Actividades</div>
              <div className="col-body">
                {!currentOrden ? (
                  <div className="empty-col"><i className="ti ti-arrow-left" style={{ display: 'block', marginBottom: '6px' }}></i>Selecciona una orden</div>
                ) : (
                  <>
                    {currentOrden.actividades.map((a, idx) => !a.completada && (
                      <div key={idx} className="act-item" style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <div style={{ flex: 1 }}>
                          <div className="act-item-area">{a.area}</div>
                          <div className="act-item-name">{a.nombre}</div>
                          {a.tipo && <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{a.tipo}</div>}
                        </div>
                        <button className="check-btn" onClick={() => toggleActividad(currentOrden.id, idx)}><i className="ti ti-check"></i></button>
                      </div>
                    ))}
                    {completadasCount > 0 && <div className="section-divider-label">Completadas</div>}
                    {currentOrden.actividades.map((a, idx) => a.completada && (
                      <div key={idx} className="act-item act-done" style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <div style={{ flex: 1 }}>
                          <div className="act-item-area">{a.area}</div>
                          <div className="act-item-name">{a.nombre}</div>
                        </div>
                        <button className="check-btn checked" onClick={() => toggleActividad(currentOrden.id, idx)}><i className="ti ti-check"></i></button>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* Columna Detalles */}
            <div className="col-panel">
              <div className="col-header">Detalles de orden</div>
              {!currentOrden ? (
                <div className="empty-col">Sin orden seleccionada</div>
              ) : (
                <div className="col-body" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
                  <div className="detail-section">
                    <div className="detail-label">Orden</div>
                    <div className="detail-value" style={{ fontWeight: 500 }}>{currentOrden.nombre}</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{currentOrden.id}</div>
                  </div>
                  <div className="detail-section">
                    <div className="detail-label" style={{ marginBottom: '7px' }}>Prendas</div>
                    {currentOrden.prendas.map((p, idx) => (
                      <div key={idx} style={{ fontSize: '13px', marginBottom: '3px' }}><i className="ti ti-shirt" style={{ marginRight: '5px', color: 'var(--color-text-secondary)' }}></i>{p}</div>
                    ))}
                  </div>
                  <div className="detail-section">
                    <div className="detail-label">Progreso</div>
                    <div className="progress-bar-bg" style={{ marginTop: '6px' }}><div className="progress-bar-fill" style={{ width: `${porcentajeProgreso}%` }}></div></div>
                    <div className="progress-label">{completadasCount}/{totalActividades} completadas</div>
                  </div>
                  <div style={{ padding: '12px 14px', marginTop: 'auto' }}>
                    <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>¿ALGO SALIÓ MAL?</div>
                    <button className="btn btn-danger" style={{ width: '100%', justifyContent: 'center' }} onClick={handleOpenModal}>
                      <i className="ti ti-alert-triangle"></i> Reportar incidencia
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    );
  };

  const renderIncidenciasView = () => (
    <div className={`view ${currentView === 'incidencias' ? 'active' : ''}`}>
      <div className="topbar">
        <div>
          <div className="page-title">Incidencias del sistema</div>
          <div className="page-subtitle">Gestiona reportes enviados y recibidos de tu área</div>
        </div>
      </div>
      
      <div className="tabs-container">
        <div className={`tab-item ${incFilter === 'enviadas' ? 'active' : ''}`} onClick={() => setIncFilter('enviadas')}>
          Enviadas por mí
        </div>
        <div className={`tab-item ${incFilter === 'recibidas' ? 'active' : ''}`} onClick={() => setIncFilter('recibidas')}>
          Recibidas en mi área
        </div>
      </div>

      <div className="content">
        {!filteredIncidencias.length ? (
          <div className="empty-state-box">
            <i className="ti ti-checks"></i> No hay incidencias en esta sección.
          </div>
        ) : (
          filteredIncidencias.map(inc => (
            <div key={inc.id} className={`inc-card ${inc.resuelta ? 'resolved' : ''}`}>
              <div className="inc-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}><i className="ti ti-alert-triangle"></i> {inc.id}</span>
                  <span className={`badge ${SEV_BADGE[inc.severidad] || 'badge-pending'}`}>Severidad: {inc.severidad}</span>
                </div>
                <span className={`status-pill ${inc.resuelta ? 'status-resuelta' : 'status-en-proceso'}`}>
                  <i className="ti ti-refresh"></i> {inc.resuelta ? 'Resuelta' : 'En proceso'}
                </span>
              </div>
              <div className="inc-card-body">
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  <span className="tag">Pedido: {inc.pedido}</span>
                  <span className="tag">Orden: {inc.orden}</span>
                  <span className="tag-area-reporta">Reporta: {inc.areaReporta}</span>
                  <span className="tag-area-asignada">Asignada a: {inc.areaAsignada}</span>
                  <span className="tag"><i className="ti ti-calendar"></i> {inc.fecha}</span>
                </div>
                <div className="inc-text-line"><span className="bold-lbl">Problema: </span>{inc.desc}</div>
                <div className="inc-text-line"><span className="bold-lbl">Acción sugerida: </span>{inc.acciones}</div>
              </div>
              <div className="inc-card-footer">
                <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                  {inc.resuelta ? '✓ Registro cerrado' : '⏱ Pendiente de revisión'}
                </span>
                {!inc.resuelta && (
                  <button className="btn btn-success" onClick={() => handleResolverIncidencia(inc.id)}>
                    <i className="ti ti-circle-check"></i> Marcar resuelta
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="cp-employee-view-container">
      {/* INYECCIÓN DE CSS EXCLUSIVO Y AISLADO */}
      <style dangerouslySetInnerHTML={{ __html: `
        .cp-employee-view-container {
          --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          --color-background-primary: #ffffff;
          --color-background-secondary: #f6f8fa;
          --color-border-tertiary: #d0d7de;
          --color-text-primary: #24292f;
          --color-text-secondary: #57606a;
          --border-radius-md: 6px;
          --border-radius-sm: 4px;
          display: flex;
          height: 100vh;
          min-height: 600px;
          font-family: var(--font-sans);
          background: var(--color-background-secondary);
        }

        .cp-employee-view-container * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .cp-employee-view-container .sidebar {
          width: 200px;
          min-width: 200px;
          background: var(--color-background-primary);
          border-right: 0.5px solid var(--color-border-tertiary);
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .cp-employee-view-container .sidebar-top {
          padding: 20px 16px 16px;
          border-bottom: 0.5px solid var(--color-border-tertiary);
        }

        .cp-employee-view-container .logo-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #185FA5;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #B5D4F4;
          font-size: 13px;
          font-weight: 500;
        }

        .cp-employee-view-container .sidebar-nav {
          flex: 1;
          padding: 12px 8px;
        }

        .cp-employee-view-container .nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 10px;
          border-radius: var(--border-radius-md);
          cursor: pointer;
          font-size: 14px;
          color: var(--color-text-secondary);
          margin-bottom: 2px;
          position: relative;
          transition: background 0.1s;
        }

        .cp-employee-view-container .nav-item:hover { background: var(--color-background-secondary); }
        .cp-employee-view-container .nav-item.active { background: #E6F1FB; color: #185FA5; font-weight: 500; }

        .cp-employee-view-container .nav-badge {
          position: absolute;
          right: 10px;
          background: #CF222E;
          color: white;
          font-size: 11px;
          padding: 1px 6px;
          border-radius: 10px;
          font-weight: 600;
        }

        .cp-employee-view-container .sidebar-bottom {
          padding: 16px;
          border-top: 0.5px solid var(--color-border-tertiary);
        }

        .cp-employee-view-container .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #eaeef2;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          color: var(--color-text-secondary);
        }

        .cp-employee-view-container .logout-btn {
          width: 100%;
          background: none;
          border: none;
          color: #8c95a0;
          font-size: 12px;
          text-align: left;
          padding: 8px 0 0;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-sans);
        }

        .cp-employee-view-container .logout-btn:hover { color: #cf222e; }

        .cp-employee-view-container .main {
          flex: 1;
          background: var(--color-background-secondary);
          position: relative;
          overflow: hidden;
          height: 100%;
        }

        .cp-employee-view-container .view {
          display: none;
          height: 100%;
          flex-direction: column;
        }

        .cp-employee-view-container .view.active { display: flex; }

        .cp-employee-view-container .topbar {
          background: var(--color-background-primary);
          border-bottom: 0.5px solid var(--color-border-tertiary);
          padding: 14px 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .cp-employee-view-container .page-title { font-size: 16px; font-weight: 600; color: var(--color-text-primary); }
        .cp-employee-view-container .page-subtitle { font-size: 12px; color: var(--color-text-secondary); margin-top: 2px; }
        .cp-employee-view-container .content { flex: 1; overflow-y: auto; padding: 16px 18px; }

        .cp-employee-view-container .back-btn {
          background: none;
          border: 1px solid var(--color-border-tertiary);
          padding: 5px 10px;
          border-radius: var(--border-radius-md);
          font-size: 12px;
          cursor: pointer;
          color: var(--color-text-secondary);
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .cp-employee-view-container .back-btn:hover { background: var(--color-background-secondary); color: var(--color-text-primary); }

        .cp-employee-view-container .tabs-container {
          display: flex;
          background: var(--color-background-primary);
          border-bottom: 0.5px solid var(--color-border-tertiary);
          padding: 0 18px;
        }

        .cp-employee-view-container .tab-item {
          padding: 10px 16px;
          font-size: 13px;
          font-weight: 500;
          color: var(--color-text-secondary);
          cursor: pointer;
          border-bottom: 2px solid transparent;
        }
        .cp-employee-view-container .tab-item:hover { color: var(--color-text-primary); }
        .cp-employee-view-container .tab-item.active {
          color: #185FA5;
          border-bottom-color: #185FA5;
          font-weight: 600;
        }

        .cp-employee-view-container .order-card {
          background: var(--color-background-primary);
          border: 0.5px solid var(--color-border-tertiary);
          border-radius: var(--border-radius-md);
          padding: 14px;
          margin-bottom: 10px;
          cursor: pointer;
          transition: all 0.1s;
        }
        .cp-employee-view-container .order-card:hover { border-color: #85b0d9; box-shadow: 0 4px 12px rgba(140,149,160,0.08); }
        .cp-employee-view-container .order-card.priority { border-left: 3px solid #CF222E; }

        .cp-employee-view-container .acts-grid {
          display: grid;
          grid-template-columns: 240px 1fr 260px;
          gap: 14px;
          flex: 1;
          min-height: 0;
        }

        .cp-employee-view-container .col-panel {
          background: var(--color-background-primary);
          border: 0.5px solid var(--color-border-tertiary);
          border-radius: var(--border-radius-md);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .cp-employee-view-container .col-header {
          padding: 10px 14px;
          font-size: 12px;
          font-weight: 600;
          background: var(--color-background-secondary);
          border-bottom: 0.5px solid var(--color-border-tertiary);
          display: flex;
          justify-content: space-between;
        }

        .cp-employee-view-container .col-body { flex: 1; overflow-y: auto; padding: 8px; }
        .cp-employee-view-container .empty-col { text-align: center; color: var(--color-text-secondary); font-size: 12px; padding: 30px 10px; }

        .cp-employee-view-container .act-item {
          border: 0.5px solid var(--color-border-tertiary);
          border-radius: var(--border-radius-md);
          padding: 10px 12px;
          margin-bottom: 6px;
          cursor: pointer;
        }
        .cp-employee-view-container .act-item.selected { border-color: #185FA5; background: #F1F7FC; }
        .cp-employee-view-container .act-item-area { font-size: 10px; font-weight: 600; color: #185FA5; margin-bottom: 2px; }
        .cp-employee-view-container .act-item-name { font-size: 13px; font-weight: 500; color: var(--color-text-primary); }

        .cp-employee-view-container .act-done { opacity: 0.6; }
        .cp-employee-view-container .act-done .act-item-name { text-decoration: line-through; }

        .cp-employee-view-container .check-btn {
          width: 19px;
          height: 19px;
          border-radius: 50%;
          border: 1.5px solid var(--color-border-tertiary);
          background: white;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: transparent;
        }
        .cp-employee-view-container .check-btn:hover { border-color: #2DA44E; color: #2DA44E; }
        .cp-employee-view-container .check-btn.checked { background: #2DA44E; border-color: #2DA44E; color: white; }

        .cp-employee-view-container .section-divider-label {
          font-size: 10px;
          color: var(--color-text-secondary);
          text-transform: uppercase;
          padding: 8px 4px 4px;
        }

        .cp-employee-view-container .detail-section { padding: 12px 14px; border-bottom: 0.5px solid var(--color-border-tertiary); }
        .cp-employee-view-container .detail-label { font-size: 11px; font-weight: 600; color: var(--color-text-secondary); }
        .cp-employee-view-container .detail-value { font-size: 14px; color: var(--color-text-primary); margin-top: 2px; }

        .cp-employee-view-container .inc-card {
          background: var(--color-background-primary);
          border: 0.5px solid var(--color-border-tertiary);
          border-radius: var(--border-radius-md);
          margin-bottom: 12px;
        }
        .cp-employee-view-container .inc-card.resolved { opacity: 0.75; }
        .cp-employee-view-container .inc-card-header {
          padding: 10px 14px;
          border-bottom: 0.5px solid var(--color-border-tertiary);
          background: var(--color-background-secondary);
          display: flex;
          justify-content: space-between;
        }

        .cp-employee-view-container .status-pill { font-size: 11px; font-weight: 600; }
        .cp-employee-view-container .status-en-proceso { color: #B07D00; }
        .cp-employee-view-container .status-resuelta { color: #2DA44E; }

        .cp-employee-view-container .inc-card-body { padding: 12px 14px; border-bottom: 0.5px solid var(--color-border-tertiary); }
        .cp-employee-view-container .inc-text-line { font-size: 13px; color: var(--color-text-secondary); margin-top: 4px; }
        .cp-employee-view-container .bold-lbl { font-weight: 500; color: var(--color-text-primary); }

        .cp-employee-view-container .badge { padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 500; }
        .cp-employee-view-container .badge-progress { background: #FFF8E5; color: #B07D00; }
        .cp-employee-view-container .badge-priority { background: #FFEBEB; color: #CC2431; }
        .cp-employee-view-container .badge-pending { background: #F6F8FA; color: #57606a; border: 0.5px solid var(--color-border-tertiary); }
        .cp-employee-view-container .badge-done { background: #E1F5EE; color: #085041; }
        .cp-employee-view-container .badge-incident { background: #FFEBEB; color: #CF222E; }

        .cp-employee-view-container .tag { background: #fff; border: 0.5px solid var(--color-border-tertiary); font-size: 11px; padding: 2px 6px; border-radius: 4px; color: var(--color-text-secondary); }
        .cp-employee-view-container .tag-area-reporta { background: #E6F1FB; border: 0.5px solid #b5d4f4; color: #185FA5; font-size: 11px; padding: 2px 6px; border-radius: 4px; }
        .cp-employee-view-container .tag-area-asignada { background: #F6F8FA; border: 0.5px solid var(--color-border-tertiary); color: var(--color-text-primary); font-size: 11px; padding: 2px 6px; border-radius: 4px; font-weight: 500; }

        .cp-employee-view-container .progress-bar-bg { background: #EAECEF; height: 6px; border-radius: 3px; overflow: hidden; }
        .cp-employee-view-container .progress-bar-fill { background: #2DA44E; height: 100%; transition: width 0.2s; }
        .cp-employee-view-container .progress-label { font-size: 11px; color: var(--color-text-secondary); margin-top: 4px; }

        .cp-employee-view-container .btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          font-size: 13px;
          font-weight: 500;
          border-radius: var(--border-radius-md);
          cursor: pointer;
          background: white;
          border: 1px solid var(--color-border-tertiary);
        }
        .cp-employee-view-container .btn-primary { background: #1F883D; color: white; border-color: rgba(27,31,36,0.15); }
        .cp-employee-view-container .btn-danger { background: #FFEBEB; color: #CC2431; border-color: rgba(204,36,49,0.2); }
        .cp-employee-view-container .btn-success { background: #E1F5EE; color: #085041; border-color: rgba(8,80,65,0.2); }

        .cp-employee-view-container .inc-card-footer { padding: 8px 14px; display: flex; justify-content: space-between; align-items: center; }
        .cp-employee-view-container .empty-state-box { text-align: center; color: var(--color-text-secondary); padding: 40px; font-size: 13px; }

        .cp-employee-view-container .modal-wrap {
          position: fixed;
          top: 0; left: 0; width: 100vw; height: 100vh;
          background: rgba(27,31,36,0.5);
          display: none; align-items: center; justify-content: center;
          z-index: 99;
        }
        .cp-employee-view-container .modal-wrap.open { display: flex; }

        .cp-employee-view-container .modal {
          background: white; border: 1px solid var(--color-border-tertiary);
          border-radius: var(--border-radius-md); width: 490px; max-width: 90%;
          padding: 16px; display: flex; flex-direction: column;
        }
        .cp-employee-view-container .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .cp-employee-view-container .modal-title { font-size: 15px; font-weight: 600; }
        .cp-employee-view-container .modal-close { background: none; border: none; cursor: pointer; color: var(--color-text-secondary); font-size: 16px; }
        .cp-employee-view-container .modal-ctx { background: #F1F7FC; border: 0.5px solid #b5d4f4; padding: 6px 10px; border-radius: var(--border-radius-sm); font-size: 12px; color: #185FA5; margin-bottom: 14px; }

        .cp-employee-view-container .form-group { margin-bottom: 12px; }
        .cp-employee-view-container .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .cp-employee-view-container .form-label { display: block; font-size: 12px; font-weight: 500; margin-bottom: 4px; }
        .cp-employee-view-container .form-label span { color: #CF222E; }

        .cp-employee-view-container .modal input, .cp-employee-view-container .modal select, .cp-employee-view-container .modal textarea {
          width: 100%; padding: 6px 8px; font-size: 13px;
          border: 1px solid var(--color-border-tertiary); border-radius: var(--border-radius-md);
        }
        .cp-employee-view-container .readonly-input { background: var(--color-background-secondary); cursor: default; }

        .cp-employee-view-container .sev-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
        .cp-employee-view-container .sev-opt { text-align: center; padding: 6px; font-size: 12px; border: 1px solid var(--color-border-tertiary); border-radius: var(--border-radius-md); cursor: pointer; }
        .cp-employee-view-container .sel-baja { background: #F6F8FA; border-color: #24292f; font-weight: 600; }
        .cp-employee-view-container .sel-media { background: #FFF8E5; color: #B07D00; border-color: #B07D00; font-weight: 600; }
        .cp-employee-view-container .sel-alta { background: #FFEBEB; color: #CC2431; border-color: #CC2431; font-weight: 600; }

        .cp-employee-view-container .modal-footer { margin-top: 14px; display: flex; justify-content: flex-end; gap: 8px; }

        .cp-employee-view-container .toast {
          position: fixed; bottom: 20px; right: 20px;
          padding: 10px 16px; border-radius: var(--border-radius-md);
          font-size: 13px; font-weight: 500; box-shadow: 0 6px 16px rgba(0,0,0,0.1);
          z-index: 100;
        }
      `}} />

      {/* SIDEBAR ASIDE */}
      <aside className="sidebar">
        <div className="sidebar-top"><div className="logo-circle">CP</div></div>
        <nav className="sidebar-nav">
          <div className={`nav-item ${currentView === 'pedidos' || currentView === 'actividades' ? 'active' : ''}`} onClick={() => setCurrentView('pedidos')}>
            <i className="ti ti-clipboard-list"></i> Pedidos
          </div>
          <div className={`nav-item ${currentView === 'incidencias' ? 'active' : ''}`} onClick={() => setCurrentView('incidencias')}>
            <i className="ti ti-alert-triangle"></i> Incidencias
            {incidenciasPendientesTotales > 0 && <span className="nav-badge">{incidenciasPendientesTotales}</span>}
          </div>
        </nav>
        <div className="sidebar-bottom">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="user-avatar">JR</div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 500 }}>José Ramírez</div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{AREA_EMPLEADO}</div>
            </div>
          </div>
          <button className="logout-btn"><i className="ti ti-logout"></i> Cerrar sesión</button>
        </div>
      </aside>

      {/* CONTENEDOR VISTAS */}
      <main className="main">
        {currentView === 'pedidos' && renderPedidosView()}
        {currentView === 'actividades' && renderActividadesView()}
        {currentView === 'incidencias' && renderIncidenciasView()}
      </main>

      {/* MODAL CONTROLADO */}
      <div className={`modal-wrap ${isModalOpen ? 'open' : ''}`}>
        <div className="modal">
          <div className="modal-header">
            <div className="modal-title">Registrar Incidencia Interna</div>
            <button className="modal-close" onClick={() => setIsModalOpen(false)}><i className="ti ti-x"></i></button>
          </div>
          {currentPedido && currentOrden && (
            <div className="modal-ctx">
              <i className="ti ti-clipboard-list" style={{ marginRight: '4px' }}></i>
              <span>{`${currentPedido.id} · ${currentPedido.equipo} — ${currentOrden.nombre}`}</span>
            </div>
          )}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Pedido</label>
              <input type="text" value={currentPedido ? currentPedido.id : ''} readOnly className="readonly-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Orden afectada</label>
              <input type="text" value={currentOrden ? currentOrden.id : ''} readOnly className="readonly-input" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Área de origen</label>
              <input type="text" value={AREA_EMPLEADO} readOnly className="readonly-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Asignar a área responsable<span>*</span></label>
              <select value={formAreaResp} onChange={(e) => setFormAreaResp(e.target.value)}>
                <option value="">Seleccionar área</option>
                <option value="Costura">Costura</option>
                <option value="Sublimación">Sublimación</option>
                <option value="DTF">DTF</option>
                <option value="Diseño textil">Diseño textil</option>
                <option value="Diseño">Diseño</option>
                <option value="Gestión de órdenes">Gestión de órdenes</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Nivel de Severidad<span>*</span></label>
            <div className="sev-row">
              <div className={`sev-opt ${formSeveridad === 'baja' ? 'sel-baja' : ''}`} onClick={() => setFormSeveridad('baja')}>Baja</div>
              <div className={`sev-opt ${formSeveridad === 'media' ? 'sel-media' : ''}`} onClick={() => setFormSeveridad('media')}>Media</div>
              <div className={`sev-opt ${formSeveridad === 'alta' ? 'sel-alta' : ''}`} onClick={() => setFormSeveridad('alta')}>Alta</div>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Descripción explícita de la falla<span>*</span></label>
            <textarea rows="3" placeholder="Ingresa detalles precisos..." value={formDesc} onChange={(e) => setFormDesc(e.target.value)}></textarea>
          </div>
          <div className="form-group">
            <label className="form-label">Acción inmediata requerida<span>*</span></label>
            <textarea rows="2" placeholder="¿Qué se necesita corregir?" value={formAcciones} onChange={(e) => setFormAcciones(e.target.value)}></textarea>
          </div>
          <div className="modal-footer">
            <button className="btn" onClick={() => setIsModalOpen(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSubmitIncident}>
              <i className="ti ti-send"></i> Levantar reporte
            </button>
          </div>
        </div>
      </div>

      {/* FLOATING TOAST */}
      <div className="toast" style={{ display: toast.visible ? 'block' : 'none', background: toast.bg, color: toast.color }}>
        {toast.msg}
      </div>
    </div>
  );
}