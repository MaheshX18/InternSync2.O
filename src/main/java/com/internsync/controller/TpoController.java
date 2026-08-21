package com.internsync.controller;

import com.internsync.dto.request.*;
import com.internsync.dto.response.*;
import com.internsync.model.*;
import com.internsync.security.CustomUserDetails;
import com.internsync.service.PlacementDriveService;
import com.internsync.service.TpoService;
import com.internsync.service.TrainingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tpo")
@PreAuthorize("hasRole('ADMIN') or hasRole('TPO')")
public class TpoController {

    private final TpoService tpoService;
    private final TrainingService trainingService;
    private final PlacementDriveService placementDriveService;

    public TpoController(TpoService tpoService,
                         TrainingService trainingService,
                         PlacementDriveService placementDriveService) {
        this.tpoService = tpoService;
        this.trainingService = trainingService;
        this.placementDriveService = placementDriveService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<TPODashboardOverview>> getDashboard() {
        TPODashboardOverview overview = tpoService.getDashboardOverview();
        return ResponseEntity.ok(ApiResponse.success("TPO Dashboard statistics retrieved successfully", overview));
    }

    @GetMapping("/students")
    public ResponseEntity<ApiResponse<List<TPOStudentSummary>>> getStudents() {
        List<TPOStudentSummary> students = tpoService.getStudentsList();
        return ResponseEntity.ok(ApiResponse.success("Student placement readiness list retrieved successfully", students));
    }

    @GetMapping("/students/{id}")
    public ResponseEntity<ApiResponse<TPOStudentDetail>> getStudentDetail(@PathVariable String id) {
        TPOStudentDetail detail = tpoService.getStudentDetail(id);
        return ResponseEntity.ok(ApiResponse.success("Student detail retrieved successfully", detail));
    }

    @GetMapping("/interventions")
    public ResponseEntity<ApiResponse<List<Intervention>>> getInterventions() {
        List<Intervention> interventions = tpoService.getInterventions();
        return ResponseEntity.ok(ApiResponse.success("Skill gap interventions retrieved successfully", interventions));
    }

    @PostMapping("/interventions/{id}/resolve")
    public ResponseEntity<ApiResponse<Intervention>> resolveIntervention(
            @PathVariable String id,
            @RequestBody ResolveInterventionRequest request) {
        Intervention intervention = tpoService.resolveIntervention(id, request);
        return ResponseEntity.ok(ApiResponse.success("Intervention updated successfully", intervention));
    }

    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<List<DepartmentAnalytics>>> getDepartmentAnalytics() {
        List<DepartmentAnalytics> analytics = tpoService.getDepartmentAnalytics();
        return ResponseEntity.ok(ApiResponse.success("Department analytics retrieved successfully", analytics));
    }

    @GetMapping("/departments")
    public ResponseEntity<ApiResponse<List<DepartmentAnalytics>>> getDepartments() {
        List<DepartmentAnalytics> analytics = tpoService.getDepartmentAnalytics();
        return ResponseEntity.ok(ApiResponse.success("Department list retrieved successfully", analytics));
    }

    @GetMapping("/training")
    public ResponseEntity<ApiResponse<List<Training>>> getTrainings() {
        List<Training> trainings = trainingService.getAllTrainings();
        return ResponseEntity.ok(ApiResponse.success("Trainings retrieved successfully", trainings));
    }

    @PostMapping("/training")
    public ResponseEntity<ApiResponse<Training>> createTraining(
            @Valid @RequestBody CreateTrainingRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        String createdBy = userDetails != null ? userDetails.getUsername() : "TPO Admin";
        Training training = trainingService.createTraining(request, createdBy);
        return ResponseEntity.ok(ApiResponse.success("Training created successfully", training));
    }

    @PutMapping("/training/{id}")
    public ResponseEntity<ApiResponse<Training>> updateTraining(
            @PathVariable String id,
            @Valid @RequestBody CreateTrainingRequest request) {
        Training training = trainingService.updateTraining(id, request);
        return ResponseEntity.ok(ApiResponse.success("Training updated successfully", training));
    }

    @PatchMapping("/training/{id}/status")
    public ResponseEntity<ApiResponse<Training>> updateTrainingStatus(
            @PathVariable String id,
            @RequestParam String status) {
        Training training = trainingService.updateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Training status updated successfully", training));
    }

    @PostMapping("/training/{id}/assign")
    public ResponseEntity<ApiResponse<List<TrainingAssignment>>> assignTraining(
            @PathVariable String id,
            @RequestBody AssignTrainingRequest request) {
        List<TrainingAssignment> assignments = trainingService.assignTraining(id, request);
        return ResponseEntity.ok(ApiResponse.success("Students assigned to training successfully", assignments));
    }

    @GetMapping("/placement-drives")
    public ResponseEntity<ApiResponse<List<PlacementDrive>>> getPlacementDrives() {
        List<PlacementDrive> drives = placementDriveService.getAllDrives();
        return ResponseEntity.ok(ApiResponse.success("Placement drives retrieved successfully", drives));
    }

    @PostMapping("/placement-drives")
    public ResponseEntity<ApiResponse<PlacementDrive>> createPlacementDrive(
            @Valid @RequestBody CreatePlacementDriveRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        String createdBy = userDetails != null ? userDetails.getUsername() : "TPO Admin";
        PlacementDrive drive = placementDriveService.createDrive(request, createdBy);
        return ResponseEntity.ok(ApiResponse.success("Placement drive created successfully", drive));
    }

    @GetMapping("/placement-drives/{id}/eligible-students")
    public ResponseEntity<ApiResponse<List<DriveEligibilityResult>>> getEligibleStudents(@PathVariable String id) {
        List<DriveEligibilityResult> results = placementDriveService.getEligibleStudentsForDrive(id);
        return ResponseEntity.ok(ApiResponse.success("Drive eligible students analyzed successfully", results));
    }

    @PostMapping("/applications/{id}/conversion")
    public ResponseEntity<ApiResponse<Application>> updateConversionOutcome(
            @PathVariable String id,
            @RequestBody UpdateConversionOutcomeRequest request) {
        Application updatedApp = placementDriveService.updateApplicationConversionOutcome(id, request.getConversionOutcome());
        return ResponseEntity.ok(ApiResponse.success("Application conversion outcome updated successfully", updatedApp));
    }
}
