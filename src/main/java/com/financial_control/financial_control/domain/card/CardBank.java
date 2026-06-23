package com.financial_control.financial_control.domain.card;

public enum CardBank {
    BRADESCO("Bradesco"),
    CAIXA("Caixa"),
    ITAU("Itau"),
    MERCADO_PAGO("Mercado Pago"),
    RIACHUELO("Riachuelo"),
    OUTRO("Outro");

    private final String label;

    CardBank(String label) { this.label = label; }

    public String getLabel() { return label; }
}
