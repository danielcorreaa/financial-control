package com.financial_control.financial_control.application.salary;

import com.financial_control.financial_control.application.salary.dto.SaveSalaryConfigCommand;
import com.financial_control.financial_control.application.salary.dto.SalaryConfigResponse;
import com.financial_control.financial_control.domain.salary.SalaryConfig;
import com.financial_control.financial_control.domain.salary.SalaryConfigRepository;
import com.financial_control.financial_control.domain.salary.SalaryDiscount;
import com.financial_control.financial_control.infrastructure.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SalaryConfigService {

    private final SalaryConfigRepository repository;

    public SalaryConfigService(SalaryConfigRepository repository) {
        this.repository = repository;
    }

    /**
     * Cria ou atualiza o salário de um ano (upsert por ano).
     */
    public SalaryConfigResponse save(SaveSalaryConfigCommand cmd) {
        List<SalaryDiscount> discounts = cmd.discounts() == null ? List.of() :
                cmd.discounts().stream()
                        .map(d -> new SalaryDiscount(d.label(), d.amount()))
                        .toList();

        Optional<SalaryConfig> existing = repository.findByYear(cmd.year());

        SalaryConfig config;
        if (existing.isPresent()) {
            config = existing.get();
            config.update(cmd.grossSalary(), cmd.manualInss(), cmd.manualInssValue(),
                    cmd.dependents(), discounts, cmd.plr(), cmd.thirteenthSalary(), cmd.notes());
        } else {
            config = new SalaryConfig(cmd.year(), cmd.grossSalary(), cmd.manualInss(),
                    cmd.manualInssValue(), cmd.dependents(), discounts,
                    cmd.plr(), cmd.thirteenthSalary(), cmd.notes());
        }

        return SalaryConfigResponse.from(repository.save(config));
    }

    public SalaryConfigResponse getByYear(int year) {
        return repository.findByYear(year)
                .map(SalaryConfigResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Configuração salarial não encontrada para o ano: " + year));
    }

    public Optional<SalaryConfigResponse> findByYear(int year) {
        return repository.findByYear(year).map(SalaryConfigResponse::from);
    }

    public List<SalaryConfigResponse> getAll() {
        return repository.findAll().stream()
                .sorted((a, b) -> Integer.compare(b.getYear(), a.getYear()))
                .map(SalaryConfigResponse::from)
                .toList();
    }

    public void delete(String id) {
        repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Configuração não encontrada: " + id));
        repository.deleteById(id);
    }
}
