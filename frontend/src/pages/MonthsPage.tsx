import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, ArrowRight, Loader2, Lock, Unlock } from 'lucide-react'
import api from '../lib/api'
import type { MonthResponse } from '../types'
import { formatCurrency, MONTH_NAMES, currentYear } from '../lib/utils'
import Modal from '../components/Modal'
import toast from 'react-hot-toast'

function CreateMonthModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear]   = useState(currentYear())
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true)
    try {
      await api.post('/months', { month, year, notes: notes || undefined })
      toast.success('Mês criado!')
      onCreated(); onClose()
    } finally { setLoading(false) }
  }

  return (
    <Modal title="Novo Mês Financeiro" onClose={onClose} size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Mês</label>
            <select className="input" value={month} onChange={e => setMonth(Number(e.target.value))}>
              {MONTH_NAMES.slice(1).map((n, i) => <option key={i+1} value={i+1}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Ano</label>
            <input type="number" className="input" value={year} min={2000}
              onChange={e => setYear(Number(e.target.value))} required />
          </div>
        </div>
        <div>
          <label className="label">Observações</label>
          <textarea className="input resize-none" rows={3} value={notes}
            onChange={e => setNotes(e.target.value)} placeholder="Opcional..." />
        </div>
        <div className="flex justify-end gap-3 pt-1">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading && <Loader2 size={14} className="animate-spin" />} Criar
          </button>
        </div>
      </form>
    </Modal>
  )
}

// Gradientes por número do mês
const MONTH_GRADIENTS = [
  '', 'from-rose-400 to-pink-600', 'from-orange-400 to-amber-600',
  'from-yellow-400 to-lime-500', 'from-emerald-400 to-teal-600',
  'from-cyan-400 to-blue-600', 'from-blue-400 to-indigo-600',
  'from-indigo-400 to-violet-600', 'from-violet-400 to-purple-600',
  'from-purple-400 to-fuchsia-600', 'from-fuchsia-400 to-rose-600',
  'from-rose-500 to-orange-500', 'from-teal-400 to-cyan-600',
]

export default function MonthsPage() {
  const [months, setMonths] = useState<MonthResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [filterYear, setFilterYear] = useState<number | ''>(currentYear())
  const years = Array.from({ length: 5 }, (_, i) => currentYear() - 2 + i)

  function load() {
    setLoading(true)
    const url = filterYear ? `/months?year=${filterYear}` : '/months'
    api.get<MonthResponse[]>(url).then(r => setMonths(r.data)).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [filterYear])

  const yearMonthCount = filterYear !== ''
    ? months.filter(m => m.year === filterYear).length
    : months.length
  const allMonthsFilled = filterYear !== '' && yearMonthCount >= 12

  const sorted = [...months].sort((a, b) => {
    const statusRank = (s: string) => s === 'FECHADO' ? 1 : 0
    if (statusRank(a.status) !== statusRank(b.status)) return statusRank(a.status) - statusRank(b.status)
    if (a.year !== b.year) return a.year - b.year
    return a.month - b.month
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meses Financeiros</h1>
          <p className="text-gray-500 text-sm mt-0.5">Gerencie seus meses de receitas e despesas</p>
        </div>
        <div className="flex gap-3 items-center">
          <select className="input w-36" value={filterYear}
            onChange={e => setFilterYear(e.target.value ? Number(e.target.value) : '')}>
            <option value="">Todos os anos</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <div className="relative group">
            <button
              className="btn-primary"
              onClick={() => setShowCreate(true)}
              disabled={allMonthsFilled}
            >
              <Plus size={16} /> Novo Mês
            </button>
            {allMonthsFilled && (
              <div className="absolute right-0 top-full mt-2 z-10 hidden group-hover:block w-52 bg-gray-900 text-white text-xs rounded-xl px-3 py-2 shadow-xl">
                Todos os 12 meses de {filterYear} já foram cadastrados.
              </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={36} className="animate-spin text-violet-500" />
        </div>
      ) : months.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-gray-400 mb-4">Nenhum mês encontrado.</p>
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={16} /> Criar primeiro mês
          </button>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {sorted.map(m => {
            const totalE = m.expenses.reduce((s, e) => s + e.amount, 0)
            const totalI = m.incomes.reduce((s, i) => s + i.amount, 0)
            const paid   = m.expenses.filter(e => e.status === 'PAGO').reduce((s, e) => s + e.amount, 0)
            const pending = totalE - paid
            const balance = totalI - totalE
            const isClosed = m.status === 'FECHADO'

            return (
              <div key={m.id} className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
                {/* Colored header */}
                <div className={`bg-gradient-to-br ${MONTH_GRADIENTS[m.month]} p-5 text-white relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-black/15 pointer-events-none" />
                  <div className="relative flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold">{MONTH_NAMES[m.month]}</h3>
                      <p className="text-white/70 text-sm">{m.year}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                      isClosed ? 'bg-black/20 text-white' : 'bg-white/25 text-white'
                    }`}>
                      {isClosed ? <><Lock size={10} /> Fechado</> : <><Unlock size={10} /> Aberto</>}
                    </span>
                  </div>
                  <p className="relative text-2xl font-bold mt-3 drop-shadow-sm">{formatCurrency(balance)}</p>
                  <p className="relative text-white/60 text-xs">saldo do mês</p>
                </div>

                {/* Body */}
                <div className="p-5 space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> Receitas
                    </span>
                    <span className="font-semibold text-emerald-600">{formatCurrency(totalI)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" /> Despesas
                    </span>
                    <span className="font-semibold text-rose-500">{formatCurrency(totalE)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-violet-400 inline-block" /> Pago
                    </span>
                    <span className="font-semibold text-violet-600">{formatCurrency(paid)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Pendente
                    </span>
                    <span className="font-semibold text-amber-600">{formatCurrency(pending)}</span>
                  </div>

                  {/* Progress */}
                  {totalE > 0 && (
                    <div className="pt-1">
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all"
                          style={{ width: `${Math.min(100, (paid / totalE) * 100)}%` }} />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {Math.round((paid / totalE) * 100)}% das despesas pagas
                      </p>
                    </div>
                  )}

                  <Link to={`/months/${m.id}`}
                    className="flex items-center justify-center gap-2 w-full mt-2 py-2.5 rounded-xl
                      bg-gradient-to-r from-slate-50 to-violet-50/50 hover:from-violet-50 hover:to-purple-50
                      text-gray-600 hover:text-violet-700
                      font-semibold text-sm transition-all duration-200 border border-gray-100 hover:border-violet-200 hover:shadow-sm">
                    Ver detalhes <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showCreate && <CreateMonthModal onClose={() => setShowCreate(false)} onCreated={load} />}
    </div>
  )
}
