package com.internsync.repository;

import com.internsync.model.LearningRoadmap;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LearningRoadmapRepository extends MongoRepository<LearningRoadmap, String> {
    Optional<LearningRoadmap> findByUserId(String userId);
}
