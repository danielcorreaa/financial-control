import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Plus, Pencil, Trash2, CheckCircle, XCircle, Lock, Unlock, Loader2, RefreshCw,
  Download, Printer,
} from 'lucide-react'
import api from '../lib/api'
import type { MonthResponse, Expense, Income, ExpenseCategory, IncomeType, CategoryBudget } from '../types'
import {
  formatCurrency, formatDate, MONTH_NAMES,
  CATEGORY_LABELS, CATEGORY_BADGE, INCOME_TYPE_LABELS, INCOME_TYPE_BADGE
} from '../lib/utils'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import StatCard from '../components/StatCard'
import toast from 'react-hot-toast'

const CATEGORIES  = Object.entries(CATEGORY_LABELS)   as [ExpenseCategory, string][]
const INCOME_TYPES = Object.entries(INCOME_TYPE_LABELS) as [IncomeType, string][]

function exportCSV(month: MonthResponse) {
  const BOM = '﻿'
  const rows = [
    'Tipo,Nome / Descrição,Categoria / Tipo,Valor (R$),Vencimento / Data,Status',
    ...month.expenses.map(e =>
      `Despesa,"${e.name}","${CATEGORY_LABELS[e.category]}",${e.amount.toFixed(2)},${e.dueDate ?? ''},${e.status}`
    ),
    ...month.incomes.map(i =>
      `Receita,"${i.description}","${INCOME_TYPE_LABELS[i.type]}",${i.amount.toFixed(2)},${i.date ?? ''},—`
    ),
  ]
  const blob = new Blob([BOM + rows.join('\r\n')], { type: 'text/csv;charset=utf-8' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `${MONTH_NAMES[month.month]}-${month.year}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ── Expense Form ─────────────────────────────────────────────────────────────
function ExpenseForm({ monthId, expense, onClose, onSaved }:
  { monthId: string; expense?: Expense; onClose: () => void; onSaved: () => void }) {
  const [name, setName]         = useState(expense?.name ?? '')
  const [category, setCategory] = useState<ExpenseCategory>(expense?.category ?? 'OUTROS')
  const [amount, setAmount]     = useState(expense?.amount?.toString() ?? '')
  const [dueDate, setDueDate]   = useState(expense?.dueDate ?? '')
  const [notes, setNotes]       = useState(expense?.notes ?? '')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true)
    try {
      const body = { name, category, amount: parseFloat(amount), dueDate: dueDate || undefined, notes: notes || undefined }
      if (expense) {
        await api.put(`/months/${monthId}/expenses/${expense.id}`, body)
        toast.success('Despesa atualizada!')
      } else {
        await api.post(`/months/${monthId}/expenses`, body)
        toast.success('Despesa adicionada!')
      }
      onSaved(); onClose()
    } catch {
      toast.error('Erro ao salvar despesa.')
    } finally { setLoading(false) }
  }

  return (
    <Modal title={expense ? 'Editar Despesa' : 'Nova Despesa'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Nome *</label>
          <input className="input" value={name} onChange={e => setName(e.target.value)} required placeholder="Ex: Aluguel" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Categoria *</label>
            <select className="input" value={category} onChange={e => setCategory(e.target.value as ExpenseCategory)}>
              {CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Valor (R$) *</label>
            <input className="input" type="number" step="0.01" min="0.01"
              value={amount} onChange={e => setAmount(e.target.value)} required placeholder="0,00" />
          </div>
        </div>
        <div>
          <label className="label">Vencimento</label>
          <input className="input" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
        </div>
        <div>
          <label className="label">Observações</label>
          <textarea className="input resize-none" rows={2} value={notes}
            onChange={e => setNotes(e.target.value)} placeholder="Opcional..." />
        </div>
        <div className="flex justify-end gap-3 pt-1">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading && <Loader2 size={14} className="animate-spin" />}
            {expense ? 'Salvar' : 'Adicionar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ── Income Form ───────────────────────────────────────────────────────────────
function IncomeForm({ monthId, income, onClose, onSaved }:
  { monthId: string; income?: Income; onClose: () => void; onSaved: () => void }) {
  const [description, setDescription] = useState(income?.description ?? '')
  const [type, setType]               = useState<IncomeType>(income?.type ?? 'SALARIO')
  const [amount, setAmount]           = useState(income?.amount?.toString() ?? '')
  const [date, setDate]               = useState(income?.date ?? '')
  const [notes, setNotes]             = useState(income?.notes ?? '')
  const [loading, setLoading]         = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true)
    try {
      const body = { description, type, amount: parseFloat(amount), date: date || undefined, notes: notes || undefined }
      if (income) {
        await api.put(`/months/${monthId}/incomes/${income.id}`, body)
        toast.success('Receita atualizada!')
      } else {
        await api.post(`/months/${monthId}/incomes`, body)
        toast.success('Receita adicionada!')
      }
      onSaved(); onClose()
    } catch {
      toast.error('Erro ao salvar receita.')
    } finally { setLoading(false) }
  }

  return (
    <Modal title={income ? 'Editar Receita' : 'Nova Receita'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Descrição *</label>
          <input className="input" value={description} onChange={e => setDescription(e.target.value)} required placeholder="Ex: Salário" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Tipo *</label>
            <select className="input" value={type} onChange={e => setType(e.target.value as IncomeType)}>
              {INCOME_TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Valor (R$) *</label>
            <input className="input" type="number" step="0.01" min="0.01"
              value={amount} onChange={e => setAmount(e.target.value)} required placeholder="0,00" />
          </div>
        </div>
        <div>
          <label className="label">Data</label>
          <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <div>
          <label className="label">Observações</label>
          <textarea className="input resize-none" rows={2} value={notes}
            onChange={e => setNotes(e.target.value)} placeholder="Opcional..." />
        </div>
        <div className="flex justify-end gap-3 pt-1">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading && <Loader2 size={14} className="animate-spin" />}
            {income ? 'Salvar' : 'Adicionar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ── Pay Dialog ────────────────────────────────────────────────────────────────
function PayDialog({ monthId, expense, onClose, onSaved }:
  { monthId: string; expense: Expense; onClose: () => void; onSaved: () => void }) {
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  async function handlePay() {
    setLoading(true)
    try {
      await api.patch(`/months/${monthId}/expenses/${expense.id}/pay`, { paymentDate })
      toast.success('Despesa paga!')
      onSaved(); onClose()
    } catch {
      toast.error('Erro ao registrar pagamento.')
    } finally { setLoading(false) }
  }
  return (
    <Modal title="Confirmar Pagamento" onClose={onClose} size="sm">
      <p className="text-sm text-gray-600 mb-4">
        Confirmar pagamento de <strong className="text-gray-900">{expense.name}</strong> — {formatCurrency(expense.amount)}
      </p>
      <div className="mb-5">
        <label className="label">Data de Pagamento</label>
        <input className="input" type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} />
      </div>
      <div className="flex justify-end gap-3">
        <button className="btn-secondary" onClick={onClose}>Cancelar</button>
        <button className="btn-success" onClick={handlePay} disabled={loading}>
          {loading && <Loader2 size={14} className="animate-spin" />} Confirmar
        </button>
      </div>
    </Modal>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function MonthDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [month, setMonth]     = useState<MonthResponse | null>(null)
  const [budget, setBudget]   = useState<CategoryBudget | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'expenses' | 'incomes'>('expenses')
  const [expFilter, setExpFilter] = useState<'ALL' | 'PAGO' | 'PENDENTE'>('ALL')

  const [expenseForm, setExpenseForm] = useState<{ open: boolean; data?: Expense }>({ open: false })
  const [incomeForm,  setIncomeForm]  = useState<{ open: boolean; data?: Income  }>({ open: false })
  const [payDialog, setPayDialog]     = useState<Expense | null>(null)
  const [delExpense, setDelExpense]   = useState<Expense | null>(null)
  const [delIncome,  setDelIncome]    = useState<Income  | null>(null)
  const [closeConfirm, setCloseConfirm] = useState(false)
  const [reopenConfirm, setReopenConfirm] = useState(false)

  function load() {
    if (!id) return
    setLoading(true)
    api.get<MonthResponse>(`/months/${id}`)
      .then(r => {
        setMonth(r.data)
        return api.get<CategoryBudget>(`/budgets/${r.data.year}`)
      })
      .then(r => setBudget(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [id])

  async function handleUnpay(exp: Expense) {
    try {
      await api.patch(`/months/${id}/expenses/${exp.id}/unpay`)
      toast.success('Pagamento desmarcado.')
      load()
    } catch {
      toast.error('Erro ao desmarcar pagamento.')
    }
  }
  async function handleDelExpense() {
    if (!delExpense) return
    try {
      await api.delete(`/months/${id}/expenses/${delExpense.id}`)
      toast.success('Despesa removida.')
      setDelExpense(null); load()
    } catch {
      toast.error('Erro ao remover despesa.')
    }
  }
  async function handleDelIncome() {
    if (!delIncome) return
    try {
      await api.delete(`/months/${id}/incomes/${delIncome.id}`)
      toast.success('Receita removida.')
      setDelIncome(null); load()
    } catch {
      toast.error('Erro ao remover receita.')
    }
  }
  async function handleClose() {
    try {
      await api.patch(`/months/${id}/close`)
      toast.success('Mês fechado!')
      setCloseConfirm(false); load()
    } catch {
      toast.error('Erro ao fechar o mês.')
    }
  }
  async function handleReopen() {
    try {
      await api.patch(`/months/${id}/reopen`)
      toast.success('Mês reaberto!')
      setReopenConfirm(false); load()
    } catch {
      toast.error('Erro ao reabrir o mês.')
    }
  }

  async function handleImportRecurring() {
    try {
      const r = await api.post(`/months/${id}/expenses/import-recurring`)
      const count = r.data?.length ?? 0
      if (count === 0) toast('Nenhuma despesa recorrente ativa encontrada.', { icon: 'ℹ️' })
      else toast.success(`${count} despesa(s) importada(s)!`)
      load()
    } catch {
      toast.error('Erro ao importar recorrentes.')
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={36} className="animate-spin text-violet-500" /></div>
  if (!month)  return <p className="text-center text-gray-400 py-20">Mês não encontrado.</p>

  const totalE   = month.expenses.reduce((s, e) => s + e.amount, 0)
  const totalI   = month.incomes.reduce((s, i) => s + i.amount, 0)
  const paid     = month.expenses.filter(e => e.status === 'PAGO').reduce((s, e) => s + e.amount, 0)
  const pending  = totalE - paid
  const balance  = totalI - totalE
  const pct      = totalI > 0 ? Math.min((totalE / totalI) * 100, 100) : 0
  const isClosed = month.status === 'FECHADO'
  const filtered = month.expenses.filter(e => expFilter === 'ALL' ? true : e.status === expFilter)

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/months')} className="btn-secondary btn-sm">
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">
              {MONTH_NAMES[month.month]} / {month.year}
            </h1>
            <span className={isClosed ? 'badge-gray' : 'badge-green'}>
              {isClosed ? '🔒 Fechado' : '🟢 Aberto'}
            </span>
          </div>
          {month.notes && <p className="text-gray-500 text-sm mt-0.5">{month.notes}</p>}
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 print-hide">
          <button className="btn-secondary btn-sm" onClick={() => exportCSV(month)} title="Exportar CSV">
            <Download size={14} /> <span className="hidden sm:inline">CSV</span>
          </button>
          <button className="btn-secondary btn-sm" onClick={() => window.print()} title="Imprimir / Salvar PDF">
            <Printer size={14} /> <span className="hidden sm:inline">PDF</span>
          </button>
          {!isClosed && (
            <button className="btn-secondary btn-sm" onClick={() => setCloseConfirm(true)} title="Fechar Mês">
              <Lock size={14} /> <span className="hidden sm:inline">Fechar Mês</span>
            </button>
          )}
          {isClosed && (
            <button className="btn-warning btn-sm" onClick={() => setReopenConfirm(true)} title="Reabrir Mês">
              <Unlock size={14} /> <span className="hidden sm:inline">Reabrir Mês</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard label="Receitas"  value={formatCurrency(totalI)}   gradient="from-emerald-500 to-teal-600" />
        <StatCard label="Despesas"  value={formatCurrency(totalE)}   gradient="from-rose-500 to-pink-600" />
        <StatCard label="Pago"      value={formatCurrency(paid)}     gradient="from-violet-500 to-indigo-600" />
        <StatCard label="Pendente"  value={formatCurrency(pending)}  gradient="from-amber-400 to-orange-500" />
        <StatCard label="Saldo"     value={formatCurrency(balance)}
          gradient={balance >= 0 ? 'from-cyan-500 to-blue-600' : 'from-red-500 to-rose-600'} />
      </div>

      {/* Budget progress */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">Progresso do Orçamento</span>
          <span className="text-sm font-bold text-gray-800">
            {formatCurrency(totalE)} <span className="text-gray-400 font-normal">de</span> {formatCurrency(totalI)}
          </span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-700 shadow-sm ${
              pct <= 80  ? 'bg-gradient-to-r from-emerald-400 to-teal-500 shadow-emerald-400/40' :
              pct <= 100 ? 'bg-gradient-to-r from-amber-400 to-orange-500 shadow-amber-400/40' :
                           'bg-gradient-to-r from-rose-500 to-pink-600 shadow-rose-500/40'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1.5">
          <span>{(totalI > 0 ? (totalE / totalI) * 100 : 0).toFixed(1)}% da receita comprometida</span>
          <span className={balance >= 0 ? 'text-violet-600 font-semibold' : 'text-rose-600 font-semibold'}>
            Saldo: {formatCurrency(balance)}
          </span>
        </div>
      </div>

      {/* Category breakdown */}
      {budget && Object.keys(budget.limits).length > 0 && (
        <div className="card">
          <h2 className="text-sm font-bold text-gray-700 mb-4">Orçamento por Categoria</h2>
          <div className="space-y-3">
            {(Object.entries(budget.limits) as [ExpenseCategory, number][])
              .sort((a, b) => b[1] - a[1])
              .map(([cat, limit]) => {
                const spent = month!.expenses
                  .filter(e => e.category === cat)
                  .reduce((s, e) => s + e.amount, 0)
                const pct = Math.min((spent / limit) * 100, 100)
                const over = spent > limit
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="flex items-center gap-1.5">
                        <span className={CATEGORY_BADGE[cat]}>{CATEGORY_LABELS[cat]}</span>
                      </span>
                      <span className={`font-semibold ${over ? 'text-rose-600' : 'text-gray-600'}`}>
                        {formatCurrency(spent)} <span className="font-normal text-gray-400">/ {formatCurrency(limit)}</span>
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          pct <= 70  ? 'bg-gradient-to-r from-emerald-400 to-teal-500' :
                          pct <= 100 ? 'bg-gradient-to-r from-amber-400 to-orange-500' :
                                       'bg-gradient-to-r from-rose-500 to-pink-600'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100">
          {(['expenses', 'incomes'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3.5 text-sm font-semibold transition-all duration-150 ${
                activeTab === tab
                  ? 'border-b-2 border-violet-500 text-violet-700 dark:text-violet-400 bg-gradient-to-b from-violet-50 to-violet-50/30 dark:from-violet-900/20 dark:to-transparent'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}>
              {tab === 'expenses'
                ? `💸 Despesas (${month.expenses.length})`
                : `💰 Receitas (${month.incomes.length})`}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* Expenses */}
          {activeTab === 'expenses' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex bg-slate-100 dark:bg-[#1a2235] rounded-xl p-1 text-xs gap-0.5">
                  {(['ALL', 'PENDENTE', 'PAGO'] as const).map(f => (
                    <button key={f} onClick={() => setExpFilter(f)}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                        expFilter === f ? 'bg-white dark:bg-[#253050] shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
                      }`}>
                      {f === 'ALL' ? 'Todas' : f === 'PENDENTE' ? 'Pendentes' : 'Pagas'}
                    </button>
                  ))}
                </div>
                {!isClosed && (
                  <div className="ml-auto flex gap-2">
                    <button className="btn-secondary btn-sm" onClick={handleImportRecurring}>
                      <RefreshCw size={13} /> Importar recorrentes
                    </button>
                    <button className="btn-primary btn-sm" onClick={() => setExpenseForm({ open: true })}>
                      <Plus size={14} /> Despesa
                    </button>
                  </div>
                )}
              </div>

              {filtered.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-10">Nenhuma despesa encontrada.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-gray-100 text-xs text-gray-400 uppercase tracking-wider">
                        <th className="text-left pb-3 pr-3 font-semibold">Nome</th>
                        <th className="text-left pb-3 pr-3 font-semibold hidden sm:table-cell">Categoria</th>
                        <th className="text-right pb-3 pr-3 font-semibold">Valor</th>
                        <th className="text-left pb-3 pr-3 font-semibold hidden md:table-cell">Vencimento</th>
                        <th className="text-left pb-3 pr-3 font-semibold hidden md:table-cell">Pagamento</th>
                        <th className="text-left pb-3 pr-3 font-semibold">Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filtered.map(exp => (
                        <tr key={exp.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="py-3 pr-3 font-semibold text-gray-800">{exp.name}</td>
                          <td className="py-3 pr-3 hidden sm:table-cell">
                            <span className={CATEGORY_BADGE[exp.category]}>{CATEGORY_LABELS[exp.category]}</span>
                          </td>
                          <td className="py-3 pr-3 text-right font-bold text-gray-800">{formatCurrency(exp.amount)}</td>
                          <td className="py-3 pr-3 text-gray-400 hidden md:table-cell">{formatDate(exp.dueDate)}</td>
                          <td className="py-3 pr-3 text-gray-400 hidden md:table-cell">{formatDate(exp.paymentDate)}</td>
                          <td className="py-3 pr-3">
                            <span className={exp.status === 'PAGO' ? 'badge-green' : 'badge-yellow'}>
                              {exp.status === 'PAGO' ? '✓ Pago' : '⏳ Pendente'}
                            </span>
                          </td>
                          <td className="py-3">
                            {!isClosed && (
                              <div className="flex items-center gap-0.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                {exp.status === 'PENDENTE'
                                  ? <button title="Pagar" onClick={() => setPayDialog(exp)} className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg"><CheckCircle size={16} /></button>
                                  : <button title="Desmarcar" onClick={() => handleUnpay(exp)} className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg"><XCircle size={16} /></button>
                                }
                                <button title="Editar" onClick={() => setExpenseForm({ open: true, data: exp })} className="p-1.5 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg"><Pencil size={15} /></button>
                                <button title="Remover" onClick={() => setDelExpense(exp)} className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 size={15} /></button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Incomes */}
          {activeTab === 'incomes' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                {!isClosed && (
                  <button className="btn-primary btn-sm" onClick={() => setIncomeForm({ open: true })}>
                    <Plus size={14} /> Receita
                  </button>
                )}
              </div>
              {month.incomes.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-10">Nenhuma receita cadastrada.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-gray-100 text-xs text-gray-400 uppercase tracking-wider">
                        <th className="text-left pb-3 pr-3 font-semibold">Descrição</th>
                        <th className="text-left pb-3 pr-3 font-semibold">Tipo</th>
                        <th className="text-right pb-3 pr-3 font-semibold">Valor</th>
                        <th className="text-left pb-3 pr-3 font-semibold hidden md:table-cell">Data</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {month.incomes.map(inc => (
                        <tr key={inc.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="py-3 pr-3 font-semibold text-gray-800">{inc.description}</td>
                          <td className="py-3 pr-3">
                            <span className={INCOME_TYPE_BADGE[inc.type]}>{INCOME_TYPE_LABELS[inc.type]}</span>
                          </td>
                          <td className="py-3 pr-3 text-right font-bold text-emerald-600">{formatCurrency(inc.amount)}</td>
                          <td className="py-3 pr-3 text-gray-400 hidden md:table-cell">{formatDate(inc.date)}</td>
                          <td className="py-3">
                            {!isClosed && (
                              <div className="flex items-center gap-0.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => setIncomeForm({ open: true, data: inc })} className="p-1.5 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg"><Pencil size={15} /></button>
                                <button onClick={() => setDelIncome(inc)} className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 size={15} /></button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {expenseForm.open && <ExpenseForm monthId={id!} expense={expenseForm.data} onClose={() => setExpenseForm({ open: false })} onSaved={load} />}
      {incomeForm.open  && <IncomeForm  monthId={id!} income={incomeForm.data}   onClose={() => setIncomeForm({ open: false })}  onSaved={load} />}
      {payDialog        && <PayDialog   monthId={id!} expense={payDialog}         onClose={() => setPayDialog(null)}               onSaved={load} />}
      {delExpense && <ConfirmDialog title="Remover Despesa"  message={`Remover "${delExpense.name}"?`} onConfirm={handleDelExpense} onCancel={() => setDelExpense(null)} />}
      {delIncome  && <ConfirmDialog title="Remover Receita"  message={`Remover "${delIncome.description}"?`} onConfirm={handleDelIncome}  onCancel={() => setDelIncome(null)} />}
      {closeConfirm && <ConfirmDialog title="Fechar Mês" message="Meses fechados não permitem mais edições. Deseja continuar?" onConfirm={handleClose} onCancel={() => setCloseConfirm(false)} />}
      {reopenConfirm && <ConfirmDialog title="Reabrir Mês" message="Deseja reabrir este mês para novas edições?" onConfirm={handleReopen} onCancel={() => setReopenConfirm(false)} danger={false} />}
    </div>
  )
}
