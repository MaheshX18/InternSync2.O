package com.internsync.controller;

import com.internsync.dto.response.ApiResponse;
import com.internsync.dto.response.ResumeAnalysisResponse;
import com.internsync.security.CustomUserDetails;
import com.internsync.service.ResumeAnalyzerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/resume")
@Tag(name = "Resume Analyzer API", description = "Endpoints for student resume analysis, extraction, and skill gap scoring")
@SecurityRequirement(name = "bearerAuth")
public class ResumeController {

    private final ResumeAnalyzerService resumeAnalyzerService;

    public ResumeController(ResumeAnalyzerService resumeAnalyzerService) {
        this.resumeAnalyzerService = resumeAnalyzerService;
    }

    @PostMapping("/upload")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Upload and analyze student resume file or content")
    public ResponseEntity<ApiResponse<ResumeAnalysisResponse>> uploadResume(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestBody(required = false) Map<String, Object> bodyPayload) {

        String fileName = "resume.pdf";
        String fileType = "application/pdf";
        long fileSize = 2048L;
        String contentText = "";

        if (file != null && !file.isEmpty()) {
            fileName = file.getOriginalFilename();
            fileType = file.getContentType();
            fileSize = file.getSize();
            try {
                contentText = new String(file.getBytes());
            } catch (Exception e) {
                contentText = "Extracted resume content from uploaded file " + fileName;
            }
        } else if (bodyPayload != null) {
            if (bodyPayload.containsKey("fileName")) fileName = bodyPayload.get("fileName").toString();
            if (bodyPayload.containsKey("fileType")) fileType = bodyPayload.get("fileType").toString();
            if (bodyPayload.containsKey("contentText")) contentText = bodyPayload.get("contentText").toString();
            if (bodyPayload.containsKey("resumeText")) contentText = bodyPayload.get("resumeText").toString();
        }

        ResumeAnalysisResponse response = resumeAnalyzerService.analyzeAndSaveResume(
                userDetails.getUsername(), fileName, fileType, fileSize, contentText
        );

        return ResponseEntity.ok(ApiResponse.success("Resume analyzed and profile skills updated successfully", response));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get current authenticated student's resume analysis")
    public ResponseEntity<ApiResponse<ResumeAnalysisResponse>> getMyResume(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        ResumeAnalysisResponse response = resumeAnalyzerService.getResumeAnalysis(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Resume analysis retrieved successfully", response));
    }

    @GetMapping("/me/analysis")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Alias to get detailed resume analysis breakdown")
    public ResponseEntity<ApiResponse<ResumeAnalysisResponse>> getMyResumeAnalysis(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        ResumeAnalysisResponse response = resumeAnalyzerService.getResumeAnalysis(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Resume analysis breakdown retrieved successfully", response));
    }

    @DeleteMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Delete current authenticated student's resume analysis")
    public ResponseEntity<ApiResponse<Void>> deleteMyResume(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        resumeAnalyzerService.deleteResumeAnalysis(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Resume analysis deleted successfully", null));
    }
}
