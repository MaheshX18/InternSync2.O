package com.internsync.controller;

import com.internsync.dto.response.ApiResponse;
import com.internsync.dto.response.RecommendationResponse;
import com.internsync.security.CustomUserDetails;
import com.internsync.service.RecommendationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/recommendations")
@Tag(name = "Recommendations", description = "Endpoints for AI-powered personalized internship matching and recommendations")
@SecurityRequirement(name = "bearerAuth")
public class RecommendationController {

    private final RecommendationService recommendationService;

    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @GetMapping
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get personalized internship recommendations for student")
    public ResponseEntity<ApiResponse<Page<RecommendationResponse>>> getRecommendations(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer minMatchScore,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<RecommendationResponse> recommendations = recommendationService.getRecommendationsForUser(
                userDetails.getId(),
                role,
                location,
                minMatchScore,
                pageable
        );
        return ResponseEntity.ok(ApiResponse.success("Internship recommendations calculated successfully", recommendations));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get personalized internship recommendations for current student (alias)")
    public ResponseEntity<ApiResponse<Page<RecommendationResponse>>> getMyRecommendations(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer minMatchScore,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return getRecommendations(userDetails, role, location, minMatchScore, page, size);
    }
}
