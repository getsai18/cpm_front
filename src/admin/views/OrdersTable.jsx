const statusConfig = {
  pendiente: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  'en-progreso': { label: 'En Progreso', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  'en-espera': { label: 'En Espera', className: 'bg-purple-100 text-purple-800 border-purple-200' },
  completado: { label: 'Completado', className: 'bg-green-100 text-green-800 border-green-200' },
}

export function OrdersTable({ orders }) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="p-6 border-b border-border">
        <h2>Pedidos Recientes</h2>
        <p className="text-sm text-muted-foreground mt-1">Ordenados por fecha de entrega más próxima</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 text-muted-foreground">#</th>
              <th className="text-left p-4 text-muted-foreground">ID Orden</th>
              <th className="text-left p-4 text-muted-foreground">Fecha Registro</th>
              <th className="text-left p-4 text-muted-foreground">Fecha Entrega</th>
              <th className="text-left p-4 text-muted-foreground">Cliente</th>
              <th className="text-left p-4 text-muted-foreground">Estado</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => {
              const statusInfo = statusConfig[order.status]
              return (
                <tr key={order.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="p-4 text-muted-foreground">{index + 1}</td>
                  <td className="p-4"><span className="font-mono text-sm">{order.id}</span></td>
                  <td className="p-4">{order.registeredDate}</td>
                  <td className="p-4">{order.deliveryDate}</td>
                  <td className="p-4">{order.clientName}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs border ${statusInfo.className}`}>
                      {statusInfo.label}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
