import { useRef, useState } from 'react'
import { Upload, Loader2, FileText, CheckSquare, Square, AlertCircle } from 'lucide-react'
import Modal from './Modal'
import api from '../lib/api'
import { CATEGORY_LABELS, CATEGORY_BADGE, formatCurrency } from '../lib/utils'
import type { ExpenseCategory } from '../types'
import toast from 'react-hot-toast'

interface ParsedTransaction {
  originalDate: string
  description: string
  amount: number
  suggestedCategory: ExpenseCategory
}

interface InvoiceParseResult {
  invoiceDueDate: string | null
  invoiceTotalAmount: number | null
  transactions: ParsedTransaction[]
}

const ALL_CATEGORIES = Object.entries(CATEGORY_LABELS) as [ExpenseCategory, string][]

export default function ImportInvoiceModal({
  monthId,
  onClose,
  onImported,
}: {
  monthId: string
  onClose: () => void
  onImported: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile]           = useState<File | null>(null)
  const [parsing, setParsing]     = useState(false)
  const [result, setResult]       = useState<InvoiceParseResult | null>(null)
  const [selected, setSelected]   = useState<Set<number>>(new Set())
  const [categories, setCategories] = useState<Record<number, ExpenseCategory>>({})
  const [dueDate, setDueDate]     = useState('')
  const [importing, setImporting] = useState(false)

  async function handleParse(f: File) {
    setParsing(true)
    try {
      const form = new FormData()
      form.append('file', f)
      const { data } = await api.post<InvoiceParseResult>('/invoices/parse', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResult(data)
      setDueDate(data.invoiceDueDate ?? '')
      const all = new Set(data.transactions.map((_, i) => i))
      setSelected(all)
      const cats: Record<number, ExpenseCategory> = {}
      data.transactions.forEach((tx, i) => { cats[i] = tx.suggestedCategory })
      setCategories(cats)
    } catch {
      toast.error('Erro ao processar PDF. Verifique se é uma fatura Bradesco.')
    } finally {
      setParsing(false)
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    handleParse(f)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (!f || f.type !== 'application/pdf') return
    setFile(f)
    handleParse(f)
  }

  function toggleAll() {
    if (!result) return
    if (selected.size === result.transactions.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(result.transactions.map((_, i) => i)))
    }
  }

  function toggle(i: number) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  function setCategory(i: number, cat: ExpenseCategory) {
    setCategories(prev => ({ ...prev, [i]: cat }))
  }

  async function handleImport() {
    if (!result || selected.size === 0) return
    setImporting(true)
    try {
      const items = [...selected].map(i => ({
        name: result.transactions[i].description,
        category: categories[i] ?? result.transactions[i].suggestedCategory,
        amount: result.transactions[i].amount,
        dueDate: dueDate || undefined,
      }))
      await Promise.all(
        items.map(item => api.post(`/months/${monthId}/expenses`, item))
      )
      toast.success(`${items.length} despesa(s) importada(s)!`)
      onImported()
      onClose()
    } catch {
      toast.error('Erro ao importar despesas.')
    } finally {
      setImporting(false)
    }
  }

  const allSelected = result ? selected.size === result.transactions.length : false
  const total = result
    ? [...selected].reduce((s, i) => s + result.transactions[i].amount, 0)
    : 0

  return (
    <Modal title="Importar Fatura Bradesco (PDF)" onClose={onClose} size="lg">
      <div className="space-y-4">

        {/* Drop zone */}
        {!result && (
          <div
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer
              ${parsing
                ? 'border-violet-300 bg-violet-50 dark:bg-violet-500/10'
                : 'border-gray-200 dark:border-white/10 hover:border-violet-400 hover:bg-violet-50/50 dark:hover:bg-violet-500/5'
              }`}
            onClick={() => !parsing && inputRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={onDrop}
          >
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={onFileChange}
            />
            {parsing ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 size={36} className="animate-spin text-violet-500" />
                <p className="text-sm text-violet-600 dark:text-violet-300">Processando PDF...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-violet-100 dark:bg-violet-500/15 flex items-center justify-center">
                  <Upload size={24} className="text-violet-500" />
                </div>
                <div>
                  <p className="font-semibold text-gray-700 dark:text-slate-200">
                    Arraste o PDF ou clique para selecionar
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Fatura Bradesco Cartão — qualquer mês</p>
                </div>
                {file && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-100 dark:bg-white/5 px-3 py-1.5 rounded-full">
                    <FileText size={13} /> {file.name}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Info: reset */}
        {result && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400">
              <FileText size={14} />
              <span className="truncate max-w-[200px]">{file?.name}</span>
            </div>
            <button
              className="text-xs text-violet-500 hover:text-violet-700 underline"
              onClick={() => { setResult(null); setFile(null) }}
            >
              Trocar arquivo
            </button>
          </div>
        )}

        {/* Due date */}
        {result && (
          <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-100 dark:border-amber-500/20">
            <AlertCircle size={15} className="text-amber-500 flex-shrink-0" />
            <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-sm text-amber-700 dark:text-amber-300 flex-1">
                Vencimento da fatura (será o prazo de todas as despesas)
              </span>
              <input
                type="date"
                className="input w-auto sm:w-40"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Transactions table */}
        {result && result.transactions.length > 0 && (
          <div className="rounded-xl border border-gray-100 dark:border-white/8 overflow-hidden">
            {/* Table header */}
            <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/8">
              <button onClick={toggleAll} className="text-gray-400 hover:text-violet-500 flex-shrink-0">
                {allSelected
                  ? <CheckSquare size={17} className="text-violet-500" />
                  : <Square size={17} />}
              </button>
              <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider flex-1">
                {selected.size} de {result.transactions.length} selecionadas
              </span>
              <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                {formatCurrency(total)}
              </span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-gray-50 dark:divide-white/5 max-h-72 overflow-y-auto">
              {result.transactions.map((tx, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer
                    ${selected.has(i)
                      ? 'bg-white dark:bg-transparent'
                      : 'bg-gray-50/60 dark:bg-white/[0.02] opacity-50'
                    }`}
                  onClick={() => toggle(i)}
                >
                  <div className="pt-0.5 flex-shrink-0">
                    {selected.has(i)
                      ? <CheckSquare size={16} className="text-violet-500" />
                      : <Square size={16} className="text-gray-300 dark:text-slate-600" />}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-slate-200 truncate">
                          {tx.description}
                        </p>
                        <p className="text-xs text-gray-400">{tx.originalDate}</p>
                      </div>
                      <span className="text-sm font-bold text-gray-800 dark:text-slate-100 flex-shrink-0">
                        {formatCurrency(tx.amount)}
                      </span>
                    </div>
                    {/* Category selector — stop propagation to avoid toggling row */}
                    <div onClick={e => e.stopPropagation()}>
                      <select
                        className="input py-1 text-xs"
                        value={categories[i] ?? tx.suggestedCategory}
                        onChange={e => setCategory(i, e.target.value as ExpenseCategory)}
                      >
                        {ALL_CATEGORIES.map(([cat, label]) => (
                          <option key={cat} value={cat}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {result && result.transactions.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-8">
            Nenhuma transação encontrada. Verifique se o PDF é uma fatura Bradesco válida.
          </p>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-1">
          <button className="btn-secondary" onClick={onClose} disabled={importing}>
            Cancelar
          </button>
          {result && result.transactions.length > 0 && (
            <button
              className="btn-primary"
              onClick={handleImport}
              disabled={importing || selected.size === 0}
            >
              {importing ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              Importar {selected.size} despesa{selected.size !== 1 ? 's' : ''}
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}
