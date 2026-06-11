import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Dashboard } from './views/Dashboard'
import { Usuarios } from './views/Usuarios'
import { Areas } from './views/Areas'
import { Actividades } from './views/Actividades'
import { Clientes } from './views/Clientes'
import { TiposPrendas } from './views/TiposPrendas'

export function AdminApp({ onLogout, areas, setAreas, usuarios, setUsuarios }) {
  return (
    <Router>
      <div className="flex h-screen bg-background">
        <Sidebar onLogout={onLogout} />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/usuarios" element={<Usuarios areas={areas} usuarios={usuarios} setUsuarios={setUsuarios} />} />
            <Route path="/areas" element={<Areas areas={areas} setAreas={setAreas} />} />
            <Route path="/actividades" element={<Actividades />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/tipos-prendas" element={<TiposPrendas />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}
