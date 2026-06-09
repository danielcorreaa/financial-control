/**
 * Cálculo de IRRF e INSS conforme tabelas vigentes.
 * Validado contra planilha real: Bruto R$ 15.252,75 → IRRF R$ 3.048,57
 */

// ── Tabela INSS 2025 (progressiva por faixa) ─────────────────────────────────
const INSS_FAIXAS = [
  { limite: 1518.00, aliquota: 0.075 },
  { limite: 2793.88, aliquota: 0.09  },
  { limite: 4190.83, aliquota: 0.12  },
  { limite: 8157.41, aliquota: 0.14  },
]
const INSS_TETO = 908.86

// ── Tabela IRRF 2024 ──────────────────────────────────────────────────────────
// Validada: base R$ 14.343,89 → alíquota 27,5% → IRRF R$ 3.048,57
const IRRF_FAIXAS = [
  { limite: 2259.20,  aliquota: 0,      deducao: 0       },
  { limite: 2826.65,  aliquota: 0.075,  deducao: 169.44  },
  { limite: 3751.05,  aliquota: 0.15,   deducao: 381.44  },
  { limite: 4664.68,  aliquota: 0.225,  deducao: 662.77  },
  { limite: Infinity, aliquota: 0.275,  deducao: 896.00  },
]

// Dedução por dependente (tabela vigente)
export const DEDUCAO_DEPENDENTE = 189.59

/**
 * Calcula INSS progressivo sobre o salário bruto.
 */
export function calcularINSS(bruto: number): number {
  if (bruto > 8157.41) return INSS_TETO

  let inss = 0
  let baseAnterior = 0

  for (const faixa of INSS_FAIXAS) {
    if (bruto <= baseAnterior) break
    const baseNaFaixa = Math.min(bruto, faixa.limite) - baseAnterior
    inss += baseNaFaixa * faixa.aliquota
    baseAnterior = faixa.limite
  }

  return round2(inss)
}

/**
 * Calcula a base do IRRF.
 * Regra: Bruto − INSS − dependentes
 * IMPORTANTE: Previdência privada e outros descontos opcionais NÃO entram
 * na base de cálculo do IRRF (confirmado pela planilha do usuário).
 */
export function calcularBaseIRRF(bruto: number, inss: number, dependentes: number): number {
  const deducaoDep = dependentes * DEDUCAO_DEPENDENTE
  return round2(Math.max(0, bruto - inss - deducaoDep))
}

/**
 * Calcula IRRF sobre a base de cálculo.
 */
export function calcularIRRF(baseCalculo: number): number {
  for (const faixa of IRRF_FAIXAS) {
    if (baseCalculo <= faixa.limite) {
      const irrf = baseCalculo * faixa.aliquota - faixa.deducao
      return round2(Math.max(0, irrf))
    }
  }
  return 0
}

function round2(v: number): number {
  return Math.round(v * 100) / 100
}
