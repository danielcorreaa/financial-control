// ─── Auth ────────────────────────────────────────────────────────────────────

export type Role = 'USER' | 'ADMIN'

export interface AuthResponse {
  token: string
  id: string
  name: string
  email: string
  role: Role
}

// ─── Enums ───────────────────────────────────────────────────────────────────

export type ExpenseCategory =
  | 'MORADIA' | 'EDUCACAO' | 'TRANSPORTE' | 'ALIMENTACAO'
  | 'CARTAO_CREDITO' | 'IMPOSTOS' | 'TELEFONIA' | 'INTERNET' | 'OUTROS'

export type ExpenseStatus = 'PENDENTE' | 'PAGO'

export type IncomeType = 'SALARIO' | 'RENDA_EXTRA' | 'BONUS' | 'OUTROS'

export type ProjectStatus = 'EM_ANDAMENTO' | 'FINALIZADO' | 'CANCELADO'

export type MonthStatus = 'ABERTO' | 'FECHADO'

// ─── Months ──────────────────────────────────────────────────────────────────

export interface Expense {
  id: string
  name: string
  category: ExpenseCategory
  amount: number
  status: ExpenseStatus
  dueDate?: string
  paymentDate?: string
  notes?: string
}

export interface Income {
  id: string
  description: string
  amount: number
  type: IncomeType
  date?: string
  notes?: string
}

export interface MonthResponse {
  id: string
  month: number
  year: number
  monthName: string
  status: MonthStatus
  notes?: string
  expenses: Expense[]
  incomes: Income[]
}

export interface MonthSummary {
  id: string
  month: number
  year: number
  monthName: string
  status: MonthStatus
  totalIncomes: number
  totalExpenses: number
  totalPaid: number
  totalPending: number
  balance: number
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface DashboardResponse {
  year: number
  totalAnnualIncomes: number
  totalAnnualExpenses: number
  totalAnnualBalance: number
  accumulatedBalance: number
  months: MonthSummary[]
}

// ─── Projects ────────────────────────────────────────────────────────────────

export interface ProjectExpense {
  id: string
  description: string
  amount: number
  paid: boolean
  notes?: string
  debitMonth?: number
  debitYear?: number
  debitSource?: string   // 'PLR' | 'DECIMO_TERCEIRO' | 'SALARIO'
  launched: boolean
  launchedExpenseId?: string
  launchedMonthId?: string
}

export interface Project {
  id: string
  name: string
  description?: string
  startDate?: string
  endDate?: string
  status: ProjectStatus
  totalAmount: number
  totalPaid: number
  totalPending: number
  expenses: ProjectExpense[]
}

// ─── Salary Config ───────────────────────────────────────────────────────────

export interface SalaryDiscount {
  label: string
  amount: number
}

export interface SalaryConfig {
  id: string
  year: number
  grossSalary: number
  manualInss: boolean
  manualInssValue?: number
  dependents: number
  discounts: SalaryDiscount[]
  plr: number
  thirteenthSalary: number
  notes?: string
  // calculados
  calculatedInss: number
  calculatedBaseIrrf: number
  calculatedIrrf: number
  calculatedTotalDiscounts: number
  calculatedNetSalary: number
  calculatedAnnualTotal: number
}
