package com.internsync.dto.request;

import com.internsync.model.Role;
import com.internsync.model.UserStatus;

public class AdminUpdateUserRequest extends UpdateProfileRequest {

    private Role role;
    private UserStatus status;

    public AdminUpdateUserRequest() {
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public UserStatus getStatus() {
        return status;
    }

    public void setStatus(UserStatus status) {
        this.status = status;
    }
}
