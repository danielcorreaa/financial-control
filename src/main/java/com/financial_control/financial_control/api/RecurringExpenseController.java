package com.financial_control.financial_control.api;

import com.financial_control.financial_control.application.recurring.RecurringExpenseService;
import com.financial_control.financial_control.application.recurring.dto.CreateRecurringExpenseCommand;
import com.financial_control.financial_control.application.recurring.dto.RecurringExpenseResponse;
import com.financial_control.financial_control.application.recurring.dto.UpdateRecurringExpenseCommand;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/recurring-expenses")
@Tag(name = "Despesas Recorrentes", description = "Modelos de despesas fixas mensais")
public class RecurringExpenseController {

    private final RecurringExpenseService service;

    public RecurringExpenseController(RecurringExpenseService service) {
        this.service = service;
    }

    @PostMapping
    @Operation(summary = "Criar modelo de despesa recorrente")
    public ResponseEntity<RecurringExpenseResponse> create(@Valid @RequestBody CreateRecurringExpenseCommand command) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(command));
    }

    @GetMapping
    @Operation(summary = "Listar todos os modelos de despesas recorrentes")
    public ResponseEntity<List<RecurringExpenseResponse>> findAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar modelo de despesa recorrente")
    public ResponseEntity<RecurringExpenseResponse> update(
            @PathVariable String id,
            @Valid @RequestBody UpdateRecurringExpenseCommand command) {
        return ResponseEntity.ok(service.update(id, command));
    }

    @PatchMapping("/{id}/toggle")
    @Operation(summary = "Ativar ou desativar uma despesa recorrente")
    public ResponseEntity<RecurringExpenseResponse> toggleActive(@PathVariable String id) {
        return ResponseEntity.ok(service.toggleActive(id));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remover modelo de despesa recorrente")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
