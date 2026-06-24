import { useState } from 'react'
import { Loader2, Upload, CreditCard } from 'lucide-react'
import Modal from './Modal'
import api from '../lib/api'
import { formatCurrency } from '../lib/utils'
import type { CardBank, CardInvoice, ParsedTransaction } from '../types'
import toast from 'react-hot-toast'

const BANKS: { value: CardBank; label: string; color: string }[] = [
  { value: 'BRADESCO',     label: 'Bradesco',      color: 'bg-red-500' },
  { value: 'CAIXA',        label: 'Caixa',         color: 'bg-blue-600' },
  { value: 'ITAU',         label: 'Itaú',          color: 'bg-orange-500' },
  { value: 'MERCADO_PAGO', label: 'Mercado Pago',  color: 'bg-sky-500' },
  { value: 'RIACHUELO',    label: 'Riachuelo',     color: 'bg-purple-600' },
  { value: 'OUTRO',        label: 'Outro',         color: 'bg-gray-500' },
]

interface ParsedPDF {
  invoiceDueDate: string | null
  invoiceTotalAmount: number | null
  transactions: ParsedTransaction[]
}

export default function AddInvoiceModal({
  onClose,
  onAdded,
}: {
  onClose: () => void
  onAdded: () => void
}) {
  const [bank, setBank]                     = useState<CardBank>('BRADESCO')
  const [cardName, setCardName]             = useState('')
  const [dueDate, setDueDate]               = useState('')
  const [amount, setAmount]                 = useState('')
  const [parsedTransactions, setParsed]     = useState<ParsedTransaction[]>([])
  const [parsing, setParsing]               = useState(false)
  const [saving, setSaving]                 = useState(false)

  const isBradesco = bank === 'BRADESCO'

  async function handlePDFUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setParsing(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const { data } = await api.post<ParsedPDF>('/invoices/parse', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const total = data.invoiceTotalAmount
        ?? data.transactions.reduce((s, t) => s + t.amount, 0)
      setAmount(total.toFixed(2))
      if (data.invoiceDueDate) setDueDate(data.invoiceDueDate)
      setParsed(data.transactions)
      const source = data.invoiceTotalAmount
        ? 'total oficial da fatura'
        : `${data.transactions.length} transações detectadas`
      toast.success(`PDF lido: ${formatCurrency(total)} (${source})`)
    } catch {
      toast.error('Erro ao ler o PDF. Verifique se é uma fatura Bradesco.')
    } finally {
      setParsing(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!dueDate || !amount) return
    setSaving(true)
    try {
      await api.post<CardInvoice>('/card-invoices', {
        bank,
        cardName: cardName.trim() || null,
        dueDate,
        totalAmount: parseFloat(amount),
        transactions: parsedTransactions,
      })
      toast.success('Fatura adicionada e despesa lançada no mês!')
      onAdded()
      onClose()
    } catch {
      toast.error('Erro ao adicionar fatura.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title="Adicionar Fatura de Cartão" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Bank selector */}
        <div>
          <label className="label">Banco / Cartão</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
            {BANKS.map(b => (
              <button
                key={b.value}
                type="button"
                onClick={() => setBank(b.value)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                  bank === b.value
                    ? 'border-violet-500 bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300'
                    : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-slate-400 hover:border-violet-200 dark:hover:border-violet-500/30'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${b.color}`} />
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Card name */}
        <div>
          <label className="label" htmlFor="cardName">Nome do cartão (opcional)</label>
          <input
            id="cardName"
            className="input mt-1"
            placeholder={`Ex: ${bank === 'BRADESCO' ? 'Bradesco Visa Gold' : bank === 'ITAU' ? 'Itaú Personnalité' : bank === 'CAIXA' ? 'Caixa Ouro' : 'Nome do cartão'}`}
            value={cardName}
            onChange={e => setCardName(e.target.value)}
          />
        </div>

        {/* Bradesco PDF upload */}
        {isBradesco && (
          <div className="rounded-xl border border-dashed border-violet-200 dark:border-violet-500/30 bg-violet-50/50 dark:bg-violet-500/5 p-4">
            <p className="text-xs font-semibold text-violet-600 dark:text-violet-400 mb-2 uppercase tracking-wide">
              Preencher automaticamente via PDF
            </p>
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="w-9 h-9 rounded-lg bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-violet-200 dark:group-hover:bg-violet-500/30 transition-colors">
                {parsing ? <Loader2 size={16} className="animate-spin text-violet-500" /> : <Upload size={16} className="text-violet-500" />}
              </div>
              <span className="text-sm text-violet-600 dark:text-violet-300">
                {parsing ? 'Lendo PDF...' : 'Carregar fatura Bradesco (PDF)'}
              </span>
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handlePDFUpload}
                disabled={parsing}
              />
            </label>
            {amount && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-medium">
                ✓ Total: {formatCurrency(parseFloat(amount))}
                {parsedTransactions.length > 0 && ` · ${parsedTransactions.length} lançamentos detectados`}
              </p>
            )}
          </div>
        )}

        {/* Due date + amount */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="dueDate">Data de vencimento *</label>
            <input
              id="dueDate"
              type="date"
              className="input mt-1"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="amount">Valor total *</label>
            <input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              className="input mt-1"
              placeholder="0,00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Preview */}
        {dueDate && amount && parseFloat(amount) > 0 && (
          <div className="rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-100 dark:border-green-500/20 px-4 py-3 text-sm text-green-700 dark:text-green-300">
            <CreditCard size={14} className="inline mr-1.5 -mt-0.5" />
            Será adicionado <strong>{formatCurrency(parseFloat(amount))}</strong> ao mês{' '}
            <strong>{new Date(dueDate + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</strong>
            {' '}como despesa <strong>Cartão de Crédito</strong>.
            {parsedTransactions.length > 0 && (
              <span className="block text-xs mt-1 text-green-600 dark:text-green-400">
                Os {parsedTransactions.length} lançamentos individuais ficam disponíveis no botão "ver detalhes" dentro do mês.
              </span>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-1">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary" disabled={saving || parsing || !dueDate || !amount}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <CreditCard size={14} />}
            Adicionar Fatura
          </button>
        </div>
      </form>
    </Modal>
  )
}
