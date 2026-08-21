package com.internsync.controller;

import com.internsync.dto.response.ApiResponse;
import com.internsync.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/test")
@Tag(name = "Role Testing API", description = "Role-based authorization verification endpoints")
public class TestController {

    @GetMapping("/public")
    @Operation(summary = "Public endpoint accessible to anyone")
    public ResponseEntity<ApiResponse<Map<String, String>>> publicEndpoint() {
        return ResponseEntity.ok(ApiResponse.success(
                "Public content accessed successfully",
                Map.of("access", "PUBLIC", "message", "No authentication required")
        ));
    }

    @GetMapping("/student")
    @PreAuthorize("hasRole('STUDENT')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Student endpoint restricted to ROLE_STUDENT")
    public ResponseEntity<ApiResponse<Map<String, Object>>> studentEndpoint(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                "Student content accessed successfully",
                Map.of(
                        "access", "ROLE_STUDENT",
                        "user", userDetails.getUsername(),
                        "role", userDetails.getUser().getRole(),
                        "message", "Welcome Student!"
                )
        ));
    }

    @GetMapping("/company")
    @PreAuthorize("hasRole('COMPANY')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Company endpoint restricted to ROLE_COMPANY")
    public ResponseEntity<ApiResponse<Map<String, Object>>> companyEndpoint(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                "Company content accessed successfully",
                Map.of(
                        "access", "ROLE_COMPANY",
                        "user", userDetails.getUsername(),
                        "role", userDetails.getUser().getRole(),
                        "message", "Welcome Company Partner!"
                )
        ));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Admin endpoint restricted to ROLE_ADMIN")
    public ResponseEntity<ApiResponse<Map<String, Object>>> adminEndpoint(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                "Admin content accessed successfully",
                Map.of(
                        "access", "ROLE_ADMIN",
                        "user", userDetails.getUsername(),
                        "role", userDetails.getUser().getRole(),
                        "message", "Welcome Platform Administrator!"
                )
        ));
    }
}
