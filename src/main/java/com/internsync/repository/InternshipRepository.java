package com.internsync.repository;

import com.internsync.model.Internship;
import com.internsync.model.InternshipStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InternshipRepository extends MongoRepository<Internship, String> {

    Page<Internship> findByCompanyId(String companyId, Pageable pageable);

    Page<Internship> findByCompanyIdAndStatus(String companyId, InternshipStatus status, Pageable pageable);

    Optional<Internship> findByIdAndCompanyId(String id, String companyId);

    Page<Internship> findByStatus(InternshipStatus status, Pageable pageable);

    List<Internship> findByStatus(InternshipStatus status);

    Page<Internship> findByIdInAndStatus(List<String> ids, InternshipStatus status, Pageable pageable);

    long countByCompanyId(String companyId);

    long countByCompanyIdAndStatus(String companyId, InternshipStatus status);
}
