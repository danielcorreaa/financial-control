import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  LayoutDashboard, Calendar, FolderKanban, LogOut, TrendingUp, Menu, X,
  Wallet, BarChart2, RefreshCw, Moon, Sun, Target, CreditCard, PieChart,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import NotificationBell from './NotificationBell'
import { fetchDueExpenses, showBrowserNotification } from '../lib/notifications'
import type { DueExpense } from '../lib/notifications'

const navItems = [
  { to: '/',          label: 'Dashboard',   icon: LayoutDashboard, end: true  },
  { to: '/months',    label: 'Meses',       icon: Calendar,        end: false },
  { to: '/recurring', label: 'Recorrentes', icon: RefreshCw,       end: false },
  { to: '/budget',    label: 'Orçamento',   icon: Target,          end: false },
  { to: '/faturas',   label: 'Faturas',     icon: CreditCard,      end: false },
  { to: '/analises',  label: 'Análises',    icon: PieChart,        end: false },
  { to: '/proventos', label: 'Proventos',   icon: Wallet,          end: false },
  { to: '/charts',    label: 'Gráficos',    icon: BarChart2,       end: false },
  { to: '/projects',  label: 'Projetos',    icon: FolderKanban,    end: false },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen]           = useState(false)
  const [dark, setDark]           = useState(() => localStorage.getItem('theme') === 'dark')
  const [due, setDue]             = useState<DueExpense[]>([])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  useEffect(() => {
    fetchDueExpenses()
      .then(list => {
        setDue(list)
        return showBrowserNotification(list)
      })
      .catch(() => {})
  }, [])

  function handleLogout() { logout(); navigate('/login') }

  const currentPage = navItems.find(item =>
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
  )?.label ?? 'FinControl'

  const Sidebar = () => (
    <aside className="flex flex-col h-full w-64 bg-sidebar border-r border-white/[0.06]">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 pb-5 border-b border-white/[0.06]"
           style={{ paddingTop: 'max(1.5rem, env(safe-area-inset-top))' }}>
        <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-700/50 flex-shrink-0">
          <TrendingUp size={15} className="text-white" />
        </div>
        <span className="text-[15px] font-bold tracking-tight text-white">FinControl</span>
        <button className="ml-auto lg:hidden p-1 rounded-lg hover:bg-white/[0.06] transition-colors" onClick={() => setOpen(false)}>
          <X size={16} className="text-slate-400 hover:text-white" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to} to={to} end={end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-violet-500/[0.14] text-white'
                  : 'text-slate-400 hover:bg-white/[0.05] hover:text-slate-200'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={16} className={isActive ? 'text-violet-400' : 'text-slate-500'} />
                <span className="flex-1">{label}</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-white/[0.04] transition-colors">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-white/90 truncate leading-tight">{user?.name}</p>
            <p className="text-[11px] text-slate-500 truncate leading-tight">{user?.email}</p>
          </div>
          <div className="flex items-center gap-0.5">
            <NotificationBell due={due} />
            <button onClick={() => setDark(d => !d)} title={dark ? 'Modo claro' : 'Modo escuro'}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.06] transition-colors">
              {dark ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <button onClick={handleLogout} title="Sair"
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-white/[0.06] transition-colors">
              <LogOut size={14} />
            </button>
          </div>
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
      <div className="hidden lg:block w-64 flex-shrink-0 sticky top-0 h-screen shadow-2xl shadow-violet-950/30">
        <Sidebar />
      </div>

      {/* Mobile sidebar */}
      <div className={`fixed top-0 left-0 h-full z-30 lg:hidden transition-transform duration-200 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header
          className="lg:hidden flex items-center gap-3 px-4 pb-4 bg-white/95 dark:bg-[#0d1117]/95 backdrop-blur border-b border-gray-100 dark:border-white/5 sticky top-0 z-10 shadow-sm shadow-violet-100/50"
          style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
        >
          <button onClick={() => setOpen(true)}>
            <Menu size={22} className="text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center shadow-sm shadow-violet-600/40">
              <TrendingUp size={13} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white">{currentPage}</span>
          </div>
        </header>

        <main
          className="flex-1 p-4 lg:p-8 overflow-auto bg-[#f3f4f8] dark:bg-[#0d1117]"
          style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
