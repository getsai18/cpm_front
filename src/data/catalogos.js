import { getDoc, setDoc } from '../storage';

export const LS_KEY      = 'cpmanager_clientes';
export const LS_KEY_OIDS = 'cpmanager_counters';

const _defaultPrendasCatalogo = [
  {nombre:'Playera',icon:'👕'},{nombre:'Polo',icon:'🥼'},{nombre:'Short',icon:'🩳'},
  {nombre:'Bermuda',icon:'🩳'},{nombre:'Capri',icon:'👖'},{nombre:'Pants',icon:'👖'},
  {nombre:'Chamarra',icon:'🧥'},{nombre:'Sudadera',icon:'🧣'},{nombre:'Gorra',icon:'🧢'},
  {nombre:'Maleta',icon:'🎒'},{nombre:'Jersey',icon:'🏈'},{nombre:'Calcetas',icon:'🧦'},
];

let _prendasCache = null;

export function setPrendasCache(data) {
  _prendasCache = data;
}

export async function initPrendasCache() {
  try {
    const data = await getDoc('cp_prendas', null);
    if (data) _prendasCache = data;
  } catch { /* ignore */ }
}

function _getLivePrendas() {
  if (!_prendasCache) return null;
  const arr = _prendasCache;
  return Array.isArray(arr) && arr.length > 0
    ? arr.map(p => ({ nombre: p.nombre, icon: p.icono || p.icon || '📦' }))
    : null;
}

export const prendasCatalogo = new Proxy(_defaultPrendasCatalogo, {
  get(target, prop) {
    const live = _getLivePrendas() || target;
    const val = live[prop];
    return typeof val === 'function' ? val.bind(live) : val;
  },
  has(target, key) { return key in (_getLivePrendas() || target); },
});

export const tallasConfig = {
  hombre: ['CH','M','G','XG','2XG','3XG','4XG'],
  mujer:  ['CH','M','G','XG','2XG','3XG'],
  'niño': ['2','4','6','8','10','12','14','16'],
};

export const areasConfig = [
  { nombre:'Diseño Textil',   color:'#4f7fff', actividades:['Mangas','Cuello','Tela'] },
  { nombre:'Costura',         color:'#60a5fa', actividades:['Mangas','Cuello'] },
  { nombre:'Sublimación',     color:'#a855f7', actividades:['Técnica','Tono'] },
  { nombre:'DTF',             color:'#c084fc', actividades:['Técnica'] },
  { nombre:'Escudos',         color:'#3ecf8e', actividades:['Técnica escudo','Posición'] },
  { nombre:'Íconos / Parches',color:'#f5a623', actividades:['Tipo ícono','Técnica ícono'] },
  { nombre:'Números',         color:'#ff5c5c', actividades:['Técnica número','Posición número'] },
  { nombre:'Personalización', color:'#06b6d4', actividades:['Elementos','Técnica personal'] },
];

export const catalogoActividades = [
  {nombre:'Mangas',          tipo:'radio',    opciones:['Tirantes','Corta','3/4','Larga','Sublimado','Tela Color']},
  {nombre:'Cuello',          tipo:'radio',    opciones:['Redondo','V','Polo','Tortuga']},
  {nombre:'Tela',            tipo:'radio',    opciones:['Jersey','Mesh','Dry-fit','Spandex','Tactel']},
  {nombre:'Técnica',         tipo:'checkbox', opciones:['Sublimado','DTF','Estampado','Serigrafía']},
  {nombre:'Tono',            tipo:'radio',    opciones:['Colores completos','Degradé','Bicolor','Tricolor']},
  {nombre:'Técnica escudo',  tipo:'radio',    opciones:['Bordado','Transfer','Sublimado','Bordado TPU 3D','Sin escudo'],
    alerta:'⚠️ Bordado TPU 3D incrementa el tiempo de producción entre 10 y 15 días hábiles. Confirma disponibilidad con el cliente antes de continuar.'},
  {nombre:'Posición',        tipo:'checkbox', opciones:['Pecho izq','Pecho der','Manga izq','Manga der','Espalda']},
  {nombre:'Tipo ícono',      tipo:'checkbox', opciones:['Bandera','Estrella','Galón','Sin ícono']},
  {nombre:'Técnica ícono',   tipo:'radio',    opciones:['Bordado','Transfer','TPU 3D'],
    alerta:'⚠️ La técnica TPU 3D requiere tiempo adicional de fabricación (10–15 días hábiles). Coordina con producción.'},
  {nombre:'Técnica número',  tipo:'radio',    opciones:['Vinil','Sublimado','Bordado','Transfer']},
  {nombre:'Posición número', tipo:'checkbox', opciones:['Frente','Espalda','Manga']},
  {nombre:'Elementos',       tipo:'checkbox', opciones:['Nombre','Número','Capitán','Entrenador','Manager'],
    alerta:'ℹ️ La personalización por nombre requiere la lista completa de jugadores antes de iniciar producción.'},
  {nombre:'Técnica personal',tipo:'radio',    opciones:['Vinil','Sublimado','Bordado']},
];

export function getCatalogoActividad(nombre) {
  return catalogoActividades.find(a => a.nombre === nombre) || null;
}

function _relDate(offsetDays) {
  const d = new Date(); d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function _relDateStr(offsetDays) {
  const d = new Date(); d.setDate(d.getDate() + offsetDays);
  return d.toLocaleDateString('es-MX',{day:'2-digit',month:'short',year:'numeric'});
}

export function getMockClientesInitial() {
  return [
    {
      id:1, nombre:'Club Atlético Juventud', telefono:'55 1234 5678',
      ultimoPedido:_relDateStr(-5), totalPedidos:2,
      pedidos:[
        {
          id:'PED-2026-041', fecha:_relDateStr(-5), fechaLimite:_relDate(20),
          status:'Producción', confirmado:true, adjuntos:[],
          kits:[
            { id:'KIT-001', nombre:'Juego completo', fecha:'14 May 2025',
              ordenIds:['ORD-2026-041-001','ORD-2026-041-002'] }
          ],
          ordenes:[
            { id:'ORD-2026-041-001', code:'ORD_FUT_JuegoLocal', status:'Producción',
              config:{ areas:[ {area:'Diseño Textil', actividades:[{actividad:'Mangas',tags:[{opcion:'Corta'}]}]} ] },
              clothes:[ {id:'c1',name:'Playera',conf:{type:'hombre',size:'M',tot:10}}, {id:'c2',name:'Short',conf:{type:'hombre',size:'M',tot:10}} ]
            },
            { id:'ORD-2026-041-002', code:'ORD_FUT_JuegoVisita', status:'Pendiente',
              config:{ areas:[] }, clothes:[ {id:'c3',name:'Playera',conf:{type:'mujer',size:'CH',tot:5}} ]
            }
          ]
        },
        {
          id:'PED-2026-018', fecha:_relDateStr(-30), fechaLimite:_relDate(-10),
          status:'Cerrado', confirmado:true, adjuntos:[], kits:[], ordenes:[
            { id:'ORD-2026-018-001', code:'ORD_BAS_Entrenamiento', status:'Cerrado',
              config:{areas:[]}, clothes:[{id:'c4',name:'Playera',conf:{type:'hombre',size:'G',tot:15}}] }
          ]
        }
      ]
    },
    {
      id:2, nombre:'Deportivo Guerreros FC', telefono:'55 9876 5432',
      ultimoPedido:_relDateStr(-1), totalPedidos:1,
      pedidos:[
        { id:'PED-2026-055', fecha:_relDateStr(-1), fechaLimite:'', status:'Borrador', confirmado:false, adjuntos:[], kits:[], ordenes:[] }
      ]
    },
    {
      id:3, nombre:'Academia Tigres Voleibol', telefono:'55 5555 0101',
      ultimoPedido:_relDateStr(-15), totalPedidos:1,
      pedidos:[
        {
          id:'PED-2026-031', fecha:_relDateStr(-15), fechaLimite:_relDate(30),
          status:'Borrador', confirmado:false, adjuntos:[], kits:[],
          ordenes:[
            { id:'ORD-2026-031-001', code:'ORD_VOL_Juego', status:'Producción',
              config:{areas:[]}, clothes:[{id:'c5',name:'Playera',conf:{type:'niño',size:'10',tot:20}}] }
          ]
        }
      ]
    }
  ];
}

export async function guardarDB(clientes, counters) {
  try {
    await setDoc(LS_KEY, clientes);
    await setDoc(LS_KEY_OIDS, counters);
  } catch(e) { console.warn('PouchDB write failed', e); }
}

export async function cargarDB() {
  try {
    const clientes = await getDoc(LS_KEY, null);
    if (clientes) {
      const counters = await getDoc(LS_KEY_OIDS, { ordenIdCounter: 10, pedidoIdCounter: 60 });
      return { clientes, counters };
    }
    return null;
  } catch(e) { console.warn('PouchDB read failed', e); return null; }
}
