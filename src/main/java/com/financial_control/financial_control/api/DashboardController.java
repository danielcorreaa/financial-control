package com.financial_control.financial_control.api;

import com.financial_control.financial_control.application.dashboard.DashboardResponse;
import com.financial_control.financial_control.application.dashboard.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

/**
 * Controller REST para o dashboard financeiro consolidado.
 */
@RestController
@RequestMapping("/dashboard")
@Tag(name = "Dashboard", description = "Balanço financeiro consolidado")
public class DashboardController {

    private final DashboardService service;

    public DashboardController(DashboardService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "Obter dashboard financeiro do ano")
    public ResponseEntity<DashboardResponse> getDashboard(
            @Parameter(description = "Ano para o dashboard (padrão: ano atual)")
            @RequestParam(required = false) Integer year) {
        int targetYear = (year != null) ? year : LocalDate.now().getYear();
        return ResponseEntity.ok(service.getDashboard(targetYear));
    }
}
