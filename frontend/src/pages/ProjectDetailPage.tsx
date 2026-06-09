import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Plus, Pencil, Trash2, CheckCircle, XCircle,
  Loader2, CheckSquare, XSquare, RotateCcw, Rocket, Undo2,
  Calendar, Zap
} from 'lucide-react'
import api from '../lib/api'
import type { Project, ProjectExpense, MonthResponse } from '../types'
import { formatCurrency, formatDate, PROJECT_STATUS_LABELS, MONTH_NAMES, currentYear } from '../lib/utils'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import StatCard from '../components/StatCard'
import toast from 'react-hot-toast'

// ── Opções de fonte de débito ─────────────────────────────────────────────────
const DEBIT_SOURCES = [
  { value: 'PLR',             label: '💰 PLR' },
  { value: 'DECIMO_TERCEIRO', label: '🎁 Décimo Terceiro' },
  { value: 'SALARIO',         label: '💼 Salário' },
]

// ── Labels para exibição ──────────────────────────────────────────────────────
function debitLabel(exp: ProjectExpense, months: MonthResponse[]): string {
  if (exp.debitSource) {
    const s = DEBIT_SOURCES.find(d => d.value === exp.debitSource)
    return s ? s.label : exp.debitSource
  }
  if (exp.debitMonth && exp.debitYear) {
    return `${MONTH_NAMES[exp.debitMonth]}/${exp.debitYear}`
  }
  return '—'
}

// ── Formulário de despesa ─────────────────────────────────────────────────────
function ProjectExpenseForm({
  projectId, expense, months, onClose, onSaved
}: {
  projectId: string
  expense?: ProjectExpense
  months: MonthResponse[]
  onClose: () => void
  onSaved: () => void
}) {
  const [description, setDescription] = useState(expense?.description ?? '')
  const [amount, setAmount]           = useState(expense?.amount?.toString() ?? '')
  const [notes, setNotes]             = useState(expense?.notes ?? '')
  const [debitType, setDebitType]     = useState<'month' | 'source' | 'none'>(
    expense?.debitSource ? 'source' : (expense?.debitMonth ? 'month' : 'none')
  )
  const [debitMonth, setDebitMonth]   = useState(expense?.debitMonth?.toString() ?? '')
  const [debitYear, setDebitYear]     = useState(expense?.debitYear?.toString() ?? currentYear().toString())
  const [debitSource, setDebitSource] = useState(expense?.debitSource ?? '')
  const [loading, setLoading]         = useState(false)

  const years = Array.from({ length: 5 }, (_, i) => currentYear() - 1 + i)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const body = {
        description,
        amount: parseFloat(amount),
        notes: notes || undefined,
        debitMonth: debitType === 'month' ? parseInt(debitMonth) : undefined,
        debitYear:  debitType === 'month' ? parseInt(debitYear)  : undefined,
        debitSource: debitType === 'source' ? debitSource : undefined,
      }
      if (expense) {
        await api.put(`/projects/${projectId}/expenses/${expense.id}`, body)
        toast.success('Despesa atualizada!')
      } else {
        await api.post(`/projects/${projectId}/expenses`, body)
        toast.success('Despesa adicionada!')
      }
      onSaved(); onClose()
    } finally { setLoading(false) }
  }

  return (
    <Modal title={expense ? 'Editar Despesa' : 'Nova Despesa do Projeto'} onClose={onClose} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Descrição *</label>
          <input className="input" value={description}
            onChange={e => setDescription(e.target.value)} required placeholder="Ex: Frete" />
        </div>

        <div>
          <label className="label">Valor (R$) *</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
            <input className="input pl-8" type="number" step="0.01" min="0.01"
              value={amount} onChange={e => setAmount(e.target.value)} required placeholder="0,00" />
          </div>
        </div>

        {/* Vínculo de débito */}
        <div>
          <label className="label">Onde debitar este gasto?</label>
          <div className="flex gap-2 mb-3">
            {[
              { v: 'none',   label: '— Sem vínculo',    icon: null },
              { v: 'month',  label: 'Mês específico',   icon: <Calendar size={13} /> },
              { v: 'source', label: 'Fonte (PLR / 13º)', icon: <Zap size={13} /> },
            ].map(opt => (
              <button key={opt.v} type="button"
                onClick={() => setDebitType(opt.v as any)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  debitType === opt.v
                    ? 'bg-violet-600 text-white border-violet-600 shadow'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-violet-300'
                }`}>
                {opt.icon}{opt.label}
              </button>
            ))}
          </div>

          {debitType === 'month' && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-gray-100">
              <div>
                <label className="label">Mês</label>
                <select className="input" value={debitMonth} onChange={e => setDebitMonth(e.target.value)}>
                  <option value="">Selecione</option>
                  {MONTH_NAMES.slice(1).map((n, i) => (
                    <option key={i+1} value={i+1}>{n}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Ano</label>
                <select className="input" value={debitYear} onChange={e => setDebitYear(e.target.value)}>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              {debitMonth && debitYear && (
                <div className="col-span-2">
                  {months.find(m => m.month === parseInt(debitMonth) && m.year === parseInt(debitYear)) ? (
                    <p className="text-xs text-emerald-600 font-medium">
                      ✓ Mês encontrado — será lançado em {MONTH_NAMES[parseInt(debitMonth)]}/{debitYear}
                    </p>
                  ) : (
                    <p className="text-xs text-amber-600 font-medium">
                      ⚠ Mês não cadastrado — crie o mês antes de lançar
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {debitType === 'source' && (
            <div className="p-3 bg-slate-50 rounded-xl border border-gray-100">
              <label className="label">Fonte de receita</label>
              <select className="input" value={debitSource} onChange={e => setDebitSource(e.target.value)}>
                <option value="">Selecione a fonte</option>
                {DEBIT_SOURCES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-2">
                O sistema vai buscar automaticamente o mês que contém esta receita
              </p>
            </div>
          )}
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

// ── Resultado do lançamento ───────────────────────────────────────────────────
function LaunchResultModal({ result, onClose }: {
  result: { launched: string[]; skipped: string[]; errors: string[] }
  onClose: () => void
}) {
  return (
    <Modal title="Resultado do Lançamento" onClose={onClose} size="md">
      <div className="space-y-4">
        {result.launched.length > 0 && (
          <div>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-2">
              ✓ Lançadas ({result.launched.length})
            </p>
            {result.launched.map((l, i) => (
              <p key={i} className="text-sm text-gray-700 flex items-center gap-2">
                <CheckCircle size={13} className="text-emerald-500 flex-shrink-0" />{l}
              </p>
            ))}
          </div>
        )}
        {result.skipped.length > 0 && (
          <div>
            <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-2">
              ↷ Ignoradas ({result.skipped.length})
            </p>
            {result.skipped.map((s, i) => (
              <p key={i} className="text-sm text-gray-500">{s}</p>
            ))}
          </div>
        )}
        {result.errors.length > 0 && (
          <div>
            <p className="text-xs font-bold text-rose-600 uppercase tracking-wide mb-2">
              ✕ Erros ({result.errors.length})
            </p>
            {result.errors.map((e, i) => (
              <p key={i} className="text-sm text-rose-600">{e}</p>
            ))}
          </div>
        )}
        <div className="flex justify-end pt-2">
          <button className="btn-primary" onClick={onClose}>Fechar</button>
        </div>
      </div>
    </Modal>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────
const STATUS_GRADIENT: Record<string, string> = {
  EM_ANDAMENTO: 'from-violet-500 to-indigo-600',
  FINALIZADO:   'from-emerald-500 to-teal-600',
  CANCELADO:    'from-gray-400 to-gray-500',
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [project, setProject]   = useState<Project | null>(null)
  const [months, setMonths]     = useState<MonthResponse[]>([])
  const [loading, setLoading]   = useState(true)
  const [launching, setLaunching] = useState(false)

  const [expenseForm, setExpenseForm]     = useState<{ open: boolean; data?: ProjectExpense }>({ open: false })
  const [delExpense, setDelExpense]       = useState<ProjectExpense | null>(null)
  const [unlaunchTarget, setUnlaunchTarget] = useState<ProjectExpense | null>(null)
  const [statusConfirm, setStatusConfirm] = useState<'finish' | 'cancel' | 'reopen' | null>(null)
  const [launchResult, setLaunchResult]   = useState<any>(null)

  function load() {
    if (!id) return
    setLoading(true)
    api.get<Project>(`/projects/${id}`).then(r => setProject(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [id])

  // Carrega todos os meses para o formulário de despesa
  useEffect(() => {
    api.get<MonthResponse[]>('/months').then(r => setMonths(r.data))
  }, [])

  async function handlePay(exp: ProjectExpense) {
    await api.patch(`/projects/${id}/expenses/${exp.id}/pay`)
    toast.success('Marcado como pago!'); load()
  }
  async function handleUnpay(exp: ProjectExpense) {
    await api.patch(`/projects/${id}/expenses/${exp.id}/unpay`)
    toast.success('Desmarcado.'); load()
  }
  async function handleDel() {
    if (!delExpense) return
    await api.delete(`/projects/${id}/expenses/${delExpense.id}`)
    toast.success('Removida.'); setDelExpense(null); load()
  }
  async function handleStatusChange() {
    if (!statusConfirm) return
    await api.patch(`/projects/${id}/${statusConfirm}`)
    const msgs = { finish: 'Projeto finalizado!', cancel: 'Projeto cancelado.', reopen: 'Projeto reaberto!' }
    toast.success(msgs[statusConfirm]); setStatusConfirm(null); load()
  }

  async function handleLaunch() {
    setLaunching(true)
    try {
      const res = await api.post(`/projects/${id}/launch`)
      setLaunchResult(res.data)
      load()
    } finally { setLaunching(false) }
  }

  async function handleUnlaunch(exp: ProjectExpense) {
    await api.patch(`/projects/${id}/expenses/${exp.id}/unlaunch`)
    toast.success('Lançamento estornado.'); setUnlaunchTarget(null); load()
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={36} className="animate-spin text-violet-500" /></div>
  if (!project) return <p className="text-center text-gray-400 py-20">Projeto não encontrado.</p>

  const isActive  = project.status === 'EM_ANDAMENTO'
  const pct       = project.totalAmount > 0
    ? Math.min(100, Math.round((project.totalPaid / project.totalAmount) * 100)) : 0
  const pendingLaunch = project.expenses.filter(e => !e.launched && (e.debitMonth || e.debitSource)).length
  const launched      = project.expenses.filter(e => e.launched).length

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button onClick={() => navigate('/projects')} className="btn-secondary btn-sm mt-1">
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <span className={`badge ${
              project.status === 'EM_ANDAMENTO' ? 'badge-violet' :
              project.status === 'FINALIZADO'   ? 'badge-green'  : 'badge-gray'
            }`}>{PROJECT_STATUS_LABELS[project.status]}</span>
          </div>
          {project.description && <p className="text-gray-500 text-sm mt-1">{project.description}</p>}
          {(project.startDate || project.endDate) && (
            <p className="text-xs text-gray-400 mt-1">
              {formatDate(project.startDate)} → {formatDate(project.endDate)}
            </p>
          )}
        </div>

        <div className="flex gap-2 flex-shrink-0 flex-wrap justify-end">
          {isActive && pendingLaunch > 0 && (
            <button className="btn-primary btn-sm" onClick={handleLaunch} disabled={launching}>
              {launching
                ? <><Loader2 size={13} className="animate-spin" /> Lançando...</>
                : <><Rocket size={13} /> Lançar nos meses ({pendingLaunch})</>}
            </button>
          )}
          {isActive && (
            <>
              <button className="btn-success btn-sm" onClick={() => setStatusConfirm('finish')}>
                <CheckSquare size={13} /> Finalizar
              </button>
              <button className="btn-danger btn-sm" onClick={() => setStatusConfirm('cancel')}>
                <XSquare size={13} /> Cancelar
              </button>
            </>
          )}
          {!isActive && (
            <button className="btn-secondary btn-sm" onClick={() => setStatusConfirm('reopen')}>
              <RotateCcw size={13} /> Reabrir
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total do Projeto" value={formatCurrency(project.totalAmount)} gradient={STATUS_GRADIENT[project.status]} />
        <StatCard label="Total Pago"        value={formatCurrency(project.totalPaid)}   gradient="from-emerald-500 to-teal-600" />
        <StatCard label="Pendente"          value={formatCurrency(project.totalPending)} gradient="from-amber-400 to-orange-500" />
      </div>

      {/* Progresso */}
      {project.totalAmount > 0 && (
        <div className="card">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-semibold text-gray-700">Progresso de pagamento</span>
            <span className="font-bold text-violet-600">{pct}%</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full bg-gradient-to-r ${STATUS_GRADIENT[project.status]} transition-all duration-500`}
              style={{ width: `${pct}%` }} />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1.5">
            <span>{formatCurrency(project.totalPaid)} pago</span>
            <span>{formatCurrency(project.totalPending)} pendente</span>
          </div>
        </div>
      )}

      {/* Status de lançamentos */}
      {(launched > 0 || pendingLaunch > 0) && (
        <div className="flex gap-3 flex-wrap">
          {launched > 0 && (
            <div className="badge-green px-3 py-1.5 text-xs font-semibold">
              <Rocket size={12} className="inline mr-1" />
              {launched} despesa{launched > 1 ? 's' : ''} lançada{launched > 1 ? 's' : ''} nos meses
            </div>
          )}
          {pendingLaunch > 0 && isActive && (
            <div className="badge-yellow px-3 py-1.5 text-xs font-semibold">
              <Calendar size={12} className="inline mr-1" />
              {pendingLaunch} aguardando lançamento
            </div>
          )}
        </div>
      )}

      {/* Tabela de despesas */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-gray-900">
            Despesas ({project.expenses.length})
          </h2>
          {isActive && (
            <button className="btn-primary btn-sm" onClick={() => setExpenseForm({ open: true })}>
              <Plus size={14} /> Despesa
            </button>
          )}
        </div>

        {project.expenses.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-10">Nenhuma despesa cadastrada.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-100 text-xs text-gray-400 uppercase tracking-wider">
                  <th className="text-left pb-3 pr-3 font-semibold">Descrição</th>
                  <th className="text-right pb-3 pr-3 font-semibold">Valor</th>
                  <th className="text-left pb-3 pr-3 font-semibold hidden md:table-cell">Débito em</th>
                  <th className="text-left pb-3 pr-3 font-semibold">Status Pgto</th>
                  <th className="text-left pb-3 pr-3 font-semibold">Lançamento</th>
                  <th></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {project.expenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="py-3 pr-3 font-semibold text-gray-800">{exp.description}</td>
                    <td className="py-3 pr-3 text-right font-bold text-gray-800">{formatCurrency(exp.amount)}</td>
                    <td className="py-3 pr-3 hidden md:table-cell">
                      {exp.debitMonth || exp.debitSource ? (
                        <span className={exp.debitSource ? 'badge-violet' : 'badge-blue'}>
                          {exp.debitSource
                            ? DEBIT_SOURCES.find(d => d.value === exp.debitSource)?.label ?? exp.debitSource
                            : `${MONTH_NAMES[exp.debitMonth!].substring(0,3)}/${exp.debitYear}`}
                        </span>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="py-3 pr-3">
                      <span className={exp.paid ? 'badge-green' : 'badge-yellow'}>
                        {exp.paid ? '✓ Pago' : '⏳ Pendente'}
                      </span>
                    </td>
                    <td className="py-3 pr-3">
                      {exp.launched ? (
                        <span className="badge-green text-xs">
                          <Rocket size={10} className="inline mr-0.5" /> Lançada
                        </span>
                      ) : (exp.debitMonth || exp.debitSource) ? (
                        <span className="badge-yellow text-xs">
                          <Calendar size={10} className="inline mr-0.5" /> Pendente
                        </span>
                      ) : (
                        <span className="text-gray-300 text-xs">Sem vínculo</span>
                      )}
                    </td>
                    <td className="py-3">
                      {isActive && (
                        <div className="flex items-center gap-0.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          {!exp.paid
                            ? <button onClick={() => handlePay(exp)} title="Marcar pago"
                                className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg"><CheckCircle size={15} /></button>
                            : <button onClick={() => handleUnpay(exp)} title="Desmarcar"
                                className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg"><XCircle size={15} /></button>
                          }
                          {exp.launched && (
                            <button onClick={() => setUnlaunchTarget(exp)} title="Estornar lançamento"
                              className="p-1.5 text-violet-400 hover:text-violet-700 hover:bg-violet-50 rounded-lg">
                              <Undo2 size={15} />
                            </button>
                          )}
                          <button onClick={() => setExpenseForm({ open: true, data: exp })} title="Editar"
                            className="p-1.5 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg"><Pencil size={14} /></button>
                          <button onClick={() => setDelExpense(exp)} title="Remover"
                            className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 size={14} /></button>
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

      {/* Modals */}
      {expenseForm.open && (
        <ProjectExpenseForm
          projectId={id!}
          expense={expenseForm.data}
          months={months}
          onClose={() => setExpenseForm({ open: false })}
          onSaved={load}
        />
      )}
      {delExpense && (
        <ConfirmDialog title="Remover Despesa"
          message={`Remover "${delExpense.description}"?${delExpense.launched ? ' Esta despesa já foi lançada em um mês — o lançamento não será desfeito automaticamente.' : ''}`}
          onConfirm={handleDel} onCancel={() => setDelExpense(null)} />
      )}
      {unlaunchTarget && (
        <ConfirmDialog title="Estornar Lançamento"
          message={`Isso vai remover "${unlaunchTarget.description}" do mês onde foi lançada. Deseja continuar?`}
          onConfirm={() => handleUnlaunch(unlaunchTarget)}
          onCancel={() => setUnlaunchTarget(null)} danger={false} />
      )}
      {statusConfirm && (
        <ConfirmDialog
          title={statusConfirm === 'finish' ? 'Finalizar Projeto' : statusConfirm === 'cancel' ? 'Cancelar Projeto' : 'Reabrir Projeto'}
          message={statusConfirm === 'finish' ? 'Deseja marcar como finalizado?' :
                   statusConfirm === 'cancel' ? 'Deseja cancelar este projeto?' : 'Deseja reabrir este projeto?'}
          onConfirm={handleStatusChange} onCancel={() => setStatusConfirm(null)}
          danger={statusConfirm === 'cancel'} />
      )}
      {launchResult && (
        <LaunchResultModal result={launchResult} onClose={() => setLaunchResult(null)} />
      )}
    </div>
  )
}
