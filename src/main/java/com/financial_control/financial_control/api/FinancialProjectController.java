package com.financial_control.financial_control.api;

import com.financial_control.financial_control.application.project.FinancialProjectService;
import com.financial_control.financial_control.application.project.dto.CreateProjectCommand;
import com.financial_control.financial_control.application.project.dto.CreateProjectExpenseCommand;
import com.financial_control.financial_control.application.project.dto.ProjectExpenseResponse;
import com.financial_control.financial_control.application.project.dto.ProjectResponse;
import com.financial_control.financial_control.application.project.dto.UpdateProjectCommand;
import com.financial_control.financial_control.domain.project.ProjectStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller REST para gestão de projetos financeiros extraordinários.
 */
@RestController
@RequestMapping("/projects")
@Tag(name = "Projetos Extraordinários", description = "Gestão de projetos financeiros extraordinários (mudanças, reformas, etc.)")
public class FinancialProjectController {

    private final FinancialProjectService service;

    public FinancialProjectController(FinancialProjectService service) {
        this.service = service;
    }

    // -------------------------------------------------------------------------
    // Projetos
    // -------------------------------------------------------------------------

    @PostMapping
    @Operation(summary = "Criar um novo projeto financeiro")
    public ResponseEntity<ProjectResponse> createProject(@Valid @RequestBody CreateProjectCommand command) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createProject(command));
    }

    @GetMapping
    @Operation(summary = "Listar todos os projetos financeiros")
    public ResponseEntity<List<ProjectResponse>> getAllProjects(
            @Parameter(description = "Filtrar por status: EM_ANDAMENTO, FINALIZADO ou CANCELADO")
            @RequestParam(required = false) ProjectStatus status) {
        if (status != null) {
            return ResponseEntity.ok(service.getProjectsByStatus(status));
        }
        return ResponseEntity.ok(service.getAllProjects());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar um projeto pelo ID")
    public ResponseEntity<ProjectResponse> getProject(@PathVariable String id) {
        return ResponseEntity.ok(service.getProject(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar dados de um projeto")
    public ResponseEntity<ProjectResponse> updateProject(
            @PathVariable String id,
            @Valid @RequestBody UpdateProjectCommand command) {
        return ResponseEntity.ok(service.updateProject(id, command));
    }

    @PatchMapping("/{id}/finish")
    @Operation(summary = "Finalizar um projeto")
    public ResponseEntity<ProjectResponse> finishProject(@PathVariable String id) {
        return ResponseEntity.ok(service.finishProject(id));
    }

    @PatchMapping("/{id}/cancel")
    @Operation(summary = "Cancelar um projeto")
    public ResponseEntity<ProjectResponse> cancelProject(@PathVariable String id) {
        return ResponseEntity.ok(service.cancelProject(id));
    }

    @PatchMapping("/{id}/reopen")
    @Operation(summary = "Reabrir um projeto cancelado ou finalizado")
    public ResponseEntity<ProjectResponse> reopenProject(@PathVariable String id) {
        return ResponseEntity.ok(service.reopenProject(id));
    }

    @PostMapping("/{id}/launch")
    @Operation(summary = "Lançar despesas do projeto nos meses vinculados")
    public ResponseEntity<FinancialProjectService.LaunchResult> launchExpenses(@PathVariable String id) {
        return ResponseEntity.ok(service.launchExpenses(id));
    }

    @PatchMapping("/{projectId}/expenses/{expenseId}/unlaunch")
    @Operation(summary = "Estornar lançamento de uma despesa do projeto")
    public ResponseEntity<ProjectExpenseResponse> unlaunchExpense(
            @PathVariable String projectId, @PathVariable String expenseId) {
        return ResponseEntity.ok(service.unlaunchExpense(projectId, expenseId));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remover um projeto")
    public ResponseEntity<Void> deleteProject(@PathVariable String id) {
        service.deleteProject(id);
        return ResponseEntity.noContent().build();
    }

    // -------------------------------------------------------------------------
    // Despesas do projeto
    // -------------------------------------------------------------------------

    @PostMapping("/{projectId}/expenses")
    @Operation(summary = "Adicionar uma despesa ao projeto")
    public ResponseEntity<ProjectExpenseResponse> addExpense(
            @PathVariable String projectId,
            @Valid @RequestBody CreateProjectExpenseCommand command) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.addExpense(projectId, command));
    }

    @PutMapping("/{projectId}/expenses/{expenseId}")
    @Operation(summary = "Atualizar uma despesa do projeto")
    public ResponseEntity<ProjectExpenseResponse> updateExpense(
            @PathVariable String projectId,
            @PathVariable String expenseId,
            @Valid @RequestBody CreateProjectExpenseCommand command) {
        return ResponseEntity.ok(service.updateExpense(projectId, expenseId, command));
    }

    @PatchMapping("/{projectId}/expenses/{expenseId}/pay")
    @Operation(summary = "Marcar despesa do projeto como paga")
    public ResponseEntity<ProjectExpenseResponse> payExpense(
            @PathVariable String projectId,
            @PathVariable String expenseId) {
        return ResponseEntity.ok(service.payExpense(projectId, expenseId));
    }

    @PatchMapping("/{projectId}/expenses/{expenseId}/unpay")
    @Operation(summary = "Desmarcar pagamento de despesa do projeto")
    public ResponseEntity<ProjectExpenseResponse> unpayExpense(
            @PathVariable String projectId,
            @PathVariable String expenseId) {
        return ResponseEntity.ok(service.unpayExpense(projectId, expenseId));
    }

    @DeleteMapping("/{projectId}/expenses/{expenseId}")
    @Operation(summary = "Remover uma despesa do projeto")
    public ResponseEntity<Void> removeExpense(
            @PathVariable String projectId,
            @PathVariable String expenseId) {
        service.removeExpense(projectId, expenseId);
        return ResponseEntity.noContent().build();
    }
}
