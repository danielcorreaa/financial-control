package com.financial_control.financial_control.application.project;

import com.financial_control.financial_control.application.project.dto.CreateProjectCommand;
import com.financial_control.financial_control.application.project.dto.CreateProjectExpenseCommand;
import com.financial_control.financial_control.application.project.dto.ProjectExpenseResponse;
import com.financial_control.financial_control.application.project.dto.ProjectResponse;
import com.financial_control.financial_control.application.project.dto.UpdateProjectCommand;
import com.financial_control.financial_control.domain.expense.ExpenseCategory;
import com.financial_control.financial_control.domain.month.FinancialMonth;
import com.financial_control.financial_control.domain.month.FinancialMonthRepository;
import com.financial_control.financial_control.domain.project.FinancialProject;
import com.financial_control.financial_control.domain.project.FinancialProjectRepository;
import com.financial_control.financial_control.domain.project.ProjectExpense;
import com.financial_control.financial_control.domain.project.ProjectStatus;
import com.financial_control.financial_control.infrastructure.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.time.Month;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class FinancialProjectService {

    private final FinancialProjectRepository repository;
    private final FinancialMonthRepository monthRepository;

    public FinancialProjectService(FinancialProjectRepository repository,
                                   FinancialMonthRepository monthRepository) {
        this.repository = repository;
        this.monthRepository = monthRepository;
    }

    // ── Gestão de projetos ───────────────────────────────────────────────────

    public ProjectResponse createProject(CreateProjectCommand command) {
        FinancialProject project = new FinancialProject(
                command.name(), command.description(),
                command.startDate(), command.endDate());
        return ProjectResponse.from(repository.save(project));
    }

    public ProjectResponse getProject(String id) {
        return ProjectResponse.from(findOrThrow(id));
    }

    public List<ProjectResponse> getAllProjects() {
        return repository.findAll().stream().map(ProjectResponse::from).toList();
    }

    public List<ProjectResponse> getProjectsByStatus(ProjectStatus status) {
        return repository.findByStatus(status).stream().map(ProjectResponse::from).toList();
    }

    public ProjectResponse updateProject(String id, UpdateProjectCommand command) {
        FinancialProject project = findOrThrow(id);
        project.update(command.name(), command.description(), command.startDate(), command.endDate());
        return ProjectResponse.from(repository.save(project));
    }

    public ProjectResponse finishProject(String id) {
        FinancialProject project = findOrThrow(id);
        project.finish();
        return ProjectResponse.from(repository.save(project));
    }

    public ProjectResponse cancelProject(String id) {
        FinancialProject project = findOrThrow(id);
        project.cancel();
        return ProjectResponse.from(repository.save(project));
    }

    public ProjectResponse reopenProject(String id) {
        FinancialProject project = findOrThrow(id);
        project.reopen();
        return ProjectResponse.from(repository.save(project));
    }

    public void deleteProject(String id) {
        findOrThrow(id);
        repository.deleteById(id);
    }

    // ── Gestão de despesas do projeto ────────────────────────────────────────

    public ProjectExpenseResponse addExpense(String projectId, CreateProjectExpenseCommand command) {
        FinancialProject project = findOrThrow(projectId);
        ProjectExpense expense = project.addExpense(
                command.description(), command.amount(), command.notes(),
                command.debitMonth(), command.debitYear(), command.debitSource());
        repository.save(project);
        return ProjectExpenseResponse.from(expense);
    }

    public ProjectExpenseResponse updateExpense(String projectId, String expenseId,
                                                CreateProjectExpenseCommand command) {
        FinancialProject project = findOrThrow(projectId);
        project.updateExpense(expenseId, command.description(), command.amount(), command.notes(),
                command.debitMonth(), command.debitYear(), command.debitSource());
        repository.save(project);
        return findExpenseResponse(project, expenseId);
    }

    public void removeExpense(String projectId, String expenseId) {
        FinancialProject project = findOrThrow(projectId);
        project.removeExpense(expenseId);
        repository.save(project);
    }

    public ProjectExpenseResponse payExpense(String projectId, String expenseId) {
        FinancialProject project = findOrThrow(projectId);
        project.payExpense(expenseId);
        repository.save(project);
        return findExpenseResponse(project, expenseId);
    }

    public ProjectExpenseResponse unpayExpense(String projectId, String expenseId) {
        FinancialProject project = findOrThrow(projectId);
        project.unpayExpense(expenseId);
        repository.save(project);
        return findExpenseResponse(project, expenseId);
    }

    // ── Lançamento de despesas nos meses ─────────────────────────────────────

    /**
     * Lança todas as despesas vinculadas a um mês/fonte nos meses financeiros correspondentes.
     * Retorna um resumo do que foi lançado.
     */
    public LaunchResult launchExpenses(String projectId) {
        FinancialProject project = findOrThrow(projectId);

        List<String> launched  = new ArrayList<>();
        List<String> skipped   = new ArrayList<>();
        List<String> errors    = new ArrayList<>();

        for (ProjectExpense expense : project.getExpenses()) {
            if (expense.isLaunched()) {
                skipped.add(expense.getDescription() + " (já lançada)");
                continue;
            }

            // Resolve o mês destino
            Optional<FinancialMonth> targetMonth = resolveTargetMonth(expense);

            if (targetMonth.isEmpty()) {
                errors.add(expense.getDescription() + " — mês destino não encontrado");
                continue;
            }

            FinancialMonth month = targetMonth.get();

            // Reabre temporariamente se fechado
            boolean wasClosed = month.getStatus().name().equals("FECHADO");
            if (wasClosed) month.reopen();

            try {
                var createdExpense = month.addExpense(
                        "[" + project.getName() + "] " + expense.getDescription(),
                        ExpenseCategory.OUTROS,
                        expense.getAmount(),
                        null,
                        "Projeto: " + project.getName()
                );
                monthRepository.save(month);

                // Marca como lançada
                expense.markAsLaunched(createdExpense.getId(), month.getId());
                launched.add(expense.getDescription() + " → " + month.getMonth().name() + "/" + month.getYear());

            } catch (Exception e) {
                errors.add(expense.getDescription() + " — erro: " + e.getMessage());
                if (wasClosed) month.close();
            }

            // Fecha novamente se estava fechado
            if (wasClosed) {
                month.close();
                monthRepository.save(month);
            }
        }

        repository.save(project);
        return new LaunchResult(launched, skipped, errors);
    }

    /**
     * Estorna o lançamento de uma despesa específica (remove do mês).
     */
    public ProjectExpenseResponse unlaunchExpense(String projectId, String expenseId) {
        FinancialProject project = findOrThrow(projectId);
        ProjectExpense expense = project.getExpenses().stream()
                .filter(e -> e.getId().equals(expenseId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Despesa não encontrada: " + expenseId));

        if (!expense.isLaunched()) {
            throw new IllegalStateException("Despesa não foi lançada ainda.");
        }

        // Remove do mês
        monthRepository.findById(expense.getLaunchedMonthId()).ifPresent(month -> {
            boolean wasClosed = month.getStatus().name().equals("FECHADO");
            if (wasClosed) month.reopen();
            try {
                month.removeExpense(expense.getLaunchedExpenseId());
            } catch (Exception ignored) {}
            if (wasClosed) month.close();
            monthRepository.save(month);
        });

        expense.unlaunch();
        repository.save(project);
        return ProjectExpenseResponse.from(expense);
    }

    // ── Resolução do mês destino ─────────────────────────────────────────────

    private Optional<FinancialMonth> resolveTargetMonth(ProjectExpense expense) {
        // Por mês/ano explícito
        if (expense.getDebitMonth() != null && expense.getDebitYear() != null) {
            return monthRepository.findByMonthAndYear(
                    Month.of(expense.getDebitMonth()), expense.getDebitYear());
        }

        // Por fonte especial — busca o mês que contém aquela receita
        if (expense.getDebitSource() != null) {
            String source = expense.getDebitSource().toUpperCase();

            // Mapeamento de fontes para palavras-chave nas receitas
            Map<String, String> sourceKeywords = Map.of(
                    "PLR",              "PLR",
                    "DECIMO_TERCEIRO",  "écimo",
                    "SALARIO",          "alário"
            );

            String keyword = sourceKeywords.getOrDefault(source, source);
            final String kw = keyword;

            return monthRepository.findAll().stream()
                    .filter(m -> m.getIncomes().stream()
                            .anyMatch(i -> i.getDescription().contains(kw)))
                    .findFirst();
        }

        return Optional.empty();
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private FinancialProject findOrThrow(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Projeto não encontrado: " + id));
    }

    private ProjectExpenseResponse findExpenseResponse(FinancialProject project, String expenseId) {
        return project.getExpenses().stream()
                .filter(e -> e.getId().equals(expenseId))
                .map(ProjectExpenseResponse::from)
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Despesa não encontrada: " + expenseId));
    }

    // ── Record de resultado ──────────────────────────────────────────────────

    public record LaunchResult(
            List<String> launched,
            List<String> skipped,
            List<String> errors
    ) {}
}
