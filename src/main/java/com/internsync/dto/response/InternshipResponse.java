package com.internsync.dto.response;

import com.internsync.model.EmploymentType;
import com.internsync.model.ExperienceLevel;
import com.internsync.model.Internship;
import com.internsync.model.InternshipStatus;
import com.internsync.model.WorkplaceType;

import java.time.Instant;
import java.util.List;

public class InternshipResponse {

    private String id;
    private String companyId;
    private String companyName;
    private String companyLogoUrl;
    private String title;
    private String description;
    private List<String> requirements;
    private List<String> responsibilities;
    private List<String> requiredSkills;
    private String location;
    private WorkplaceType workplaceType;
    private EmploymentType employmentType;
    private ExperienceLevel experienceLevel;
    private Double stipendOrSalaryMin;
    private Double stipendOrSalaryMax;
    private String currency;
    private Boolean isPaid;
    private Integer positionsAvailable;
    private Integer applicantCount;
    private InternshipStatus status;
    private Instant applicationDeadline;
    private Instant createdAt;
    private Instant updatedAt;
    private Instant publishedAt;
    private Boolean isBookmarked = false;

    public InternshipResponse() {
    }

    public static InternshipResponse fromEntity(Internship internship) {
        return fromEntity(internship, false);
    }

    public static InternshipResponse fromEntity(Internship internship, boolean isBookmarked) {
        if (internship == null) return null;
        InternshipResponse resp = new InternshipResponse();
        resp.setId(internship.getId());
        resp.setCompanyId(internship.getCompanyId());
        resp.setCompanyName(internship.getCompanyName());
        resp.setCompanyLogoUrl(internship.getCompanyLogoUrl());
        resp.setTitle(internship.getTitle());
        resp.setDescription(internship.getDescription());
        resp.setRequirements(internship.getRequirements());
        resp.setResponsibilities(internship.getResponsibilities());
        resp.setRequiredSkills(internship.getRequiredSkills());
        resp.setLocation(internship.getLocation());
        resp.setWorkplaceType(internship.getWorkplaceType());
        resp.setEmploymentType(internship.getEmploymentType());
        resp.setExperienceLevel(internship.getExperienceLevel());
        resp.setStipendOrSalaryMin(internship.getStipendOrSalaryMin());
        resp.setStipendOrSalaryMax(internship.getStipendOrSalaryMax());
        resp.setCurrency(internship.getCurrency());
        resp.setIsPaid(internship.getIsPaid());
        resp.setPositionsAvailable(internship.getPositionsAvailable());
        resp.setApplicantCount(internship.getApplicantCount());
        resp.setStatus(internship.getStatus());
        resp.setApplicationDeadline(internship.getApplicationDeadline());
        resp.setCreatedAt(internship.getCreatedAt());
        resp.setUpdatedAt(internship.getUpdatedAt());
        resp.setPublishedAt(internship.getPublishedAt());
        resp.setIsBookmarked(isBookmarked);
        return resp;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCompanyId() {
        return companyId;
    }

    public void setCompanyId(String companyId) {
        this.companyId = companyId;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getCompanyLogoUrl() {
        return companyLogoUrl;
    }

    public void setCompanyLogoUrl(String companyLogoUrl) {
        this.companyLogoUrl = companyLogoUrl;
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

    public Integer getApplicantCount() {
        return applicantCount;
    }

    public void setApplicantCount(Integer applicantCount) {
        this.applicantCount = applicantCount;
    }

    public InternshipStatus getStatus() {
        return status;
    }

    public void setStatus(InternshipStatus status) {
        this.status = status;
    }

    public Instant getApplicationDeadline() {
        return applicationDeadline;
    }

    public void setApplicationDeadline(Instant applicationDeadline) {
        this.applicationDeadline = applicationDeadline;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Instant getPublishedAt() {
        return publishedAt;
    }

    public void setPublishedAt(Instant publishedAt) {
        this.publishedAt = publishedAt;
    }

    public Boolean getIsBookmarked() {
        return isBookmarked;
    }

    public void setIsBookmarked(Boolean isBookmarked) {
        this.isBookmarked = isBookmarked;
    }
}
