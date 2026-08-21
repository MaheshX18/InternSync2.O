package com.internsync.controller;

import com.internsync.dto.CreateApplicationRequest;
import com.internsync.dto.UpdateApplicationStatusRequest;
import com.internsync.dto.response.ApiResponse;
import com.internsync.model.Application;
import com.internsync.model.ApplicationStatus;
import com.internsync.security.CustomUserDetails;
import com.internsync.service.ApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@Tag(name = "Applications", description = "Endpoints for student and company application management")
@SecurityRequirement(name = "bearerAuth")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    // STUDENT: Apply to Internship
    @PostMapping("/api/v1/internships/{internshipId}/applications")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Submit application for an internship")
    public ResponseEntity<ApiResponse<Application>> applyToInternship(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String internshipId,
            @Valid @RequestBody CreateApplicationRequest request
    ) {
        Application app = applicationService.applyToInternship(userDetails.getId(), internshipId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Application submitted successfully", app));
    }

    // STUDENT: View My Applications
    @GetMapping({"/api/v1/applications/me", "/api/v1/applications/student/me"})
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get student applications")
    public ResponseEntity<ApiResponse<Page<Application>>> getStudentApplications(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false) ApplicationStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "appliedAt"));
        Page<Application> result = applicationService.getStudentApplications(userDetails.getId(), status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Student applications retrieved successfully", result));
    }

    // STUDENT: View My Application Details
    @GetMapping("/api/v1/applications/me/{id}")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get student application details by ID")
    public ResponseEntity<ApiResponse<Application>> getStudentApplicationById(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String id
    ) {
        Application app = applicationService.getStudentApplicationById(userDetails.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Application details retrieved successfully", app));
    }

    // STUDENT: Withdraw Application
    @PutMapping("/api/v1/applications/me/{id}/withdraw")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Withdraw an application")
    public ResponseEntity<ApiResponse<Application>> withdrawApplication(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String id
    ) {
        Application app = applicationService.withdrawApplication(userDetails.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Application withdrawn successfully", app));
    }

    // COMPANY: View Applicants
    @GetMapping("/api/v1/company/applications")
    @PreAuthorize("hasRole('COMPANY')")
    @Operation(summary = "Get company applicants")
    public ResponseEntity<ApiResponse<Page<Application>>> getCompanyApplications(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false) String internshipId,
            @RequestParam(required = false) ApplicationStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "appliedAt"));
        Page<Application> result = applicationService.getCompanyApplications(userDetails.getId(), internshipId, status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Company applicants retrieved successfully", result));
    }

    // COMPANY: View Applicant Details
    @GetMapping("/api/v1/company/applications/{id}")
    @PreAuthorize("hasRole('COMPANY')")
    @Operation(summary = "Get applicant details by ID")
    public ResponseEntity<ApiResponse<Application>> getCompanyApplicationById(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String id
    ) {
        Application app = applicationService.getCompanyApplicationById(userDetails.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Application details retrieved successfully", app));
    }

    // COMPANY: Update Application Status
    @PutMapping("/api/v1/company/applications/{id}/status")
    @PreAuthorize("hasRole('COMPANY')")
    @Operation(summary = "Update application status")
    public ResponseEntity<ApiResponse<Application>> updateApplicationStatus(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String id,
            @Valid @RequestBody UpdateApplicationStatusRequest request
    ) {
        Application app = applicationService.updateApplicationStatus(userDetails.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Application status updated successfully", app));
    }

    // ADMIN: View Applications
    @GetMapping("/api/v1/admin/applications")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all applications for admin")
    public ResponseEntity<ApiResponse<Page<Application>>> getAdminApplications(
            @RequestParam(required = false) ApplicationStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "appliedAt"));
        Page<Application> result = applicationService.getAdminApplications(status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Admin applications retrieved successfully", result));
    }

    // ADMIN: View Application Details
    @GetMapping("/api/v1/admin/applications/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get application details by ID for admin")
    public ResponseEntity<ApiResponse<Application>> getAdminApplicationById(
            @PathVariable String id
    ) {
        Application app = applicationService.getAdminApplicationById(id);
        return ResponseEntity.ok(ApiResponse.success("Application details retrieved successfully", app));
    }
}
