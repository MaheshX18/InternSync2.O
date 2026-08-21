package com.internsync.repository;

import com.internsync.model.Intervention;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterventionRepository extends MongoRepository<Intervention, String> {
    List<Intervention> findByStudentId(String studentId);
    List<Intervention> findByStatus(String status);
}
