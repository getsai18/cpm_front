import { useState } from 'react';
import {
  ChevronLeft, ChevronRight, ChevronDown,
  ClipboardList, Shirt, Image, Pencil, Upload,
  Plus, PlusCircle, Info, TriangleAlert, CheckCircle,
} from 'lucide-react';
import AdjuntoItem from './AdjuntoItem';
import { prendasCatalogo, tallasConfig } from '../data/catalogos';
import { generarCodigo, tipoSolicitudLimpio } from '../utils/helpers';

function StepBar({ substepActual, maxSubstep, onGoSubstepNav }) {
  const steps = [
    { n: 1, label: 'General' },
    { n: 2, label: 'Prendas' },
    { n: 3, label: 'Áreas' },
    { n: 4, label: 'Resumen' },
  ];
  return (
    <div className="flex items-center mb-7 flex-wrap gap-1">
      {steps.map((s, idx) => {
        const isDone = s.n < substepActual;
        const isActive = s.n === substepActual;
        const isVisited = s.n <= maxSubstep;
        const cls = `step${isActive ? ' active' : ''}${isDone ? ' done' : ''}`;
        return (
          <div key={s.n} style={{ display: 'contents' }}>
            <div
              className={cls}
              style={{ cursor: isVisited ? 'pointer' : 'default', opacity: isVisited ? 1 : 0.4 }}
              onClick={() => isVisited && onGoSubstepNav(s.n)}
              title={s.label}
            >
              <div className="step-dot">{isDone ? '✓' : s.n}</div>
              {s.label}
            </div>
            {idx < steps.length - 1 && <div className="step-line"></div>}
          </div>
        );
      })}
    </div>
  );
}

function ActividadOpciones({ act, areaIdx, actIdx, onSelectTagOp, onToggleMulti }) {
  const multi = act.tipo === 'checkbox';
  return (
    <div className="tag-group">
      {act.opciones.map(op => {
        const isSelected = act.selectedOptions?.includes(op);
        return (
          <div
            key={op}
            className={`tag-option ${multi ? 'multi' : ''} ${isSelected ? 'selected' : ''}`}
            onClick={() => {
              if (multi) onToggleMulti(areaIdx, actIdx, op);
              else onSelectTagOp(areaIdx, actIdx, op);
            }}
          >
            {op}
          </div>
        );
      })}
    </div>
  );
}

function AreasForm({ areasActivas, onToggleArea, onQuitarActividad, onAbrirModalActividades, onSelectTagOp, onToggleMulti, tpuAlert }) {
  return (
    <div>
      {areasActivas.map((area, ai) => {
        const activa = area.activa;
        return (
          <div key={area.nombre} className="area-block">
            <div className={`area-header${activa ? '' : ' area-header-inactive'}`}>
              <div className="area-dot" style={{ background: area.color, opacity: activa ? 1 : 0.4 }}></div>
              <span style={{ opacity: activa ? 1 : 0.5 }}>{area.nombre}</span>
              {activa && area.actividades.length > 0 && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700">{area.actividades.length}</span>
              )}
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-xs text-gray-400">{activa ? 'Participa' : 'No participa'}</span>
                <label className="switch" onClick={e => e.stopPropagation()}>
                  <input type="checkbox" checked={activa} onChange={e => onToggleArea(ai, e.target.checked)} />
                  <div className="switch-track"></div>
                  <div className="switch-thumb"></div>
                </label>
              </div>
            </div>
            {activa && (
              <div className="area-body">
                {area.actividades.map((act, li) => (
                  <div key={`${act.nombre}-${li}`} className="actividad-simple-row">
                    <div className="actividad-simple-inner">
                      <div className="actividad-label flex items-center gap-2">
                        {act.nombre}
                        {act.tipo === 'checkbox'
                          ? <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-green-100 text-green-700 normal-case tracking-normal">opción múltiple</span>
                          : act.tipo === 'radio'
                          ? <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 normal-case tracking-normal">opción única</span>
                          : null
                        }
                      </div>
                      <ActividadOpciones
                        act={act}
                        areaIdx={ai}
                        actIdx={li}
                        onSelectTagOp={onSelectTagOp}
                        onToggleMulti={onToggleMulti}
                      />
                      {act.nota && (
                        <div className="flex items-start gap-2 mt-2.5 p-2.5 rounded-lg bg-blue-50 border border-blue-200">
                          <Info className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div className="text-xs text-blue-800 leading-relaxed font-medium">
                            {act.nota}
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      className="flex-shrink-0 px-2.5 py-1 rounded-md text-xs font-semibold text-red-500 border border-red-200 hover:bg-red-50 mt-5 transition-colors"
                      onClick={() => onQuitarActividad(ai, li)}
                    >
                      Quitar
                    </button>
                  </div>
                ))}
                <div className="add-actividad-row" onClick={() => onAbrirModalActividades(ai)}>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar actividad</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
      {tpuAlert && (
        <div className="flex items-start gap-3 p-3.5 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-700 mb-4">
          <TriangleAlert className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div className="text-xs leading-relaxed">
            <strong className="font-semibold block">TPU 3D seleccionado</strong>
            El tiempo de fabricación se extiende 10–15 días hábiles. Coordina con el cliente.
          </div>
        </div>
      )}
    </div>
  );
}

function ResumenView({ disciplina, categoria, tipoSolicitud, observaciones, tipoDiseno, prendasSeleccionadas, clothesData, adjuntosData, areasActivas, pedidoActivo }) {
  const code = generarCodigo(disciplina, tipoSolicitud, pedidoActivo?.id);
  const grupos = { hombre: [], mujer: [], niño: [] };
  clothesData.forEach(c => { if (grupos[c.conf.type]) grupos[c.conf.type].push(c); });
  const totalPiezas = clothesData.reduce((s, c) => s + (c.conf.tot || 0), 0);

  const disenoBadgeMap = {
    Nuevo: 'bg-blue-50 text-blue-700',
    Pasado: 'bg-green-50 text-green-700',
    Ambos: 'bg-purple-50 text-purple-700',
  };
  const disenoCls = disenoBadgeMap[tipoDiseno] || 'bg-gray-100 text-gray-700';
  const tipoSolDisplay = tipoSolicitudLimpio(tipoSolicitud);

  const areasActuales = areasActivas || [];

  return (
    <div>
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Código de orden</div>
        <div className="code-box">{code}</div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3 pb-2.5 border-b border-gray-100">Información general</div>
        <div className="resumen-grid">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Tipo de diseño</div>
            <span className={`inline-flex px-2.5 py-1 rounded text-sm font-semibold ${disenoCls}`}>{tipoDiseno}</span>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Disciplina</div>
            <div className="text-sm font-semibold text-gray-900">{disciplina || '—'}</div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Categoría</div>
            <div className="text-sm font-semibold text-gray-900">{categoria || '—'}</div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Tipo de solicitud</div>
            <div className="text-sm font-semibold text-gray-900">
              {tipoSolDisplay !== '—' ? tipoSolDisplay : <span className="text-gray-400">Sin especificar</span>}
            </div>
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Prendas seleccionadas</div>
            <div className="text-sm text-gray-700">{prendasSeleccionadas.join(', ')}</div>
          </div>
        </div>
        {observaciones && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Observaciones</div>
            <div className="text-sm text-gray-600">{observaciones}</div>
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3 pb-2.5 border-b border-gray-100">
          Prendas y cantidades · <span className="text-green-600 font-bold">{totalPiezas} piezas total</span>
        </div>
        {clothesData.length === 0 ? (
          <div className="text-sm text-gray-400">Sin prendas capturadas</div>
        ) : Object.entries({ Hombre: 'hombre', Mujer: 'mujer', Niño: 'niño' }).map(([label, key]) => {
          const items = grupos[key];
          if (!items.length) return null;
          return (
            <div key={key}>
              <div className="cloth-group-title">{label}</div>
              <div className="cloth-resumen-grid">
                {items.map(c => (
                  <div key={c.id} className="cloth-resumen-card">
                    <div className="cloth-resumen-qty">{c.conf.tot}</div>
                    <div className="cloth-resumen-detail">
                      <div className="cloth-resumen-name">{c.name}</div>
                      <div className="cloth-resumen-talla">Talla {c.conf.size}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3 pb-2.5 border-b border-gray-100">Áreas de producción</div>
        {areasActuales.filter(a => a.activa && a.actividades.length > 0).length === 0 ? (
          <div className="text-sm text-gray-400">Sin áreas activas</div>
        ) : areasActuales.filter(a => a.activa && a.actividades.length > 0).map(area => (
          <div key={area.nombre} className="mb-3">
            <div className="text-xs font-semibold mb-1.5" style={{ color: area.color }}>{area.nombre}</div>
            {area.actividades.map((act, ai) => {
              const opts = act.selectedOptions || [];
              if (!opts.length) return null;
              return (
                <div key={ai} className="mb-1.5 text-xs">
                  <span className="text-gray-400">{act.nombre}: </span>
                  <span className="flex flex-wrap gap-1 mt-1 inline-flex">
                    {opts.map(op => (
                      <span key={op} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">{op}</span>
                    ))}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3 pb-2.5 border-b border-gray-100">Archivos adjuntos</div>
        <div className="flex flex-wrap gap-2">
          {adjuntosData.length === 0
            ? <span className="text-xs text-gray-400">Sin adjuntos</span>
            : adjuntosData.map(a => (
              <span key={a.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">📎 {a.nombre}</span>
            ))
          }
        </div>
      </div>

      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-700 mb-4">
        <TriangleAlert className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <div className="text-xs leading-relaxed">Revisa toda la información antes de confirmar. Una vez confirmada, la orden quedará con estado Pendiente en el pedido.</div>
      </div>
    </div>
  );
}

export default function NuevaOrdenScreen({
  pedidoActivo, kitDestino,
  esReutilizado, tipoDiseno, setTipoDiseno,
  prendasSeleccionadas, setPrendasSeleccionadas,
  clothesData, setClothesData,
  adjuntosData,
  areasActivas, setAreasActivas,
  substepActual, maxSubstep,
  generoSeleccionado, setGeneroSeleccionado,
  disciplina, setDisciplina,
  categoria, setCategoria,
  tipoSolicitud, setTipoSolicitud,
  observaciones, setObservaciones,
  snapshotOriginal,
  onSalirNuevaOrden, onConfirmarOrden,
  onAbrirModalActividades,
  onHandleAdjuntos, onQuitarAdjunto,
  onGoSubstep, onGoSubstepNav,
  onShowAlert,
}) {
  const [collapsed, setCollapsed] = useState({});

  const codePreview = generarCodigo(disciplina, tipoSolicitud, pedidoActivo?.id);

  function toggleSection(id) {
    setCollapsed(prev => ({ ...prev, [id]: !prev[id] }));
  }

  function actualizarBadgeDiseno(newDisciplina, newPrendasSeleccionadas) {
    if (!esReutilizado) {
      setTipoDiseno('Nuevo');
      return;
    }
    const disc = newDisciplina !== undefined ? newDisciplina : disciplina;
    const prendas = (newPrendasSeleccionadas || prendasSeleccionadas).slice().sort().join(',');
    const snap = snapshotOriginal;
    if (snap && (disc !== snap.disciplina || prendas !== snap.prendas)) {
      setTipoDiseno('Ambos');
    } else if (snap) {
      setTipoDiseno('Pasado');
    }
  }

  function handleDisciplinaChange(val) {
    setDisciplina(val);
    if (esReutilizado) actualizarBadgeDiseno(val, prendasSeleccionadas);
  }

  function togglePrenda(nombre) {
    if (prendasSeleccionadas.includes(nombre)) {
      if (prendasSeleccionadas.length === 1) return;
      const newList = prendasSeleccionadas.filter(p => p !== nombre);
      setPrendasSeleccionadas(newList);
      if (esReutilizado) actualizarBadgeDiseno(disciplina, newList);
    } else {
      const newList = [...prendasSeleccionadas, nombre];
      setPrendasSeleccionadas(newList);
      if (esReutilizado) actualizarBadgeDiseno(disciplina, newList);
    }
  }

  function selGenero(gen) {
    setGeneroSeleccionado(gen);
  }

  function agregarCloth() {
    const tipoEl = document.getElementById('cloth-tipo');
    const tallaEl = document.getElementById('cloth-talla');
    const qtyEl = document.getElementById('cloth-qty');
    const tipo = tipoEl?.value || '';
    const talla = tallaEl?.value || '';
    const qtyRaw = qtyEl?.value || '0';
    const qty = Math.floor(Number(qtyRaw));
    const gen = generoSeleccionado;
    const faltantes = [];
    if (!tipo) faltantes.push('Tipo de prenda');
    if (!gen) faltantes.push('Género');
    if (!talla) faltantes.push('Talla');
    if (!qty || qty <= 0) faltantes.push('Cantidad (debe ser un número entero mayor a 0)');
    if (faltantes.length) {
      onShowAlert('Campos requeridos', `Por favor completa: ${faltantes.join(', ')}.`, 'alert-circle');
      return;
    }
    const existente = clothesData.find(c => c.name === tipo && c.conf.type === gen && c.conf.size === talla);
    if (existente) {
      setClothesData(clothesData.map(c =>
        c.name === tipo && c.conf.type === gen && c.conf.size === talla
          ? { ...c, conf: { ...c.conf, tot: c.conf.tot + qty } }
          : c
      ));
    } else {
      setClothesData([...clothesData, { id: 'c' + Date.now(), name: tipo, conf: { type: gen, size: talla, tot: qty } }]);
    }
    if (tipoEl) tipoEl.value = '';
    if (tallaEl) tallaEl.value = '';
    if (qtyEl) qtyEl.value = '0';
    setGeneroSeleccionado('');
  }

  function quitarCloth(id) {
    setClothesData(clothesData.filter(c => c.id !== id));
  }

  function onToggleArea(areaIdx, activa) {
    setAreasActivas(prev => prev.map((a, i) => i === areaIdx ? { ...a, activa } : a));
  }

  function onQuitarActividad(areaIdx, actIdx) {
    setAreasActivas(prev => prev.map((a, i) =>
      i === areaIdx ? { ...a, actividades: a.actividades.filter((_, li) => li !== actIdx) } : a
    ));
  }

  function onSelectTagOp(areaIdx, actIdx, option) {
    setAreasActivas(prev => prev.map((a, i) =>
      i !== areaIdx ? a : {
        ...a,
        actividades: a.actividades.map((act, li) =>
          li !== actIdx ? act : { ...act, selectedOptions: [option] }
        )
      }
    ));
  }

  function onToggleMulti(areaIdx, actIdx, option) {
    setAreasActivas(prev => prev.map((a, i) =>
      i !== areaIdx ? a : {
        ...a,
        actividades: a.actividades.map((act, li) => {
          if (li !== actIdx) return act;
          const opts = act.selectedOptions || [];
          const newOpts = opts.includes(option) ? opts.filter(o => o !== option) : [...opts, option];
          return { ...act, selectedOptions: newOpts };
        })
      }
    ));
  }

  const tpuAlert = (areasActivas || []).some(area =>
    area.activa && area.actividades.some(act => act.selectedOptions?.some(op => op.includes('TPU 3D')))
  );

  const tallaOptions = tallasConfig[generoSeleccionado] || [];

  const genLabel = { hombre: 'Hombre', mujer: 'Mujer', niño: 'Niño' };

  const kitInfo = pedidoActivo?.kits?.find(k => k.id === kitDestino);
  const noSubText = kitDestino && kitInfo ? `Nueva orden para el kit "${kitInfo.nombre}"` : 'Completa los datos de producción';

  return (
    <div>
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nueva orden</h1>
          <p className="text-sm text-gray-500 mt-1">{noSubText}</p>
        </div>
        <button
          onClick={onSalirNuevaOrden}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <ChevronLeft className="w-4 h-4" /> Volver
        </button>
      </div>

      <StepBar substepActual={substepActual} maxSubstep={maxSubstep} onGoSubstepNav={onGoSubstepNav} />

      {/* STEP 1: GENERAL */}
      {substepActual === 1 && (
        <div>
          {/* Info general */}
          <div className={`form-section bg-white border border-gray-200 rounded-xl mb-4${collapsed['general'] ? ' collapsed' : ''}`}>
            <div className="form-section-header flex items-center justify-between px-5 py-3.5 border-b border-gray-100 cursor-pointer hover:bg-gray-50 rounded-t-xl" onClick={() => toggleSection('general')}>
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <ClipboardList className="w-4 h-4 text-gray-500" /> Información general
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 chevron-icon" />
            </div>
            <div className="form-section-body p-5">
              <div className="field-row">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1.5">Tipo de diseño</label>
                  <div className="tag-group">
                    {['Nuevo','Pasado','Ambos'].map(val => (
                      <div
                        key={val}
                        className={`tag-option${tipoDiseno === val ? ' selected' : ''}`}
                        onClick={() => setTipoDiseno(val)}
                      >
                        {val}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1.5">Disciplina</label>
                  <input
                    type="text"
                    value={disciplina}
                    onChange={e => handleDisciplinaChange(e.target.value)}
                    placeholder="Ej. Fútbol, Básquetbol…"
                    className="field-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1.5">Calidad de producto</label>
                  <select value={categoria} onChange={e => setCategoria(e.target.value)} className="field-input">
                    <option value="">Seleccionar…</option>
                    <option>Amateur</option>
                    <option>Semi</option>
                    <option>Profesional</option>
                    <option>Pro Elite</option>
                  </select>
                </div>
              </div>
              <div className="field-row">
                <div style={{ gridColumn: '1/-1' }}>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1.5">
                    Tipo de solicitud <span className="normal-case font-normal text-gray-400">(forma parte del código de orden)</span>
                  </label>
                  <input
                    type="text"
                    value={tipoSolicitud}
                    onChange={e => setTipoSolicitud(e.target.value)}
                    placeholder="Ej. JuegoLocal, Entrenamiento, Portero, JuegoVisita…"
                    className="field-input"
                  />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1.5">Código de orden generado</div>
                <div className="code-box">{codePreview}</div>
              </div>
            </div>
          </div>

          {/* Prendas */}
          <div className={`form-section bg-white border border-gray-200 rounded-xl mb-4${collapsed['prendas'] ? ' collapsed' : ''}`}>
            <div className="form-section-header flex items-center justify-between px-5 py-3.5 border-b border-gray-100 cursor-pointer hover:bg-gray-50 rounded-t-xl" onClick={() => toggleSection('prendas')}>
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <Shirt className="w-4 h-4 text-gray-500" /> Tipos de prenda
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 chevron-icon" />
            </div>
            <div className="form-section-body p-5">
              <div className="prendas-grid">
                {prendasCatalogo.map(p => (
                  <div
                    key={p.nombre}
                    className={`prenda-chip${prendasSeleccionadas.includes(p.nombre) ? ' selected' : ''}`}
                    onClick={() => togglePrenda(p.nombre)}
                  >
                    <span className="icon">{p.icon}</span>
                    {p.nombre}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Adjuntos */}
          <div className={`form-section bg-white border border-gray-200 rounded-xl mb-4${collapsed['adjuntos'] ? ' collapsed' : ''}`}>
            <div className="form-section-header flex items-center justify-between px-5 py-3.5 border-b border-gray-100 cursor-pointer hover:bg-gray-50 rounded-t-xl" onClick={() => toggleSection('adjuntos')}>
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <Image className="w-4 h-4 text-gray-500" />
                Archivos adjuntos <span className="text-xs font-normal text-gray-400 ml-1">(se guardan en el pedido)</span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 chevron-icon" />
            </div>
            <div className="form-section-body p-5">
              <div className="adjuntos-layout">
                <div>
                  <div
                    className="border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 p-7 text-center cursor-pointer hover:border-gray-400 transition-colors"
                    onClick={() => document.getElementById('adj-input').click()}
                  >
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <div className="text-sm font-medium text-gray-500">Haz clic para agregar archivos</div>
                    <div className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP, SVG, GIF…</div>
                  </div>
                  <input
                    type="file"
                    id="adj-input"
                    multiple
                    accept="image/*,.pdf,.txt,.doc,.docx"
                    className="hidden"
                    onChange={onHandleAdjuntos}
                  />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Archivos agregados</div>
                  {adjuntosData.length === 0 ? (
                    <div className="text-xs text-gray-400 text-center py-4">Sin archivos adjuntos</div>
                  ) : (
                    <div className="adjunto-grid">
                      {adjuntosData.map((a, i) => (
                        <AdjuntoItem key={a.id || i} adjunto={a} index={i} scope="orden" onQuitar={onQuitarAdjunto} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Observaciones */}
          <div className={`form-section bg-white border border-gray-200 rounded-xl mb-4${collapsed['observaciones'] ? ' collapsed' : ''}`}>
            <div className="form-section-header flex items-center justify-between px-5 py-3.5 border-b border-gray-100 cursor-pointer hover:bg-gray-50 rounded-t-xl" onClick={() => toggleSection('observaciones')}>
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <Pencil className="w-4 h-4 text-gray-500" /> Observaciones generales
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 chevron-icon" />
            </div>
            <div className="form-section-body p-5">
              <textarea
                value={observaciones}
                onChange={e => setObservaciones(e.target.value)}
                placeholder="Notas especiales, indicaciones para el equipo de producción…"
                className="w-full min-h-20 p-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 resize-y outline-none focus:border-gray-400 font-sans"
              />
            </div>
          </div>

          <div className="form-nav">
            <div></div>
            <button onClick={() => onGoSubstep(2)} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#050314] text-white rounded-lg hover:bg-gray-800">
              Siguiente <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: PRENDAS */}
      {substepActual === 2 && (
        <div>
          <div className="bg-white border border-gray-200 rounded-xl mb-4">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <Shirt className="w-4 h-4 text-gray-500" /> Prendas y cantidades
              </div>
            </div>
            <div className="p-5">
              <div className="clothes-layout">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <div className="text-sm font-semibold mb-4 flex items-center gap-2 text-gray-800">
                    <PlusCircle className="w-4 h-4 text-gray-500" /> Agregar prenda
                  </div>
                  <div className="mb-3">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1.5">Tipo de prenda</label>
                    <select id="cloth-tipo" className="field-input">
                      <option value="">Seleccionar…</option>
                      {prendasSeleccionadas.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1.5">Género</label>
                    <div className="tag-group">
                      {['hombre','mujer','niño'].map(gen => (
                        <div
                          key={gen}
                          className={`tag-option${generoSeleccionado === gen ? ' selected' : ''}`}
                          onClick={() => selGenero(gen)}
                        >
                          {gen.charAt(0).toUpperCase() + gen.slice(1)}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1.5">Talla</label>
                    <select id="cloth-talla" className="field-input">
                      <option value="">Seleccionar…</option>
                      {tallaOptions.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1.5">Cantidad</label>
                    <input type="number" id="cloth-qty" min="0" defaultValue="0" className="field-input" />
                  </div>
                  <button onClick={agregarCloth} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-[#050314] text-white rounded-lg hover:bg-gray-800">
                    <Plus className="w-4 h-4" /> Agregar
                  </button>
                </div>

                <div>
                  {clothesData.length === 0 ? (
                    <div className="text-center p-8 border border-dashed border-gray-200 rounded-xl text-sm text-gray-400">
                      Sin prendas agregadas todavía.<br />Usa el formulario para agregar.
                    </div>
                  ) : (
                    <div className="clothes-cards-grid">
                      {clothesData.map(c => (
                        <div key={c.id} className="cloth-card">
                          <button
                            className="absolute top-1.5 right-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 p-1 rounded text-xs transition-colors"
                            onClick={() => quitarCloth(c.id)}
                          >
                            ✕
                          </button>
                          <div className="cloth-qty">{c.conf.tot}</div>
                          <div className="cloth-name">{c.name}</div>
                          <div className="cloth-badges">
                            <span className="cloth-badge-gen">{genLabel[c.conf.type] || c.conf.type}</span>
                            <span className="cloth-badge-talla">T. {c.conf.size}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="form-nav">
            <button onClick={() => onGoSubstep(1)} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
              <ChevronLeft className="w-4 h-4" /> Anterior
            </button>
            <button onClick={() => onGoSubstep(3)} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#050314] text-white rounded-lg hover:bg-gray-800">
              Siguiente <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: ÁREAS */}
      {substepActual === 3 && (
        <div>
          <div className="flex items-center gap-3 px-4 py-3 mb-4 bg-blue-50 border border-blue-100 rounded-xl">
            <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <p className="text-xs text-blue-700 font-medium">Activa las áreas que participarán en la producción de esta orden. Puedes agregar actividades específicas a cada área activa.</p>
          </div>
          {areasActivas && (
            <AreasForm
              areasActivas={areasActivas}
              onToggleArea={onToggleArea}
              onQuitarActividad={onQuitarActividad}
              onAbrirModalActividades={onAbrirModalActividades}
              onSelectTagOp={onSelectTagOp}
              onToggleMulti={onToggleMulti}
              tpuAlert={tpuAlert}
            />
          )}
          <div className="form-nav">
            <button onClick={() => onGoSubstep(2)} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
              <ChevronLeft className="w-4 h-4" /> Anterior
            </button>
            <button onClick={() => onGoSubstep(4)} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#050314] text-white rounded-lg hover:bg-gray-800">
              Ver resumen <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: RESUMEN */}
      {substepActual === 4 && (
        <div>
          <ResumenView
            disciplina={disciplina}
            categoria={categoria}
            tipoSolicitud={tipoSolicitud}
            observaciones={observaciones}
            tipoDiseno={tipoDiseno}
            prendasSeleccionadas={prendasSeleccionadas}
            clothesData={clothesData}
            adjuntosData={adjuntosData}
            areasActivas={areasActivas}
            pedidoActivo={pedidoActivo}
          />
          <div className="form-nav">
            <button onClick={() => onGoSubstep(3)} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
              <ChevronLeft className="w-4 h-4" /> Editar
            </button>
            <button onClick={onConfirmarOrden} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#050314] text-white rounded-lg hover:bg-gray-800">
              <CheckCircle className="w-4 h-4" /> Confirmar orden
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

