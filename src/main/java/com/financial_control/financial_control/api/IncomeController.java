package com.financial_control.financial_control.api;

import com.financial_control.financial_control.application.income.dto.CreateIncomeCommand;
import com.financial_control.financial_control.application.income.dto.IncomeResponse;
import com.financial_control.financial_control.application.income.dto.UpdateIncomeCommand;
import com.financial_control.financial_control.application.month.FinancialMonthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller REST para gestão de receitas (proventos) dentro de um mês financeiro.
 */
@RestController
@RequestMapping("/months/{monthId}/incomes")
@Tag(name = "Receitas", description = "Gestão de receitas mensais (proventos)")
public class IncomeController {

    private final FinancialMonthService service;

    public IncomeController(FinancialMonthService service) {
        this.service = service;
    }

    @PostMapping
    @Operation(summary = "Adicionar uma receita ao mês")
    public ResponseEntity<IncomeResponse> addIncome(
            @PathVariable String monthId,
            @Valid @RequestBody CreateIncomeCommand command) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.addIncome(monthId, command));
    }

    @GetMapping
    @Operation(summary = "Listar receitas do mês")
    public ResponseEntity<List<IncomeResponse>> getIncomes(@PathVariable String monthId) {
        return ResponseEntity.ok(service.getIncomes(monthId));
    }

    @PutMapping("/{incomeId}")
    @Operation(summary = "Atualizar uma receita")
    public ResponseEntity<IncomeResponse> updateIncome(
            @PathVariable String monthId,
            @PathVariable String incomeId,
            @Valid @RequestBody UpdateIncomeCommand command) {
        return ResponseEntity.ok(service.updateIncome(monthId, incomeId, command));
    }

    @DeleteMapping("/{incomeId}")
    @Operation(summary = "Remover uma receita do mês")
    public ResponseEntity<Void> removeIncome(
            @PathVariable String monthId,
            @PathVariable String incomeId) {
        service.removeIncome(monthId, incomeId);
        return ResponseEntity.noContent().build();
    }
}
