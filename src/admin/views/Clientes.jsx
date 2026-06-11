import { useState, useEffect, useMemo } from 'react'
import { Plus, Pencil, Trash2, Search, Users, UserCircle, X, ClipboardList, Package } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Pagination } from './Pagination'

const estadoOrdenConfig = {
  completado: { label: 'Completado', color: 'bg-green-100 text-green-700' },
  'en-progreso': { label: 'En progreso', color: 'bg-blue-100 text-blue-700' },
  pendiente: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700' },
  cancelado: { label: 'Cancelado', color: 'bg-red-100 text-red-700' },
}

function mapPedidoStatus(status) {
  if (!status) return 'pendiente'
  const s = status.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  if (s === 'cerrado' || s === 'entregado') return 'completado'
  if (s === 'produccion') return 'en-progreso'
  if (s === 'borrador') return 'pendiente'
  return 'pendiente'
}

function buildHistorialFromGestor(clienteId) {
  try {
    const gestorData = JSON.parse(localStorage.getItem('cpmanager_clientes') || '[]')
    const found = gestorData.find(c => String(c.id) === String(clienteId))
    if (!found) return []
    return (found.pedidos || []).map(p => {
      const clothes = (p.ordenes || []).flatMap(o =>
        (o.clothes || []).map(cl => `${cl.name || ''} x${cl.qty ?? cl.conf?.tot ?? 1}`)
      )
      const desc = clothes.length ? clothes.slice(0, 3).join(', ') + (clothes.length > 3 ? '…' : '') : `${(p.ordenes || []).length} orden(es)`
      return {
        id: p.id,
        fecha: p.fecha || '—',
        entrega: p.fechaLimite || '—',
        descripcion: desc,
        estado: mapPedidoStatus(p.status),
      }
    })
  } catch { return [] }
}

const initialClientes = [
  { id: 1, tipo: 'equipo', nombre: 'Club Deportivo Águilas', informacion: '', fechaRegistro: '2025-02-10' },
  { id: 2, tipo: 'individual', nombre: 'María González', informacion: '', fechaRegistro: '2025-03-15' },
  { id: 3, tipo: 'equipo', nombre: 'Equipo Jaguares FC', informacion: '', fechaRegistro: '2025-01-20' },
  { id: 4, tipo: 'individual', nombre: 'Carlos Mendoza', informacion: '', fechaRegistro: '2025-05-22' },
  { id: 5, tipo: 'equipo', nombre: 'Academia Futbol Juvenil', informacion: '', fechaRegistro: '2025-04-08' },
  { id: 6, tipo: 'equipo', nombre: 'Leones Basket Team', informacion: '', fechaRegistro: '2025-02-28' },
  { id: 7, tipo: 'individual', nombre: 'Ana Rodríguez', informacion: '', fechaRegistro: '2025-06-01' },
  { id: 8, tipo: 'equipo', nombre: 'Titanes Volleyball', informacion: '', fechaRegistro: '2025-03-30' },
]

const PAGE_SIZE = 5

export function Clientes() {
  const [clientes, setClientes] = useState(() => {
    const saved = localStorage.getItem('cp_admin_clientes')
    return saved ? JSON.parse(saved) : initialClientes
  })

  useEffect(() => {
    localStorage.setItem('cp_admin_clientes', JSON.stringify(clientes))

    // sync to cp_clientes (legacy)
    const existing = JSON.parse(localStorage.getItem('cp_clientes') || '[]')
    const mapped = clientes.map(c => {
      const prev = existing.find(e => String(e.id) === String(c.id))
      return { id: String(c.id), nombre: c.nombre, telefono: prev?.telefono || c.informacion || '', ultimoPedido: prev?.ultimoPedido || 'Sin pedidos', totalPedidos: prev?.totalPedidos ?? 0 }
    })
    localStorage.setItem('cp_clientes', JSON.stringify(mapped))

    // sync to cpmanager_clientes (Gestor master), preserving existing pedidos
    const existingGestor = JSON.parse(localStorage.getItem('cpmanager_clientes') || '[]')
    const adminIds = new Set(clientes.map(c => String(c.id)))
    const gestorOnly = existingGestor.filter(c => !adminIds.has(String(c.id)))
    const gestorMapped = clientes.map(c => {
      const prev = existingGestor.find(e => String(e.id) === String(c.id))
      return {
        id: String(c.id),
        nombre: c.nombre,
        telefono: prev?.telefono || c.informacion || '',
        ultimoPedido: prev?.ultimoPedido || 'Sin pedidos',
        totalPedidos: prev?.totalPedidos ?? 0,
        pedidos: prev?.pedidos || [],
      }
    })
    localStorage.setItem('cpmanager_clientes', JSON.stringify([...gestorMapped, ...gestorOnly]))
  }, [clientes])

  const [search, setSearch] = useState('')
  const [filterTipo, setFilterTipo] = useState('todos')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteModal, setDeleteModal] = useState(null)
  const [editTarget, setEditTarget] = useState(null)
  const [historialCliente, setHistorialCliente] = useState(null)
  const [historialPage, setHistorialPage] = useState(1)

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({ defaultValues: { tipo: 'individual' } })
  const tipoWatched = watch('tipo')

  const filtered = clientes.filter(c => {
    const matchSearch = c.nombre.toLowerCase().includes(search.toLowerCase())
    const matchTipo = filterTipo === 'todos' || c.tipo === filterTipo
    return matchSearch && matchTipo
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => { setPage(1) }, [search, filterTipo])

  useEffect(() => {
    function onKey(e) {
      if (e.key !== 'Escape') return
      if (deleteModal) { setDeleteModal(null); return }
      if (modalOpen) { setModalOpen(false); return }
      if (historialCliente) setHistorialCliente(null)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [modalOpen, deleteModal, historialCliente])

  const historialOrdenes = useMemo(
    () => historialCliente ? buildHistorialFromGestor(historialCliente.id) : [],
    [historialCliente]
  )
  const HIST_PAGE_SIZE = 5
  const historialTotalPages = Math.max(1, Math.ceil(historialOrdenes.length / HIST_PAGE_SIZE))
  const historialPaginated = historialOrdenes.slice((historialPage - 1) * HIST_PAGE_SIZE, historialPage * HIST_PAGE_SIZE)

  function openCreate() {
    setEditTarget(null)
    reset({ tipo: 'individual', nombre: '', informacion: '' })
    setModalOpen(true)
  }

  function openEdit(c) {
    setEditTarget(c)
    reset({ tipo: c.tipo, nombre: c.nombre, informacion: c.informacion })
    setModalOpen(true)
  }

  function onSubmit(data) {
    if (editTarget) {
      setClientes(prev => prev.map(c => c.id === editTarget.id ? { ...c, ...data } : c))
    } else {
      setClientes(prev => [...prev, { id: Date.now(), tipo: data.tipo, nombre: data.nombre, informacion: data.informacion, fechaRegistro: new Date().toISOString().split('T')[0] }])
    }
    setModalOpen(false)
  }

  function confirmDelete() {
    if (!deleteModal) return
    setClientes(prev => prev.filter(c => c.id !== deleteModal.id))
    setDeleteModal(null)
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1>Clientes</h1>
        <p className="text-muted-foreground mt-1">Gestiona clientes individuales y equipos deportivos</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Buscar cliente o equipo..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="flex rounded-lg border border-border overflow-hidden">
            {['todos', 'individual', 'equipo'].map(t => (
              <button key={t} onClick={() => setFilterTipo(t)} className={`px-3 py-2 text-sm transition-colors ${filterTipo === t ? 'bg-primary text-primary-foreground' : 'hover:bg-accent text-muted-foreground'}`}>
                {t === 'todos' ? 'Todos' : t === 'individual' ? 'Individuales' : 'Equipos'}
              </button>
            ))}
          </div>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Nuevo Cliente
        </button>
      </div>

      <div className="border border-border rounded-xl overflow-hidden bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 text-muted-foreground">#</th>
              <th className="text-left px-4 py-3 text-muted-foreground">Nombre</th>
              <th className="text-left px-4 py-3 text-muted-foreground">Información</th>
              <th className="text-left px-4 py-3 text-muted-foreground">Tipo</th>
              <th className="text-left px-4 py-3 text-muted-foreground">Registro</th>
              <th className="text-left px-4 py-3 text-muted-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No se encontraron clientes</td></tr>
            ) : (
              paginated.map((c, idx) => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${c.tipo === 'equipo' ? 'bg-orange-100' : 'bg-blue-100'}`}>
                        {c.tipo === 'equipo' ? <Users className="w-4 h-4 text-orange-600" /> : <UserCircle className="w-4 h-4 text-blue-600" />}
                      </div>
                      <span>{c.nombre}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground max-w-xs">{c.informacion ? <span className="truncate block">{c.informacion}</span> : <span className="text-muted-foreground/50">—</span>}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs ${c.tipo === 'equipo' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                      {c.tipo === 'equipo' ? <Users className="w-3 h-3" /> : <UserCircle className="w-3 h-3" />}
                      {c.tipo === 'equipo' ? 'Equipo' : 'Individual'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.fechaRegistro}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setHistorialCliente(c); setHistorialPage(1) }} className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" title="Historial"><ClipboardList className="w-4 h-4" /></button>
                      <button onClick={() => openEdit(c)} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" title="Editar"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteModal(c)} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onPage={setPage} totalItems={filtered.length} pageSize={PAGE_SIZE} />

      {historialCliente && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setHistorialCliente(null)}>
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${historialCliente.tipo === 'equipo' ? 'bg-orange-100' : 'bg-blue-100'}`}>
                  {historialCliente.tipo === 'equipo' ? <Users className="w-5 h-5 text-orange-600" /> : <UserCircle className="w-5 h-5 text-blue-600" />}
                </div>
                <div>
                  <h2>{historialCliente.nombre}</h2>
                  <p className="text-sm text-muted-foreground">Historial de pedidos — {historialOrdenes.length} {historialOrdenes.length === 1 ? 'orden' : 'órdenes'}</p>
                </div>
              </div>
              <button onClick={() => setHistorialCliente(null)} className="p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              {historialOrdenes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Package className="w-12 h-12 text-muted-foreground/40 mb-3" />
                  <p className="text-muted-foreground">Sin pedidos registrados</p>
                </div>
              ) : (
                <>
                  <div className="border border-border rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 border-b border-border">
                        <tr>
                          <th className="text-left px-4 py-3 text-muted-foreground">ID de Orden</th>
                          <th className="text-left px-4 py-3 text-muted-foreground">Descripción</th>
                          <th className="text-left px-4 py-3 text-muted-foreground">Fecha</th>
                          <th className="text-left px-4 py-3 text-muted-foreground">Entrega</th>
                          <th className="text-left px-4 py-3 text-muted-foreground">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historialPaginated.map(o => (
                          <tr key={o.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3 font-mono text-xs">{o.id}</td>
                            <td className="px-4 py-3 text-muted-foreground max-w-xs">{o.descripcion}</td>
                            <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{o.fecha}</td>
                            <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{o.entrega}</td>
                            <td className="px-4 py-3"><span className={`inline-block px-2.5 py-0.5 rounded-full text-xs ${estadoOrdenConfig[o.estado].color}`}>{estadoOrdenConfig[o.estado].label}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Pagination page={historialPage} totalPages={historialTotalPages} onPage={setHistorialPage} totalItems={historialOrdenes.length} pageSize={HIST_PAGE_SIZE} />
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setModalOpen(false)}>
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md mx-4 p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><UserCircle className="w-5 h-5 text-primary" /></div>
              <div>
                <h2>{editTarget ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
                <p className="text-sm text-muted-foreground">{editTarget ? 'Modifica los datos del cliente' : 'Registra un nuevo cliente o equipo'}</p>
              </div>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Tipo de cliente</label>
                <div className="flex rounded-lg border border-border overflow-hidden">
                  {['individual', 'equipo'].map(t => (
                    <label key={t} className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm cursor-pointer transition-colors ${tipoWatched === t ? 'bg-primary text-primary-foreground' : 'hover:bg-accent text-muted-foreground'}`}>
                      <input type="radio" value={t} {...register('tipo')} className="sr-only" />
                      {t === 'equipo' ? <Users className="w-4 h-4" /> : <UserCircle className="w-4 h-4" />}
                      {t === 'equipo' ? 'Equipo' : 'Individual'}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1">{tipoWatched === 'equipo' ? 'Nombre del equipo' : 'Nombre completo'}</label>
                <input {...register('nombre', { required: 'El nombre es requerido' })} type="text" placeholder={tipoWatched === 'equipo' ? 'Ej. Club Deportivo Águilas' : 'Ej. Juan Pérez'} className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                {errors.nombre && <p className="text-xs text-destructive mt-1">{errors.nombre.message}</p>}
              </div>
              <div>
                <label className="block text-sm mb-1">Información</label>
                <textarea {...register('informacion')} rows={3} placeholder="Notas adicionales, colores, tallas, referencias..." className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm hover:bg-accent transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:opacity-90 transition-opacity">{editTarget ? 'Guardar Cambios' : 'Registrar Cliente'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDeleteModal(null)}>
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-sm mx-4 p-6" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4"><Trash2 className="w-6 h-6 text-destructive" /></div>
            <h2 className="text-center mb-2">Eliminar Cliente</h2>
            <p className="text-center text-sm text-muted-foreground mb-6">¿Estás seguro de eliminar a <strong>{deleteModal.nombre}</strong>? Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal(null)} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm hover:bg-accent transition-colors">Cancelar</button>
              <button onClick={confirmDelete} className="flex-1 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm hover:opacity-90 transition-opacity">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
