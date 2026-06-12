import { useState, useEffect } from 'react';
import { X, Search, CheckCircle, Info } from 'lucide-react';
import { getDoc } from '../../storage'; // <-- Cambiado para usar PouchDB

export default function ActividadesModal({ visible, areaIdx, areasActivas, onClose, onConfirmar }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [catalogoActividades, setCatalogoActividades] = useState([]);
  const [seleccionadas, setSeleccionadas] = useState([]);

  // Cargar las actividades desde PouchDB cada vez que se abre el modal
  useEffect(() => {
    if (visible) {
      setSearchQuery('');
      setSeleccionadas([]);
      getDoc('cp_v5_actividades', [])
        .then(saved => {
          if (saved && Array.isArray(saved)) {
            setCatalogoActividades(saved);
          }
        })
        .catch(console.warn);
    }
  }, [visible]);

  if (!visible || areaIdx === null || !areasActivas) return null;

  const area = areasActivas[areaIdx];
  const nombresEnArea = area?.actividades?.map(a => a.nombre) || [];
  const q = searchQuery.toLowerCase().trim();

  // Filtramos las actividades de PouchDB
  const disponibles = catalogoActividades.filter(a => {
    if (nombresEnArea.includes(a.nombre)) return false;
    if (!q) return true;
    if (a.nombre.toLowerCase().includes(q)) return true;
    return a.opciones?.some(o => o.toLowerCase().includes(q));
  });

  function toggleSeleccion(act) {
    setSeleccionadas(prev => {
      const existe = prev.find(s => s.nombre === act.nombre);
      if (existe) {
        return prev.filter(s => s.nombre !== act.nombre);
      } else {
        return [...prev, act]; // Guardamos el objeto completo, no solo el string
      }
    });
  }

  function handleConfirmar() {
    // onConfirmar ahora recibe el array de objetos completos (con su campo .nota)
    onConfirmar(areaIdx, seleccionadas);
    setSearchQuery('');
    setSeleccionadas([]);
  }

  function handleClose() {
    setSearchQuery('');
    setSeleccionadas([]);
    onClose();
  }

  return (
    <div
      className={`modal-overlay${visible ? ' visible' : ''}`}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="modal-box bg-white border border-gray-200 rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl">
        <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <div className="text-base font-bold text-gray-900">Agregar actividades</div>
            <div className="text-xs text-gray-400 mt-0.5">{area?.nombre}</div>
          </div>
          <button onClick={handleClose} className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-5 py-3">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre u opción…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400 bg-gray-50"
            />
          </div>
          
          {disponibles.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <div className="text-sm">No hay actividades disponibles para agregar.</div>
            </div>
          ) : (
            <div>
              {disponibles.map(act => (
                <label key={act.nombre} className="modal-actividad-item cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="modal-act-check mt-1" 
                    checked={seleccionadas.some(s => s.nombre === act.nombre)}
                    onChange={() => toggleSeleccion(act)}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="block text-sm font-semibold text-gray-900">{act.nombre}</span>
                    <span className="block text-xs text-gray-400 mt-0.5">
                      {act.tipo === 'radio' ? 'Selección única' : act.tipo === 'checkbox' ? 'Selección múltiple' : 'Texto libre'}
                    </span>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {act.opciones?.slice(0,3).map(o => (
                        <span key={o} className="px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-600 border border-gray-200">{o}</span>
                      ))}
                      {act.opciones?.length > 3 && (
                        <span className="px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-500">+{act.opciones.length - 3}</span>
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-100 flex-shrink-0">
          <button onClick={handleClose} className="px-4 py-2 text-sm font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button onClick={handleConfirmar} className="px-4 py-2 text-sm font-medium bg-[#050314] text-white rounded-lg hover:bg-gray-800 transition-colors">
            Agregar seleccionadas {seleccionadas.length > 0 && `(${seleccionadas.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}