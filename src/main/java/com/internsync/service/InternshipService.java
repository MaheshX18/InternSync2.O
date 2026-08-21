package com.internsync.service;

import com.internsync.dto.request.CreateInternshipRequest;
import com.internsync.dto.request.UpdateInternshipRequest;
import com.internsync.dto.request.UpdateInternshipStatusRequest;
import com.internsync.dto.response.InternshipResponse;
import com.internsync.dto.response.InternshipSummaryResponse;
import com.internsync.exception.InvalidInternshipStatusException;
import com.internsync.exception.InternshipNotFoundException;
import com.internsync.model.EmploymentType;
import com.internsync.model.Internship;
import com.internsync.model.InternshipStatus;
import com.internsync.model.User;
import com.internsync.model.WorkplaceType;
import com.internsync.repository.InternshipRepository;
import com.internsync.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class InternshipService {

    private final InternshipRepository internshipRepository;
    private final UserRepository userRepository;
    private final MongoTemplate mongoTemplate;

    public InternshipService(
            InternshipRepository internshipRepository,
            UserRepository userRepository,
            MongoTemplate mongoTemplate
    ) {
        this.internshipRepository = internshipRepository;
        this.userRepository = userRepository;
        this.mongoTemplate = mongoTemplate;
    }

    public InternshipResponse createInternship(String companyId, CreateInternshipRequest request) {
        User company = userRepository.findById(companyId)
                .orElseThrow(() -> new IllegalArgumentException("Company user not found"));

        if (request.getStipendOrSalaryMax() != null && request.getStipendOrSalaryMin() != null) {
            if (request.getStipendOrSalaryMax() < request.getStipendOrSalaryMin()) {
                throw new IllegalArgumentException("Maximum stipend/salary cannot be less than minimum");
            }
        }

        Internship internship = new Internship();
        internship.setCompanyId(companyId);
        internship.setCompanyName(company.getCompanyName() != null && !company.getCompanyName().isBlank()
                ? company.getCompanyName()
                : (company.getFirstName() + " " + company.getLastName()).trim());
        internship.setCompanyLogoUrl(company.getCompanyLogoUrl() != null ? company.getCompanyLogoUrl() : company.getAvatarUrl());

        internship.setTitle(request.getTitle());
        internship.setDescription(request.getDescription());
        internship.setRequirements(request.getRequirements());
        internship.setResponsibilities(request.getResponsibilities());
        internship.setRequiredSkills(request.getRequiredSkills());
        internship.setLocation(request.getLocation());
        internship.setWorkplaceType(request.getWorkplaceType());
        internship.setEmploymentType(request.getEmploymentType());
        internship.setExperienceLevel(request.getExperienceLevel());
        internship.setStipendOrSalaryMin(request.getStipendOrSalaryMin());
        internship.setStipendOrSalaryMax(request.getStipendOrSalaryMax());
        internship.setCurrency(request.getCurrency() != null ? request.getCurrency() : "USD");
        internship.setIsPaid(request.getIsPaid());
        internship.setPositionsAvailable(request.getPositionsAvailable() != null ? request.getPositionsAvailable() : 1);
        internship.setApplicationDeadline(request.getApplicationDeadline());
        internship.setApplicantCount(0);

        if (Boolean.TRUE.equals(request.getPublishImmediately())) {
            if (request.getApplicationDeadline() != null && request.getApplicationDeadline().isBefore(Instant.now())) {
                throw new InvalidInternshipStatusException("Cannot publish an internship with an expired application deadline");
            }
            internship.setStatus(InternshipStatus.PUBLISHED);
            internship.setPublishedAt(Instant.now());
        } else {
            internship.setStatus(InternshipStatus.DRAFT);
        }

        Internship saved = internshipRepository.save(internship);
        return InternshipResponse.fromEntity(saved);
    }

    public Page<InternshipResponse> getCompanyInternships(String companyId, Pageable pageable) {
        Page<Internship> page = internshipRepository.findByCompanyId(companyId, pageable);
        return page.map(InternshipResponse::fromEntity);
    }

    public InternshipResponse getCompanyInternshipById(String companyId, String id) {
        Internship internship = internshipRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new InternshipNotFoundException("Internship not found or does not belong to your company"));
        return InternshipResponse.fromEntity(internship);
    }

    public InternshipResponse updateCompanyInternship(String companyId, String id, UpdateInternshipRequest request) {
        Internship internship = internshipRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new InternshipNotFoundException("Internship not found or does not belong to your company"));

        if (request.getStipendOrSalaryMax() != null && request.getStipendOrSalaryMin() != null) {
            if (request.getStipendOrSalaryMax() < request.getStipendOrSalaryMin()) {
                throw new IllegalArgumentException("Maximum stipend/salary cannot be less than minimum");
            }
        }

        if (internship.getStatus() == InternshipStatus.PUBLISHED) {
            if (request.getApplicationDeadline() != null && request.getApplicationDeadline().isBefore(Instant.now())) {
                throw new InvalidInternshipStatusException("Cannot set an expired application deadline for a published internship");
            }
        }

        internship.setTitle(request.getTitle());
        internship.setDescription(request.getDescription());
        internship.setRequirements(request.getRequirements());
        internship.setResponsibilities(request.getResponsibilities());
        internship.setRequiredSkills(request.getRequiredSkills());
        internship.setLocation(request.getLocation());
        internship.setWorkplaceType(request.getWorkplaceType());
        internship.setEmploymentType(request.getEmploymentType());
        internship.setExperienceLevel(request.getExperienceLevel());
        internship.setStipendOrSalaryMin(request.getStipendOrSalaryMin());
        internship.setStipendOrSalaryMax(request.getStipendOrSalaryMax());
        internship.setCurrency(request.getCurrency() != null ? request.getCurrency() : "USD");
        internship.setIsPaid(request.getIsPaid());
        if (request.getPositionsAvailable() != null) {
            internship.setPositionsAvailable(request.getPositionsAvailable());
        }
        internship.setApplicationDeadline(request.getApplicationDeadline());

        Internship updated = internshipRepository.save(internship);
        return InternshipResponse.fromEntity(updated);
    }

    public InternshipResponse updateCompanyInternshipStatus(String companyId, String id, UpdateInternshipStatusRequest request) {
        Internship internship = internshipRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new InternshipNotFoundException("Internship not found or does not belong to your company"));

        InternshipStatus currentStatus = internship.getStatus();
        InternshipStatus targetStatus = request.getStatus();

        if (targetStatus == InternshipStatus.REMOVED_BY_ADMIN || currentStatus == InternshipStatus.REMOVED_BY_ADMIN) {
            throw new InvalidInternshipStatusException("Company users cannot modify postings moderated by administrator");
        }

        // Check valid transitions
        boolean isValidTransition = false;
        if (currentStatus == InternshipStatus.DRAFT && (targetStatus == InternshipStatus.PUBLISHED || targetStatus == InternshipStatus.CLOSED)) {
            isValidTransition = true;
        } else if (currentStatus == InternshipStatus.PUBLISHED && (targetStatus == InternshipStatus.UNPUBLISHED || targetStatus == InternshipStatus.CLOSED)) {
            isValidTransition = true;
        } else if (currentStatus == InternshipStatus.UNPUBLISHED && (targetStatus == InternshipStatus.PUBLISHED || targetStatus == InternshipStatus.CLOSED)) {
            isValidTransition = true;
        } else if (currentStatus == targetStatus) {
            isValidTransition = true;
        }

        if (!isValidTransition) {
            throw new InvalidInternshipStatusException("Invalid status transition from " + currentStatus + " to " + targetStatus);
        }

        if (targetStatus == InternshipStatus.PUBLISHED) {
            if (internship.getApplicationDeadline() != null && internship.getApplicationDeadline().isBefore(Instant.now())) {
                throw new InvalidInternshipStatusException("Cannot publish an internship with an expired application deadline");
            }
            if (internship.getPublishedAt() == null) {
                internship.setPublishedAt(Instant.now());
            }
        }

        internship.setStatus(targetStatus);
        Internship updated = internshipRepository.save(internship);
        return InternshipResponse.fromEntity(updated);
    }

    public void deleteCompanyInternship(String companyId, String id) {
        Internship internship = internshipRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new InternshipNotFoundException("Internship not found or does not belong to your company"));
        internshipRepository.delete(internship);
    }

    public Page<InternshipSummaryResponse> getPublicInternships(
            String search,
            WorkplaceType workplaceType,
            EmploymentType employmentType,
            String location,
            Boolean isPaid,
            Double minSalary,
            Double maxSalary,
            String studentId,
            Pageable pageable
    ) {
        Query query = new Query();
        query.addCriteria(Criteria.where("status").is(InternshipStatus.PUBLISHED));

        if (search != null && !search.isBlank()) {
            String regex = Pattern.quote(search.trim());
            Criteria searchCriteria = new Criteria().orOperator(
                    Criteria.where("title").regex(regex, "i"),
                    Criteria.where("description").regex(regex, "i"),
                    Criteria.where("companyName").regex(regex, "i"),
                    Criteria.where("location").regex(regex, "i"),
                    Criteria.where("requiredSkills").regex(regex, "i")
            );
            query.addCriteria(searchCriteria);
        }

        if (workplaceType != null) {
            query.addCriteria(Criteria.where("workplaceType").is(workplaceType));
        }

        if (employmentType != null) {
            query.addCriteria(Criteria.where("employmentType").is(employmentType));
        }

        if (location != null && !location.isBlank()) {
            query.addCriteria(Criteria.where("location").regex(Pattern.quote(location.trim()), "i"));
        }

        if (isPaid != null) {
            query.addCriteria(Criteria.where("isPaid").is(isPaid));
        }

        if (minSalary != null) {
            query.addCriteria(Criteria.where("stipendOrSalaryMin").gte(minSalary));
        }

        if (maxSalary != null) {
            query.addCriteria(Criteria.where("stipendOrSalaryMax").lte(maxSalary));
        }

        long total = mongoTemplate.count(query, Internship.class);

        query.with(pageable);
        List<Internship> list = mongoTemplate.find(query, Internship.class);

        List<String> bookmarkedIds = getStudentBookmarkedIds(studentId);

        List<InternshipSummaryResponse> dtos = list.stream()
                .map(item -> InternshipSummaryResponse.fromEntity(item, bookmarkedIds.contains(item.getId())))
                .collect(Collectors.toList());

        return new PageImpl<>(dtos, pageable, total);
    }

    public InternshipResponse getPublicInternshipById(String id, String studentId) {
        Internship internship = internshipRepository.findById(id)
                .orElseThrow(() -> new InternshipNotFoundException("Internship not found"));

        if (internship.getStatus() != InternshipStatus.PUBLISHED) {
            throw new InternshipNotFoundException("Internship not found");
        }

        List<String> bookmarkedIds = getStudentBookmarkedIds(studentId);
        boolean isBookmarked = bookmarkedIds.contains(internship.getId());

        return InternshipResponse.fromEntity(internship, isBookmarked);
    }

    public boolean toggleBookmark(String studentId, String internshipId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student user not found"));

        Internship internship = internshipRepository.findById(internshipId)
                .orElseThrow(() -> new InternshipNotFoundException("Cannot bookmark an unpublished or non-existent internship"));

        if (internship.getStatus() != InternshipStatus.PUBLISHED) {
            throw new InternshipNotFoundException("Cannot bookmark an unpublished or non-existent internship");
        }

        List<String> saved = student.getSavedInternshipIds();
        if (saved == null) {
            saved = new ArrayList<>();
        }

        boolean nowBookmarked;
        if (saved.contains(internshipId)) {
            saved.remove(internshipId);
            nowBookmarked = false;
        } else {
            saved.add(internshipId);
            nowBookmarked = true;
        }

        student.setSavedInternshipIds(saved);
        userRepository.save(student);
        return nowBookmarked;
    }

    public Page<InternshipSummaryResponse> getStudentBookmarks(String studentId, Pageable pageable) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student user not found"));

        List<String> savedIds = student.getSavedInternshipIds();
        if (savedIds == null || savedIds.isEmpty()) {
            return new PageImpl<>(new ArrayList<>(), pageable, 0);
        }

        Page<Internship> page = internshipRepository.findByIdInAndStatus(savedIds, InternshipStatus.PUBLISHED, pageable);
        return page.map(item -> InternshipSummaryResponse.fromEntity(item, true));
    }

    public Page<InternshipResponse> getAdminInternships(String companyId, InternshipStatus status, String search, Pageable pageable) {
        Query query = new Query();

        if (companyId != null && !companyId.isBlank()) {
            query.addCriteria(Criteria.where("companyId").is(companyId));
        }

        if (status != null) {
            query.addCriteria(Criteria.where("status").is(status));
        }

        if (search != null && !search.isBlank()) {
            String regex = Pattern.quote(search.trim());
            Criteria searchCriteria = new Criteria().orOperator(
                    Criteria.where("title").regex(regex, "i"),
                    Criteria.where("companyName").regex(regex, "i"),
                    Criteria.where("location").regex(regex, "i")
            );
            query.addCriteria(searchCriteria);
        }

        long total = mongoTemplate.count(query, Internship.class);
        query.with(pageable);
        List<Internship> list = mongoTemplate.find(query, Internship.class);

        List<InternshipResponse> dtos = list.stream()
                .map(InternshipResponse::fromEntity)
                .collect(Collectors.toList());

        return new PageImpl<>(dtos, pageable, total);
    }

    public InternshipResponse updateAdminInternshipStatus(String id, UpdateInternshipStatusRequest request) {
        Internship internship = internshipRepository.findById(id)
                .orElseThrow(() -> new InternshipNotFoundException("Internship not found"));

        internship.setStatus(request.getStatus());
        Internship updated = internshipRepository.save(internship);
        return InternshipResponse.fromEntity(updated);
    }

    public void deleteAdminInternship(String id) {
        Internship internship = internshipRepository.findById(id)
                .orElseThrow(() -> new InternshipNotFoundException("Internship not found"));
        internshipRepository.delete(internship);
    }

    private List<String> getStudentBookmarkedIds(String studentId) {
        if (studentId == null || studentId.isBlank()) {
            return new ArrayList<>();
        }
        return userRepository.findById(studentId)
                .map(user -> user.getSavedInternshipIds() != null ? user.getSavedInternshipIds() : new ArrayList<String>())
                .orElse(new ArrayList<>());
    }
}
