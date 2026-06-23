package com.financial_control.financial_control.api;

import com.financial_control.financial_control.application.analytics.AnalyticsService;
import com.financial_control.financial_control.application.analytics.dto.InstallmentDTO;
import com.financial_control.financial_control.application.analytics.dto.MonthCategoryTotals;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/analytics")
@Tag(name = "Analytics", description = "Analise de gastos e parcelas")
public class AnalyticsController {

    private final AnalyticsService service;

    public AnalyticsController(AnalyticsService service) {
        this.service = service;
    }

    @GetMapping("/by-category")
    @Operation(summary = "Totais de despesas por categoria no ano")
    public ResponseEntity<List<MonthCategoryTotals>> byCategory(
            @RequestParam(defaultValue = "0") int year) {
        int y = year > 0 ? year : java.time.Year.now().getValue();
        return ResponseEntity.ok(service.getCategoryTotals(y));
    }

    @GetMapping("/installments")
    @Operation(summary = "Parcelas ativas (despesas com padrao X/Y no nome)")
    public ResponseEntity<List<InstallmentDTO>> installments() {
        return ResponseEntity.ok(service.getActiveInstallments());
    }
}
