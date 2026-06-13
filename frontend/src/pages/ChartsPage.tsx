import { useEffect, useState, useMemo } from 'react'
import {
  AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { Loader2, TrendingUp, TrendingDown, Wallet, Filter } from 'lucide-react'
import api from '../lib/api'
import type { MonthResponse, ExpenseCategory } from '../types'
import { formatCurrency, MONTH_NAMES, currentYear, CATEGORY_LABELS } from '../lib/utils'
import StatCard from '../components/StatCard'

// ── Paleta de cores ───────────────────────────────────────────────────────────
const COLORS = [
  '#8b5cf6', '#6366f1', '#3b82f6', '#06b6d4', '#10b981',
  '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#f97316',
]

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

// ── Formatadores ──────────────────────────────────────────────────────────────
const fmtCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)

// ── Tooltip customizado ───────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm min-w-[160px]">
      <p className="font-bold text-gray-800 mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: p.color }} />
            <span className="text-gray-600">{p.name}</span>
          </span>
          <span className="font-semibold text-gray-900">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

// ── Componente de card de gráfico ─────────────────────────────────────────────
function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="card">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-gray-900">{title}</h3>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function ChartsPage() {
  const [year, setYear]       = useState(currentYear())
  const [months, setMonths]   = useState<MonthResponse[]>([])
  const [loading, setLoading] = useState(true)

  // filtros
  const [selectedExpense, setSelectedExpense] = useState<string>('') // nome de conta específica
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | ''>('')

  const years = Array.from({ length: 5 }, (_, i) => currentYear() - 2 + i)

  useEffect(() => {
    setLoading(true)
    api.get<MonthResponse[]>(`/months?year=${year}`)
      .then(r => {
        const sorted = [...r.data].sort((a, b) => a.month - b.month)
        setMonths(sorted)
      })
      .finally(() => setLoading(false))
  }, [year])

  // ── Nomes únicos de despesas (para o filtro de conta) ─────────────────────
  const expenseNames = useMemo(() => {
    const names = new Set<string>()
    months.forEach(m => m.expenses.forEach(e => names.add(e.name)))
    return Array.from(names).sort()
  }, [months])

  // ── Dados mensais principais ─────────────────────────────────────────────
  const monthlyData = useMemo(() => {
    return months.map(m => {
      const totalIncome  = m.incomes.reduce((s, i) => s + i.amount, 0)
      const totalExpense = m.expenses.reduce((s, e) => s + e.amount, 0)
      const totalPaid    = m.expenses.filter(e => e.status === 'PAGO').reduce((s, e) => s + e.amount, 0)
      const balance      = totalIncome - totalExpense

      return {
        month:    MONTH_NAMES[m.month].substring(0, 3),
        Receitas: totalIncome,
        Despesas: totalExpense,
        Pago:     totalPaid,
        Saldo:    balance,
      }
    })
  }, [months])

  // ── Evolução de uma conta específica ─────────────────────────────────────
  const accountData = useMemo(() => {
    if (!selectedExpense) return []
    return months.map(m => {
      const expense = m.expenses.find(e =>
        e.name.toLowerCase() === selectedExpense.toLowerCase()
      )
      return {
        month: MONTH_NAMES[m.month].substring(0, 3),
        Valor: expense?.amount ?? 0,
      }
    })
  }, [months, selectedExpense])

  // ── Evolução de uma categoria ─────────────────────────────────────────────
  const categoryData = useMemo(() => {
    if (!selectedCategory) return []
    return months.map(m => {
      const total = m.expenses
        .filter(e => e.category === selectedCategory)
        .reduce((s, e) => s + e.amount, 0)
      return {
        month: MONTH_NAMES[m.month].substring(0, 3),
        Valor: total,
      }
    })
  }, [months, selectedCategory])

  // ── Pizza — distribuição por categoria (soma do ano) ─────────────────────
  const pieData = useMemo(() => {
    const totals: Partial<Record<ExpenseCategory, number>> = {}
    months.forEach(m =>
      m.expenses.forEach(e => {
        totals[e.category] = (totals[e.category] ?? 0) + e.amount
      })
    )
    return Object.entries(totals)
      .map(([cat, val]) => ({
        name:  CATEGORY_LABELS[cat as ExpenseCategory],
        value: val as number,
        color: CATEGORY_COLORS[cat as ExpenseCategory],
      }))
      .sort((a, b) => b.value - a.value)
  }, [months])

  // ── Top despesas do ano ───────────────────────────────────────────────────
  const topExpenses = useMemo(() => {
    const totals: Record<string, number> = {}
    months.forEach(m =>
      m.expenses.forEach(e => {
        totals[e.name] = (totals[e.name] ?? 0) + e.amount
      })
    )
    return Object.entries(totals)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8)
  }, [months])

  // ── Saldo acumulado mês a mês ─────────────────────────────────────────────
  const accumulatedData = useMemo(() => {
    let acc = 0
    return monthlyData.map(d => {
      acc += d.Saldo
      return { month: d.month, 'Saldo Acumulado': acc, 'Saldo Mensal': d.Saldo }
    })
  }, [monthlyData])

  // ── Métricas de resumo ────────────────────────────────────────────────────
  const totalIncome  = monthlyData.reduce((s, d) => s + d.Receitas, 0)
  const totalExpense = monthlyData.reduce((s, d) => s + d.Despesas, 0)
  const totalBalance = totalIncome - totalExpense
  const avgExpense   = months.length ? totalExpense / months.length : 0

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gráficos</h1>
          <p className="text-gray-500 text-sm mt-0.5">Evolução e análise dos seus gastos</p>
        </div>
        <select value={year} onChange={e => setYear(Number(e.target.value))} className="input w-32">
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={36} className="animate-spin text-violet-500" />
        </div>
      ) : months.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          Nenhum dado encontrado para {year}.
        </div>
      ) : (
        <>
          {/* ── KPIs ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Receitas Totais"    value={fmtCurrency(totalIncome)}  gradient="from-emerald-500 to-teal-600" icon={<TrendingUp size={20} />} />
            <StatCard label="Despesas Totais"    value={fmtCurrency(totalExpense)} gradient="from-rose-500 to-pink-600"    icon={<TrendingDown size={20} />} />
            <StatCard label="Saldo do Ano"       value={fmtCurrency(totalBalance)} gradient={totalBalance >= 0 ? 'from-violet-500 to-indigo-600' : 'from-orange-500 to-red-600'} icon={<Wallet size={20} />} />
            <StatCard label="Média Mensal Gasto" value={fmtCurrency(avgExpense)}   gradient="from-cyan-500 to-blue-600"    icon={<Filter size={20} />} />
          </div>

          {/* ── Receitas vs Despesas (área) ── */}
          <ChartCard
            title="Receitas × Despesas × Saldo"
            subtitle="Evolução mensal comparativa"
          >
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={monthlyData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gReceit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gDesp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gSaldo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis tickFormatter={fmtCurrency} tick={{ fontSize: 11, fill: '#94a3b8' }} width={90} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="Receitas" stroke="#10b981" fill="url(#gReceit)" strokeWidth={2} dot={{ r: 3 }} />
                <Area type="monotone" dataKey="Despesas" stroke="#ef4444" fill="url(#gDesp)"   strokeWidth={2} dot={{ r: 3 }} />
                <Area type="monotone" dataKey="Saldo"    stroke="#8b5cf6" fill="url(#gSaldo)"  strokeWidth={2} dot={{ r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* ── Saldo acumulado + Top despesas ── */}
          <div className="grid lg:grid-cols-2 gap-6">
            <ChartCard title="Saldo Acumulado" subtitle="Quanto sobrou acumulando mês a mês">
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={accumulatedData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gAcc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis tickFormatter={fmtCurrency} tick={{ fontSize: 10, fill: '#94a3b8' }} width={85} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="Saldo Acumulado" stroke="#6366f1" fill="url(#gAcc)" strokeWidth={2.5} dot={{ r: 3 }} />
                  <Bar dataKey="Saldo Mensal" fill="#c7d2fe" radius={[4,4,0,0]} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Top 8 Despesas do Ano" subtitle="Maiores gastos consolidados">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={topExpenses} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tickFormatter={fmtCurrency} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} width={120} />
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                  <Bar dataKey="total" name="Total" radius={[0, 6, 6, 0]}>
                    {topExpenses.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* ── Distribuição por categoria + Pago vs Pendente ── */}
          <div className="grid lg:grid-cols-2 gap-6">
            <ChartCard title="Distribuição por Categoria" subtitle={`Total do ano ${year}`}>
              <div className="flex gap-4">
                <ResponsiveContainer width="55%" height={220}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                      dataKey="value" paddingAngle={2}>
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-1.5 self-center overflow-y-auto max-h-52 pr-1">
                  {pieData.map((d, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                        <span className="text-gray-600 truncate">{d.name}</span>
                      </div>
                      <span className="font-semibold text-gray-800 flex-shrink-0">{fmtCurrency(d.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ChartCard>

            <ChartCard title="Pago vs Pendente" subtitle="Situação mensal das despesas">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis tickFormatter={fmtCurrency} tick={{ fontSize: 10, fill: '#94a3b8' }} width={80} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Pago"    stackId="a" fill="#10b981" radius={[0,0,0,0]} name="Pago" />
                  <Bar dataKey="Saldo"   stackId="b" fill="#8b5cf6" radius={[4,4,0,0]} name="Saldo" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* ── Filtro por conta específica ── */}
          <ChartCard
            title="Evolução de uma Conta Específica"
            subtitle="Acompanhe como um gasto evoluiu ao longo do ano"
          >
            <div className="mb-4">
              <select
                className="input max-w-xs"
                value={selectedExpense}
                onChange={e => setSelectedExpense(e.target.value)}
              >
                <option value="">— Selecione uma conta —</option>
                {expenseNames.map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            {selectedExpense ? (
              <>
                {/* mini KPIs da conta */}
                {(() => {
                  const vals = accountData.map(d => d.Valor).filter(v => v > 0)
                  const total = vals.reduce((s, v) => s + v, 0)
                  const avg   = vals.length ? total / vals.length : 0
                  const max   = Math.max(...vals, 0)
                  const min   = Math.min(...vals, Infinity) === Infinity ? 0 : Math.min(...vals)
                  return (
                    <div className="grid grid-cols-4 gap-3 mb-4">
                      {[
                        { label: 'Total Anual', value: total, color: 'bg-violet-50 text-violet-700' },
                        { label: 'Média Mensal', value: avg,  color: 'bg-blue-50 text-blue-700' },
                        { label: 'Maior Mês',   value: max,  color: 'bg-rose-50 text-rose-700' },
                        { label: 'Menor Mês',   value: min,  color: 'bg-emerald-50 text-emerald-700' },
                      ].map(k => (
                        <div key={k.label} className={`${k.color} rounded-xl p-3 text-center`}>
                          <p className="text-xs font-semibold uppercase tracking-wide opacity-70 mb-0.5">{k.label}</p>
                          <p className="font-bold text-sm">{formatCurrency(k.value)}</p>
                        </div>
                      ))}
                    </div>
                  )
                })()}

                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={accountData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gAccount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis tickFormatter={fmtCurrency} tick={{ fontSize: 10, fill: '#94a3b8' }} width={85} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="Valor" name={selectedExpense}
                      stroke="#8b5cf6" fill="url(#gAccount)" strokeWidth={2.5}
                      dot={{ r: 4, fill: '#8b5cf6' }} activeDot={{ r: 6 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </>
            ) : (
              <div className="h-32 flex items-center justify-center text-gray-300 text-sm">
                Selecione uma conta acima para ver a evolução
              </div>
            )}
          </ChartCard>

          {/* ── Filtro por categoria ── */}
          <ChartCard
            title="Evolução por Categoria"
            subtitle="Acompanhe o comportamento de uma categoria ao longo do ano"
          >
            <div className="mb-4">
              <select
                className="input max-w-xs"
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value as ExpenseCategory | '')}
              >
                <option value="">— Selecione uma categoria —</option>
                {(Object.entries(CATEGORY_LABELS) as [ExpenseCategory, string][]).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>

            {selectedCategory ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={categoryData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis tickFormatter={fmtCurrency} tick={{ fontSize: 10, fill: '#94a3b8' }} width={85} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="Valor" name={CATEGORY_LABELS[selectedCategory]}
                    fill={CATEGORY_COLORS[selectedCategory]} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-32 flex items-center justify-center text-gray-300 text-sm">
                Selecione uma categoria acima
              </div>
            )}
          </ChartCard>
        </>
      )}
    </div>
  )
}
