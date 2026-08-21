package com.internsync.controller;

import com.internsync.dto.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Health Check", description = "System status and health check APIs")
public class HealthController {

    @Autowired(required = false)
    private MongoTemplate mongoTemplate;

    @GetMapping("/health")
    @Operation(summary = "Check backend and database health status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getHealth() {
        Map<String, Object> healthInfo = new HashMap<>();
        healthInfo.put("status", "UP");
        healthInfo.put("service", "InternSync Spring Boot API");
        healthInfo.put("version", "1.0.0");
        
        boolean mongoConnected = false;
        try {
            if (mongoTemplate != null) {
                mongoTemplate.getDb().runCommand(new org.bson.Document("ping", 1));
                mongoConnected = true;
            }
        } catch (Exception e) {
            mongoConnected = false;
        }
        
        healthInfo.put("database", mongoConnected ? "CONNECTED (MongoDB)" : "DISCONNECTED");

        return ResponseEntity.ok(ApiResponse.success("InternSync System Health OK", healthInfo));
    }
}
