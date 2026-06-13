import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, TrendingDown, Wallet, PiggyBank, ArrowRight, Loader2 } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import api from '../lib/api'
import type { DashboardResponse } from '../types'
import { formatCurrency, currentYear, MONTH_NAMES } from '../lib/utils'
import StatCard from '../components/StatCard'

const fmtAxis = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0, notation: 'compact' }).format(v)

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  const dark = document.documentElement.classList.contains('dark')
  return (
    <div style={{
      background: dark ? '#1a2235' : '#fff',
      border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}`,
      borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
      padding: '10px 14px', fontSize: 13, minWidth: 160,
    }}>
      <p style={{ fontWeight: 700, color: dark ? '#dde3f0' : '#1e293b', marginBottom: 8 }}>{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
            <span style={{ color: dark ? '#94a3b8' : '#64748b' }}>{p.name}</span>
          </span>
          <span style={{ fontWeight: 600, color: dark ? '#dde3f0' : '#0f172a' }}>{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null)
  const [year, setYear] = useState(currentYear())
  const [loading, setLoading] = useState(true)
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))
  const years = Array.from({ length: 5 }, (_, i) => currentYear() - 2 + i)

  useEffect(() => {
    const obs = new MutationObserver(() =>
      setDark(document.documentElement.classList.contains('dark'))
    )
    obs.observe(document.documentElement, { attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    setLoading(true)
    api.get<DashboardResponse>(`/dashboard?year=${year}`)
      .then(r => setData(r.data))
      .finally(() => setLoading(false))
  }, [year])

  const chartData = data?.months.map(m => ({
    month: MONTH_NAMES[m.month].substring(0, 3),
    Receitas: m.totalIncomes,
    Despesas: m.totalExpenses,
    Saldo: m.balance,
  })) ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Visão consolidada das suas finanças</p>
        </div>
        <select value={year} onChange={e => setYear(Number(e.target.value))} className="input w-32">
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={36} className="animate-spin text-violet-500" />
        </div>
      ) : !data ? null : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Receitas Anuais"  value={formatCurrency(data.totalAnnualIncomes)}
              gradient="from-emerald-500 to-teal-600" icon={<TrendingUp size={20} />} />
            <StatCard label="Despesas Anuais"  value={formatCurrency(data.totalAnnualExpenses)}
              gradient="from-rose-500 to-pink-600"    icon={<TrendingDown size={20} />} />
            <StatCard label="Saldo Anual"      value={formatCurrency(data.totalAnnualBalance)}
              gradient={data.totalAnnualBalance >= 0 ? 'from-violet-500 to-indigo-600' : 'from-amber-500 to-orange-600'}
              icon={<Wallet size={20} />} />
            <StatCard label="Saldo Acumulado"  value={formatCurrency(data.accumulatedBalance)}
              gradient={data.accumulatedBalance >= 0 ? 'from-cyan-500 to-blue-600' : 'from-red-500 to-rose-600'}
              icon={<PiggyBank size={20} />} />
          </div>

          {/* Trend chart */}
          {chartData.length > 0 && (
            <div className="card">
              <div className="mb-4">
                <h2 className="text-base font-bold text-gray-900">Tendência Mensal — {year}</h2>
                <p className="text-xs text-gray-400 mt-0.5">Receitas, despesas e saldo mês a mês</p>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dbReceit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="dbDesp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="dbSaldo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={dark ? 'rgba(255,255,255,0.06)' : '#f1f5f9'} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <YAxis tickFormatter={fmtAxis} tick={{ fontSize: 11, fill: '#94a3b8' }} width={75} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="Receitas" stroke="#10b981" fill="url(#dbReceit)" strokeWidth={2} dot={{ r: 3 }} />
                  <Area type="monotone" dataKey="Despesas" stroke="#ef4444" fill="url(#dbDesp)"   strokeWidth={2} dot={{ r: 3 }} />
                  <Area type="monotone" dataKey="Saldo"    stroke="#8b5cf6" fill="url(#dbSaldo)"  strokeWidth={2} dot={{ r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Monthly table */}
          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-gray-900">Resumo Mensal — {year}</h2>
              <Link to="/months" className="text-xs font-semibold text-violet-600 hover:underline flex items-center gap-1">
                Ver todos <ArrowRight size={13} />
              </Link>
            </div>

            {data.months.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-10">
                Nenhum mês cadastrado.{' '}
                <Link to="/months" className="text-violet-600 font-semibold hover:underline">Criar agora</Link>
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-100 text-xs text-gray-400 uppercase tracking-wider">
                      <th className="text-left pb-3 pr-4 font-semibold">Mês</th>
                      <th className="text-right pb-3 pr-4 font-semibold">Receitas</th>
                      <th className="text-right pb-3 pr-4 font-semibold">Despesas</th>
                      <th className="text-right pb-3 pr-4 font-semibold hidden md:table-cell">Pago</th>
                      <th className="text-right pb-3 pr-4 font-semibold hidden md:table-cell">Pendente</th>
                      <th className="text-right pb-3 pr-4 font-semibold">Saldo</th>
                      <th className="text-left pb-3 font-semibold">Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.months.map(m => (
                      <tr key={m.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="py-3.5 pr-4 font-semibold text-gray-800">{MONTH_NAMES[m.month]}</td>
                        <td className="py-3.5 pr-4 text-right font-medium text-emerald-600">{formatCurrency(m.totalIncomes)}</td>
                        <td className="py-3.5 pr-4 text-right font-medium text-rose-500">{formatCurrency(m.totalExpenses)}</td>
                        <td className="py-3.5 pr-4 text-right text-gray-500 hidden md:table-cell">{formatCurrency(m.totalPaid)}</td>
                        <td className="py-3.5 pr-4 text-right text-amber-600 hidden md:table-cell">{formatCurrency(m.totalPending)}</td>
                        <td className={`py-3.5 pr-4 text-right font-bold ${m.balance >= 0 ? 'text-violet-600' : 'text-rose-600'}`}>
                          {formatCurrency(m.balance)}
                        </td>
                        <td className="py-3.5 pr-4">
                          <span className={m.status === 'FECHADO' ? 'badge-gray' : 'badge-green'}>
                            {m.status === 'FECHADO' ? 'Fechado' : 'Aberto'}
                          </span>
                        </td>
                        <td className="py-3.5">
                          <Link to={`/months/${m.id}`}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-violet-500 hover:text-violet-700">
                            <ArrowRight size={16} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
