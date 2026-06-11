export function esc(str) {
  return String(str || '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

export function displayStatus(status) {
  return status === 'Entregado' ? 'Cerrado' : (status || 'Borrador');
}

export function pedidoVencido(p) {
  if (!p.fechaLimite) return false;
  const hoy = new Date();
  const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,'0')}-${String(hoy.getDate()).padStart(2,'0')}`;
  return p.fechaLimite < hoyStr;
}

export function adjuntoExtInfo(type, nombre) {
  const ext = nombre.split('.').pop().toLowerCase();
  const isImg = type && type.startsWith('image/');
  const colors = {
    pdf: 'bg-red-50 text-red-600 border-red-200',
    doc: 'bg-blue-50 text-blue-600 border-blue-200',
    docx:'bg-blue-50 text-blue-600 border-blue-200',
    txt: 'bg-gray-50 text-gray-600 border-gray-200',
  };
  const icons = {
    pdf:'file-text', doc:'file-text', docx:'file-text', txt:'file',
  };
  return {
    isImg,
    extLabel: ext.toUpperCase().substring(0,4),
    colorCls: colors[ext] || 'bg-gray-50 text-gray-500 border-gray-200',
    iconName: icons[ext] || 'file',
  };
}

export function disciplinaAbrev(raw) {
  const map = {
    'futbol':'FUT','fútbol':'FUT','fut':'FUT',
    'basquetbol':'BAS','básquetbol':'BAS','basketball':'BAS','bas':'BAS',
    'voleibol':'VOL','volleyball':'VOL','vol':'VOL',
    'beisbol':'BEI','béisbol':'BEI','baseball':'BEI',
    'atletismo':'ATL','atl':'ATL',
    'softbol':'SOF','softball':'SOF',
    'americano':'AME','football':'AME','ame':'AME',
    'futsal':'FSL',
    'natacion':'NAT','natación':'NAT',
  };
  const key = raw.toLowerCase().trim();
  return map[key] || raw.trim().substring(0,3).toUpperCase().replace(/\s/g,'') || '—';
}

export function tipoSolicitudLimpio(raw) {
  return (raw || '').trim()
    .replace(/\s+(.)/g, (_,c) => c.toUpperCase())
    .replace(/^(.)/, c => c.toUpperCase())
    .replace(/\s/g,'') || '—';
}

export function generarCodigo(disciplina, tipoSolicitud, pedidoId) {
  const disc = disciplinaAbrev(disciplina || '');
  const tipo = tipoSolicitudLimpio(tipoSolicitud || '');
  const hoy = new Date();
  const dd = String(hoy.getDate()).padStart(2,'0');
  const mm = String(hoy.getMonth()+1).padStart(2,'0');
  const yyyy = hoy.getFullYear();
  const ped = pedidoId?.replace('PED-','').replace(/-/g,'').substring(4) || '000';
  return `ORD_${dd}${mm}${yyyy}_${ped}_${disc}_${tipo}`;
}

export function statusBadgeCls(status) {
  const map = {
    'Borrador':'bg-blue-50 text-blue-700',
    'Producción':'bg-yellow-50 text-yellow-700',
    'Entregado':'bg-green-50 text-green-700',
    'Cerrado':'bg-green-50 text-green-700',
    'Cancelado':'bg-red-50 text-red-700',
    'Pendiente':'bg-blue-50 text-blue-700',
  };
  return map[status] || 'bg-gray-100 text-gray-600';
}
