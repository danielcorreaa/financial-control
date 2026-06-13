import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Loader2, RefreshCw } from 'lucide-react'
import api from '../lib/api'
import type { RecurringExpense, ExpenseCategory } from '../types'
import {
  formatCurrency, CATEGORY_LABELS, CATEGORY_BADGE,
} from '../lib/utils'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import toast from 'react-hot-toast'

const CATEGORIES = Object.entries(CATEGORY_LABELS) as [ExpenseCategory, string][]

// ── Form ──────────────────────────────────────────────────────────────────────
function RecurringForm({
  item, onClose, onSaved,
}: { item?: RecurringExpense; onClose: () => void; onSaved: () => void }) {
  const [name, setName]           = useState(item?.name ?? '')
  const [category, setCategory]   = useState<ExpenseCategory>(item?.category ?? 'OUTROS')
  const [amount, setAmount]       = useState(item?.amount?.toString() ?? '')
  const [dayOfMonth, setDay]      = useState(item?.dayOfMonth?.toString() ?? '')
  const [loading, setLoading]     = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const body = {
        name,
        category,
        amount: parseFloat(amount),
        dayOfMonth: dayOfMonth ? parseInt(dayOfMonth) : null,
      }
      if (item) {
        await api.put(`/recurring-expenses/${item.id}`, body)
        toast.success('Despesa recorrente atualizada!')
      } else {
        await api.post('/recurring-expenses', body)
        toast.success('Despesa recorrente criada!')
      }
      onSaved()
      onClose()
    } catch {
      toast.error('Erro ao salvar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title={item ? 'Editar Despesa Recorrente' : 'Nova Despesa Recorrente'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Nome *</label>
          <input className="input" value={name} onChange={e => setName(e.target.value)}
            required placeholder="Ex: Internet, Condomínio..." />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Categoria *</label>
            <select className="input" value={category}
              onChange={e => setCategory(e.target.value as ExpenseCategory)}>
              {CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Valor (R$) *</label>
            <input className="input" type="number" step="0.01" min="0.01"
              value={amount} onChange={e => setAmount(e.target.value)}
              required placeholder="0,00" />
          </div>
        </div>
        <div>
          <label className="label">Dia de vencimento</label>
          <input className="input" type="number" min="1" max="31"
            value={dayOfMonth} onChange={e => setDay(e.target.value)}
            placeholder="Ex: 10 (opcional)" />
          <p className="text-xs text-gray-400 mt-1">Usado para calcular o vencimento ao importar.</p>
        </div>
        <div className="flex justify-end gap-3 pt-1">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading && <Loader2 size={14} className="animate-spin" />}
            {item ? 'Salvar' : 'Criar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function RecurringExpensesPage() {
  const [items, setItems]     = useState<RecurringExpense[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm]       = useState<{ open: boolean; data?: RecurringExpense }>({ open: false })
  const [delItem, setDelItem] = useState<RecurringExpense | null>(null)

  function load() {
    setLoading(true)
    api.get<RecurringExpense[]>('/recurring-expenses')
      .then(r => setItems(r.data))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  async function handleToggle(item: RecurringExpense) {
    try {
      await api.patch(`/recurring-expenses/${item.id}/toggle`)
      toast.success(item.active ? 'Desativada.' : 'Ativada.')
      load()
    } catch {
      toast.error('Erro ao alterar status.')
    }
  }

  async function handleDelete() {
    if (!delItem) return
    try {
      await api.delete(`/recurring-expenses/${delItem.id}`)
      toast.success('Removida.')
      setDelItem(null)
      load()
    } catch {
      toast.error('Erro ao remover.')
    }
  }

  const active   = items.filter(i => i.active)
  const inactive = items.filter(i => !i.active)
  const totalMonthly = active.reduce((s, i) => s + i.amount, 0)

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Despesas Recorrentes</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Modelos de despesas fixas importados automaticamente a cada mês
          </p>
        </div>
        <button className="btn-primary" onClick={() => setForm({ open: true })}>
          <Plus size={16} /> Nova Recorrente
        </button>
      </div>

      {/* Summary card */}
      {active.length > 0 && (
        <div className="card bg-gradient-to-br from-violet-600 to-indigo-700 text-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider opacity-75">
                Total mensal fixo ({active.length} ativas)
              </p>
              <p className="text-3xl font-bold mt-1">{formatCurrency(totalMonthly)}</p>
            </div>
            <RefreshCw size={32} className="opacity-30" />
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={36} className="animate-spin text-violet-500" />
        </div>
      ) : items.length === 0 ? (
        <div className="card text-center py-16">
          <RefreshCw size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-400 mb-4">Nenhuma despesa recorrente cadastrada.</p>
          <button className="btn-primary" onClick={() => setForm({ open: true })}>
            <Plus size={16} /> Criar primeira
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active */}
          {active.length > 0 && (
            <div className="card p-0 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <h2 className="text-sm font-bold text-gray-700">Ativas ({active.length})</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {active.map(item => (
                  <RecurringRow key={item.id} item={item}
                    onEdit={() => setForm({ open: true, data: item })}
                    onToggle={() => handleToggle(item)}
                    onDelete={() => setDelItem(item)} />
                ))}
              </div>
            </div>
          )}

          {/* Inactive */}
          {inactive.length > 0 && (
            <div className="card p-0 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gray-300" />
                <h2 className="text-sm font-bold text-gray-400">Inativas ({inactive.length})</h2>
              </div>
              <div className="divide-y divide-gray-50 opacity-60">
                {inactive.map(item => (
                  <RecurringRow key={item.id} item={item}
                    onEdit={() => setForm({ open: true, data: item })}
                    onToggle={() => handleToggle(item)}
                    onDelete={() => setDelItem(item)} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {form.open && (
        <RecurringForm item={form.data} onClose={() => setForm({ open: false })} onSaved={load} />
      )}
      {delItem && (
        <ConfirmDialog
          title="Remover Despesa Recorrente"
          message={`Remover "${delItem.name}" dos modelos recorrentes?`}
          onConfirm={handleDelete}
          onCancel={() => setDelItem(null)}
        />
      )}
    </div>
  )
}

function RecurringRow({
  item, onEdit, onToggle, onDelete,
}: { item: RecurringExpense; onEdit: () => void; onToggle: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-gray-800 text-sm">{item.name}</span>
          <span className={CATEGORY_BADGE[item.category]}>{CATEGORY_LABELS[item.category]}</span>
        </div>
        {item.dayOfMonth && (
          <p className="text-xs text-gray-400 mt-0.5">Vence todo dia {item.dayOfMonth}</p>
        )}
      </div>
      <span className="font-bold text-gray-800 text-sm whitespace-nowrap">
        {formatCurrency(item.amount)}
      </span>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button title={item.active ? 'Desativar' : 'Ativar'} onClick={onToggle}
          className={`p-1.5 rounded-lg transition-colors ${
            item.active
              ? 'text-emerald-500 hover:bg-emerald-50'
              : 'text-gray-400 hover:bg-gray-100'
          }`}>
          {item.active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
        </button>
        <button title="Editar" onClick={onEdit}
          className="p-1.5 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg">
          <Pencil size={15} />
        </button>
        <button title="Remover" onClick={onDelete}
          className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg">
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  )
}
