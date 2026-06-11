import { ChevronLeft, ChevronRight } from 'lucide-react'

export function Pagination({ page, totalPages, onPage, totalItems, pageSize }) {
  if (totalPages <= 1 && totalItems <= pageSize) return null

  const from = Math.min((page - 1) * pageSize + 1, totalItems)
  const to = Math.min(page * pageSize, totalItems)

  const pages = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (page > 3) pages.push('...')
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i)
    if (page < totalPages - 2) pages.push('...')
    pages.push(totalPages)
  }

  return (
    <div className="flex items-center justify-between mt-4">
      <p className="text-xs text-muted-foreground">Mostrando {from}–{to} de {totalItems}</p>
      <div className="flex items-center gap-1">
        <button
          disabled={page === 1}
          onClick={() => onPage(page - 1)}
          title="Página anterior"
          className="p-1.5 rounded-lg border border-border disabled:opacity-40 hover:bg-accent transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground text-sm">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPage(p)}
              className={`w-8 h-8 rounded-lg border text-sm transition-colors ${
                p === page ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-accent'
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          disabled={page === totalPages}
          onClick={() => onPage(page + 1)}
          title="Página siguiente"
          className="p-1.5 rounded-lg border border-border disabled:opacity-40 hover:bg-accent transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
