package com.internsync.service;

import com.internsync.dto.CreateApplicationRequest;
import com.internsync.dto.UpdateApplicationStatusRequest;
import com.internsync.model.Application;
import com.internsync.model.ApplicationStatus;
import com.internsync.model.Internship;
import com.internsync.model.InternshipStatus;
import com.internsync.model.User;
import com.internsync.repository.ApplicationRepository;
import com.internsync.repository.InternshipRepository;
import com.internsync.repository.UserRepository;
import com.internsync.exception.ApplicationNotFoundException;
import com.internsync.exception.DuplicateApplicationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final InternshipRepository internshipRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public ApplicationService(
            ApplicationRepository applicationRepository,
            InternshipRepository internshipRepository,
            UserRepository userRepository,
            NotificationService notificationService
    ) {
        this.applicationRepository = applicationRepository;
        this.internshipRepository = internshipRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public Application applyToInternship(String studentId, String internshipId, CreateApplicationRequest request) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Internship internship = internshipRepository.findById(internshipId)
                .orElseThrow(() -> new RuntimeException("Internship posting not found"));

        if (internship.getStatus() != InternshipStatus.PUBLISHED) {
            throw new IllegalArgumentException("Internship is not accepting applications: status is " + internship.getStatus());
        }

        if (internship.getApplicationDeadline() != null && internship.getApplicationDeadline().isBefore(Instant.now())) {
            throw new IllegalArgumentException("Application deadline has passed");
        }

        if (internship.getPositionsAvailable() != null && internship.getPositionsAvailable() <= 0) {
            throw new IllegalArgumentException("No positions available for this internship");
        }

        if (applicationRepository.findByInternshipIdAndStudentId(internshipId, studentId).isPresent()) {
            throw new DuplicateApplicationException("Student has already applied to this internship");
        }

        Application app = new Application();
        app.setInternshipId(internshipId);
        app.setStudentId(studentId);
        app.setStudentName((student.getFirstName() + " " + student.getLastName()).trim());
        app.setStudentEmail(student.getEmail());
        app.setInternshipTitle(internship.getTitle());
        app.setCompanyId(internship.getCompanyId());
        app.setCompanyName(internship.getCompanyName());
        app.setCoverLetter(request.getCoverLetter());
        app.setResumeUrl(request.getResumeUrl());
        app.setSkills(request.getSkills());
        app.setPhoneNumber(request.getPhoneNumber());
        app.setUniversity(request.getUniversity());
        app.setGraduationYear(request.getGraduationYear());
        app.setStatus(ApplicationStatus.SUBMITTED);
        app.setAppliedAt(LocalDateTime.now());
        app.setUpdatedAt(LocalDateTime.now());

        Application savedApp = applicationRepository.save(app);

        // Update applicant count
        internship.setApplicantCount(internship.getApplicantCount() + 1);
        internshipRepository.save(internship);

        // Trigger notifications
        notificationService.createNotification(
                studentId,
                "APPLICATION_SUBMITTED",
                "Application Submitted",
                "Your application for \"" + internship.getTitle() + "\" at " + internship.getCompanyName() + " was submitted successfully.",
                savedApp.getId(),
                "APPLICATION"
        );

        notificationService.createNotification(
                internship.getCompanyId(),
                "NEW_APPLICATION",
                "New Application Received",
                student.getFirstName() + " " + student.getLastName() + " applied for \"" + internship.getTitle() + "\".",
                savedApp.getId(),
                "APPLICATION"
        );

        return savedApp;
    }

    public Page<Application> getStudentApplications(String studentId, ApplicationStatus status, Pageable pageable) {
        if (status != null) {
            return applicationRepository.findByStudentIdAndStatus(studentId, status, pageable);
        }
        return applicationRepository.findByStudentId(studentId, pageable);
    }

    public Application getStudentApplicationById(String studentId, String applicationId) {
        return applicationRepository.findByIdAndStudentId(applicationId, studentId)
                .orElseThrow(() -> new ApplicationNotFoundException("Application not found"));
    }

    public Application withdrawApplication(String studentId, String applicationId) {
        Application app = getStudentApplicationById(studentId, applicationId);
        if (app.getStatus() != ApplicationStatus.SUBMITTED) {
            throw new IllegalStateException("Cannot withdraw application in status " + app.getStatus());
        }

        app.setStatus(ApplicationStatus.WITHDRAWN);
        app.setUpdatedAt(LocalDateTime.now());
        Application updated = applicationRepository.save(app);

        notificationService.createNotification(
                app.getCompanyId(),
                "APPLICATION_WITHDRAWN",
                "Application Withdrawn",
                app.getStudentName() + " withdrew their application for \"" + app.getInternshipTitle() + "\".",
                app.getId(),
                "APPLICATION"
        );

        return updated;
    }

    public Page<Application> getCompanyApplications(String companyId, String internshipId, ApplicationStatus status, Pageable pageable) {
        if (internshipId != null && status != null) {
            return applicationRepository.findByInternshipIdAndStatus(internshipId, status, pageable);
        } else if (internshipId != null) {
            return applicationRepository.findByInternshipId(internshipId, pageable);
        } else if (status != null) {
            return applicationRepository.findByCompanyIdAndStatus(companyId, status, pageable);
        }
        return applicationRepository.findByCompanyId(companyId, pageable);
    }

    public Application getCompanyApplicationById(String companyId, String applicationId) {
        return applicationRepository.findByIdAndCompanyId(applicationId, companyId)
                .orElseThrow(() -> new ApplicationNotFoundException("Application not found"));
    }

    public Application updateApplicationStatus(String companyId, String applicationId, UpdateApplicationStatusRequest request) {
        Application app = getCompanyApplicationById(companyId, applicationId);

        ApplicationStatus targetStatus = request.getStatus();
        if (!isValidStatusTransition(app.getStatus(), targetStatus)) {
            throw new IllegalArgumentException("Invalid status transition from " + app.getStatus() + " to " + targetStatus);
        }

        app.setStatus(targetStatus);
        if (request.getRecruiterNotes() != null) {
            app.setRecruiterNotes(request.getRecruiterNotes());
        }
        app.setUpdatedAt(LocalDateTime.now());

        Application updated = applicationRepository.save(app);

        notificationService.createNotification(
                app.getStudentId(),
                "APPLICATION_STATUS_UPDATED",
                "Application Status Updated",
                "Your application status for \"" + app.getInternshipTitle() + "\" at " + app.getCompanyName() + " has been updated to " + targetStatus + ".",
                app.getId(),
                "APPLICATION"
        );

        return updated;
    }

    public Page<Application> getAdminApplications(ApplicationStatus status, Pageable pageable) {
        if (status != null) {
            return applicationRepository.findAll(pageable); // Can be refined if specific filtering needed
        }
        return applicationRepository.findAll(pageable);
    }

    public Application getAdminApplicationById(String applicationId) {
        return applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ApplicationNotFoundException("Application not found"));
    }

    private boolean isValidStatusTransition(ApplicationStatus current, ApplicationStatus target) {
        if (current == ApplicationStatus.SUBMITTED && target == ApplicationStatus.UNDER_REVIEW) return true;
        if (current == ApplicationStatus.UNDER_REVIEW && (target == ApplicationStatus.INTERVIEWED || target == ApplicationStatus.REJECTED)) return true;
        if (current == ApplicationStatus.INTERVIEWED && (target == ApplicationStatus.ACCEPTED || target == ApplicationStatus.REJECTED)) return true;
        return false;
    }
}
