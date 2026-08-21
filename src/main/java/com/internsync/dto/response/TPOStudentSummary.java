package com.internsync.dto.response;

import java.util.ArrayList;
import java.util.List;

public class TPOStudentSummary {

    private String id;
    private String email;
    private String firstName;
    private String lastName;
    private String department;
    private String rollNumber;
    private String batch;
    private Double gpa;
    private Integer readinessScore;
    private String readinessLevel; // "Highly Ready", "Career Ready", "Developing", "Needs Improvement"
    private String placementStatus; // "NOT_PLACED", "INTERNSHIP_ACCEPTED", "PLACED_JOB", "STARTUP_FOUNDED"
    private long applicationsCount;
    private long interviewsCount;
    private long offersCount;
    private long assignedTrainingsCount;
    private long completedTrainingsCount;
    private boolean needsIntervention;
    private List<String> missingSkills = new ArrayList<>();

    public TPOStudentSummary() {}

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getRollNumber() {
        return rollNumber;
    }

    public void setRollNumber(String rollNumber) {
        this.rollNumber = rollNumber;
    }

    public String getBatch() {
        return batch;
    }

    public void setBatch(String batch) {
        this.batch = batch;
    }

    public Double getGpa() {
        return gpa;
    }

    public void setGpa(Double gpa) {
        this.gpa = gpa;
    }

    public Integer getReadinessScore() {
        return readinessScore;
    }

    public void setReadinessScore(Integer readinessScore) {
        this.readinessScore = readinessScore;
    }

    public String getReadinessLevel() {
        return readinessLevel;
    }

    public void setReadinessLevel(String readinessLevel) {
        this.readinessLevel = readinessLevel;
    }

    public String getPlacementStatus() {
        return placementStatus;
    }

    public void setPlacementStatus(String placementStatus) {
        this.placementStatus = placementStatus;
    }

    public long getApplicationsCount() {
        return applicationsCount;
    }

    public void setApplicationsCount(long applicationsCount) {
        this.applicationsCount = applicationsCount;
    }

    public long getInterviewsCount() {
        return interviewsCount;
    }

    public void setInterviewsCount(long interviewsCount) {
        this.interviewsCount = interviewsCount;
    }

    public long getOffersCount() {
        return offersCount;
    }

    public void setOffersCount(long offersCount) {
        this.offersCount = offersCount;
    }

    public long getAssignedTrainingsCount() {
        return assignedTrainingsCount;
    }

    public void setAssignedTrainingsCount(long assignedTrainingsCount) {
        this.assignedTrainingsCount = assignedTrainingsCount;
    }

    public long getCompletedTrainingsCount() {
        return completedTrainingsCount;
    }

    public void setCompletedTrainingsCount(long completedTrainingsCount) {
        this.completedTrainingsCount = completedTrainingsCount;
    }

    public boolean isNeedsIntervention() {
        return needsIntervention;
    }

    public void setNeedsIntervention(boolean needsIntervention) {
        this.needsIntervention = needsIntervention;
    }

    public List<String> getMissingSkills() {
        return missingSkills;
    }

    public void setMissingSkills(List<String> missingSkills) {
        this.missingSkills = missingSkills;
    }
}
