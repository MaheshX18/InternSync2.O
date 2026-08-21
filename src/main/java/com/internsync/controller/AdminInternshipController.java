package com.internsync.controller;

import com.internsync.dto.request.UpdateInternshipStatusRequest;
import com.internsync.dto.response.ApiResponse;
import com.internsync.dto.response.InternshipResponse;
import com.internsync.model.InternshipStatus;
import com.internsync.service.InternshipService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/internships")
@Tag(name = "Admin Internship Management", description = "Endpoints for administrators to moderate and manage all internship postings")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class AdminInternshipController {

    private final InternshipService internshipService;

    public AdminInternshipController(InternshipService internshipService) {
        this.internshipService = internshipService;
    }

    @GetMapping
    @Operation(summary = "Get all internships with filtering and pagination for admin moderation")
    public ResponseEntity<ApiResponse<Page<InternshipResponse>>> getAdminInternships(
            @RequestParam(required = false) String companyId,
            @RequestParam(required = false) InternshipStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir
    ) {
        Sort.Direction direction = sortDir.equalsIgnoreCase("ASC") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Page<InternshipResponse> pageResult = internshipService.getAdminInternships(companyId, status, search, pageable);
        return ResponseEntity.ok(ApiResponse.success("Admin internships retrieved successfully", pageResult));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Moderate/update internship status as admin")
    public ResponseEntity<ApiResponse<InternshipResponse>> updateAdminInternshipStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdateInternshipStatusRequest request
    ) {
        InternshipResponse response = internshipService.updateAdminInternshipStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success("Internship status moderated successfully", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remove/delete internship as admin")
    public ResponseEntity<ApiResponse<Void>> deleteAdminInternship(@PathVariable String id) {
        internshipService.deleteAdminInternship(id);
        return ResponseEntity.ok(ApiResponse.success("Internship posting deleted by admin", null));
    }
}
