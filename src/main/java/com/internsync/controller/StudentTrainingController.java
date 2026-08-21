package com.internsync.controller;

import com.internsync.dto.response.ApiResponse;
import com.internsync.model.TrainingAssignment;
import com.internsync.security.CustomUserDetails;
import com.internsync.service.TrainingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/student/trainings")
@PreAuthorize("hasRole('STUDENT')")
public class StudentTrainingController {

    private final TrainingService trainingService;

    public StudentTrainingController(TrainingService trainingService) {
        this.trainingService = trainingService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TrainingAssignment>>> getMyTrainings(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        String studentId = userDetails.getId();
        List<TrainingAssignment> assignments = trainingService.getStudentAssignments(studentId);
        return ResponseEntity.ok(ApiResponse.success("Assigned trainings retrieved successfully", assignments));
    }

    @PostMapping("/{assignmentId}/complete")
    public ResponseEntity<ApiResponse<TrainingAssignment>> completeTraining(
            @PathVariable String assignmentId,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        String studentId = userDetails.getId();
        String feedback = body != null ? body.get("feedback") : "Training completed successfully";
        TrainingAssignment completed = trainingService.completeTraining(assignmentId, studentId, feedback);
        return ResponseEntity.ok(ApiResponse.success("Training marked as completed and skills updated on student profile", completed));
    }
}
