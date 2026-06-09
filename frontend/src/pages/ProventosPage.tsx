import { useEffect, useState, useMemo } from 'react'
import {
  Calculator, Plus, Loader2, CheckCircle, Info,
  Save, Trash2, ChevronDown, ChevronUp, History
} from 'lucide-react'
import api from '../lib/api'
import type { MonthResponse, SalaryConfig, SalaryDiscount } from '../types'
import { calcularINSS, calcularIRRF, calcularBaseIRRF, DEDUCAO_DEPENDENTE } from '../lib/irrf'
import { formatCurrency, MONTH_NAMES, currentYear } from '../lib/utils'
import ConfirmDialog from '../components/ConfirmDialog'
import toast from 'react-hot-toast'

// ── helpers ───────────────────────────────────────────────────────────────────
let _id = 1
const uid = () => _id++

interface DiscountRow { id: number; label: string; amount: string }
interface IncomeRow   { id: number; label: string; amount: string }

function toNumber(s: string) { return parseFloat(s) || 0 }

// ── Histórico lateral ─────────────────────────────────────────────────────────
function HistoryPanel({
  configs, onLoad, onDelete
}: {
  configs: SalaryConfig[]
  onLoad: (c: SalaryConfig) => void
  onDelete: (id: string) => void
}) {
  const [delId, setDelId] = useState<string | null>(null)

  return (
    <div className="card">
      <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
        <History size={15} className="text-violet-500" /> Salários Cadastrados
      </h2>

      {configs.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-6">Nenhum salário cadastrado ainda.</p>
      ) : (
        <div className="space-y-2">
          {configs.map(c => (
            <div key={c.id}
              className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-violet-50 hover:border-violet-200 transition-colors cursor-pointer group"
              onClick={() => onLoad(c)}>
              <div>
                <p className="font-bold text-gray-900 text-sm">{c.year}</p>
                <p className="text-xs text-gray-500">
                  Bruto {formatCurrency(c.grossSalary)} → Líquido{' '}
                  <span className="font-semibold text-emerald-600">{formatCurrency(c.calculatedNetSalary)}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-violet-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  Carregar
                </span>
                <button
                  onClick={e => { e.stopPropagation(); setDelId(c.id) }}
                  className="text-gray-300 hover:text-rose-500 transition-colors p-1">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {delId && (
        <ConfirmDialog
          title="Remover Configuração"
          message="Tem certeza que deseja remover este cadastro salarial?"
          onConfirm={() => { onDelete(delId); setDelId(null) }}
          onCancel={() => setDelId(null)}
        />
      )}
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function ProventosPage() {
  // form state
  const [year, setYear]               = useState(currentYear())
  const [bruto, setBruto]             = useState('')
  const [manualInss, setManualInss]   = useState(false)
  const [inssValor, setInssValor]     = useState('')
  const [dependentes, setDependentes] = useState(0)
  const [descontos, setDescontos]     = useState<DiscountRow[]>([
    { id: uid(), label: 'Vale Refeição',     amount: '' },
    { id: uid(), label: 'Convênio Odonto',   amount: '' },
    { id: uid(), label: 'Previdência Privada', amount: '' },
  ])
  const [decimo, setDecimo] = useState('')
  const [plr, setPlr]       = useState('')
  const [extras, setExtras] = useState<IncomeRow[]>([])
  const [notes, setNotes]   = useState('')

  // destino (registrar no mês)
  const [destYear, setDestYear]   = useState(currentYear())
  const [monthId, setMonthId]     = useState('')
  const [months, setMonths]       = useState<MonthResponse[]>([])

  // meta state
  const [configs, setConfigs]     = useState<SalaryConfig[]>([])
  const [saving, setSaving]       = useState(false)
  const [registering, setRegistering] = useState(false)
  const [savedId, setSavedId]     = useState<string | null>(null)

  const years = Array.from({ length: 6 }, (_, i) => currentYear() - 3 + i)

  // carrega histórico
  function loadConfigs() {
    api.get<SalaryConfig[]>('/salary-configs').then(r => setConfigs(r.data))
  }
  useEffect(() => { loadConfigs() }, [])

  // carrega meses do destino
  useEffect(() => {
    api.get<MonthResponse[]>(`/months?year=${destYear}`).then(r => {
      const sorted = r.data.sort((a, b) => a.month - b.month)
      setMonths(sorted)
      setMonthId(sorted[0]?.id ?? '')
    })
  }, [destYear])

  // tenta auto-carregar config do ano selecionado
  useEffect(() => {
    const found = configs.find(c => c.year === year)
    if (found) loadConfig(found)
  }, [year, configs])

  // ── cálculos ────────────────────────────────────────────────────────────────
  const brutoNum = toNumber(bruto)
  const inssNum  = manualInss ? toNumber(inssValor) : calcularINSS(brutoNum)
  const baseIRRF = calcularBaseIRRF(brutoNum, inssNum, dependentes)
  const irrf     = calcularIRRF(baseIRRF)

  const totalDescontos = useMemo(() => {
    const outros = descontos.reduce((s, d) => s + toNumber(d.amount), 0)
    return inssNum + irrf + outros
  }, [inssNum, irrf, descontos])

  const liquido     = Math.max(0, brutoNum - totalDescontos)
  const decimoNum   = toNumber(decimo)
  const plrNum      = toNumber(plr)
  const totalExtras = extras.reduce((s, r) => s + toNumber(r.amount), 0)
  const totalAnual  = liquido * 12 + decimoNum + plrNum + totalExtras

  // ── carregar config do histórico ─────────────────────────────────────────────
  function loadConfig(c: SalaryConfig) {
    setYear(c.year)
    setBruto(c.grossSalary.toString())
    setManualInss(c.manualInss)
    setInssValor(c.manualInssValue?.toString() ?? '')
    setDependentes(c.dependents)
    setDescontos(c.discounts.map(d => ({ id: uid(), label: d.label, amount: d.amount.toString() })))
    setDecimo(c.thirteenthSalary > 0 ? c.thirteenthSalary.toString() : '')
    setPlr(c.plr > 0 ? c.plr.toString() : '')
    setNotes(c.notes ?? '')
    setExtras([])
    setSavedId(c.id)
    toast.success(`Salário ${c.year} carregado`)
  }

  // ── salvar configuração ──────────────────────────────────────────────────────
  async function handleSaveConfig() {
    if (!brutoNum) { toast.error('Informe o salário bruto.'); return }
    setSaving(true)
    try {
      const body = {
        year,
        grossSalary: brutoNum,
        manualInss,
        manualInssValue: manualInss ? toNumber(inssValor) : null,
        dependents: dependentes,
        discounts: descontos
          .filter(d => d.label && toNumber(d.amount) > 0)
          .map(d => ({ label: d.label, amount: toNumber(d.amount) })),
        plr: plrNum || null,
        thirteenthSalary: decimoNum || null,
        notes: notes || null,
      }
      const res = await api.post<SalaryConfig>('/salary-configs', body)
      setSavedId(res.data.id)
      toast.success(`Salário ${year} salvo!`)
      loadConfigs()
    } finally { setSaving(false) }
  }

  // ── deletar config ───────────────────────────────────────────────────────────
  async function handleDeleteConfig(id: string) {
    await api.delete(`/salary-configs/${id}`)
    toast.success('Configuração removida.')
    if (savedId === id) setSavedId(null)
    loadConfigs()
  }

  // ── registrar receitas no mês ────────────────────────────────────────────────
  async function handleRegister() {
    if (!monthId)  { toast.error('Selecione um mês.'); return }
    if (!liquido)  { toast.error('Salário líquido inválido.'); return }
    setRegistering(true)
    try {
      const mes = months.find(m => m.id === monthId)
      const label = mes ? `${MONTH_NAMES[mes.month]}/${mes.year}` : ''

      await api.post(`/months/${monthId}/incomes`, {
        description: `Salário Líquido — ${label}`,
        amount: liquido,
        type: 'SALARIO',
      })
      if (decimoNum > 0)
        await api.post(`/months/${monthId}/incomes`, { description: 'Décimo Terceiro', amount: decimoNum, type: 'BONUS' })
      if (plrNum > 0)
        await api.post(`/months/${monthId}/incomes`, { description: 'PLR', amount: plrNum, type: 'BONUS' })
      for (const r of extras.filter(x => x.label && toNumber(x.amount) > 0))
        await api.post(`/months/${monthId}/incomes`, { description: r.label, amount: toNumber(r.amount), type: 'RENDA_EXTRA' })

      toast.success(`Proventos registrados em ${label}!`)
    } finally { setRegistering(false) }
  }

  // ── helpers de linha ─────────────────────────────────────────────────────────
  const updateDesc = (id: number, f: 'label'|'amount', v: string) =>
    setDescontos(p => p.map(d => d.id === id ? {...d, [f]: v} : d))
  const removeDesc = (id: number) => setDescontos(p => p.filter(d => d.id !== id))

  const updateExtra = (id: number, f: 'label'|'amount', v: string) =>
    setExtras(p => p.map(r => r.id === id ? {...r, [f]: v} : r))
  const removeExtra = (id: number) => setExtras(p => p.filter(r => r.id !== id))

  // ── render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Proventos</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Cadastre o salário por ano — o sistema calcula INSS, IRRF e líquido automaticamente
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ── Coluna 1+2: formulário ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Ano + bruto */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                <Calculator size={15} className="text-violet-500" /> Salário Bruto
              </h2>
              {savedId && configs.find(c => c.id === savedId)?.year === year && (
                <span className="badge-green text-xs">✓ Salvo para {year}</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="label">Ano de referência</label>
                <select className="input" value={year} onChange={e => setYear(Number(e.target.value))}>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Salário Bruto (A)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
                  <input className="input pl-8" type="number" step="0.01" min="0"
                    placeholder="0,00" value={bruto} onChange={e => setBruto(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* INSS */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="label mb-0">INSS (B)</label>
                  <button onClick={() => { setManualInss(!manualInss); setInssValor(inssNum.toFixed(2)) }}
                    className="text-xs text-violet-600 hover:underline font-medium">
                    {manualInss ? '← Automático' : 'Manual'}
                  </button>
                </div>
                {manualInss ? (
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
                    <input className="input pl-8" type="number" step="0.01" min="0"
                      value={inssValor} onChange={e => setInssValor(e.target.value)} />
                  </div>
                ) : (
                  <div className="px-3 py-2 bg-slate-50 border border-gray-100 rounded-xl text-sm font-semibold text-gray-700">
                    {formatCurrency(inssNum)}
                    <span className="text-xs text-gray-400 font-normal ml-1">(auto)</span>
                  </div>
                )}
              </div>

              {/* Dependentes */}
              <div>
                <label className="label">Dependentes</label>
                <input className="input" type="number" min="0" max="10"
                  value={dependentes} onChange={e => setDependentes(Number(e.target.value))} />
                {dependentes > 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    -{formatCurrency(dependentes * DEDUCAO_DEPENDENTE)} da base IRRF
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Outros descontos */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Outros Descontos</h2>
              <button onClick={() => setDescontos(p => [...p, { id: uid(), label: '', amount: '' }])}
                className="btn-secondary btn-sm"><Plus size={13} /> Adicionar</button>
            </div>
            <div className="space-y-2.5">
              {descontos.map(d => (
                <div key={d.id} className="flex gap-2 items-center">
                  <input className="input flex-1" placeholder="Descrição (ex: Vale Refeição)"
                    value={d.label} onChange={e => updateDesc(d.id, 'label', e.target.value)} />
                  <div className="relative w-36">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">R$</span>
                    <input className="input pl-7 text-right" type="number" step="0.01" min="0"
                      placeholder="0,00" value={d.amount}
                      onChange={e => updateDesc(d.id, 'amount', e.target.value)} />
                  </div>
                  <button onClick={() => removeDesc(d.id)}
                    className="text-gray-300 hover:text-rose-500 p-1 transition-colors">✕</button>
                </div>
              ))}
              {descontos.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-2">Nenhum desconto extra</p>
              )}
            </div>
          </div>

          {/* Bônus */}
          <div className="card">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">Bônus e Adicionais</h2>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <label className="label">Décimo Terceiro</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
                  <input className="input pl-8" type="number" step="0.01" min="0"
                    placeholder="0,00" value={decimo} onChange={e => setDecimo(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="label">PLR</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
                  <input className="input pl-8" type="number" step="0.01" min="0"
                    placeholder="0,00" value={plr} onChange={e => setPlr(e.target.value)} />
                </div>
              </div>
            </div>
            {extras.map(r => (
              <div key={r.id} className="flex gap-2 items-center mb-2.5">
                <input className="input flex-1" placeholder="Descrição (ex: Hora extra)"
                  value={r.label} onChange={e => updateExtra(r.id, 'label', e.target.value)} />
                <div className="relative w-36">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">R$</span>
                  <input className="input pl-7 text-right" type="number" step="0.01" min="0"
                    placeholder="0,00" value={r.amount}
                    onChange={e => updateExtra(r.id, 'amount', e.target.value)} />
                </div>
                <button onClick={() => removeExtra(r.id)}
                  className="text-gray-300 hover:text-rose-500 p-1 transition-colors">✕</button>
              </div>
            ))}
            <button onClick={() => setExtras(p => [...p, { id: uid(), label: '', amount: '' }])}
              className="btn-secondary btn-sm w-full justify-center mt-1">
              <Plus size={13} /> Outra receita
            </button>
          </div>

          {/* Observações */}
          <div className="card">
            <label className="label">Observações</label>
            <textarea className="input resize-none" rows={2} value={notes}
              onChange={e => setNotes(e.target.value)} placeholder="Ex: Reajuste de março 2026..." />
          </div>

          {/* Botão salvar config */}
          <button onClick={handleSaveConfig} disabled={saving || !brutoNum}
            className="btn-primary w-full justify-center py-3">
            {saving ? <><Loader2 size={16} className="animate-spin" /> Salvando...</> :
                      <><Save size={16} /> Salvar Salário {year}</>}
          </button>
        </div>

        {/* ── Coluna 3: resultado + histórico ── */}
        <div className="space-y-5">

          {/* Holerite calculado */}
          <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 text-white p-5 shadow-lg">
            <p className="text-xs font-bold uppercase tracking-wide opacity-70 mb-4">Holerite — {year}</p>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="opacity-75">Bruto (A)</span>
                <span className="font-bold">{formatCurrency(brutoNum)}</span>
              </div>
              <div className="border-t border-white/20 pt-2 space-y-1.5">
                <div className="flex justify-between">
                  <span className="opacity-75">INSS (B)</span>
                  <span className="text-rose-300">− {formatCurrency(inssNum)}</span>
                </div>
                <div className="flex justify-between opacity-60 text-xs">
                  <span>Base IRRF (C) = A−B</span>
                  <span>{formatCurrency(baseIRRF)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-75">IRRF (D)</span>
                  <span className="text-rose-300">− {formatCurrency(irrf)}</span>
                </div>
                {descontos.filter(d => toNumber(d.amount) > 0).map(d => (
                  <div key={d.id} className="flex justify-between opacity-75">
                    <span className="truncate max-w-[120px]">{d.label || 'Desconto'}</span>
                    <span className="text-rose-300">− {formatCurrency(toNumber(d.amount))}</span>
                  </div>
                ))}
                <div className="flex justify-between font-semibold border-t border-white/20 pt-1.5 opacity-80">
                  <span>Total descontos</span>
                  <span className="text-rose-300">− {formatCurrency(totalDescontos)}</span>
                </div>
              </div>

              {/* Líquido */}
              <div className="bg-white/20 rounded-xl p-3 mt-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold">Líquido (E)</span>
                  <span className="text-xl font-bold">{formatCurrency(liquido)}</span>
                </div>
              </div>

              {/* Bônus */}
              {(decimoNum > 0 || plrNum > 0) && (
                <div className="border-t border-white/20 pt-2 space-y-1.5">
                  {decimoNum > 0 && (
                    <div className="flex justify-between opacity-75">
                      <span>13º Salário</span>
                      <span className="text-emerald-300">+ {formatCurrency(decimoNum)}</span>
                    </div>
                  )}
                  {plrNum > 0 && (
                    <div className="flex justify-between opacity-75">
                      <span>PLR</span>
                      <span className="text-emerald-300">+ {formatCurrency(plrNum)}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Anual */}
              <div className="bg-white/10 rounded-xl p-3 flex justify-between items-center">
                <span className="opacity-75 text-xs">Ganho Anual</span>
                <span className="font-bold text-emerald-300">{formatCurrency(totalAnual)}</span>
              </div>
            </div>
          </div>

          {/* Registrar no mês */}
          <div className="card">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
              <Plus size={14} className="text-violet-500" /> Registrar no Mês
            </h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Ano</label>
                  <select className="input" value={destYear} onChange={e => setDestYear(Number(e.target.value))}>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Mês</label>
                  <select className="input" value={monthId} onChange={e => setMonthId(e.target.value)}>
                    {months.length === 0 && <option value="">Sem meses</option>}
                    {months.map(m => (
                      <option key={m.id} value={m.id}>{MONTH_NAMES[m.month]}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* resumo */}
              <div className="bg-slate-50 rounded-xl p-3 text-sm space-y-1 border border-gray-100">
                <div className="flex justify-between">
                  <span className="text-gray-500">Salário Líquido</span>
                  <span className="font-semibold">{formatCurrency(liquido)}</span>
                </div>
                {decimoNum > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">13º Salário</span>
                    <span className="font-semibold">{formatCurrency(decimoNum)}</span>
                  </div>
                )}
                {plrNum > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">PLR</span>
                    <span className="font-semibold">{formatCurrency(plrNum)}</span>
                  </div>
                )}
                {extras.filter(r => r.label && toNumber(r.amount) > 0).map(r => (
                  <div key={r.id} className="flex justify-between">
                    <span className="text-gray-500">{r.label}</span>
                    <span className="font-semibold">{formatCurrency(toNumber(r.amount))}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-start gap-2 text-xs text-gray-400 bg-amber-50 border border-amber-100 rounded-xl p-3">
                <Info size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <span>Os valores são adicionados como receitas no mês. Receitas existentes não são substituídas.</span>
              </div>

              <button onClick={handleRegister} disabled={registering || !liquido || !monthId}
                className="btn-primary w-full justify-center py-2.5">
                {registering
                  ? <><Loader2 size={15} className="animate-spin" /> Registrando...</>
                  : <><CheckCircle size={15} /> Registrar Proventos</>}
              </button>
            </div>
          </div>

          {/* Histórico */}
          <HistoryPanel
            configs={configs}
            onLoad={loadConfig}
            onDelete={handleDeleteConfig}
          />
        </div>
      </div>
    </div>
  )
}
