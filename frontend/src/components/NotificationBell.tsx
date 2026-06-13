import { useState } from 'react'
import { Bell, X, AlertCircle, Clock, CalendarCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { DueExpense } from '../lib/notifications'
import { formatCurrency } from '../lib/utils'

function DayTag({ days }: { days: number }) {
  if (days < 0) return (
    <span className="flex items-center gap-1 text-xs font-semibold text-rose-400">
      <AlertCircle size={11} /> {Math.abs(days)}d vencida
    </span>
  )
  if (days === 0) return (
    <span className="flex items-center gap-1 text-xs font-semibold text-amber-400">
      <Clock size={11} /> Vence hoje
    </span>
  )
  return (
    <span className="flex items-center gap-1 text-xs font-semibold text-slate-400">
      <CalendarCheck size={11} /> {days}d restante{days > 1 ? 's' : ''}
    </span>
  )
}

export default function NotificationBell({ due }: { due: DueExpense[] }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const count = due.length
  const hasOverdue = due.some(d => d.daysUntilDue < 0)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="relative text-white/50 hover:text-white transition-colors p-1"
        title={count > 0 ? `${count} despesa(s) próximas do vencimento` : 'Sem pendências'}
      >
        <Bell size={17} className={count > 0 ? 'text-white/80' : ''} />
        {count > 0 && (
          <span className={`absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5
            ${hasOverdue ? 'bg-rose-500' : 'bg-amber-500'}
            text-white text-[10px] font-bold rounded-full flex items-center justify-center`}>
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-10 left-0 w-80 bg-white dark:bg-[#1a2235]
            rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/8">
              <div className="flex items-center gap-2">
                <Bell size={14} className="text-violet-500" />
                <span className="text-sm font-bold text-gray-900">Próximas a vencer</span>
              </div>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 p-0.5 rounded">
                <X size={15} />
              </button>
            </div>

            {count === 0 ? (
              <div className="text-center py-8">
                <CalendarCheck size={28} className="mx-auto text-emerald-400 mb-2" />
                <p className="text-sm text-gray-400">Nenhuma despesa pendente nos próximos 7 dias.</p>
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 dark:divide-white/5">
                {due.map(d => (
                  <button
                    key={d.expense.id}
                    onClick={() => { navigate(`/months/${d.monthId}`); setOpen(false) }}
                    className="w-full flex items-center justify-between px-4 py-3
                      hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-left group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-violet-600 transition-colors">
                        {d.expense.name}
                      </p>
                      <p className="text-xs text-gray-400">{d.monthLabel}</p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3 space-y-0.5">
                      <p className="text-sm font-bold text-gray-800">{formatCurrency(d.expense.amount)}</p>
                      <DayTag days={d.daysUntilDue} />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {count > 0 && (
              <div className="px-4 py-3 border-t border-gray-100 dark:border-white/8 bg-slate-50 dark:bg-white/3">
                <p className="text-xs text-gray-400 text-center">
                  {due.filter(d => d.daysUntilDue < 0).length > 0 && (
                    <span className="text-rose-500 font-semibold">
                      {due.filter(d => d.daysUntilDue < 0).length} vencida(s) ·{' '}
                    </span>
                  )}
                  Total: {formatCurrency(due.reduce((s, d) => s + d.expense.amount, 0))}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
