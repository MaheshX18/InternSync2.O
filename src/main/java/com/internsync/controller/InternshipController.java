package com.internsync.controller;

import com.internsync.dto.request.CreateInternshipRequest;
import com.internsync.dto.request.UpdateInternshipRequest;
import com.internsync.dto.request.UpdateInternshipStatusRequest;
import com.internsync.dto.response.ApiResponse;
import com.internsync.dto.response.InternshipResponse;
import com.internsync.dto.response.InternshipSummaryResponse;
import com.internsync.model.EmploymentType;
import com.internsync.model.WorkplaceType;
import com.internsync.security.CustomUserDetails;
import com.internsync.service.InternshipService;
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
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/internships")
@Tag(name = "Internships", description = "Endpoints for creating, managing, browsing, and bookmarking internship postings")
public class InternshipController {

    private final InternshipService internshipService;

    public InternshipController(InternshipService internshipService) {
        this.internshipService = internshipService;
    }

    // --- COMPANY ENDPOINTS ---

    @PostMapping
    @PreAuthorize("hasRole('COMPANY')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Create a new internship posting")
    public ResponseEntity<ApiResponse<InternshipResponse>> createInternship(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CreateInternshipRequest request
    ) {
        InternshipResponse response = internshipService.createInternship(userDetails.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Internship posting created successfully", response));
    }

    @GetMapping("/company/me")
    @PreAuthorize("hasRole('COMPANY')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Get postings belonging to the authenticated company")
    public ResponseEntity<ApiResponse<Page<InternshipResponse>>> getMyCompanyInternships(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir
    ) {
        Sort.Direction direction = sortDir.equalsIgnoreCase("ASC") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        Page<InternshipResponse> pageResult = internshipService.getCompanyInternships(userDetails.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success("Company internships retrieved successfully", pageResult));
    }

    @GetMapping("/company/me/{id}")
    @PreAuthorize("hasRole('COMPANY')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Get specific posting belonging to the authenticated company")
    public ResponseEntity<ApiResponse<InternshipResponse>> getMyCompanyInternshipById(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String id
    ) {
        InternshipResponse response = internshipService.getCompanyInternshipById(userDetails.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Internship posting retrieved successfully", response));
    }

    @PutMapping("/company/me/{id}")
    @PreAuthorize("hasRole('COMPANY')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Update specific posting belonging to the authenticated company")
    public ResponseEntity<ApiResponse<InternshipResponse>> updateMyCompanyInternship(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String id,
            @Valid @RequestBody UpdateInternshipRequest request
    ) {
        InternshipResponse response = internshipService.updateCompanyInternship(userDetails.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Internship posting updated successfully", response));
    }

    @PutMapping("/company/me/{id}/status")
    @PreAuthorize("hasRole('COMPANY')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Update status of specific posting belonging to the authenticated company")
    public ResponseEntity<ApiResponse<InternshipResponse>> updateMyCompanyInternshipStatus(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String id,
            @Valid @RequestBody UpdateInternshipStatusRequest request
    ) {
        InternshipResponse response = internshipService.updateCompanyInternshipStatus(userDetails.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Internship status updated successfully", response));
    }

    @DeleteMapping("/company/me/{id}")
    @PreAuthorize("hasRole('COMPANY')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Delete specific posting belonging to the authenticated company")
    public ResponseEntity<ApiResponse<Void>> deleteMyCompanyInternship(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String id
    ) {
        internshipService.deleteCompanyInternship(userDetails.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Internship posting deleted successfully", null));
    }

    // --- PUBLIC & STUDENT ENDPOINTS ---

    @GetMapping("/public")
    @Operation(summary = "Browse and search published internships")
    public ResponseEntity<ApiResponse<Page<InternshipSummaryResponse>>> getPublicInternships(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) WorkplaceType workplaceType,
            @RequestParam(required = false) EmploymentType employmentType,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Boolean isPaid,
            @RequestParam(required = false) Double minSalary,
            @RequestParam(required = false) Double maxSalary,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Sort.Direction direction = sortDir.equalsIgnoreCase("ASC") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        String studentId = userDetails != null ? userDetails.getId() : null;

        Page<InternshipSummaryResponse> pageResult = internshipService.getPublicInternships(
                search, workplaceType, employmentType, location, isPaid, minSalary, maxSalary, studentId, pageable
        );
        return ResponseEntity.ok(ApiResponse.success("Published internships retrieved successfully", pageResult));
    }

    @GetMapping("/public/{id}")
    @Operation(summary = "View details of a published internship")
    public ResponseEntity<ApiResponse<InternshipResponse>> getPublicInternshipById(
            @PathVariable String id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        String studentId = userDetails != null ? userDetails.getId() : null;
        InternshipResponse response = internshipService.getPublicInternshipById(id, studentId);
        return ResponseEntity.ok(ApiResponse.success("Internship details retrieved successfully", response));
    }

    @PostMapping("/bookmarks/{id}")
    @PreAuthorize("hasRole('STUDENT')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Toggle bookmark for an internship posting")
    public ResponseEntity<ApiResponse<Boolean>> toggleBookmark(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String id
    ) {
        boolean bookmarked = internshipService.toggleBookmark(userDetails.getId(), id);
        String msg = bookmarked ? "Internship saved to bookmarks" : "Internship removed from bookmarks";
        return ResponseEntity.ok(ApiResponse.success(msg, bookmarked));
    }

    @GetMapping("/bookmarks")
    @PreAuthorize("hasRole('STUDENT')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Get saved/bookmarked internships for student")
    public ResponseEntity<ApiResponse<Page<InternshipSummaryResponse>>> getBookmarks(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir
    ) {
        Sort.Direction direction = sortDir.equalsIgnoreCase("ASC") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Page<InternshipSummaryResponse> pageResult = internshipService.getStudentBookmarks(userDetails.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success("Bookmarked internships retrieved successfully", pageResult));
    }
}
