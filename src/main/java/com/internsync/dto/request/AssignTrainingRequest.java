package com.internsync.dto.request;

import java.util.ArrayList;
import java.util.List;

public class AssignTrainingRequest {

    private List<String> studentIds = new ArrayList<>();
    private Boolean assignAllNeedingAttention = false;

    public AssignTrainingRequest() {}

    public List<String> getStudentIds() {
        return studentIds;
    }

    public void setStudentIds(List<String> studentIds) {
        this.studentIds = studentIds;
    }

    public Boolean getAssignAllNeedingAttention() {
        return assignAllNeedingAttention;
    }

    public void setAssignAllNeedingAttention(Boolean assignAllNeedingAttention) {
        this.assignAllNeedingAttention = assignAllNeedingAttention;
    }
}
