import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LayoutDashboard, Calendar, FolderKanban, LogOut, TrendingUp, Menu, X, Wallet, BarChart2 } from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { to: '/',          label: 'Dashboard', icon: LayoutDashboard, end: true  },
  { to: '/months',    label: 'Meses',     icon: Calendar,        end: false },
  { to: '/proventos', label: 'Proventos', icon: Wallet,          end: false },
  { to: '/charts',    label: 'Gráficos',  icon: BarChart2,       end: false },
  { to: '/projects',  label: 'Projetos',  icon: FolderKanban,    end: false },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  function handleLogout() { logout(); navigate('/login') }

  const Sidebar = () => (
    <aside className="flex flex-col h-full w-64 bg-sidebar text-white">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
        <div className="w-9 h-9 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
          <TrendingUp size={20} className="text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight">FinControl</span>
        <button className="ml-auto lg:hidden" onClick={() => setOpen(false)}>
          <X size={20} className="text-white/70 hover:text-white" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to} to={to} end={end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-white/20 text-white shadow-lg shadow-black/10'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
            <p className="text-xs text-white/60 truncate">{user?.email}</p>
          </div>
          <button onClick={handleLogout} title="Sair"
            className="text-white/50 hover:text-white transition-colors p-1">
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </aside>
  )

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:block w-64 flex-shrink-0 sticky top-0 h-screen">
        <Sidebar />
      </div>

      {/* Mobile sidebar */}
      <div className={`fixed top-0 left-0 h-full z-30 lg:hidden transition-transform duration-200 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-4 bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
          <button onClick={() => setOpen(true)}>
            <Menu size={22} className="text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-sidebar rounded-lg flex items-center justify-center">
              <TrendingUp size={14} className="text-white" />
            </div>
            <span className="font-bold text-gray-900">FinControl</span>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
