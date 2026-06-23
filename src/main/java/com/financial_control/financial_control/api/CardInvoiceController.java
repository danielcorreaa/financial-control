package com.financial_control.financial_control.api;

import com.financial_control.financial_control.application.card.CardInvoiceService;
import com.financial_control.financial_control.application.card.dto.CardInvoiceResponse;
import com.financial_control.financial_control.application.card.dto.CreateCardInvoiceCommand;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/card-invoices")
@Tag(name = "Faturas de Cartao", description = "Gestao de faturas de cartao de credito")
public class CardInvoiceController {

    private final CardInvoiceService service;

    public CardInvoiceController(CardInvoiceService service) {
        this.service = service;
    }

    @PostMapping
    @Operation(summary = "Adicionar fatura de cartao")
    public ResponseEntity<CardInvoiceResponse> add(@Valid @RequestBody CreateCardInvoiceCommand command) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.add(command));
    }

    @GetMapping
    @Operation(summary = "Listar todas as faturas")
    public ResponseEntity<List<CardInvoiceResponse>> findAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remover fatura e a despesa associada")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
