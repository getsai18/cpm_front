import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Search, MonitorSmartphone } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Pagination } from './Pagination'

const PAGE_SIZE = 5

const estadoConfig = {
  activo: { label: 'Activo', color: 'bg-green-100 text-green-700' },
  inactivo: { label: 'Inactivo', color: 'bg-gray-100 text-gray-600' },
}

export function Usuarios({ areas, usuarios, setUsuarios }) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteModal, setDeleteModal] = useState(null)
  const [editTarget, setEditTarget] = useState(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const filtered = usuarios.filter(u =>
    u.nombre.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => { setPage(1) }, [search])

  useEffect(() => {
    function onKey(e) {
      if (e.key !== 'Escape') return
      if (deleteModal) { setDeleteModal(null); return }
      if (modalOpen) setModalOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [modalOpen, deleteModal])

  const areaName = (areaId) => areas.find(a => a.id === areaId)?.nombre ?? '—'

  const availableAreas = areas.filter(a =>
    !usuarios.some(u => u.areaId === a.id && u.id !== editTarget?.id)
  )

  function openCreate() {
    setEditTarget(null)
    reset({ nombre: '', email: '', areaId: '', password: '', estado: 'activo' })
    setModalOpen(true)
  }

  function openEdit(u) {
    setEditTarget(u)
    reset({ nombre: u.nombre, email: u.email, areaId: u.areaId ?? '', estado: u.estado })
    setModalOpen(true)
  }

  function onSubmit(data) {
    const areaId = data.areaId === '' ? null : Number(data.areaId)
    if (editTarget) {
      setUsuarios(prev => prev.map(u => u.id === editTarget.id ? { ...u, ...data, areaId } : u))
    } else {
      const nuevo = {
        id: Date.now(),
        nombre: data.nombre,
        email: data.email,
        areaId,
        estado: 'activo',
        fechaCreacion: new Date().toISOString().split('T')[0],
      }
      setUsuarios(prev => [...prev, nuevo])
    }
    setModalOpen(false)
  }

  function confirmDelete() {
    if (!deleteModal) return
    setUsuarios(prev => prev.filter(u => u.id !== deleteModal.id))
    setDeleteModal(null)
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1>Usuarios</h1>
        <p className="text-muted-foreground mt-1">Un usuario (dispositivo) por área de producción</p>
      </div>

      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" /> Nuevo Usuario
        </button>
      </div>

      <div className="border border-border rounded-xl overflow-hidden bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 text-muted-foreground">#</th>
              <th className="text-left px-4 py-3 text-muted-foreground">Nombre</th>
              <th className="text-left px-4 py-3 text-muted-foreground">Correo</th>
              <th className="text-left px-4 py-3 text-muted-foreground">Área</th>
              <th className="text-left px-4 py-3 text-muted-foreground">Estado</th>
              <th className="text-left px-4 py-3 text-muted-foreground">Fecha de Alta</th>
              <th className="text-left px-4 py-3 text-muted-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">No se encontraron usuarios</td>
              </tr>
            ) : (
              paginated.map((u, idx) => (
                <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <MonitorSmartphone className="w-4 h-4 text-primary" />
                      </div>
                      <span>{u.nombre}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3">
                    {u.areaId ? (
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">{areaName(u.areaId)}</span>
                    ) : (
                      <span className="text-muted-foreground">Sin área</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs ${estadoConfig[u.estado].color}`}>
                      {estadoConfig[u.estado].label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{u.fechaCreacion}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(u)} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" title="Editar">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteModal(u)} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" title="Eliminar">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onPage={setPage} totalItems={filtered.length} pageSize={PAGE_SIZE} />

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setModalOpen(false)}>
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md mx-4 p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <MonitorSmartphone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2>{editTarget ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
                <p className="text-sm text-muted-foreground">{editTarget ? 'Modifica los datos del dispositivo' : 'Registra un dispositivo de área'}</p>
              </div>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Nombre</label>
                <input {...register('nombre', { required: 'El nombre es requerido' })} type="text" placeholder="Ej. Área Corte" className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                {errors.nombre && <p className="text-xs text-destructive mt-1">{errors.nombre.message}</p>}
              </div>
              <div>
                <label className="block text-sm mb-1">Correo electrónico</label>
                <input {...register('email', { required: 'El correo es requerido', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Correo inválido' } })} type="email" placeholder="area@uniformespro.com" className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
              </div>
              {!editTarget && (
                <div>
                  <label className="block text-sm mb-1">Contraseña</label>
                  <input {...register('password', { required: 'La contraseña es requerida', minLength: { value: 6, message: 'Mínimo 6 caracteres' } })} type="password" placeholder="••••••••" className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
                </div>
              )}
              <div>
                <label className="block text-sm mb-1">Área asignada</label>
                <select {...register('areaId')} className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Sin área</option>
                  {availableAreas.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                  {editTarget && editTarget.areaId && !availableAreas.find(a => a.id === editTarget.areaId) && (
                    <option value={editTarget.areaId}>{areaName(editTarget.areaId)}</option>
                  )}
                </select>
              </div>
              {editTarget && (
                <div>
                  <label className="block text-sm mb-1">Estado</label>
                  <select {...register('estado')} className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm hover:bg-accent transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:opacity-90 transition-opacity">{editTarget ? 'Guardar Cambios' : 'Crear Usuario'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDeleteModal(null)}>
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-sm mx-4 p-6" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-destructive" />
            </div>
            <h2 className="text-center mb-2">Eliminar Usuario</h2>
            <p className="text-center text-sm text-muted-foreground mb-6">
              ¿Estás seguro de eliminar a <strong>{deleteModal.nombre}</strong>?{' '}
              {deleteModal.areaId && <span>El área <strong>{areaName(deleteModal.areaId)}</strong> quedará inactiva.</span>}
            </p>
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
