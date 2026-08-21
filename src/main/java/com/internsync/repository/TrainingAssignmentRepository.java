package com.internsync.repository;

import com.internsync.model.TrainingAssignment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TrainingAssignmentRepository extends MongoRepository<TrainingAssignment, String> {
    List<TrainingAssignment> findByStudentId(String studentId);
    List<TrainingAssignment> findByTrainingId(String trainingId);
    boolean existsByTrainingIdAndStudentId(String trainingId, String studentId);
    Optional<TrainingAssignment> findByTrainingIdAndStudentId(String trainingId, String studentId);
    long countByStudentIdAndStatus(String studentId, String status);
    long countByStatus(String status);
}
