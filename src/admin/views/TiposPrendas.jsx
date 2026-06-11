import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { useForm } from 'react-hook-form'

const ICONOS = [
  { id: 'superiores', emoji: 'https://img.icons8.com/?size=100&id=10506&format=png&color=000000', label: 'Prenda superior', desc: 'Playeras, polos, chamarras...' },
  { id: 'inferiores', emoji: 'https://img.icons8.com/?size=100&id=10179&format=png&color=000000', label: 'Prenda inferior', desc: 'Shorts, capris, pants...' },
  { id: 'accesorios', emoji: 'https://img.icons8.com/?size=100&id=wdwLFtw3Nu2p&format=png&color=000000', label: 'Accesorio', desc: 'Gorras, maletas, bolsos...' },
  { id: 'otros', emoji: 'https://img.icons8.com/?size=100&id=8286&format=png&color=000000', label: 'Otro', desc: 'Otros tipos de prenda' },
]

const iconoEmoji = {
  superiores: 'https://img.icons8.com/?size=100&id=10506&format=png&color=000000',
  inferiores: 'https://img.icons8.com/?size=100&id=10179&format=png&color=000000',
  accesorios: 'https://img.icons8.com/?size=100&id=wdwLFtw3Nu2p&format=png&color=000000',
  otros: 'https://img.icons8.com/?size=100&id=8286&format=png&color=000000',
}

const iconoBg = { superiores: 'bg-gray-100', inferiores: 'bg-gray-100', accesorios: 'bg-gray-100', otros: 'bg-gray-50' }

const ICONO_EMOJI = { superiores: '👕', inferiores: '🩳', accesorios: '🎒', otros: '📦' }
const TALLAS_DEFAULT = { superiores: ['XS','S','M','L','XL','XXL'], inferiores: ['XS','S','M','L','XL'], accesorios: ['Única'], otros: ['Única'] }

const initialPrendas = [
  { id: 1, nombre: 'U. Completo', icono: 'superiores' },
  { id: 2, nombre: 'Polo', icono: 'superiores' },
  { id: 3, nombre: 'Playera', icono: 'superiores' },
  { id: 4, nombre: 'Chamarra', icono: 'superiores' },
  { id: 5, nombre: 'Pants', icono: 'inferiores' },
  { id: 6, nombre: 'Capri', icono: 'inferiores' },
  { id: 7, nombre: 'Short', icono: 'inferiores' },
  { id: 8, nombre: 'Bermuda', icono: 'inferiores' },
  { id: 9, nombre: 'Casacas', icono: 'superiores' },
  { id: 10, nombre: 'Sudadera', icono: 'superiores' },
  { id: 11, nombre: 'Gorra', icono: 'accesorios' },
  { id: 12, nombre: 'Maleta', icono: 'accesorios' },
  { id: 13, nombre: 'Otro', icono: 'otros' },
]

export function TiposPrendas() {
  const [prendas, setPrendas] = useState(initialPrendas)

  useEffect(() => {
    const mapped = prendas.map(p => ({ id: 'pt' + p.id, nombre: p.nombre, icono: ICONO_EMOJI[p.icono], tallas: TALLAS_DEFAULT[p.icono] }))
    localStorage.setItem('cp_prendas', JSON.stringify(mapped))
  }, [prendas])

  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteModal, setDeleteModal] = useState(null)
  const [editTarget, setEditTarget] = useState(null)

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({ defaultValues: { nombre: '', icono: 'superiores' } })

  useEffect(() => {
    function onKey(e) {
      if (e.key !== 'Escape') return
      if (deleteModal) { setDeleteModal(null); return }
      if (modalOpen) setModalOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [modalOpen, deleteModal])
  const iconoWatched = watch('icono')

  const filtered = prendas.filter(p => p.nombre.toLowerCase().includes(search.toLowerCase()))

  function openCreate() { setEditTarget(null); reset({ nombre: '', icono: 'superiores' }); setModalOpen(true) }
  function openEdit(p) { setEditTarget(p); reset({ nombre: p.nombre, icono: p.icono }); setModalOpen(true) }

  function onSubmit(data) {
    if (editTarget) {
      setPrendas(prev => prev.map(p => p.id === editTarget.id ? { ...p, ...data } : p))
    } else {
      setPrendas(prev => [...prev, { id: Date.now(), nombre: data.nombre, icono: data.icono }])
    }
    setModalOpen(false)
  }

  function confirmDelete() {
    if (!deleteModal) return
    setPrendas(prev => prev.filter(p => p.id !== deleteModal.id))
    setDeleteModal(null)
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1>Tipos de Prendas</h1>
        <p className="text-muted-foreground mt-1">Gestiona los tipos de prendas disponibles para las órdenes</p>
      </div>

      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Buscar prenda..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Nueva Prenda
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <img alt="" src="https://img.icons8.com/?size=100&id=10506&format=png&color=000000" className="w-12 mb-4 opacity-40" />
          <p className="text-muted-foreground">No se encontraron prendas</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filtered.map(p => (
            <div key={p.id} className="bg-card border border-border rounded-xl flex flex-col items-center pt-6 pb-4 px-3 hover:border-primary/40 hover:shadow-sm transition-all group">
              <div className={`w-16 h-16 rounded-2xl ${iconoBg[p.icono]} flex items-center justify-center mb-3`}>
                <img src={iconoEmoji[p.icono]} alt="" style={{ width: '44px' }} />
              </div>
              <p className="text-sm text-center leading-tight mb-4 px-1">{p.nombre}</p>
              <div className="flex items-center gap-2 mt-auto">
                <button onClick={() => openEdit(p)} title={`Editar ${p.nombre}`} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => setDeleteModal(p)} title={`Eliminar ${p.nombre}`} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-4 text-xs text-muted-foreground">{filtered.length} de {prendas.length} prendas</p>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setModalOpen(false)}>
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-sm mx-4 p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <img src={iconoEmoji[iconoWatched]} alt="" style={{ width: '24px' }} />
              </div>
              <div>
                <h2>{editTarget ? 'Editar Prenda' : 'Nueva Prenda'}</h2>
                <p className="text-sm text-muted-foreground">{editTarget ? 'Modifica el tipo de prenda' : 'Define el nuevo tipo de prenda'}</p>
              </div>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm mb-1">Nombre de la prenda</label>
                <input {...register('nombre', { required: 'El nombre es requerido' })} type="text" placeholder="Ej. Playera" className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                {errors.nombre && <p className="text-xs text-destructive mt-1">{errors.nombre.message}</p>}
              </div>
              <div>
                <label className="block text-sm mb-2">Icono representativo</label>
                <div className="grid grid-cols-2 gap-2">
                  {ICONOS.map(ic => (
                    <label key={ic.id} title={ic.desc} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${iconoWatched === ic.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40 hover:bg-muted/30'}`}>
                      <input type="radio" value={ic.id} {...register('icono')} onChange={() => setValue('icono', ic.id)} className="sr-only" />
                      <img src={ic.emoji} alt="" style={{ width: '24px' }} />
                      <div><p className="text-xs leading-tight">{ic.label}</p></div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm hover:bg-accent transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:opacity-90 transition-opacity">{editTarget ? 'Guardar Cambios' : 'Crear Prenda'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDeleteModal(null)}>
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-sm mx-4 p-6" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4"><Trash2 className="w-6 h-6 text-destructive" /></div>
            <h2 className="text-center mb-2">Eliminar Prenda</h2>
            <p className="text-center text-sm text-muted-foreground mb-6">¿Estás seguro de eliminar <strong>{deleteModal.nombre}</strong>? Esta acción no se puede deshacer.</p>
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
