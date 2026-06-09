package com.financial_control.financial_control.api;

import com.financial_control.financial_control.application.expense.dto.CreateExpenseCommand;
import com.financial_control.financial_control.application.expense.dto.ExpenseResponse;
import com.financial_control.financial_control.application.expense.dto.PayExpenseCommand;
import com.financial_control.financial_control.application.expense.dto.UpdateExpenseCommand;
import com.financial_control.financial_control.application.month.FinancialMonthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller REST para gestão de despesas dentro de um mês financeiro.
 */
@RestController
@RequestMapping("/months/{monthId}/expenses")
@Tag(name = "Despesas", description = "Gestão de despesas mensais")
public class ExpenseController {

    private final FinancialMonthService service;

    public ExpenseController(FinancialMonthService service) {
        this.service = service;
    }

    @PostMapping
    @Operation(summary = "Adicionar uma despesa ao mês")
    public ResponseEntity<ExpenseResponse> addExpense(
            @PathVariable String monthId,
            @Valid @RequestBody CreateExpenseCommand command) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.addExpense(monthId, command));
    }

    @GetMapping
    @Operation(summary = "Listar despesas do mês")
    public ResponseEntity<List<ExpenseResponse>> getExpenses(
            @PathVariable String monthId,
            @Parameter(description = "Filtrar por status: PAGO ou PENDENTE")
            @RequestParam(required = false) String status) {
        if ("PAGO".equalsIgnoreCase(status)) {
            return ResponseEntity.ok(service.getPaidExpenses(monthId));
        }
        if ("PENDENTE".equalsIgnoreCase(status)) {
            return ResponseEntity.ok(service.getPendingExpenses(monthId));
        }
        return ResponseEntity.ok(service.getExpenses(monthId));
    }

    @PutMapping("/{expenseId}")
    @Operation(summary = "Atualizar uma despesa")
    public ResponseEntity<ExpenseResponse> updateExpense(
            @PathVariable String monthId,
            @PathVariable String expenseId,
            @Valid @RequestBody UpdateExpenseCommand command) {
        return ResponseEntity.ok(service.updateExpense(monthId, expenseId, command));
    }

    @PatchMapping("/{expenseId}/pay")
    @Operation(summary = "Marcar despesa como paga")
    public ResponseEntity<ExpenseResponse> payExpense(
            @PathVariable String monthId,
            @PathVariable String expenseId,
            @RequestBody(required = false) PayExpenseCommand command) {
        PayExpenseCommand cmd = command != null ? command : new PayExpenseCommand(null);
        return ResponseEntity.ok(service.payExpense(monthId, expenseId, cmd));
    }

    @PatchMapping("/{expenseId}/unpay")
    @Operation(summary = "Desmarcar pagamento de uma despesa")
    public ResponseEntity<ExpenseResponse> unpayExpense(
            @PathVariable String monthId,
            @PathVariable String expenseId) {
        return ResponseEntity.ok(service.unpayExpense(monthId, expenseId));
    }

    @DeleteMapping("/{expenseId}")
    @Operation(summary = "Remover uma despesa do mês")
    public ResponseEntity<Void> removeExpense(
            @PathVariable String monthId,
            @PathVariable String expenseId) {
        service.removeExpense(monthId, expenseId);
        return ResponseEntity.noContent().build();
    }
}
