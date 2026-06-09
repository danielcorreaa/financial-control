import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, TrendingDown, Wallet, PiggyBank, ArrowRight, Loader2 } from 'lucide-react'
import api from '../lib/api'
import type { DashboardResponse } from '../types'
import { formatCurrency, currentYear, MONTH_NAMES } from '../lib/utils'
import StatCard from '../components/StatCard'

export default function DashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null)
  const [year, setYear] = useState(currentYear())
  const [loading, setLoading] = useState(true)
  const years = Array.from({ length: 5 }, (_, i) => currentYear() - 2 + i)

  useEffect(() => {
    setLoading(true)
    api.get<DashboardResponse>(`/dashboard?year=${year}`)
      .then(r => setData(r.data))
      .finally(() => setLoading(false))
  }, [year])

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
            <StatCard label="Saldo Anual"       value={formatCurrency(data.totalAnnualBalance)}
              gradient={data.totalAnnualBalance >= 0 ? 'from-violet-500 to-indigo-600' : 'from-amber-500 to-orange-600'}
              icon={<Wallet size={20} />} />
            <StatCard label="Saldo Acumulado"   value={formatCurrency(data.accumulatedBalance)}
              gradient={data.accumulatedBalance >= 0 ? 'from-cyan-500 to-blue-600' : 'from-red-500 to-rose-600'}
              icon={<PiggyBank size={20} />} />
          </div>

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
