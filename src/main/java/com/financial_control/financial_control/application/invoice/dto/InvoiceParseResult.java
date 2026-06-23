package com.financial_control.financial_control.application.invoice.dto;

import java.util.List;

public record InvoiceParseResult(
        String invoiceDueDate,
        Double invoiceTotalAmount,
        List<ParsedTransactionDTO> transactions
) {}
