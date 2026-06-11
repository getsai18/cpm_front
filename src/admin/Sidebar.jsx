import { LayoutDashboard, Users, Building2, Activity, UserCircle, Shirt, LogOut } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

export function Sidebar({ onLogout }) {
  const location = useLocation()

  const menuItems = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard, path: '/' },
    { id: 'usuarios', label: 'Usuarios', icon: Users, path: '/usuarios' },
    { id: 'areas', label: 'Áreas', icon: Building2, path: '/areas' },
    { id: 'actividades', label: 'Actividades', icon: Activity, path: '/actividades' },
    { id: 'clientes', label: 'Clientes', icon: UserCircle, path: '/clientes' },
    { id: 'tipos-prendas', label: 'Tipos de Prendas', icon: Shirt, path: '/tipos-prendas' },
  ]

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border h-screen flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-sidebar-foreground">UniformesPro</h1>
        <p className="text-sm text-muted-foreground mt-1">Sistema de Gestión</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <li key={item.id}>
                <Link
                  to={item.path}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-sidebar-border space-y-3">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
            A
          </div>
          <div className="flex-1">
            <p className="text-sm text-sidebar-foreground">Administrador</p>
            <p className="text-xs text-muted-foreground">admin@uniformespro.com</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          title="Cerrar sesión"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sidebar-foreground hover:bg-destructive hover:text-destructive-foreground"
        >
          <LogOut className="w-5 h-5" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  )
}
