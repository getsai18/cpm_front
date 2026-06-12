import { useState, useEffect } from 'react'
import { StatCard } from './StatCard'
import { OrdersTable } from './OrdersTable'
import { Clock, CheckCircle, PauseCircle, AlertTriangle } from 'lucide-react'
import { getDoc } from '../../storage'
import { db } from '../../db'

function mapOrdenStatus(status) {
  if (!status) return 'pendiente'
  const s = status.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  if (s === 'completado' || s === 'cerrado' || s === 'entregado') return 'completado'
  if (s === 'produccion' || s === 'en proceso') return 'en-progreso'
  if (s === 'pendiente') return 'pendiente'
  return 'en-espera'
}

async function buildDashboardData() {
  try {
    const clientes = await getDoc('cpmanager_clientes', [])
    const incidencias = await getDoc('cp_v5_incidencias', [])
    const todasOrdenes = []

    clientes.forEach(c => {
      ;(c.pedidos || []).forEach(ped => {
        ;(ped.ordenes || []).forEach(o => {
          todasOrdenes.push({
            id: o.id,
            registeredDate: ped.fecha || '—',
            deliveryDate: ped.fechaLimite || '—',
            clientName: c.nombre,
            status: mapOrdenStatus(o.status),
          })
        })
      })
    })

    const pendientes = todasOrdenes.filter(o => o.status === 'pendiente').length
    const enProgreso = todasOrdenes.filter(o => o.status === 'en-progreso').length
    const enEspera = todasOrdenes.filter(o => o.status === 'en-espera').length

    const sorted = [...todasOrdenes].sort((a, b) => {
      if (!a.deliveryDate || a.deliveryDate === '—') return 1
      if (!b.deliveryDate || b.deliveryDate === '—') return -1
      return a.deliveryDate > b.deliveryDate ? 1 : -1
    })

    return {
      stats: { pendientes, enProgreso, enEspera, incidencias: incidencias.length },
      orders: sorted.slice(0, 8),
    }
  } catch {
    return { stats: { pendientes: 0, enProgreso: 0, enEspera: 0, incidencias: 0 }, orders: [] }
  }
}

export function Dashboard() {
  const [data, setData] = useState({ stats: { pendientes: 0, enProgreso: 0, enEspera: 0, incidencias: 0 }, orders: [] })

  useEffect(() => {
    buildDashboardData().then(setData)
  }, [])

  useEffect(() => {
    const feed = db.changes({ live: true, since: 'now', include_docs: false })
      .on('change', (change) => {
        if (change.id === 'cpmanager_clientes' || change.id === 'cp_v5_incidencias') {
          buildDashboardData().then(setData)
        }
      })
    return () => feed.cancel()
  }, [])

  const getCurrentMonth = () => {
    const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
    return months[new Date().getMonth()]
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1>Dashboard</h1>
        <p className="text-muted-foreground mt-1">Resumen general de pedidos y actividad</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Pendientes" value={data.stats.pendientes} icon={Clock} color="yellow" />
        <StatCard title="En Progreso" value={data.stats.enProgreso} icon={CheckCircle} color="blue" />
        <StatCard title="En Espera" value={data.stats.enEspera} icon={PauseCircle} color="purple" />
        <StatCard title="Incidencias" value={data.stats.incidencias} icon={AlertTriangle} color="red" subtitle={getCurrentMonth()} />
      </div>
      <OrdersTable orders={data.orders} />
    </div>
  )
}
