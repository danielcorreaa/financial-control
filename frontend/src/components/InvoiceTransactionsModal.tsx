import Modal from './Modal'
import { formatCurrency, formatDate, CATEGORY_LABELS, CATEGORY_BADGE } from '../lib/utils'
import type { CardInvoice } from '../types'

const BANK_COLORS: Record<string, string> = {
  BRADESCO:     'bg-red-500',
  CAIXA:        'bg-blue-600',
  ITAU:         'bg-orange-500',
  MERCADO_PAGO: 'bg-sky-500',
  RIACHUELO:    'bg-purple-600',
  OUTRO:        'bg-gray-500',
}

export default function InvoiceTransactionsModal({
  invoice,
  onClose,
}: {
  invoice: CardInvoice
  onClose: () => void
}) {
  const label = invoice.cardName || invoice.bankLabel
  const txs = invoice.transactions ?? []

  const byCategory = txs.reduce<Record<string, number>>((acc, tx) => {
    acc[tx.suggestedCategory] = (acc[tx.suggestedCategory] ?? 0) + tx.amount
    return acc
  }, {})

  return (
    <Modal title={`Lançamentos — ${label}`} onClose={onClose} size="lg">
      <div className="space-y-4">

        {/* Invoice header */}
        <div className={`${BANK_COLORS[invoice.bank] ?? 'bg-gray-500'} rounded-xl px-4 py-3 flex items-center justify-between`}>
          <div>
            <p className="font-bold text-white">{label}</p>
            <p className="text-xs text-white/70">Vence em {formatDate(invoice.dueDate)}</p>
          </div>
          <p className="text-xl font-extrabold text-white">{formatCurrency(invoice.totalAmount)}</p>
        </div>

        {txs.length === 0 ? (
          <p className="text-center text-sm text-gray-400 dark:text-slate-500 py-8">
            Nenhum lançamento individual disponível para esta fatura.
            <br />
            <span className="text-xs mt-1 block">Apenas faturas adicionadas via PDF do Bradesco têm lançamentos detalhados.</span>
          </p>
        ) : (
          <>
            {/* Category summary */}
            <div className="flex flex-wrap gap-2">
              {Object.entries(byCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, total]) => (
                  <div key={cat} className="flex items-center gap-1.5 text-xs bg-gray-100 dark:bg-white/8 rounded-lg px-2.5 py-1.5">
                    <span className={CATEGORY_BADGE[cat as keyof typeof CATEGORY_BADGE] ?? 'badge-gray'}>
                      {CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] ?? cat}
                    </span>
                    <span className="font-semibold text-gray-700 dark:text-slate-300">{formatCurrency(total)}</span>
                  </div>
                ))}
            </div>

            {/* Transaction list */}
            <div className="rounded-xl border border-gray-100 dark:border-white/8 overflow-hidden">
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 dark:divide-white/5">
                {txs.map((tx, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                    <span className="text-xs text-gray-400 dark:text-slate-500 w-10 flex-shrink-0 tabular-nums">
                      {tx.originalDate}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm text-gray-800 dark:text-slate-200 truncate">
                        {tx.description}
                      </span>
                      {tx.city && (
                        <span className="text-xs text-gray-400 dark:text-slate-500">
                          {tx.city}
                        </span>
                      )}
                    </span>
                    <span className={`${CATEGORY_BADGE[tx.suggestedCategory] ?? 'badge-gray'} hidden sm:inline-flex flex-shrink-0`}>
                      {CATEGORY_LABELS[tx.suggestedCategory] ?? tx.suggestedCategory}
                    </span>
                    <span className="text-sm font-bold text-gray-800 dark:text-slate-100 flex-shrink-0 tabular-nums">
                      {formatCurrency(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-white/8">
                <span className="text-xs text-gray-500 dark:text-slate-400">{txs.length} lançamentos</span>
                <span className="text-sm font-bold text-gray-800 dark:text-slate-100">
                  {formatCurrency(txs.reduce((s, t) => s + t.amount, 0))}
                </span>
              </div>
            </div>
          </>
        )}

        <div className="flex justify-end pt-1">
          <button className="btn-secondary" onClick={onClose}>Fechar</button>
        </div>
      </div>
    </Modal>
  )
}
