package com.internsync.dto.response;

import com.internsync.model.Application;
import com.internsync.model.Intervention;
import com.internsync.model.TrainingAssignment;

import java.util.ArrayList;
import java.util.List;

public class TPOStudentDetail {

    private TPOStudentSummary summary;
    private CareerReadinessResponse readinessBreakdown;
    private List<Application> applications = new ArrayList<>();
    private List<TrainingAssignment> assignedTrainings = new ArrayList<>();
    private List<Intervention> interventions = new ArrayList<>();

    public TPOStudentDetail() {}

    public TPOStudentSummary getSummary() {
        return summary;
    }

    public void setSummary(TPOStudentSummary summary) {
        this.summary = summary;
    }

    public CareerReadinessResponse getReadinessBreakdown() {
        return readinessBreakdown;
    }

    public void setReadinessBreakdown(CareerReadinessResponse readinessBreakdown) {
        this.readinessBreakdown = readinessBreakdown;
    }

    public List<Application> getApplications() {
        return applications;
    }

    public void setApplications(List<Application> applications) {
        this.applications = applications;
    }

    public List<TrainingAssignment> getAssignedTrainings() {
        return assignedTrainings;
    }

    public void setAssignedTrainings(List<TrainingAssignment> assignedTrainings) {
        this.assignedTrainings = assignedTrainings;
    }

    public List<Intervention> getInterventions() {
        return interventions;
    }

    public void setInterventions(List<Intervention> interventions) {
        this.interventions = interventions;
    }
}
