import { useState, useEffect, useRef } from 'react'
import { Plus, Pencil, Trash2, Search, X, Circle, Square, AlignLeft, Tag, ChevronDown, Eye } from 'lucide-react'
import { Pagination } from './Pagination'
import { getDoc, setDoc } from '../../storage' // <-- Importamos los métodos de PouchDB

const tipoConfig = {
  radio: { label: 'Varias opciones', color: 'bg-blue-100 text-blue-700' },
  checkbox: { label: 'Casillas', color: 'bg-purple-100 text-purple-700' },
  texto: { label: 'Respuesta corta', color: 'bg-green-100 text-green-700' },
}

const tipoItems = [
  { value: 'radio', label: 'Varias opciones' },
  { value: 'checkbox', label: 'Casillas' },
  { value: 'texto', label: 'Respuesta corta' },
]

// Usaremos esto como datos por defecto si la base de datos está vacía
const initialActividades = [
  { id: 1, nombre: 'Color de la prenda', tipo: 'radio', opciones: ['Azul marino', 'Rojo', 'Verde', 'Negro', 'Blanco'], etiquetas: ['color', 'uniforme'], nota: '' },
  { id: 2, nombre: 'Talla del jugador', tipo: 'radio', opciones: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], etiquetas: ['talla', 'medidas'], nota: '' },
  { id: 3, nombre: 'Personalización adicional', tipo: 'checkbox', opciones: ['Número en espalda', 'Nombre del jugador', 'Escudo bordado', 'Patrocinador'], etiquetas: ['personalización'], nota: 'El tiempo de fabricación se extiende 10–15 días hábiles. Coordina con el cliente.' },
  { id: 4, nombre: 'Número del jugador', tipo: 'texto', opciones: [], etiquetas: ['número', 'personalización'], nota: '' },
  { id: 5, nombre: 'Material preferido', tipo: 'radio', opciones: ['Poliéster', 'Algodón', 'Dry-fit', 'Lycra'], etiquetas: ['material'], nota: '' },
]

const PAGE_SIZE = 5

function ActividadBuilder({ initial, onSave, onCancel, isEdit, isView }) {
  const [nombre, setNombre] = useState(initial.nombre)
  const [tipo, setTipo] = useState(initial.tipo)
  const [opciones, setOpciones] = useState(initial.opciones.length > 0 ? initial.opciones : ['Opción 1', 'Opción 2'])
  const [etiquetas, setEtiquetas] = useState(initial.etiquetas)
  const [etiquetaInput, setEtiquetaInput] = useState('')
  const [nota, setNota] = useState(initial.nota || '') // <-- Nuevo estado exclusivo para la nota
  const [tipoOpen, setTipoOpen] = useState(false)
  const [nombreError, setNombreError] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function onDoc(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setTipoOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  function handleTipo(t) {
    if (isView) return
    setTipo(t)
    setTipoOpen(false)
    if (t !== 'texto' && opciones.length === 0) setOpciones(['Opción 1', 'Opción 2'])
  }

  function addOpcion() { if (!isView) setOpciones(p => [...p, `Opción ${p.length + 1}`]) }
  function removeOpcion(i) { if (!isView) setOpciones(p => p.filter((_, j) => j !== i)) }
  function updateOpcion(i, v) { if (!isView) setOpciones(p => p.map((o, j) => j === i ? v : o)) }

  function addEtiqueta() {
    if (isView) return
    const tag = etiquetaInput.trim().toLowerCase()
    if (!tag || etiquetas.includes(tag)) { setEtiquetaInput(''); return }
    setEtiquetas(p => [...p, tag])
    setEtiquetaInput('')
  }

  function handleSave() {
    if (isView) return
    if (!nombre.trim()) { setNombreError(true); return }
    // Incluimos la nota en el objeto que se guarda
    onSave({ nombre: nombre.trim(), tipo, opciones: tipo === 'texto' ? [] : opciones.filter(o => o.trim()), etiquetas, nota: nota.trim() })
  }

  const TipoIcon = tipo === 'radio' ? Circle : tipo === 'checkbox' ? Square : AlignLeft

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onCancel}>
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-border flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
            <Tag className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2>{isView ? 'Ver Actividad' : isEdit ? 'Editar Actividad' : 'Nueva Actividad'}</h2>
            <p className="text-sm text-muted-foreground">{isView ? 'Detalles y configuración de la actividad' : isEdit ? 'Modifica los datos de la actividad' : 'Configura la actividad y sus opciones de respuesta'}</p>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-4">
          <div className="border border-border rounded-xl overflow-hidden">
            <div className="h-1 bg-primary" />
            <div className="p-5">
              <div className="flex gap-3 items-start mb-6">
                <div className="flex-1">
                  <input
                    value={nombre}
                    disabled={isView}
                    onChange={e => { setNombre(e.target.value); setNombreError(false) }}
                    placeholder="Actividad sin título"
                    className={`w-full bg-muted/40 px-3 py-2.5 rounded-t-lg border-b-2 focus:outline-none transition-colors ${isView ? 'cursor-not-allowed opacity-80' : ''} ${nombreError ? 'border-b-destructive' : 'border-b-border focus:border-b-primary'}`}
                  />
                  {nombreError && <p className="text-xs text-destructive mt-1">El nombre es requerido</p>}
                </div>
                <div className="relative shrink-0" ref={dropdownRef}>
                  <button type="button" disabled={isView} onClick={() => setTipoOpen(p => !p)} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border bg-card transition-colors text-sm ${isView ? 'cursor-not-allowed opacity-80' : 'hover:bg-accent'}`}>
                    <TipoIcon className="w-4 h-4 text-muted-foreground" />
                    <span>{tipoConfig[tipo].label}</span>
                    {!isView && <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${tipoOpen ? 'rotate-180' : ''}`} />}
                  </button>
                  {tipoOpen && !isView && (
                    <div className="absolute right-0 top-full mt-1 w-52 bg-card border border-border rounded-xl shadow-lg z-10 overflow-hidden py-1">
                      {tipoItems.map(item => {
                        const Icon = item.value === 'radio' ? Circle : item.value === 'checkbox' ? Square : AlignLeft
                        return (
                          <button key={item.value} type="button" onClick={() => handleTipo(item.value)} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent transition-colors ${tipo === item.value ? 'bg-muted' : ''}`}>
                            <Icon className="w-4 h-4 text-muted-foreground" />
                            {item.label}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              {tipo === 'texto' ? (
                <div className="pl-1">
                  <input disabled placeholder="El participante escribirá su respuesta aquí..." className="w-80 bg-transparent border-0 border-b border-dashed border-muted-foreground/40 py-1 text-sm text-muted-foreground cursor-not-allowed focus:outline-none" />
                </div>
              ) : (
                <div className="space-y-1.5">
                  {opciones.map((op, idx) => (
                    <div key={idx} className="flex items-center gap-3 group">
                      {tipo === 'radio' ? <Circle className="w-4 h-4 text-muted-foreground/40 shrink-0" /> : <Square className="w-4 h-4 text-muted-foreground/40 shrink-0" />}
                      <input value={op} disabled={isView} onChange={e => updateOpcion(idx, e.target.value)} className={`flex-1 bg-transparent border-0 border-b border-border py-1 text-sm focus:outline-none transition-colors ${isView ? 'cursor-not-allowed text-muted-foreground' : 'focus:border-primary'}`} />
                      {!isView && (
                        <button type="button" onClick={() => removeOpcion(idx)} className="opacity-0 group-hover:opacity-100 p-1 rounded text-muted-foreground hover:text-foreground transition-all"><X className="w-4 h-4" /></button>
                      )}
                    </div>
                  ))}
                  {!isView && (
                    <div className="flex items-center gap-3 mt-2 pt-1">
                      {tipo === 'radio' ? <Circle className="w-4 h-4 text-muted-foreground/25 shrink-0" /> : <Square className="w-4 h-4 text-muted-foreground/25 shrink-0" />}
                      <button type="button" onClick={addOpcion} className="text-sm text-primary hover:underline focus:outline-none">Añadir opción</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="border border-border rounded-xl p-5">
            {!isView && (
              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Agregar etiqueta</span>
                <div className="flex-1 h-px bg-border" />
                <input value={etiquetaInput} onChange={e => setEtiquetaInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addEtiqueta() } }} placeholder="nueva etiqueta" className="px-3 py-1.5 rounded-lg border border-border bg-input-background text-sm w-40 focus:outline-none focus:ring-2 focus:ring-ring" />
                <button type="button" onClick={addEtiqueta} className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity shrink-0"><Plus className="w-4 h-4" /></button>
              </div>
            )}
            {etiquetas.length === 0 ? (
              <p className="text-xs text-muted-foreground/50 italic">Sin etiquetas añadidas</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {etiquetas.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-sm text-muted-foreground">
                    {tag}
                    {!isView && <button type="button" onClick={() => setEtiquetas(p => p.filter(e => e !== tag))} className="hover:text-destructive transition-colors"><X className="w-3 h-3" /></button>}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* NUEVA SECCIÓN DE NOTAS */}
          <div className="border border-border rounded-xl p-5 bg-muted/10">
            {!isView ? (
              <div className="flex flex-col gap-2 mb-2">
                <span className="text-sm font-semibold text-foreground">Nota / Aviso de la actividad (Opcional)</span>
                <textarea 
                  value={nota} 
                  onChange={e => setNota(e.target.value)} 
                  placeholder="Ej. El tiempo de fabricación se extiende 10–15 días hábiles..." 
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  rows={2}
                />
              </div>
            ) : (
              <div className="flex flex-col gap-2 mb-2">
                <span className="text-sm font-semibold text-foreground">Nota / Aviso de la actividad</span>
                <p className="text-sm text-muted-foreground bg-input-background p-2 rounded-md border border-border">
                  {nota || <span className="italic opacity-50">Sin nota configurada</span>}
                </p>
              </div>
            )}
            <p className="text-xs text-muted-foreground/60 italic mt-2">Esta nota será visible para el Gestor de Órdenes como un aviso al momento de configurar una nueva orden de producción.</p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
          {isView ? (
            <button type="button" onClick={onCancel} className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:opacity-90 transition-opacity">Cerrar</button>
          ) : (
            <>
              <button type="button" onClick={onCancel} className="px-5 py-2 rounded-lg border border-border text-sm hover:bg-accent transition-colors">Cancelar</button>
              <button type="button" onClick={handleSave} className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:opacity-90 transition-opacity">{isEdit ? 'Guardar Cambios' : 'Guardar Actividad'}</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export function Actividades() {
  const [actividades, setActividades] = useState([]) // Inicializa vacío para cargar la BD
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [builderOpen, setBuilderOpen] = useState(false)
  const [isViewMode, setIsViewMode] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteModal, setDeleteModal] = useState(null)
  
  const loadedRef = useRef(false) // Referencia para saber si ya cargamos la BD

  // 1. CARGA DESDE POUCHDB AL MONTAR
  useEffect(() => {
    getDoc('cp_v5_actividades', initialActividades)
      .then(saved => {
        if (saved && Array.isArray(saved)) {
          setActividades(saved)
        }
      })
      .catch(console.warn)
      .finally(() => {
        loadedRef.current = true
      })
  }, [])

  // 2. GUARDADO AUTOMÁTICO EN POUCHDB CUANDO CAMBIAN LAS ACTIVIDADES
  useEffect(() => {
    if (!loadedRef.current) return
    setDoc('cp_v5_actividades', actividades).catch(console.warn)
  }, [actividades])

  const filtered = actividades.filter(a =>
    a.nombre.toLowerCase().includes(search.toLowerCase()) ||
    a.etiquetas.some(e => e.includes(search.toLowerCase()))
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => { setPage(1) }, [search])

  useEffect(() => {
    function onKey(e) {
      if (e.key !== 'Escape') return
      if (deleteModal) { setDeleteModal(null); return }
      if (builderOpen) setBuilderOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [builderOpen, deleteModal])

  function openCreate() { setEditTarget(null); setIsViewMode(false); setBuilderOpen(true) }
  function openEdit(a) { setEditTarget(a); setIsViewMode(false); setBuilderOpen(true) }
  function openView(a) { setEditTarget(a); setIsViewMode(true); setBuilderOpen(true) }

  function handleSave(data) {
    if (editTarget) {
      setActividades(prev => prev.map(a => a.id === editTarget.id ? { ...a, ...data } : a))
    } else {
      setActividades(prev => [...prev, { id: Date.now(), ...data }])
    }
    setBuilderOpen(false)
  }

  function confirmDelete() {
    if (!deleteModal) return
    setActividades(prev => prev.filter(a => a.id !== deleteModal.id))
    setDeleteModal(null)
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1>Actividades</h1>
        <p className="text-muted-foreground mt-1">Define las preguntas y opciones que se incluirán en las órdenes de producción</p>
      </div>

      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Buscar actividad o etiqueta..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Nueva Actividad
        </button>
      </div>

      <div className="border border-border rounded-xl overflow-hidden bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 text-muted-foreground">#</th>
              <th className="text-left px-4 py-3 text-muted-foreground">Actividad</th>
              <th className="text-left px-4 py-3 text-muted-foreground">Tipo de respuesta</th>
              <th className="text-left px-4 py-3 text-muted-foreground">Opciones</th>
              <th className="text-left px-4 py-3 text-muted-foreground">Etiquetas</th>
              <th className="text-left px-4 py-3 text-muted-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No se encontraron actividades</td></tr>
            ) : (
              paginated.map((a, idx) => {
                const cfg = tipoConfig[a.tipo]
                return (
                  <tr key={a.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                    <td className="px-4 py-3">
                      <div>{a.nombre}</div>
                      {/* Un pequeño indicador si la actividad tiene nota */}
                      {a.nota && <span className="text-[10px] text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-sm inline-block mt-1">Nota</span>}
                    </td>
                    <td className="px-4 py-3"><span className={`inline-block px-2.5 py-0.5 rounded-full text-xs ${cfg.color}`}>{cfg.label}</span></td>
                    <td className="px-4 py-3 text-muted-foreground">{a.tipo === 'texto' ? <span className="italic text-xs">Libre</span> : `${a.opciones.length} opciones`}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {a.etiquetas.length === 0
                          ? <span className="text-muted-foreground/50 text-xs">—</span>
                          : a.etiquetas.map(tag => <span key={tag} className="inline-block px-2 py-0.5 rounded-full bg-muted text-xs">{tag}</span>)
                        }
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openView(a)} title="Ver detalles" className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => openEdit(a)} title="Editar" className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteModal(a)} title="Eliminar" className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onPage={setPage} totalItems={filtered.length} pageSize={PAGE_SIZE} />

      {builderOpen && (
        <ActividadBuilder
          initial={{ 
            nombre: editTarget?.nombre ?? '', 
            tipo: editTarget?.tipo ?? 'radio', 
            opciones: editTarget?.opciones ?? [], 
            etiquetas: editTarget?.etiquetas ?? [],
            nota: editTarget?.nota ?? '' // <-- Pasamos la nota al inicializador
          }}
          isEdit={!!editTarget && !isViewMode}
          isView={isViewMode}
          onSave={handleSave}
          onCancel={() => setBuilderOpen(false)}
        />
      )}

      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDeleteModal(null)}>
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-sm mx-4 p-6" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4"><Trash2 className="w-6 h-6 text-destructive" /></div>
            <h2 className="text-center mb-2">Eliminar Actividad</h2>
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