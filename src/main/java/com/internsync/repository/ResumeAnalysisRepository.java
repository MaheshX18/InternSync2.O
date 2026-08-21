package com.internsync.repository;

import com.internsync.model.ResumeAnalysis;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ResumeAnalysisRepository extends MongoRepository<ResumeAnalysis, String> {
    Optional<ResumeAnalysis> findByUserId(String userId);
    void deleteByUserId(String userId);
}
