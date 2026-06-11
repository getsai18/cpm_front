import { FileText, File } from 'lucide-react';
import { adjuntoExtInfo } from '../utils/helpers';

export default function AdjuntoItem({ adjunto: a, index: i, scope, onQuitar, readonly }) {
  const info = adjuntoExtInfo(a.type, a.nombre);
  const size = a.size ? ` · ${(a.size / 1024).toFixed(0)} KB` : '';
  const colorText = info.colorCls.split(' ')[1] || 'text-gray-500';
  const IconComp = info.iconName === 'file-text' ? FileText : File;

  if (info.isImg) {
    return (
      <div className="adjunto-preview-card">
        <img className="adjunto-preview-img" src={a.dataUrl} alt={a.nombre} />
        <div className="adjunto-preview-footer">
          <div className="adjunto-preview-name" title={a.nombre}>{a.nombre}</div>
          {!readonly && (
            <button onClick={() => onQuitar(i, scope)} className="text-gray-400 hover:text-red-500 text-sm p-0.5">✕</button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="adjunto-preview-card flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-2 bg-gray-50 border-b border-gray-100 min-h-[80px]">
        <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${info.colorCls}`}>
          <IconComp className="w-5 h-5" />
        </div>
        <span className={`text-xs font-bold tracking-wide ${colorText}`}>{info.extLabel}</span>
      </div>
      <div className="adjunto-preview-footer">
        <div className="adjunto-preview-name" title={a.nombre}>{a.nombre}{size}</div>
        {!readonly && (
          <button onClick={() => onQuitar(i, scope)} className="text-gray-400 hover:text-red-500 text-sm p-0.5">✕</button>
        )}
      </div>
    </div>
  );
}
