import { useState, useEffect, useRef } from 'react'
import { Search, CheckCircle, XCircle, Clock, Eye, AlertTriangle } from 'lucide-react'
import { getDoc, setDoc } from '../../storage'

export function Incidencias() {
  const [incidencias, setIncidencias] = useState([])
  const [search, setSearch] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos') // todos, pendiente, aceptada, rechazada
  const [detalleModal, setDetalleModal] = useState(null)
  
  const loadedRef = useRef(false)

  // 1. Cargar las incidencias al montar el componente (Siguiendo el patrón de TiposPrendas)
  useEffect(() => {
    getDoc('cp_v5_incidencias', [])
      .then(saved => {
        if (saved && Array.isArray(saved)) {
          setIncidencias(saved)
        }
      })
      .catch(console.warn)
      .finally(() => {
        loadedRef.current = true
      })
  }, [])

  // 2. Persistir automáticamente en PouchDB mediante setDoc cuando el estado cambie
  useEffect(() => {
    if (!loadedRef.current) return
    setDoc('cp_v5_incidencias', incidencias).catch(console.warn)
  }, [incidencias])

  // Cierre de modales con la tecla Escape
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape' && detalleModal) {
        setDetalleModal(null)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [detalleModal])

  // 3. Manejo de Acciones del Administrador (Aceptar / Rechazar)
  const resolverIncidencia = (id, nuevoEstado) => {
    setIncidencias(prev =>
      prev.map(inc =>
        inc.id === id 
          ? { ...inc, estado: nuevoEstado, fechaResolucion: new Date().toISOString() } 
          : inc
      )
    )
    // Si el modal detallado está abierto, actualizamos su estado visual también
    if (detalleModal && detalleModal.id === id) {
      setDetalleModal(prev => ({ ...prev, estado: nuevoEstado }))
    }
  }

  // 4. Filtrado Avanzado (Buscador por Pedido + Filtro por Estado)
  const filtered = incidencias.filter(inc => {
    const cumpleBusqueda = 
      inc.pedido?.toLowerCase().includes(search.toLowerCase()) ||
      inc.ordenAfectada?.toLowerCase().includes(search.toLowerCase()) ||
      inc.areaOrigen?.toLowerCase().includes(search.toLowerCase())

    const cumpleFiltro = filtroEstado === 'todos' || inc.estado === filtroEstado
    
    return cumpleBusqueda && cumpleFiltro
  })

  // Contadores para los botones de filtrado rápido
  const conteo = {
    todos: incidencias.length,
    pendiente: incidencias.filter(i => i.estado === 'pendiente').length,
    aceptada: incidencias.filter(i => i.estado === 'aceptada').length,
    rechazada: incidencias.filter(i => i.estado === 'rechazada').length,
  }

  // Estilos dinámicos para los badges de estado
  const badgeStyles = {
    pendiente: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    aceptada: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    rechazada: 'bg-destructive/10 text-destructive border-destructive/20'
  }

  return (
    <div className="p-8">
      {/* Encabezado */}
      <div className="mb-8">
        <h1>Gestión de Incidencias Internas</h1>
        <p className="text-muted-foreground mt-1">Panel de revisión y dictamen para reportes de fallas de producción.</p>
      </div>

      {/* Controles: Buscador y Filtros Rápidos */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Buscar por pedido, orden o área..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" 
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {Object.keys(conteo).map(tipo => (
            <button
              key={tipo}
              onClick={() => setFiltroEstado(tipo)}
              className={`px-4 py-2 text-xs font-medium rounded-lg border transition-all capitalize ${
                filtroEstado === tipo 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'bg-card text-muted-foreground border-border hover:bg-accent'
              }`}
            >
              {tipo} ({conteo[tipo]})
            </button>
          ))}
        </div>
      </div>

      {/* Tabla de Incidencias */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-card border border-border rounded-xl">
          <AlertTriangle className="w-12 h-12 mb-4 text-muted-foreground opacity-40" />
          <p className="text-muted-foreground">No se encontraron incidencias bajo estos criterios</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground font-medium">
                <tr>
                  <th className="p-4">Pedido / Orden</th>
                  <th className="p-4">Origen → Responsable</th>
                  <th className="p-4">Falla reportada</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(inc => (
                  <tr key={inc.id} className="hover:bg-muted/20 transition-colors group">
                    <td className="p-4 whitespace-nowrap">
                      <div className="font-semibold">{inc.pedido}</div>
                      <div className="text-xs text-muted-foreground">{inc.ordenAfectada}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-xs font-medium text-primary bg-primary/5 px-2 py-0.5 rounded-md inline-block mb-1">
                        {inc.areaOrigen}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ↳ Responsable: <span className="font-medium text-foreground">{inc.areaResponsable || 'No asignada'}</span>
                      </div>
                    </td>
                    <td className="p-4 max-w-xs md:max-w-md truncate">
                      <div className="font-medium text-foreground">{inc.descripcionFalla}</div>
                      <div className="text-xs text-muted-foreground italic truncate">Acción: {inc.accionInmediata}</div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${badgeStyles[inc.estado || 'pendiente']}`}>
                        {inc.estado || 'pendiente'}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setDetalleModal(inc)}
                          title="Ver detalle completo"
                          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {(inc.estado === 'pendiente' || !inc.estado) && (
                          <>
                            <button 
                              onClick={() => resolverIncidencia(inc.id, 'aceptada')}
                              title="Aceptar Incidencia"
                              className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-500/10 transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => resolverIncidencia(inc.id, 'rechazada')}
                              title="Rechazar Incidencia"
                              className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-border bg-muted/20">
            <p className="text-xs text-muted-foreground">Mostrando {filtered.length} de {incidencias.length} registros</p>
          </div>
        </div>
      )}

      {/* Modal de Detalle y Dictamen */}
      {detalleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDetalleModal(null)}>
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md mx-4 p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            
            {/* Header Modal */}
            <div className="flex items-start justify-between border-b border-border pb-4 mb-4">
              <div>
                <h2 className="text-base font-bold">Detalle de Incidencia Interna</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Pedido: {detalleModal.pedido}</p>
              </div>
              <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${badgeStyles[detalleModal.estado || 'pendiente']}`}>
                {detalleModal.estado || 'pendiente'}
              </span>
            </div>

            {/* Detalles Técnicos */}
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-2 bg-muted/30 p-3 rounded-lg border border-border">
                <div>
                  <span className="text-xs text-muted-foreground block">Área de Origen</span>
                  <span className="font-medium">{detalleModal.areaOrigen}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Área Responsable</span>
                  <span className="font-medium">{detalleModal.areaResponsable}</span>
                </div>
              </div>

              <div>
                <span className="text-xs text-muted-foreground font-semibold block mb-1">Descripción explícita de la falla</span>
                <div className="p-3 bg-input-background border border-border rounded-lg text-foreground whitespace-pre-wrap">
                  {detalleModal.descripcionFalla}
                </div>
              </div>

              <div>
                <span className="text-xs text-muted-foreground font-semibold block mb-1">Acción inmediata requerida</span>
                <div className="p-3 bg-input-background border border-border rounded-lg text-foreground italic">
                  {detalleModal.accionInmediata}
                </div>
              </div>
              
              {detalleModal.fechaResolucion && (
                <div className="text-xs text-muted-foreground flex items-center gap-1.5 pt-2">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Dictaminado el: {new Date(detalleModal.fechaResolucion).toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Acciones del Administrador en el Footer */}
            <div className="flex gap-3 pt-6 mt-4 border-t border-border">
              <button 
                type="button" 
                onClick={() => setDetalleModal(null)} 
                className="flex-1 px-4 py-2 rounded-lg border border-border text-sm hover:bg-accent transition-colors"
              >
                Cerrar
              </button>
              
              {(detalleModal.estado === 'pendiente' || !detalleModal.estado) && (
                <>
                  <button 
                    onClick={() => resolverIncidencia(detalleModal.id, 'rechazada')} 
                    className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm hover:opacity-90 transition-opacity"
                  >
                    Rechazar
                  </button>
                  <button 
                    onClick={() => resolverIncidencia(detalleModal.id, 'aceptada')} 
                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:opacity-90 transition-opacity"
                  >
                    Aceptar
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  )
}