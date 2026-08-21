package com.internsync.controller;

import com.internsync.dto.response.ApiResponse;
import com.internsync.dto.response.CareerReadinessResponse;
import com.internsync.service.CareerReadinessService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
public class CareerReadinessController {

    private final CareerReadinessService careerReadinessService;

    public CareerReadinessController(CareerReadinessService careerReadinessService) {
        this.careerReadinessService = careerReadinessService;
    }

    @GetMapping("/career/readiness")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<CareerReadinessResponse>> getCareerReadiness(
            @RequestParam(required = false) String targetRole,
            Authentication authentication
    ) {
        String userIdentifier = authentication.getName();
        CareerReadinessResponse readiness;
        if (userIdentifier.contains("@")) {
            readiness = careerReadinessService.calculateReadinessByEmail(userIdentifier, targetRole);
        } else {
            readiness = careerReadinessService.calculateReadinessForUser(userIdentifier, targetRole);
        }
        return ResponseEntity.ok(ApiResponse.success("Career readiness analysis retrieved successfully", readiness));
    }

    @GetMapping("/readiness")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<CareerReadinessResponse>> getReadinessAlias(
            @RequestParam(required = false) String targetRole,
            Authentication authentication
    ) {
        return getCareerReadiness(targetRole, authentication);
    }
}
