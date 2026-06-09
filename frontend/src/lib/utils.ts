import type { ExpenseCategory, IncomeType, MonthStatus, ProjectStatus } from '../types'

export const MONTH_NAMES = [
  '', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

export const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  MORADIA:       'Moradia',
  EDUCACAO:      'Educação',
  TRANSPORTE:    'Transporte',
  ALIMENTACAO:   'Alimentação',
  CARTAO_CREDITO:'Cartão de Crédito',
  IMPOSTOS:      'Impostos',
  TELEFONIA:     'Telefonia',
  INTERNET:      'Internet',
  OUTROS:        'Outros',
}

// Badge CSS class por categoria
export const CATEGORY_BADGE: Record<ExpenseCategory, string> = {
  MORADIA:       'badge-blue',
  EDUCACAO:      'badge-violet',
  TRANSPORTE:    'badge-cyan',
  ALIMENTACAO:   'badge-orange',
  CARTAO_CREDITO:'badge-pink',
  IMPOSTOS:      'badge-red',
  TELEFONIA:     'badge-teal',
  INTERNET:      'badge-indigo',
  OUTROS:        'badge-gray',
}

// Cor de fundo do card de categoria (para ícones e destaques)
export const CATEGORY_COLOR: Record<ExpenseCategory, string> = {
  MORADIA:        'bg-blue-500',
  EDUCACAO:       'bg-violet-500',
  TRANSPORTE:     'bg-cyan-500',
  ALIMENTACAO:    'bg-orange-500',
  CARTAO_CREDITO: 'bg-pink-500',
  IMPOSTOS:       'bg-rose-500',
  TELEFONIA:      'bg-teal-500',
  INTERNET:       'bg-indigo-500',
  OUTROS:         'bg-gray-400',
}

export const INCOME_TYPE_LABELS: Record<IncomeType, string> = {
  SALARIO:    'Salário',
  RENDA_EXTRA:'Renda Extra',
  BONUS:      'Bônus',
  OUTROS:     'Outros',
}

export const INCOME_TYPE_BADGE: Record<IncomeType, string> = {
  SALARIO:    'badge-green',
  RENDA_EXTRA:'badge-teal',
  BONUS:      'badge-yellow',
  OUTROS:     'badge-gray',
}

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  EM_ANDAMENTO: 'Em Andamento',
  FINALIZADO:   'Finalizado',
  CANCELADO:    'Cancelado',
}

export const PROJECT_STATUS_BADGE: Record<ProjectStatus, string> = {
  EM_ANDAMENTO: 'badge-violet',
  FINALIZADO:   'badge-green',
  CANCELADO:    'badge-red',
}

export const MONTH_STATUS_LABELS: Record<MonthStatus, string> = {
  ABERTO:  'Aberto',
  FECHADO: 'Fechado',
}

export function formatCurrency(value: number | string): string {
  const n = typeof value === 'string' ? parseFloat(value) : value
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n || 0)
}

export function formatDate(date?: string): string {
  if (!date) return '—'
  const [y, m, d] = date.split('-')
  return `${d}/${m}/${y}`
}

export function currentYear(): number {
  return new Date().getFullYear()
}
