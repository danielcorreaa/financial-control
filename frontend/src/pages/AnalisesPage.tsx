import { useEffect, useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Loader2, TrendingDown, Calendar, ChevronLeft, ChevronRight, CreditCard, AlertCircle } from 'lucide-react'
import api from '../lib/api'
import { formatCurrency, CATEGORY_LABELS, currentYear } from '../lib/utils'
import type { ExpenseCategory, MonthCategoryTotals, InstallmentDTO } from '../types'

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  MORADIA:        '#3b82f6',
  EDUCACAO:       '#8b5cf6',
  TRANSPORTE:     '#06b6d4',
  ALIMENTACAO:    '#f97316',
  LAZER:          '#d946ef',
  CARTAO_CREDITO: '#ec4899',
  IMPOSTOS:       '#ef4444',
  TELEFONIA:      '#14b8a6',
  INTERNET:       '#6366f1',
  OUTROS:         '#94a3b8',
}

const MONTH_NAMES = ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

const fmtCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-[#1a2235] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl p-3 text-sm min-w-[180px]">
      <p className="font-bold text-gray-800 dark:text-slate-200 mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: p.fill }} />
            <span className="text-gray-500 dark:text-slate-400">{p.name}</span>
          </span>
          <span className="font-semibold text-gray-900 dark:text-slate-100">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function AnalisesPage() {
  const [year, setYear]                   = useState(currentYear())
  const [monthly, setMonthly]             = useState<MonthCategoryTotals[]>([])
  const [installments, setInstallments]   = useState<InstallmentDTO[]>([])
  const [loadingM, setLoadingM]           = useState(true)
  const [loadingI, setLoadingI]           = useState(true)
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null)

  useEffect(() => {
    setLoadingM(true)
    api.get<MonthCategoryTotals[]>(`/analytics/by-category?year=${year}`)
      .then(r => setMonthly(r.data))
      .catch(() => {})
      .finally(() => setLoadingM(false))
  }, [year])

  useEffect(() => {
    api.get<InstallmentDTO[]>('/analytics/installments')
      .then(r => setInstallments(r.data))
      .catch(() => {})
      .finally(() => setLoadingI(false))
  }, [])

  // Build chart data: one bar per month, each segment = category
  const chartData = useMemo(() =>
    monthly.map(m => {
      const point: Record<string, number | string> = {
        name: MONTH_NAMES[m.month] ?? String(m.month),
        month: m.month,
      }
      for (const [cat, val] of Object.entries(m.totals)) {
        point[CATEGORY_LABELS[cat as ExpenseCategory]] = val ?? 0
      }
      return point
    }), [monthly])

  // All categories present in the data
  const activeCategories = useMemo(() => {
    const cats = new Set<ExpenseCategory>()
    monthly.forEach(m => Object.keys(m.totals).forEach(c => cats.add(c as ExpenseCategory)))
    return [...cats]
  }, [monthly])

  // Month detail: breakdown table for selected month
  const monthDetail = selectedMonth !== null
    ? monthly.find(m => m.month === selectedMonth)
    : null

  // Aggregate: category totals for the year
  const yearTotals = useMemo(() => {
    const totals: Partial<Record<ExpenseCategory, number>> = {}
    monthly.forEach(m => {
      for (const [cat, val] of Object.entries(m.totals)) {
        totals[cat as ExpenseCategory] = (totals[cat as ExpenseCategory] ?? 0) + (val ?? 0)
      }
    })
    return Object.entries(totals)
      .sort(([, a], [, b]) => b - a)
      .map(([cat, val]) => ({ cat: cat as ExpenseCategory, val }))
  }, [monthly])

  const yearGrandTotal = yearTotals.reduce((s, t) => s + t.val, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Análises</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            Gastos por categoria e parcelas ativas
          </p>
        </div>
        {/* Year selector */}
        <div className="flex items-center gap-2 bg-white dark:bg-[#1a2235] border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 shadow-sm">
          <button onClick={() => setYear(y => y - 1)} className="text-gray-400 hover:text-violet-500 transition-colors">
            <ChevronLeft size={18} />
          </button>
          <span className="font-bold text-gray-800 dark:text-slate-200 w-12 text-center">{year}</span>
          <button onClick={() => setYear(y => y + 1)} className="text-gray-400 hover:text-violet-500 transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Stacked bar chart */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-slate-100">Gastos por Categoria — {year}</h2>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">Clique em uma barra para ver o detalhamento</p>
          </div>
          {yearGrandTotal > 0 && (
            <p className="text-sm font-bold text-gray-700 dark:text-slate-300">{formatCurrency(yearGrandTotal)}</p>
          )}
        </div>
        {loadingM ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-violet-500" /></div>
        ) : monthly.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-10">Nenhum dado para {year}</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} onClick={(d: any) => {
            if (d?.activeLabel) {
              const found = monthly.find(m => MONTH_NAMES[m.month] === d.activeLabel)
              setSelectedMonth(found?.month ?? null)
            }
          }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={fmtCurrency} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={72} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(139,92,246,0.06)' }} />
              {activeCategories.map(cat => (
                <Bar
                  key={cat}
                  dataKey={CATEGORY_LABELS[cat]}
                  stackId="a"
                  fill={CATEGORY_COLORS[cat]}
                  radius={activeCategories[activeCategories.length - 1] === cat ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Year category totals */}
        <div className="card">
          <h2 className="text-sm font-bold text-gray-900 dark:text-slate-100 mb-4">Resumo Anual por Categoria</h2>
          {loadingM ? (
            <div className="flex justify-center py-8"><Loader2 className="animate-spin text-violet-500" /></div>
          ) : yearTotals.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-6">Sem dados</p>
          ) : (
            <div className="space-y-3">
              {yearTotals.map(({ cat, val }) => {
                const pct = yearGrandTotal > 0 ? (val / yearGrandTotal) * 100 : 0
                const color = CATEGORY_COLORS[cat]
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                        <span className="text-gray-700 dark:text-slate-300">{CATEGORY_LABELS[cat]}</span>
                      </span>
                      <span className="font-semibold text-gray-800 dark:text-slate-200">{formatCurrency(val)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Installments */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard size={16} className="text-violet-500" />
            <h2 className="text-sm font-bold text-gray-900 dark:text-slate-100">Parcelas Ativas</h2>
          </div>

          {loadingI ? (
            <div className="flex justify-center py-8"><Loader2 className="animate-spin text-violet-500" /></div>
          ) : installments.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle size={24} className="text-gray-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-gray-400 dark:text-slate-500">
                Nenhuma parcela detectada. Adicione despesas com o padrão "Nome 3/12" para rastrear parcelas.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {installments.map(inst => {
                const pct = inst.total > 0 ? (inst.current / inst.total) * 100 : 0
                const endLabel = inst.endDate
                  ? new Date(inst.endDate + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
                  : '—'
                return (
                  <div key={inst.expenseId} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-gray-800 dark:text-slate-200 truncate">{inst.name}</p>
                        <span className="text-xs font-bold text-gray-600 dark:text-slate-400 flex-shrink-0 tabular-nums">
                          {inst.current}/{inst.total}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 h-1.5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                          <div className="h-full rounded-full bg-violet-500 transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-gray-400 dark:text-slate-500 flex-shrink-0">
                          {inst.remaining}x · termina {endLabel}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                        {formatCurrency(inst.monthlyAmount)}/mês
                        {inst.remaining > 0 && (
                          <span className="ml-1 text-violet-600 dark:text-violet-400">
                            · total restante {formatCurrency(inst.monthlyAmount * inst.remaining)}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Month detail breakdown */}
      {monthDetail && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-900 dark:text-slate-100">
              <Calendar size={14} className="inline mr-1.5 -mt-0.5" />
              Detalhamento — {MONTH_NAMES[monthDetail.month]}/{year}
            </h2>
            <button
              onClick={() => setSelectedMonth(null)}
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
            >
              Fechar ×
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(monthDetail.totals)
              .sort(([, a], [, b]) => b - a)
              .map(([cat, val]) => (
                <div key={cat} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: CATEGORY_COLORS[cat as ExpenseCategory] }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 dark:text-slate-400">{CATEGORY_LABELS[cat as ExpenseCategory]}</p>
                    <p className="text-sm font-bold text-gray-800 dark:text-slate-100">{formatCurrency(val ?? 0)}</p>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-slate-500">
                    {monthDetail.grandTotal > 0 ? Math.round(((val ?? 0) / monthDetail.grandTotal) * 100) : 0}%
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
