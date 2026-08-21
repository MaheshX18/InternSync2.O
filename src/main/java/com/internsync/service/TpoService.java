package com.internsync.service;

import com.internsync.dto.request.ResolveInterventionRequest;
import com.internsync.dto.response.*;
import com.internsync.exception.ResourceNotFoundException;
import com.internsync.model.*;
import com.internsync.repository.*;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TpoService {

    private final UserRepository userRepository;
    private final ApplicationRepository applicationRepository;
    private final TrainingRepository trainingRepository;
    private final TrainingAssignmentRepository trainingAssignmentRepository;
    private final PlacementDriveRepository placementDriveRepository;
    private final InterventionRepository interventionRepository;
    private final CareerReadinessService careerReadinessService;
    private final SkillGapService skillGapService;

    public TpoService(UserRepository userRepository,
                      ApplicationRepository applicationRepository,
                      TrainingRepository trainingRepository,
                      TrainingAssignmentRepository trainingAssignmentRepository,
                      PlacementDriveRepository placementDriveRepository,
                      InterventionRepository interventionRepository,
                      CareerReadinessService careerReadinessService,
                      SkillGapService skillGapService) {
        this.userRepository = userRepository;
        this.applicationRepository = applicationRepository;
        this.trainingRepository = trainingRepository;
        this.trainingAssignmentRepository = trainingAssignmentRepository;
        this.placementDriveRepository = placementDriveRepository;
        this.interventionRepository = interventionRepository;
        this.careerReadinessService = careerReadinessService;
        this.skillGapService = skillGapService;
    }

    public TPODashboardOverview getDashboardOverview() {
        List<User> students = userRepository.findByRole(Role.STUDENT);
        List<Application> allApplications = applicationRepository.findAll();
        List<TrainingAssignment> allAssignments = trainingAssignmentRepository.findAll();
        List<Training> allTrainings = trainingRepository.findAll();
        List<PlacementDrive> allDrives = placementDriveRepository.findAll();

        long totalStudents = students.size();

        Set<String> participantStudentIds = allApplications.stream()
                .map(Application::getStudentId)
                .collect(Collectors.toSet());
        long internshipParticipants = participantStudentIds.size();

        long acceptedCount = allApplications.stream()
                .filter(a -> a.getStatus() == ApplicationStatus.ACCEPTED)
                .count();

        long convertedToJobs = allApplications.stream()
                .filter(a -> a.getConversionOutcome() == ConversionOutcome.CONVERTED_JOB)
                .count();

        long convertedToStartups = allApplications.stream()
                .filter(a -> a.getConversionOutcome() == ConversionOutcome.CONVERTED_STARTUP)
                .count();

        double jobRate = acceptedCount > 0 ? (double) convertedToJobs / acceptedCount * 100.0 : 0.0;
        double startupRate = acceptedCount > 0 ? (double) convertedToStartups / acceptedCount * 100.0 : 0.0;

        long readyCount = 0;
        long lowReadinessCount = 0;
        long atRiskCount = 0;

        Map<String, Long> skillGapFrequencies = new HashMap<>();

        for (User student : students) {
            var readiness = careerReadinessService.calculateReadinessForUser(student.getId(), null);
            int score = readiness.getScore();
            if (score >= 75) readyCount++;
            if (score < 60) lowReadinessCount++;
            if (score < 50 || (student.getGpa() != null && student.getGpa() < 6.0)) atRiskCount++;

            // Track missing skills for aggregate skill gaps
            List<String> roleSkills = skillGapService.getRoleSkills(student.getPreferredRole());
            List<String> userSkills = student.getSkills() != null ? student.getSkills() : new ArrayList<>();
            for (String req : roleSkills) {
                boolean has = userSkills.stream().anyMatch(s -> s.equalsIgnoreCase(req) || s.toLowerCase().contains(req.toLowerCase()));
                if (!has) {
                    skillGapFrequencies.put(req, skillGapFrequencies.getOrDefault(req, 0L) + 1);
                }
            }
        }

        List<TPODashboardOverview.SkillGapCount> topGaps = skillGapFrequencies.entrySet().stream()
                .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                .limit(6)
                .map(e -> new TPODashboardOverview.SkillGapCount(e.getKey(), e.getValue()))
                .collect(Collectors.toList());

        long completedTrainings = allAssignments.stream()
                .filter(a -> "COMPLETED".equalsIgnoreCase(a.getStatus()))
                .count();

        long activeTrainings = allTrainings.stream()
                .filter(t -> "ACTIVE".equalsIgnoreCase(t.getStatus()))
                .count();

        long activeDrives = allDrives.stream()
                .filter(d -> "OPEN".equalsIgnoreCase(d.getStatus()))
                .count();

        TPODashboardOverview overview = new TPODashboardOverview();
        overview.setTotalStudents(totalStudents);
        overview.setInternshipParticipants(internshipParticipants);
        overview.setInternshipCompletionCount(acceptedCount);
        overview.setPlacementReadyCount(readyCount);
        overview.setStudentsNeedingIntervention(lowReadinessCount);
        overview.setAtRiskCount(atRiskCount);
        overview.setConvertedToJobsCount(convertedToJobs);
        overview.setConvertedToStartupsCount(convertedToStartups);
        overview.setConversionToJobRate(Math.round(jobRate * 10.0) / 10.0);
        overview.setConversionToStartupRate(Math.round(startupRate * 10.0) / 10.0);
        overview.setTrainingCompletionCount(completedTrainings);
        overview.setActiveTrainingsCount(activeTrainings);
        overview.setActiveDrivesCount(activeDrives);
        overview.setTopSkillGaps(topGaps);

        return overview;
    }

    public List<TPOStudentSummary> getStudentsList() {
        List<User> students = userRepository.findByRole(Role.STUDENT);
        List<TPOStudentSummary> summaries = new ArrayList<>();

        for (User student : students) {
            summaries.add(buildStudentSummary(student));
        }

        summaries.sort((a, b) -> Integer.compare(b.getReadinessScore(), a.getReadinessScore()));
        return summaries;
    }

    public TPOStudentDetail getStudentDetail(String studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", studentId));

        TPOStudentSummary summary = buildStudentSummary(student);
        var readinessBreakdown = careerReadinessService.calculateReadinessForUser(studentId, null);
        List<Application> applications = applicationRepository.findByStudentId(studentId);
        List<TrainingAssignment> assignedTrainings = trainingAssignmentRepository.findByStudentId(studentId);
        List<Intervention> interventions = interventionRepository.findByStudentId(studentId);

        TPOStudentDetail detail = new TPOStudentDetail();
        detail.setSummary(summary);
        detail.setReadinessBreakdown(readinessBreakdown);
        detail.setApplications(applications);
        detail.setAssignedTrainings(assignedTrainings);
        detail.setInterventions(interventions);

        return detail;
    }

    public List<Intervention> getInterventions() {
        // Generate or sync interventions for at-risk/low-readiness students
        List<User> students = userRepository.findByRole(Role.STUDENT);
        for (User student : students) {
            var readiness = careerReadinessService.calculateReadinessForUser(student.getId(), null);
            if (readiness.getScore() < 60 || "Needs Improvement".equalsIgnoreCase(readiness.getLevel())) {
                List<Intervention> existing = interventionRepository.findByStudentId(student.getId());
                if (existing.isEmpty()) {
                    Intervention intervention = new Intervention();
                    intervention.setStudentId(student.getId());
                    intervention.setStudentName((student.getFirstName() != null ? student.getFirstName() : "") + " " + (student.getLastName() != null ? student.getLastName() : ""));
                    intervention.setStudentEmail(student.getEmail());
                    intervention.setDepartment(student.getDepartment() != null ? student.getDepartment() : "General CS");
                    intervention.setGpa(student.getGpa() != null ? student.getGpa() : 7.0);
                    intervention.setReadinessScore(readiness.getScore());
                    intervention.setReadinessLevel(readiness.getLevel());
                    intervention.setReasons(readiness.getWeaknesses());
                    
                    List<String> actions = new ArrayList<>();
                    actions.add("Assign targeted Skill Training module");
                    actions.add("Schedule 1-on-1 resume optimization & interview coaching");
                    intervention.setRecommendedActions(actions);
                    intervention.setStatus("PENDING");
                    intervention.setCreatedAt(Instant.now());
                    intervention.setUpdatedAt(Instant.now());

                    interventionRepository.save(intervention);
                }
            }
        }

        return interventionRepository.findAll();
    }

    public Intervention resolveIntervention(String interventionId, ResolveInterventionRequest request) {
        Intervention intervention = interventionRepository.findById(interventionId)
                .orElseThrow(() -> new ResourceNotFoundException("Intervention", "id", interventionId));

        if (request.getStatus() != null) {
            intervention.setStatus(request.getStatus());
        } else {
            intervention.setStatus("RESOLVED");
        }

        if (request.getNotes() != null) {
            intervention.setNotes(request.getNotes());
        }
        intervention.setUpdatedAt(Instant.now());

        return interventionRepository.save(intervention);
    }

    public List<DepartmentAnalytics> getDepartmentAnalytics() {
        List<User> students = userRepository.findByRole(Role.STUDENT);
        Map<String, List<User>> deptMap = students.stream()
                .collect(Collectors.groupingBy(s -> s.getDepartment() != null && !s.getDepartment().trim().isEmpty() ? s.getDepartment() : "Computer Science"));

        List<DepartmentAnalytics> analyticsList = new ArrayList<>();

        for (Map.Entry<String, List<User>> entry : deptMap.entrySet()) {
            String dept = entry.getKey();
            List<User> deptStudents = entry.getValue();

            long count = deptStudents.size();
            double avgGpa = deptStudents.stream().mapToDouble(s -> s.getGpa() != null ? s.getGpa() : 7.5).average().orElse(7.5);

            double sumReadiness = 0;
            long placed = 0;
            long atRisk = 0;

            for (User student : deptStudents) {
                var readiness = careerReadinessService.calculateReadinessForUser(student.getId(), null);
                sumReadiness += readiness.getScore();

                if (readiness.getScore() < 50 || (student.getGpa() != null && student.getGpa() < 6.0)) {
                    atRisk++;
                }

                List<Application> apps = applicationRepository.findByStudentId(student.getId());
                boolean hasJobOrAccepted = apps.stream().anyMatch(a -> a.getStatus() == ApplicationStatus.ACCEPTED || a.getConversionOutcome() == ConversionOutcome.CONVERTED_JOB || a.getConversionOutcome() == ConversionOutcome.CONVERTED_STARTUP);
                if (hasJobOrAccepted) {
                    placed++;
                }
            }

            double avgReadiness = count > 0 ? sumReadiness / count : 0.0;
            double placementRate = count > 0 ? ((double) placed / count) * 100.0 : 0.0;

            DepartmentAnalytics analytics = new DepartmentAnalytics(
                    dept,
                    count,
                    Math.round(avgGpa * 100.0) / 100.0,
                    Math.round(avgReadiness * 10.0) / 10.0,
                    placed,
                    Math.round(placementRate * 10.0) / 10.0,
                    atRisk
            );

            analyticsList.add(analytics);
        }

        analyticsList.sort((a, b) -> Double.compare(b.getAverageReadiness(), a.getAverageReadiness()));
        return analyticsList;
    }

    private TPOStudentSummary buildStudentSummary(User student) {
        var readiness = careerReadinessService.calculateReadinessForUser(student.getId(), null);
        List<Application> apps = applicationRepository.findByStudentId(student.getId());
        List<TrainingAssignment> assignments = trainingAssignmentRepository.findByStudentId(student.getId());

        TPOStudentSummary summary = new TPOStudentSummary();
        summary.setId(student.getId());
        summary.setEmail(student.getEmail());
        summary.setFirstName(student.getFirstName());
        summary.setLastName(student.getLastName());
        summary.setDepartment(student.getDepartment() != null ? student.getDepartment() : "Computer Science");
        summary.setRollNumber(student.getRollNumber() != null ? student.getRollNumber() : "CS2026-" + student.getId().substring(0, 4).toUpperCase());
        summary.setBatch(student.getBatch() != null ? student.getBatch() : "2026");
        summary.setGpa(student.getGpa() != null ? student.getGpa() : 7.5);
        summary.setReadinessScore(readiness.getScore());
        summary.setReadinessLevel(readiness.getLevel());

        long interviewCount = apps.stream().filter(a -> a.getStatus() == ApplicationStatus.INTERVIEWED).count();
        long offerCount = apps.stream().filter(a -> a.getStatus() == ApplicationStatus.ACCEPTED).count();

        boolean hasJobConversion = apps.stream().anyMatch(a -> a.getConversionOutcome() == ConversionOutcome.CONVERTED_JOB);
        boolean hasStartupConversion = apps.stream().anyMatch(a -> a.getConversionOutcome() == ConversionOutcome.CONVERTED_STARTUP);

        String placementStatus = "NOT_PLACED";
        if (hasJobConversion) placementStatus = "PLACED_JOB";
        else if (hasStartupConversion) placementStatus = "STARTUP_FOUNDED";
        else if (offerCount > 0) placementStatus = "INTERNSHIP_ACCEPTED";

        summary.setPlacementStatus(placementStatus);
        summary.setApplicationsCount(apps.size());
        summary.setInterviewsCount(interviewCount);
        summary.setOffersCount(offerCount);

        summary.setAssignedTrainingsCount(assignments.size());
        long completedTrainings = assignments.stream().filter(a -> "COMPLETED".equalsIgnoreCase(a.getStatus())).count();
        summary.setCompletedTrainingsCount(completedTrainings);

        summary.setNeedsIntervention(readiness.getScore() < 60 || "Needs Improvement".equalsIgnoreCase(readiness.getLevel()));

        List<String> roleSkills = skillGapService.getRoleSkills(student.getPreferredRole());
        List<String> userSkills = student.getSkills() != null ? student.getSkills() : new ArrayList<>();
        List<String> missing = new ArrayList<>();
        for (String req : roleSkills) {
            boolean has = userSkills.stream().anyMatch(s -> s.equalsIgnoreCase(req) || s.toLowerCase().contains(req.toLowerCase()));
            if (!has) missing.add(req);
        }
        summary.setMissingSkills(missing);

        return summary;
    }
}
