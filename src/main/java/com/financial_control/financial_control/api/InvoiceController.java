package com.financial_control.financial_control.api;

import com.financial_control.financial_control.application.invoice.BradescoInvoiceParser;
import com.financial_control.financial_control.application.invoice.dto.InvoiceParseResult;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/invoices")
@Tag(name = "Faturas", description = "Importação de faturas de cartão de crédito")
public class InvoiceController {

    private static final Logger log = LoggerFactory.getLogger(InvoiceController.class);

    private final BradescoInvoiceParser parser;

    public InvoiceController(BradescoInvoiceParser parser) {
        this.parser = parser;
    }

    @PostMapping("/parse")
    @Operation(summary = "Extrair transações de uma fatura Bradesco em PDF")
    public ResponseEntity<?> parseBradesco(
            @RequestParam("file") MultipartFile file) {
        try {
            return ResponseEntity.ok(parser.parse(file));
        } catch (Exception e) {
            log.error("Erro ao processar fatura PDF: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
