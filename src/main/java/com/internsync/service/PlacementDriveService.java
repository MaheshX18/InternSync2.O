package com.internsync.service;

import com.internsync.dto.request.CreatePlacementDriveRequest;
import com.internsync.dto.response.DriveEligibilityResult;
import com.internsync.exception.ResourceNotFoundException;
import com.internsync.model.*;
import com.internsync.repository.*;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;

@Service
public class PlacementDriveService {

    private final PlacementDriveRepository placementDriveRepository;
    private final UserRepository userRepository;
    private final ApplicationRepository applicationRepository;
    private final CareerReadinessService careerReadinessService;

    public PlacementDriveService(PlacementDriveRepository placementDriveRepository,
                                 UserRepository userRepository,
                                 ApplicationRepository applicationRepository,
                                 CareerReadinessService careerReadinessService) {
        this.placementDriveRepository = placementDriveRepository;
        this.userRepository = userRepository;
        this.applicationRepository = applicationRepository;
        this.careerReadinessService = careerReadinessService;
    }

    public PlacementDrive createDrive(CreatePlacementDriveRequest request, String createdBy) {
        PlacementDrive drive = new PlacementDrive();
        drive.setCompanyName(request.getCompanyName());
        drive.setCompanyLogoUrl(request.getCompanyLogoUrl());
        drive.setRole(request.getRole());
        drive.setPackageOffered(request.getPackageOffered() != null ? request.getPackageOffered() : "10 LPA");
        drive.setMinCgpa(request.getMinCgpa() != null ? request.getMinCgpa() : 6.0);
        drive.setAllowedDepartments(request.getAllowedDepartments() != null ? request.getAllowedDepartments() : new ArrayList<>());
        drive.setRequiredSkills(request.getRequiredSkills() != null ? request.getRequiredSkills() : new ArrayList<>());
        drive.setBatch(request.getBatch() != null ? request.getBatch() : "2026");
        drive.setLocation(request.getLocation() != null ? request.getLocation() : "Remote / Hybrid");
        drive.setDeadline(request.getDeadline() != null ? request.getDeadline() : "2026-09-30");
        drive.setStatus(request.getStatus() != null ? request.getStatus() : "OPEN");
        drive.setCreatedBy(createdBy);
        drive.setCreatedAt(Instant.now());

        return placementDriveRepository.save(drive);
    }

    public List<PlacementDrive> getAllDrives() {
        return placementDriveRepository.findAll();
    }

    public PlacementDrive getDriveById(String id) {
        return placementDriveRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PlacementDrive", "id", id));
    }

    public PlacementDrive updateDrive(String id, CreatePlacementDriveRequest request) {
        PlacementDrive drive = getDriveById(id);
        drive.setCompanyName(request.getCompanyName());
        drive.setCompanyLogoUrl(request.getCompanyLogoUrl());
        drive.setRole(request.getRole());
        if (request.getPackageOffered() != null) drive.setPackageOffered(request.getPackageOffered());
        if (request.getMinCgpa() != null) drive.setMinCgpa(request.getMinCgpa());
        if (request.getAllowedDepartments() != null) drive.setAllowedDepartments(request.getAllowedDepartments());
        if (request.getRequiredSkills() != null) drive.setRequiredSkills(request.getRequiredSkills());
        if (request.getBatch() != null) drive.setBatch(request.getBatch());
        if (request.getLocation() != null) drive.setLocation(request.getLocation());
        if (request.getDeadline() != null) drive.setDeadline(request.getDeadline());
        if (request.getStatus() != null) drive.setStatus(request.getStatus());

        return placementDriveRepository.save(drive);
    }

    public PlacementDrive closeDrive(String id) {
        PlacementDrive drive = getDriveById(id);
        drive.setStatus("CLOSED");
        return placementDriveRepository.save(drive);
    }

    public List<DriveEligibilityResult> getEligibleStudentsForDrive(String driveId) {
        PlacementDrive drive = getDriveById(driveId);
        List<User> students = userRepository.findByRole(Role.STUDENT);
        List<DriveEligibilityResult> results = new ArrayList<>();

        List<String> reqSkills = drive.getRequiredSkills() != null ? drive.getRequiredSkills() : new ArrayList<>();
        List<String> allowedDepts = drive.getAllowedDepartments() != null ? drive.getAllowedDepartments() : new ArrayList<>();
        Double minGpa = drive.getMinCgpa() != null ? drive.getMinCgpa() : 0.0;

        for (User student : students) {
            DriveEligibilityResult result = new DriveEligibilityResult();
            result.setStudentId(student.getId());
            result.setStudentName((student.getFirstName() != null ? student.getFirstName() : "") + " " + (student.getLastName() != null ? student.getLastName() : ""));
            result.setEmail(student.getEmail());
            result.setDepartment(student.getDepartment() != null ? student.getDepartment() : "General CS");
            result.setGpa(student.getGpa() != null ? student.getGpa() : 7.0);

            var readiness = careerReadinessService.calculateReadinessForUser(student.getId(), drive.getRole());
            result.setReadinessScore(readiness.getScore());

            List<String> studentSkills = student.getSkills() != null ? student.getSkills() : new ArrayList<>();
            List<String> matched = new ArrayList<>();
            List<String> missing = new ArrayList<>();
            List<String> reasons = new ArrayList<>();

            boolean gpaEligible = result.getGpa() >= minGpa;
            if (!gpaEligible) {
                reasons.add("GPA (" + result.getGpa() + ") below minimum required (" + minGpa + ").");
            } else {
                reasons.add("GPA criteria met (" + result.getGpa() + " >= " + minGpa + ").");
            }

            boolean deptEligible = allowedDepts.isEmpty() || allowedDepts.stream().anyMatch(d -> d.equalsIgnoreCase(result.getDepartment()));
            if (!deptEligible) {
                reasons.add("Department (" + result.getDepartment() + ") not in allowed departments list.");
            } else {
                reasons.add("Department eligible (" + result.getDepartment() + ").");
            }

            for (String reqSkill : reqSkills) {
                boolean has = studentSkills.stream().anyMatch(s -> s.equalsIgnoreCase(reqSkill) || s.toLowerCase().contains(reqSkill.toLowerCase()) || reqSkill.toLowerCase().contains(s.toLowerCase()));
                if (has) matched.add(reqSkill);
                else missing.add(reqSkill);
            }

            int matchPct = reqSkills.isEmpty() ? 100 : (int) Math.round(((double) matched.size() / reqSkills.size()) * 100);
            result.setMatchedSkills(matched);
            result.setMissingSkills(missing);
            result.setMatchPercentage(matchPct);

            boolean skillEligible = reqSkills.isEmpty() || matchPct >= 50;
            if (!skillEligible) {
                reasons.add("Skill match (" + matchPct + "%) below 50% threshold.");
            } else {
                reasons.add("Skill match (" + matchPct + "%) meets requirement.");
            }

            boolean isOverallEligible = gpaEligible && deptEligible && skillEligible;
            result.setEligible(isOverallEligible);
            result.setEligibilityReasons(reasons);

            results.add(result);
        }

        results.sort((a, b) -> {
            if (a.isEligible() != b.isEligible()) return Boolean.compare(b.isEligible(), a.isEligible());
            return Integer.compare(b.getMatchPercentage(), a.getMatchPercentage());
        });

        return results;
    }

    public Application updateApplicationConversionOutcome(String applicationId, ConversionOutcome outcome) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", applicationId));

        app.setConversionOutcome(outcome);
        app.setUpdatedAt(java.time.LocalDateTime.now());
        return applicationRepository.save(app);
    }
}
