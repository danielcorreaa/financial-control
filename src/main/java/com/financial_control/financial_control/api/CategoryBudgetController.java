package com.financial_control.financial_control.api;

import com.financial_control.financial_control.application.budget.CategoryBudgetService;
import com.financial_control.financial_control.application.budget.dto.BudgetResponse;
import com.financial_control.financial_control.application.budget.dto.SaveBudgetCommand;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/budgets")
@Tag(name = "Orçamento por Categoria", description = "Limites de gasto por categoria e ano")
public class CategoryBudgetController {

    private final CategoryBudgetService service;

    public CategoryBudgetController(CategoryBudgetService service) {
        this.service = service;
    }

    @GetMapping("/{year}")
    @Operation(summary = "Buscar orçamento de um ano")
    public ResponseEntity<BudgetResponse> get(@PathVariable int year) {
        return ResponseEntity.ok(service.getOrEmpty(year));
    }

    @PutMapping("/{year}")
    @Operation(summary = "Salvar ou atualizar orçamento de um ano")
    public ResponseEntity<BudgetResponse> save(
            @PathVariable int year,
            @Valid @RequestBody SaveBudgetCommand command) {
        return ResponseEntity.ok(service.save(year, command));
    }
}
