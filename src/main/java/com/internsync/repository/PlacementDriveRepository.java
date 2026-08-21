package com.internsync.repository;

import com.internsync.model.PlacementDrive;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlacementDriveRepository extends MongoRepository<PlacementDrive, String> {
    List<PlacementDrive> findByStatus(String status);
}
