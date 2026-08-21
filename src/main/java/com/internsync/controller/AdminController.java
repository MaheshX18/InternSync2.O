package com.internsync.controller;

import com.internsync.dto.request.AdminUpdateUserRequest;
import com.internsync.dto.request.UpdateUserStatusRequest;
import com.internsync.dto.response.ApiResponse;
import com.internsync.dto.response.PagedResponse;
import com.internsync.dto.response.UserProfileResponse;
import com.internsync.model.Role;
import com.internsync.model.UserStatus;
import com.internsync.security.CustomUserDetails;
import com.internsync.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/users")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin User Management API", description = "Endpoints for administrators to list, view, update, and manage users")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping
    @Operation(summary = "Get paginated user list with filters")
    public ResponseEntity<ApiResponse<PagedResponse<UserProfileResponse>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) UserStatus status,
            @RequestParam(required = false) String search) {

        PagedResponse<UserProfileResponse> users = adminService.getAllUsers(page, size, role, status, search);
        return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", users));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user details by ID")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getUserById(@PathVariable String id) {
        UserProfileResponse user = adminService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success("User profile retrieved", user));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update user account status (ACTIVE, INACTIVE, SUSPENDED)")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateUserStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdateUserStatusRequest request) {

        UserProfileResponse updatedUser = adminService.updateUserStatus(id, request.getStatus());
        return ResponseEntity.ok(ApiResponse.success("User status updated successfully", updatedUser));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update complete user profile and role/status by admin")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateUser(
            @PathVariable String id,
            @RequestBody AdminUpdateUserRequest request) {

        UserProfileResponse updatedUser = adminService.updateUserByAdmin(id, request);
        return ResponseEntity.ok(ApiResponse.success("User updated successfully", updatedUser));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete user account")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @PathVariable String id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        adminService.deleteUser(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
    }
}
