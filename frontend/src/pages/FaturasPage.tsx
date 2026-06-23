import { useEffect, useState } from 'react'
import { Plus, Trash2, ExternalLink, CreditCard, Loader2, FileUp } from 'lucide-react'
import api from '../lib/api'
import { formatCurrency, formatDate, MONTH_NAMES } from '../lib/utils'
import type { CardBank, CardInvoice } from '../types'
import toast from 'react-hot-toast'
import AddInvoiceModal from '../components/AddInvoiceModal'
import { useNavigate } from 'react-router-dom'

const BANK_COLORS: Record<CardBank, string> = {
  BRADESCO: 'bg-red-500',
  CAIXA:    'bg-blue-600',
  ITAU:     'bg-orange-500',
  MERCADO_PAGO: 'bg-sky-500',
  RIACHUELO: 'bg-purple-600',
  OUTRO:    'bg-gray-500',
}

const BANK_LABELS: Record<CardBank, string> = {
  BRADESCO:     'Bradesco',
  CAIXA:        'Caixa',
  ITAU:         'Itaú',
  MERCADO_PAGO: 'Mercado Pago',
  RIACHUELO:    'Riachuelo',
  OUTRO:        'Outro',
}

export default function FaturasPage() {
  const [invoices, setInvoices] = useState<CardInvoice[]>([])
  const [loading, setLoading]   = useState(true)
  const [adding, setAdding]     = useState(false)
  const navigate = useNavigate()

  async function load() {
    try {
      const { data } = await api.get<CardInvoice[]>('/card-invoices')
      setInvoices(data)
    } catch {
      toast.error('Erro ao carregar faturas.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Remover fatura "${name}" e a despesa associada?`)) return
    try {
      await api.delete(`/card-invoices/${id}`)
      toast.success('Fatura removida.')
      load()
    } catch {
      toast.error('Erro ao remover fatura.')
    }
  }

  // Group by bank
  const byBank = invoices.reduce<Record<string, CardInvoice[]>>((acc, inv) => {
    const key = inv.bank
    if (!acc[key]) acc[key] = []
    acc[key].push(inv)
    return acc
  }, {})

  const totalByBank = (list: CardInvoice[]) =>
    list.reduce((s, i) => s + i.totalAmount, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={28} className="animate-spin text-violet-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Faturas de Cartão</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            Adicione faturas — o valor é lançado automaticamente no mês do vencimento
          </p>
        </div>
        <button className="btn-primary" onClick={() => setAdding(true)}>
          <Plus size={16} /> Nova Fatura
        </button>
      </div>

      {invoices.length === 0 ? (
        <div className="card flex flex-col items-center gap-4 py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-violet-100 dark:bg-violet-500/15 flex items-center justify-center">
            <CreditCard size={28} className="text-violet-500" />
          </div>
          <div>
            <p className="font-semibold text-gray-700 dark:text-slate-200">Nenhuma fatura cadastrada</p>
            <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">
              Adicione uma fatura para lançar automaticamente no mês do vencimento
            </p>
          </div>
          <button className="btn-primary" onClick={() => setAdding(true)}>
            <Plus size={16} /> Adicionar primeira fatura
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {(Object.keys(BANK_LABELS) as CardBank[])
            .filter(bank => byBank[bank])
            .map(bank => {
              const list = byBank[bank] ?? []
              const color = BANK_COLORS[bank]
              return (
                <div key={bank} className="card p-0 overflow-hidden">
                  {/* Bank header */}
                  <div className={`${color} px-5 py-4 flex items-center gap-3`}>
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <CreditCard size={20} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-white text-base">{BANK_LABELS[bank]}</p>
                      <p className="text-xs text-white/70">
                        {list.length} fatura{list.length !== 1 ? 's' : ''} · Total {formatCurrency(totalByBank(list))}
                      </p>
                    </div>
                  </div>

                  {/* Invoice list */}
                  <div className="divide-y divide-gray-50 dark:divide-white/5">
                    {list.map(inv => {
                      const [y, m] = inv.dueDate.split('-')
                      const label = inv.cardName || BANK_LABELS[inv.bank]
                      return (
                        <div key={inv.id} className="flex items-center gap-3 px-5 py-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 dark:text-slate-200 truncate">
                              {label}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-slate-500">
                              Vence {formatDate(inv.dueDate)} · {MONTH_NAMES[parseInt(m)]}/{y}
                            </p>
                          </div>
                          <span className="text-sm font-bold text-gray-900 dark:text-slate-100 flex-shrink-0">
                            {formatCurrency(inv.totalAmount)}
                          </span>
                          <button
                            onClick={() => navigate(`/months/${inv.monthId}`)}
                            title="Ver mês"
                            className="text-gray-300 dark:text-slate-600 hover:text-violet-500 dark:hover:text-violet-400 transition-colors p-1 flex-shrink-0"
                          >
                            <ExternalLink size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(inv.id, label)}
                            title="Remover fatura"
                            className="text-gray-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1 flex-shrink-0"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
        </div>
      )}

      {adding && (
        <AddInvoiceModal
          onClose={() => setAdding(false)}
          onAdded={load}
        />
      )}
    </div>
  )
}
