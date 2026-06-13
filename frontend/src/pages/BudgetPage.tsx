import { useEffect, useState } from 'react'
import { Save, Loader2, Target, Info } from 'lucide-react'
import api from '../lib/api'
import type { ExpenseCategory, CategoryBudget } from '../types'
import { CATEGORY_LABELS, CATEGORY_BADGE, currentYear } from '../lib/utils'
import toast from 'react-hot-toast'

const CATEGORIES = Object.entries(CATEGORY_LABELS) as [ExpenseCategory, string][]

export default function BudgetPage() {
  const [year, setYear]       = useState(currentYear())
  const [limits, setLimits]   = useState<Partial<Record<ExpenseCategory, string>>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const years = Array.from({ length: 5 }, (_, i) => currentYear() - 2 + i)

  useEffect(() => {
    setLoading(true)
    api.get<CategoryBudget>(`/budgets/${year}`)
      .then(r => {
        const str: Partial<Record<ExpenseCategory, string>> = {}
        Object.entries(r.data.limits).forEach(([k, v]) => {
          if (v != null) str[k as ExpenseCategory] = String(v)
        })
        setLimits(str)
      })
      .catch(() => setLimits({}))
      .finally(() => setLoading(false))
  }, [year])

  async function handleSave() {
    setSaving(true)
    try {
      const numLimits: Partial<Record<ExpenseCategory, number>> = {}
      Object.entries(limits).forEach(([k, v]) => {
        const n = parseFloat(v as string)
        if (!isNaN(n) && n > 0) numLimits[k as ExpenseCategory] = n
      })
      await api.put(`/budgets/${year}`, { year, limits: numLimits })
      toast.success('Orçamento salvo!')
    } catch {
      toast.error('Erro ao salvar orçamento.')
    } finally {
      setSaving(false)
    }
  }

  function clearAll() {
    setLimits({})
  }

  const filledCount = Object.values(limits).filter(v => v && parseFloat(v) > 0).length
  const totalLimit  = Object.values(limits).reduce((s, v) => s + (parseFloat(v ?? '0') || 0), 0)

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orçamento por Categoria</h1>
          <p className="text-gray-500 text-sm mt-0.5">Defina o limite mensal de gastos por categoria</p>
        </div>
        <select value={year} onChange={e => setYear(Number(e.target.value))} className="input w-32">
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 bg-violet-50 dark:bg-violet-500/10 rounded-2xl border border-violet-100 dark:border-violet-500/20">
        <Info size={16} className="text-violet-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-violet-700 dark:text-violet-300">
          Os limites definidos aqui aparecem como barras de progresso no detalhe de cada mês.
          Deixe o campo vazio para não monitorar aquela categoria. O valor é o limite <strong>mensal</strong>.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={36} className="animate-spin text-violet-500" />
        </div>
      ) : (
        <div className="card space-y-1">
          {/* Summary row */}
          {filledCount > 0 && (
            <div className="flex items-center justify-between pb-4 mb-2 border-b border-gray-100 dark:border-white/8">
              <span className="text-xs text-gray-400">{filledCount} categoria(s) configurada(s)</span>
              <span className="text-sm font-bold text-gray-700">
                Total: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalLimit)}
                <span className="text-xs text-gray-400 font-normal"> /mês</span>
              </span>
            </div>
          )}

          {/* Category rows */}
          <div className="space-y-2">
            {CATEGORIES.map(([cat, label]) => (
              <div key={cat} className="flex items-center gap-3">
                <span className={`${CATEGORY_BADGE[cat]} flex-shrink-0 w-32 justify-center text-center`}>
                  {label}
                </span>
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 text-sm font-medium pointer-events-none">
                    R$
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Sem limite"
                    className="input pl-9"
                    value={limits[cat] ?? ''}
                    onChange={e => setLimits(prev => ({ ...prev, [cat]: e.target.value }))}
                  />
                </div>
                {limits[cat] && (
                  <button
                    onClick={() => setLimits(prev => { const n = { ...prev }; delete n[cat]; return n })}
                    className="text-gray-300 dark:text-slate-600 hover:text-rose-400 transition-colors text-lg leading-none flex-shrink-0"
                    title="Remover limite"
                  >×</button>
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-5 mt-3 border-t border-gray-100 dark:border-white/8">
            <button
              onClick={clearAll}
              className="text-xs text-gray-400 hover:text-rose-500 transition-colors"
            >
              Limpar tudo
            </button>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Salvar Orçamento {year}
            </button>
          </div>
        </div>
      )}

      {/* Preview hint */}
      {filledCount > 0 && (
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Target size={13} />
          Os limites aparecem em cada mês aberto na seção "Orçamento por Categoria".
        </div>
      )}
    </div>
  )
}
