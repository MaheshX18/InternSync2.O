package com.internsync.dto.request;

import com.internsync.model.InternshipStatus;
import jakarta.validation.constraints.NotNull;

public class UpdateInternshipStatusRequest {

    @NotNull(message = "Status is required")
    private InternshipStatus status;

    public UpdateInternshipStatusRequest() {
    }

    public UpdateInternshipStatusRequest(InternshipStatus status) {
        this.status = status;
    }

    public InternshipStatus getStatus() {
        return status;
    }

    public void setStatus(InternshipStatus status) {
        this.status = status;
    }
}
