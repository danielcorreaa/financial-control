package com.financial_control.financial_control.api;

import com.financial_control.financial_control.application.month.FinancialMonthService;
import com.financial_control.financial_control.application.month.dto.CreateMonthCommand;
import com.financial_control.financial_control.application.month.dto.MonthResponse;
import com.financial_control.financial_control.application.month.dto.MonthSummaryResponse;
import com.financial_control.financial_control.application.month.dto.UpdateMonthCommand;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller REST para gestão de meses financeiros.
 */
@RestController
@RequestMapping("/months")
@Tag(name = "Meses Financeiros", description = "Gestão de meses financeiros")
public class FinancialMonthController {

    private final FinancialMonthService service;

    public FinancialMonthController(FinancialMonthService service) {
        this.service = service;
    }

    @PostMapping
    @Operation(summary = "Criar um novo mês financeiro")
    public ResponseEntity<MonthResponse> createMonth(@Valid @RequestBody CreateMonthCommand command) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createMonth(command));
    }

    @GetMapping
    @Operation(summary = "Listar todos os meses financeiros")
    public ResponseEntity<List<MonthResponse>> getAllMonths(
            @Parameter(description = "Filtrar por ano (opcional)")
            @RequestParam(required = false) Integer year) {
        if (year != null) {
            return ResponseEntity.ok(service.getMonthsByYear(year));
        }
        return ResponseEntity.ok(service.getAllMonths());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar um mês financeiro pelo ID")
    public ResponseEntity<MonthResponse> getMonth(@PathVariable String id) {
        return ResponseEntity.ok(service.getMonth(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar observações de um mês financeiro")
    public ResponseEntity<MonthResponse> updateMonth(
            @PathVariable String id,
            @RequestBody UpdateMonthCommand command) {
        return ResponseEntity.ok(service.updateMonth(id, command));
    }

    @PatchMapping("/{id}/close")
    @Operation(summary = "Fechar um mês financeiro")
    public ResponseEntity<MonthResponse> closeMonth(@PathVariable String id) {
        return ResponseEntity.ok(service.closeMonth(id));
    }

    @PatchMapping("/{id}/reopen")
    @Operation(summary = "Reabrir um mês financeiro fechado")
    public ResponseEntity<MonthResponse> reopenMonth(@PathVariable String id) {
        return ResponseEntity.ok(service.reopenMonth(id));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remover um mês financeiro")
    public ResponseEntity<Void> deleteMonth(@PathVariable String id) {
        service.deleteMonth(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/reset")
    @Operation(summary = "Zerar um mês: remove todas as despesas e receitas (apenas meses abertos)")
    public ResponseEntity<MonthResponse> resetMonth(@PathVariable String id) {
        return ResponseEntity.ok(service.resetMonth(id));
    }

    @GetMapping("/{id}/summary")
    @Operation(summary = "Obter o balanço financeiro de um mês")
    public ResponseEntity<MonthSummaryResponse> getSummary(@PathVariable String id) {
        return ResponseEntity.ok(service.getSummary(id));
    }
}
