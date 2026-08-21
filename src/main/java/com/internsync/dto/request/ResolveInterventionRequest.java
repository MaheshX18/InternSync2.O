package com.internsync.dto.request;

public class ResolveInterventionRequest {

    private String notes;
    private String status = "RESOLVED";
    private String trainingIdToAssign;

    public ResolveInterventionRequest() {}

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getTrainingIdToAssign() {
        return trainingIdToAssign;
    }

    public void setTrainingIdToAssign(String trainingIdToAssign) {
        this.trainingIdToAssign = trainingIdToAssign;
    }
}
