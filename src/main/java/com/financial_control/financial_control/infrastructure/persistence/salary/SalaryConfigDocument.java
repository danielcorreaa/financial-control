package com.financial_control.financial_control.infrastructure.persistence.salary;

import com.financial_control.financial_control.domain.salary.SalaryConfig;
import com.financial_control.financial_control.domain.salary.SalaryDiscount;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "salary_configs")
public class SalaryConfigDocument {

    @Id
    private String id;

    @Indexed(unique = true)
    private int year;

    private BigDecimal grossSalary;
    private boolean manualInss;
    private BigDecimal manualInssValue;
    private int dependents;
    private List<SalaryDiscountDocument> discounts = new ArrayList<>();
    private BigDecimal plr;
    private BigDecimal thirteenthSalary;
    private String notes;

    // Valores calculados (persistidos)
    private BigDecimal calculatedInss;
    private BigDecimal calculatedIrrf;
    private BigDecimal calculatedBaseIrrf;
    private BigDecimal calculatedNetSalary;
    private BigDecimal calculatedTotalDiscounts;
    private BigDecimal calculatedAnnualTotal;

    public static SalaryConfigDocument from(SalaryConfig domain) {
        List<SalaryDiscountDocument> discounts = domain.getDiscounts().stream()
                .map(SalaryDiscountDocument::from).toList();

        SalaryConfigDocument doc = new SalaryConfigDocument();
        doc.setId(domain.getId());
        doc.setYear(domain.getYear());
        doc.setGrossSalary(domain.getGrossSalary());
        doc.setManualInss(domain.isManualInss());
        doc.setManualInssValue(domain.getManualInssValue());
        doc.setDependents(domain.getDependents());
        doc.setDiscounts(new ArrayList<>(discounts));
        doc.setPlr(domain.getPlr());
        doc.setThirteenthSalary(domain.getThirteenthSalary());
        doc.setNotes(domain.getNotes());
        doc.setCalculatedInss(domain.getCalculatedInss());
        doc.setCalculatedIrrf(domain.getCalculatedIrrf());
        doc.setCalculatedBaseIrrf(domain.getCalculatedBaseIrrf());
        doc.setCalculatedNetSalary(domain.getCalculatedNetSalary());
        doc.setCalculatedTotalDiscounts(domain.getCalculatedTotalDiscounts());
        doc.setCalculatedAnnualTotal(domain.getCalculatedAnnualTotal());
        return doc;
    }

    public SalaryConfig toDomain() {
        List<SalaryDiscount> discounts = this.discounts.stream()
                .map(SalaryDiscountDocument::toDomain).toList();
        return new SalaryConfig(id, year, grossSalary, manualInss, manualInssValue,
                dependents, discounts, plr, thirteenthSalary, notes);
    }
}
