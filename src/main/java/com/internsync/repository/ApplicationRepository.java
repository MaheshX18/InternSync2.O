package com.internsync.repository;

import com.internsync.model.Application;
import com.internsync.model.ApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends MongoRepository<Application, String> {

    Page<Application> findByStudentId(String studentId, Pageable pageable);

    List<Application> findByStudentId(String studentId);

    Page<Application> findByStudentIdAndStatus(String studentId, ApplicationStatus status, Pageable pageable);

    Page<Application> findByInternshipId(String internshipId, Pageable pageable);

    Page<Application> findByInternshipIdAndStatus(String internshipId, ApplicationStatus status, Pageable pageable);

    Page<Application> findByCompanyId(String companyId, Pageable pageable);

    Page<Application> findByCompanyIdAndStatus(String companyId, ApplicationStatus status, Pageable pageable);

    Optional<Application> findByInternshipIdAndStudentId(String internshipId, String studentId);

    Optional<Application> findByIdAndStudentId(String id, String studentId);

    Optional<Application> findByIdAndCompanyId(String id, String companyId);

    long countByInternshipId(String internshipId);

    long countByInternshipIdAndStatus(String internshipId, ApplicationStatus status);

    long countByStudentId(String studentId);

    long countByCompanyId(String companyId);
}
