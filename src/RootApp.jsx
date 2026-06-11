import { useState, useEffect, useRef } from 'react'
import { LogOut } from 'lucide-react'
import App from './App'
import { Login } from './auth/Login'
import { AdminApp } from './admin/AdminApp'
import CPManagerEmployee from './employee/Empleado'

// Transforms Gestor's cpmanager_clientes → cp_v5_pedidos format for the Empleado.
// Preserves completada states already marked by the Empleado.
function syncGestorToEmpleado() {
  try {
    const clientes = JSON.parse(localStorage.getItem('cpmanager_clientes') || '[]')
    const existing = JSON.parse(localStorage.getItem('cp_v5_pedidos') || '[]')

    const completedMap = {}
    existing.forEach(p => {
      ;(p.ordenes || []).forEach(o => {
        const m = {}
        ;(o.actividades || []).forEach(a => { m[`${a.area}::${a.nombre}`] = a.completada })
        completedMap[o.id] = m
      })
    })

    const nuevos = []
    clientes.forEach(c => {
      ;(c.pedidos || []).forEach(ped => {
        if (!ped.confirmado) return
        ;(ped.ordenes || []).forEach(orden => {
          const areas = orden.config?.areas || []
          if (!areas.length) return
          const actMap = completedMap[orden.id] || {}
          const actividades = areas.flatMap(a =>
            (a.actividades || []).map(act => ({
              area: a.area,
              nombre: act.actividad,
              tipo: (act.tags || []).map(t => t.opcion).join(', '),
              completada: actMap[`${a.area}::${act.actividad}`] ?? false,
            }))
          )
          const done = actividades.filter(a => a.completada).length
          const progreso = actividades.length ? Math.round((done / actividades.length) * 100) : 0
          nuevos.push({
            id: orden.id,
            equipo: c.nombre,
            disciplina: orden.disciplina || '',
            entrega: ped.fechaLimite || '',
            prioridad: false,
            progreso,
            ordenes: [{
              id: orden.id,
              nombre: orden.tipoSolicitud || orden.code || orden.id,
              prendas: (orden.clothes || []).map(cl => `${cl.name || ''} x${cl.qty ?? cl.conf?.tot ?? 1}`),
              estado: orden.status || 'Pendiente',
              actividades,
            }],
          })
        })
      })
    })

    if (nuevos.length > 0) localStorage.setItem('cp_v5_pedidos', JSON.stringify(nuevos))
  } catch (e) { console.warn('syncGestorToEmpleado', e) }
}

// Reads completed actividades from cp_v5_pedidos and pushes status back to cpmanager_clientes.
function syncEmpleadoToGestor() {
  try {
    const pedidos = JSON.parse(localStorage.getItem('cp_v5_pedidos') || '[]')
    const clientes = JSON.parse(localStorage.getItem('cpmanager_clientes') || '[]')

    const progressMap = {}
    pedidos.forEach(p => {
      ;(p.ordenes || []).forEach(o => {
        const total = (o.actividades || []).length
        const done = (o.actividades || []).filter(a => a.completada).length
        progressMap[o.id] = { total, done }
      })
    })

    let changed = false
    const updated = clientes.map(c => ({
      ...c,
      pedidos: (c.pedidos || []).map(ped => ({
        ...ped,
        ordenes: (ped.ordenes || []).map(orden => {
          const p = progressMap[orden.id]
          if (!p || p.total === 0) return orden
          const newStatus = p.done === p.total ? 'Completado' : p.done > 0 ? 'En proceso' : orden.status
          if (newStatus === orden.status) return orden
          changed = true
          return { ...orden, status: newStatus }
        }),
      })),
    }))

    if (changed) localStorage.setItem('cpmanager_clientes', JSON.stringify(updated))
  } catch (e) { console.warn('syncEmpleadoToGestor', e) }
}

const AREA_COLORS = {
  'Corte': '#eab308',
  'Costura': '#10b981',
  'Sublimación': '#ec4899',
  'Control de Calidad': '#6b7280',
  'Empaque y Envío': '#3b82f6',
  'Bordado': '#8b5cf6',
}

const initialAreas = [
  { id: 1, nombre: 'Corte', descripcion: 'Corte de telas y materiales según patrones', estado: 'activa' },
  { id: 2, nombre: 'Costura', descripcion: 'Confección y ensamble de prendas deportivas', estado: 'activa' },
  { id: 3, nombre: 'Sublimación', descripcion: 'Impresión de diseños por transferencia de calor', estado: 'activa' },
  { id: 4, nombre: 'Control de Calidad', descripcion: 'Inspección y validación de prendas terminadas', estado: 'activa' },
  { id: 5, nombre: 'Empaque y Envío', descripcion: 'Preparación y despacho de pedidos al cliente', estado: 'activa' },
  { id: 6, nombre: 'Bordado', descripcion: 'Aplicación de bordados y acabados especiales', estado: 'inactiva' },
]

const initialUsuarios = [
  { id: 1, nombre: 'Área Corte', email: 'corte@uniformespro.com', areaId: 1, estado: 'activo', fechaCreacion: '2025-01-15' },
  { id: 2, nombre: 'Área Costura', email: 'costura@uniformespro.com', areaId: 2, estado: 'activo', fechaCreacion: '2025-01-15' },
  { id: 3, nombre: 'Área Sublimación', email: 'sublimacion@uniformespro.com', areaId: 3, estado: 'activo', fechaCreacion: '2025-02-01' },
  { id: 4, nombre: 'Área Control de Calidad', email: 'calidad@uniformespro.com', areaId: 4, estado: 'activo', fechaCreacion: '2025-02-10' },
  { id: 5, nombre: 'Área Empaque', email: 'empaque@uniformespro.com', areaId: 5, estado: 'activo', fechaCreacion: '2025-03-05' },
]

function syncAreaStatus(nextUsuarios, nextAreas) {
  return nextAreas.map(a => ({
    ...a,
    estado: nextUsuarios.some(u => u.areaId === a.id) ? 'activa' : 'inactiva',
  }))
}

function GestorView({ onLogout }) {
  return (
    <>
      <App />
      <button
        onClick={onLogout}
        title="Cerrar sesión"
        style={{
          position: 'fixed', top: '10px', right: '56px', zIndex: 100,
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '5px 10px', fontSize: '12px', fontWeight: 500,
          color: '#6b7280', background: 'white',
          border: '1px solid #e5e7eb', borderRadius: '6px',
          cursor: 'pointer', fontFamily: 'inherit', lineHeight: '1',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#fca5a5' }}
        onMouseLeave={e => { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.borderColor = '#e5e7eb' }}
      >
        <LogOut style={{ width: '14px', height: '14px' }} />
        Salir
      </button>
    </>
  )
}

function EmpleadoView({ onLogout }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const btn = container.querySelector('.logout-btn')
    if (!btn) return
    btn.addEventListener('click', onLogout)
    return () => btn.removeEventListener('click', onLogout)
  }, [onLogout])

  return (
    <div ref={containerRef} style={{ height: '100vh', overflow: 'hidden' }}>
      <CPManagerEmployee />
    </div>
  )
}

export default function RootApp() {
  const [role, setRole] = useState(null)
  const [areas, setAreas] = useState(initialAreas)
  const [usuarios, setUsuarios] = useState(initialUsuarios)

  useEffect(() => {
    const existing = JSON.parse(localStorage.getItem('cp_areas') || '[]')
    const mapped = areas.map(a => {
      const prev = existing.find(e => e.nombre === a.nombre)
      return {
        id: 'a' + a.id,
        nombre: a.nombre,
        color: AREA_COLORS[a.nombre] || '#6b7280',
        actividades: prev?.actividades || [],
      }
    })
    localStorage.setItem('cp_areas', JSON.stringify(mapped))
  }, [areas])

  // Cross-tab storage sync
  useEffect(() => {
    function onStorage(e) {
      if (e.key === 'cpmanager_clientes') syncGestorToEmpleado()
      if (e.key === 'cp_v5_pedidos') syncEmpleadoToGestor()
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  function handleSetUsuarios(updater) {
    setUsuarios(prev => {
      const next = updater(prev)
      setAreas(prevAreas => syncAreaStatus(next, prevAreas))
      return next
    })
  }

  function handleLogin(newRole) {
    // Before entering empleado: push latest Gestor data down
    syncGestorToEmpleado()
    setRole(newRole)
  }

  function handleLogout() {
    // Before leaving empleado: push completions back up to Gestor
    if (role === 'empleado') syncEmpleadoToGestor()
    setRole(null)
  }

  if (role === null) return <Login onLogin={handleLogin} />
  if (role === 'empleado') return <EmpleadoView onLogout={handleLogout} />
  if (role === 'gestor') return <GestorView onLogout={handleLogout} />

  return (
    <AdminApp
      onLogout={handleLogout}
      areas={areas}
      setAreas={setAreas}
      usuarios={usuarios}
      setUsuarios={handleSetUsuarios}
    />
  )
}
