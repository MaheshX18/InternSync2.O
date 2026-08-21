package com.internsync.controller;

import com.internsync.dto.response.AdminDashboardResponse;
import com.internsync.dto.response.ApiResponse;
import com.internsync.dto.response.CompanyDashboardResponse;
import com.internsync.dto.response.StudentDashboardResponse;
import com.internsync.security.CustomUserDetails;
import com.internsync.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboards")
@Tag(name = "Dashboard API", description = "Role-based user dashboard statistics and metrics")
@SecurityRequirement(name = "bearerAuth")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/student")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get student dashboard statistics")
    public ResponseEntity<ApiResponse<StudentDashboardResponse>> getStudentDashboard(@AuthenticationPrincipal CustomUserDetails userDetails) {
        StudentDashboardResponse dashboard = dashboardService.getStudentDashboard(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Student dashboard data retrieved", dashboard));
    }

    @GetMapping("/company")
    @PreAuthorize("hasRole('COMPANY')")
    @Operation(summary = "Get company dashboard statistics")
    public ResponseEntity<ApiResponse<CompanyDashboardResponse>> getCompanyDashboard(@AuthenticationPrincipal CustomUserDetails userDetails) {
        CompanyDashboardResponse dashboard = dashboardService.getCompanyDashboard(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Company dashboard data retrieved", dashboard));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get admin system dashboard statistics")
    public ResponseEntity<ApiResponse<AdminDashboardResponse>> getAdminDashboard() {
        AdminDashboardResponse dashboard = dashboardService.getAdminDashboard();
        return ResponseEntity.ok(ApiResponse.success("Admin system metrics retrieved", dashboard));
    }
}
