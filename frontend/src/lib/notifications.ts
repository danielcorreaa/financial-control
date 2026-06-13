import api from './api'
import type { MonthResponse, Expense } from '../types'
import { MONTH_NAMES } from './utils'

export interface DueExpense {
  monthId:      string
  monthLabel:   string
  expense:      Expense
  daysUntilDue: number
}

export async function fetchDueExpenses(): Promise<DueExpense[]> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const in7Days = new Date(today)
  in7Days.setDate(in7Days.getDate() + 7)

  const res = await api.get<MonthResponse[]>('/months')
  const open = res.data.filter(m => m.status === 'ABERTO')

  return open
    .flatMap(m =>
      m.expenses
        .filter(e => {
          if (e.status !== 'PENDENTE' || !e.dueDate) return false
          const due = new Date(e.dueDate + 'T00:00:00')
          return due <= in7Days
        })
        .map(e => {
          const due = new Date(e.dueDate! + 'T00:00:00')
          const daysUntilDue = Math.ceil((due.getTime() - today.getTime()) / 86_400_000)
          return { monthId: m.id, monthLabel: `${MONTH_NAMES[m.month]}/${m.year}`, expense: e, daysUntilDue }
        })
    )
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue)
}

export async function showBrowserNotification(due: DueExpense[]) {
  if (!('Notification' in window) || due.length === 0) return
  if (sessionStorage.getItem('fc-notified')) return

  let perm = Notification.permission
  if (perm === 'default') perm = await Notification.requestPermission()
  if (perm !== 'granted') return

  const overdue = due.filter(d => d.daysUntilDue < 0)
  const todayItems = due.filter(d => d.daysUntilDue === 0)

  let body: string
  if (overdue.length > 0) {
    body = `⚠️ ${overdue.length} despesa(s) vencida(s)! + ${due.length - overdue.length} vence(m) em breve.`
  } else if (todayItems.length > 0) {
    body = `⏰ ${todayItems.length} despesa(s) vence(m) hoje! Total: ${due.length} nos próximos 7 dias.`
  } else {
    body = `📅 ${due.length} despesa(s) vencem nos próximos 7 dias.`
  }

  new Notification('💰 FinControl — Despesas Pendentes', { body, icon: '/favicon.ico', tag: 'fc-due' })
  sessionStorage.setItem('fc-notified', '1')
}
