package com.internsync.dto.request;

import com.internsync.model.EmploymentType;
import com.internsync.model.ExperienceLevel;
import com.internsync.model.WorkplaceType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class CreateInternshipRequest {

    @NotBlank(message = "Title is required")
    @Size(min = 5, max = 100, message = "Title must be between 5 and 100 characters")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(min = 20, max = 5000, message = "Description must be between 20 and 5000 characters")
    private String description;

    @NotNull(message = "Requirements list cannot be null")
    @Size(min = 1, message = "At least one requirement is required")
    private List<String> requirements = new ArrayList<>();

    private List<String> responsibilities = new ArrayList<>();

    @NotNull(message = "Required skills list cannot be null")
    @Size(min = 1, message = "At least one required skill is required")
    private List<String> requiredSkills = new ArrayList<>();

    @NotBlank(message = "Location is required")
    private String location;

    @NotNull(message = "Workplace type is required")
    private WorkplaceType workplaceType;

    @NotNull(message = "Employment type is required")
    private EmploymentType employmentType;

    private ExperienceLevel experienceLevel = ExperienceLevel.ENTRY_LEVEL;

    @Min(value = 0, message = "Minimum stipend or salary must be non-negative")
    private Double stipendOrSalaryMin;

    private Double stipendOrSalaryMax;

    private String currency = "USD";

    @NotNull(message = "isPaid field is required")
    private Boolean isPaid = true;

    private Integer positionsAvailable = 1;

    private Instant applicationDeadline;

    private Boolean publishImmediately = false;

    public CreateInternshipRequest() {
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<String> getRequirements() {
        return requirements;
    }

    public void setRequirements(List<String> requirements) {
        this.requirements = requirements;
    }

    public List<String> getResponsibilities() {
        return responsibilities;
    }

    public void setResponsibilities(List<String> responsibilities) {
        this.responsibilities = responsibilities;
    }

    public List<String> getRequiredSkills() {
        return requiredSkills;
    }

    public void setRequiredSkills(List<String> requiredSkills) {
        this.requiredSkills = requiredSkills;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public WorkplaceType getWorkplaceType() {
        return workplaceType;
    }

    public void setWorkplaceType(WorkplaceType workplaceType) {
        this.workplaceType = workplaceType;
    }

    public EmploymentType getEmploymentType() {
        return employmentType;
    }

    public void setEmploymentType(EmploymentType employmentType) {
        this.employmentType = employmentType;
    }

    public ExperienceLevel getExperienceLevel() {
        return experienceLevel;
    }

    public void setExperienceLevel(ExperienceLevel experienceLevel) {
        this.experienceLevel = experienceLevel;
    }

    public Double getStipendOrSalaryMin() {
        return stipendOrSalaryMin;
    }

    public void setStipendOrSalaryMin(Double stipendOrSalaryMin) {
        this.stipendOrSalaryMin = stipendOrSalaryMin;
    }

    public Double getStipendOrSalaryMax() {
        return stipendOrSalaryMax;
    }

    public void setStipendOrSalaryMax(Double stipendOrSalaryMax) {
        this.stipendOrSalaryMax = stipendOrSalaryMax;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public Boolean getIsPaid() {
        return isPaid;
    }

    public void setIsPaid(Boolean isPaid) {
        this.isPaid = isPaid;
    }

    public Integer getPositionsAvailable() {
        return positionsAvailable;
    }

    public void setPositionsAvailable(Integer positionsAvailable) {
        this.positionsAvailable = positionsAvailable;
    }

    public Instant getApplicationDeadline() {
        return applicationDeadline;
    }

    public void setApplicationDeadline(Instant applicationDeadline) {
        this.applicationDeadline = applicationDeadline;
    }

    public Boolean getPublishImmediately() {
        return publishImmediately;
    }

    public void setPublishImmediately(Boolean publishImmediately) {
        this.publishImmediately = publishImmediately;
    }
}
