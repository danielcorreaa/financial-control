package com.financial_control.financial_control.api;

import com.financial_control.financial_control.application.salary.SalaryConfigService;
import com.financial_control.financial_control.application.salary.dto.SaveSalaryConfigCommand;
import com.financial_control.financial_control.application.salary.dto.SalaryConfigResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/salary-configs")
@Tag(name = "Configuração Salarial", description = "Cadastro de salário por ano com cálculo de INSS, IRRF e líquido")
public class SalaryConfigController {

    private final SalaryConfigService service;

    public SalaryConfigController(SalaryConfigService service) {
        this.service = service;
    }

    @PostMapping
    @Operation(summary = "Criar ou atualizar configuração salarial de um ano (upsert)")
    public ResponseEntity<SalaryConfigResponse> save(@Valid @RequestBody SaveSalaryConfigCommand cmd) {
        return ResponseEntity.ok(service.save(cmd));
    }

    @GetMapping
    @Operation(summary = "Listar todas as configurações salariais")
    public ResponseEntity<List<SalaryConfigResponse>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/year/{year}")
    @Operation(summary = "Buscar configuração salarial por ano")
    public ResponseEntity<SalaryConfigResponse> getByYear(@PathVariable int year) {
        Optional<SalaryConfigResponse> result = service.findByYear(year);
        return result.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remover configuração salarial")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
