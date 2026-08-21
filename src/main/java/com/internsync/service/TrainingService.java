package com.internsync.service;

import com.internsync.dto.request.AssignTrainingRequest;
import com.internsync.dto.request.CreateTrainingRequest;
import com.internsync.exception.ResourceNotFoundException;
import com.internsync.model.*;
import com.internsync.repository.*;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;

@Service
public class TrainingService {

    private final TrainingRepository trainingRepository;
    private final TrainingAssignmentRepository trainingAssignmentRepository;
    private final UserRepository userRepository;
    private final InterventionRepository interventionRepository;
    private final CareerReadinessService careerReadinessService;
    private final SkillGapService skillGapService;

    public TrainingService(TrainingRepository trainingRepository,
                           TrainingAssignmentRepository trainingAssignmentRepository,
                           UserRepository userRepository,
                           InterventionRepository interventionRepository,
                           CareerReadinessService careerReadinessService,
                           SkillGapService skillGapService) {
        this.trainingRepository = trainingRepository;
        this.trainingAssignmentRepository = trainingAssignmentRepository;
        this.userRepository = userRepository;
        this.interventionRepository = interventionRepository;
        this.careerReadinessService = careerReadinessService;
        this.skillGapService = skillGapService;
    }

    public Training createTraining(CreateTrainingRequest request, String createdBy) {
        Training training = new Training();
        training.setTitle(request.getTitle());
        training.setDescription(request.getDescription());
        training.setDuration(request.getDuration() != null ? request.getDuration() : "4 Weeks");
        training.setSkills(request.getSkills() != null ? request.getSkills() : new ArrayList<>());
        training.setCapacity(request.getCapacity() != null ? request.getCapacity() : 50);
        training.setStartDate(request.getStartDate());
        training.setEndDate(request.getEndDate());
        training.setStatus(request.getStatus() != null ? request.getStatus() : "ACTIVE");
        training.setCreatedBy(createdBy);
        training.setCreatedAt(Instant.now());
        training.setUpdatedAt(Instant.now());

        return trainingRepository.save(training);
    }

    public List<Training> getAllTrainings() {
        return trainingRepository.findAll();
    }

    public Training getTrainingById(String id) {
        return trainingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Training", "id", id));
    }

    public Training updateTraining(String id, CreateTrainingRequest request) {
        Training training = getTrainingById(id);
        training.setTitle(request.getTitle());
        training.setDescription(request.getDescription());
        if (request.getDuration() != null) training.setDuration(request.getDuration());
        if (request.getSkills() != null) training.setSkills(request.getSkills());
        if (request.getCapacity() != null) training.setCapacity(request.getCapacity());
        if (request.getStartDate() != null) training.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) training.setEndDate(request.getEndDate());
        if (request.getStatus() != null) training.setStatus(request.getStatus());
        training.setUpdatedAt(Instant.now());

        return trainingRepository.save(training);
    }

    public Training updateStatus(String id, String status) {
        Training training = getTrainingById(id);
        training.setStatus(status);
        training.setUpdatedAt(Instant.now());
        return trainingRepository.save(training);
    }

    public List<TrainingAssignment> assignTraining(String trainingId, AssignTrainingRequest request) {
        Training training = getTrainingById(trainingId);
        Set<String> targetStudentIds = new HashSet<>();

        if (request.getStudentIds() != null && !request.getStudentIds().isEmpty()) {
            targetStudentIds.addAll(request.getStudentIds());
        }

        if (Boolean.TRUE.equals(request.getAssignAllNeedingAttention())) {
            List<User> students = userRepository.findByRole(Role.STUDENT);
            for (User student : students) {
                var readiness = careerReadinessService.calculateReadinessForUser(student.getId(), null);
                if (readiness.getScore() < 70 || "Needs Improvement".equalsIgnoreCase(readiness.getLevel()) || "Developing".equalsIgnoreCase(readiness.getLevel())) {
                    targetStudentIds.add(student.getId());
                }
            }
        }

        List<TrainingAssignment> createdAssignments = new ArrayList<>();

        for (String studentId : targetStudentIds) {
            if (trainingAssignmentRepository.existsByTrainingIdAndStudentId(trainingId, studentId)) {
                continue;
            }

            User student = userRepository.findById(studentId).orElse(null);
            if (student == null) continue;

            TrainingAssignment assignment = new TrainingAssignment();
            assignment.setTrainingId(training.getId());
            assignment.setTrainingTitle(training.getTitle());
            assignment.setStudentId(student.getId());
            assignment.setStudentName((student.getFirstName() != null ? student.getFirstName() : "") + " " + (student.getLastName() != null ? student.getLastName() : ""));
            assignment.setStudentEmail(student.getEmail());
            assignment.setDepartment(student.getDepartment() != null ? student.getDepartment() : "General CS");
            assignment.setStatus("IN_PROGRESS");
            assignment.setProgress(10);
            assignment.setAssignedAt(Instant.now());

            createdAssignments.add(trainingAssignmentRepository.save(assignment));

            // Update student interventions to IN_PROGRESS if pending
            List<Intervention> interventions = interventionRepository.findByStudentId(studentId);
            for (Intervention intervention : interventions) {
                if ("PENDING".equalsIgnoreCase(intervention.getStatus())) {
                    intervention.setStatus("IN_PROGRESS");
                    intervention.setNotes("Assigned to training: " + training.getTitle());
                    intervention.setUpdatedAt(Instant.now());
                    interventionRepository.save(intervention);
                }
            }
        }

        return createdAssignments;
    }

    public List<TrainingAssignment> getStudentAssignments(String studentId) {
        return trainingAssignmentRepository.findByStudentId(studentId);
    }

    public List<TrainingAssignment> getTrainingAssignments(String trainingId) {
        return trainingAssignmentRepository.findByTrainingId(trainingId);
    }

    public TrainingAssignment completeTraining(String assignmentId, String studentId, String feedback) {
        TrainingAssignment assignment = trainingAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("TrainingAssignment", "id", assignmentId));

        if (!assignment.getStudentId().equals(studentId)) {
            throw new IllegalArgumentException("Unauthorized to complete assignment for another student.");
        }

        assignment.setStatus("COMPLETED");
        assignment.setProgress(100);
        assignment.setCompletedAt(Instant.now());
        if (feedback != null) assignment.setFeedback(feedback);

        TrainingAssignment savedAssignment = trainingAssignmentRepository.save(assignment);

        // Auto-sync training target skills to student profile
        Training training = trainingRepository.findById(assignment.getTrainingId()).orElse(null);
        User student = userRepository.findById(studentId).orElse(null);

        if (training != null && student != null && training.getSkills() != null) {
            List<String> currentSkills = student.getSkills() != null ? new ArrayList<>(student.getSkills()) : new ArrayList<>();
            boolean modified = false;

            for (String targetSkill : training.getSkills()) {
                boolean exists = currentSkills.stream().anyMatch(s -> s.equalsIgnoreCase(targetSkill));
                if (!exists) {
                    currentSkills.add(targetSkill);
                    modified = true;
                }
            }

            if (modified) {
                student.setSkills(currentSkills);
                userRepository.save(student);

                // Recalculate roadmap
                LearningRoadmap roadmap = skillGapService.getOrCreateRoadmap(studentId, student.getPreferredRole());
                skillGapService.generateOrUpdateRoadmap(student, roadmap);
            }
        }

        // Mark student interventions as RESOLVED
        List<Intervention> interventions = interventionRepository.findByStudentId(studentId);
        for (Intervention intervention : interventions) {
            if (!"RESOLVED".equalsIgnoreCase(intervention.getStatus())) {
                intervention.setStatus("RESOLVED");
                intervention.setNotes("Completed training intervention: " + (training != null ? training.getTitle() : "Training"));
                intervention.setUpdatedAt(Instant.now());
                interventionRepository.save(intervention);
            }
        }

        return savedAssignment;
    }
}
