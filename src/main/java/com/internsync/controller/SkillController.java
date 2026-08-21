package com.internsync.controller;

import com.internsync.dto.response.ApiResponse;
import com.internsync.model.LearningRoadmap;
import com.internsync.service.SkillGapService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/skills")
public class SkillController {

    private final SkillGapService skillGapService;

    public SkillController(SkillGapService skillGapService) {
        this.skillGapService = skillGapService;
    }

    @GetMapping("/roles")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAvailableRoles() {
        List<Map<String, Object>> roles = skillGapService.getAvailableRoles();
        return ResponseEntity.ok(ApiResponse.success("Roles fetched successfully", roles));
    }

    @GetMapping("/gaps")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSkillGaps(
            @RequestParam(required = false) String targetRole,
            Authentication authentication
    ) {
        String userId = authentication.getName();
        Map<String, Object> gapAnalysis = skillGapService.getSkillGapAnalysis(userId, targetRole);
        return ResponseEntity.ok(ApiResponse.success("Skill gap analysis fetched successfully", gapAnalysis));
    }

    @GetMapping("/roadmap")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<LearningRoadmap>> getRoadmap(
            @RequestParam(required = false) String targetRole,
            Authentication authentication
    ) {
        String userId = authentication.getName();
        LearningRoadmap roadmap = skillGapService.getOrCreateRoadmap(userId, targetRole);
        return ResponseEntity.ok(ApiResponse.success("Learning roadmap fetched successfully", roadmap));
    }

    @PostMapping("/roadmap/{itemId}/start")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<LearningRoadmap>> startRoadmapItem(
            @PathVariable String itemId,
            Authentication authentication
    ) {
        String userId = authentication.getName();
        LearningRoadmap roadmap = skillGapService.updateItemStatus(userId, itemId, "IN_PROGRESS", 50);
        return ResponseEntity.ok(ApiResponse.success("Started roadmap module", roadmap));
    }

    @PostMapping("/roadmap/{itemId}/complete")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<LearningRoadmap>> completeRoadmapItem(
            @PathVariable String itemId,
            Authentication authentication
    ) {
        String userId = authentication.getName();
        LearningRoadmap roadmap = skillGapService.updateItemStatus(userId, itemId, "COMPLETED", 100);
        return ResponseEntity.ok(ApiResponse.success("Completed roadmap module", roadmap));
    }

    @PostMapping("/roadmap/{itemId}/status")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<LearningRoadmap>> updateRoadmapItemStatus(
            @PathVariable String itemId,
            @RequestBody Map<String, Object> body,
            Authentication authentication
    ) {
        String userId = authentication.getName();
        String status = (String) body.get("status");
        Integer progress = body.get("progress") != null ? ((Number) body.get("progress")).intValue() : 50;
        LearningRoadmap roadmap = skillGapService.updateItemStatus(userId, itemId, status, progress);
        return ResponseEntity.ok(ApiResponse.success("Updated roadmap item status", roadmap));
    }

    @PutMapping("/level")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<LearningRoadmap>> updateSkillLevel(
            @RequestBody Map<String, String> body,
            Authentication authentication
    ) {
        String userId = authentication.getName();
        String skill = body.get("skill");
        String level = body.get("level");
        LearningRoadmap roadmap = skillGapService.updateSkillLevel(userId, skill, level);
        return ResponseEntity.ok(ApiResponse.success("Updated skill level", roadmap));
    }

    @PutMapping("/target-role")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<LearningRoadmap>> updateTargetRole(
            @RequestBody Map<String, String> body,
            Authentication authentication
    ) {
        String userId = authentication.getName();
        String targetRole = body.get("targetRole");
        LearningRoadmap roadmap = skillGapService.getOrCreateRoadmap(userId, targetRole);
        return ResponseEntity.ok(ApiResponse.success("Updated target role", roadmap));
    }
}
