package com.internsync.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Document(collection = "learning_roadmaps")
public class LearningRoadmap {

    @Id
    private String id;

    @Indexed(unique = true)
    private String userId;

    private String targetRole = "Backend Developer";

    private Integer readinessScore = 0;

    private List<RoadmapItem> items = new ArrayList<>();

    // Map of skill -> skill level ("BEGINNER", "INTERMEDIATE", "ADVANCED", "UNKNOWN")
    private Map<String, String> skillLevels = new HashMap<>();

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    public LearningRoadmap() {
    }

    public LearningRoadmap(String userId, String targetRole) {
        this.userId = userId;
        this.targetRole = targetRole;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getTargetRole() {
        return targetRole;
    }

    public void setTargetRole(String targetRole) {
        this.targetRole = targetRole;
    }

    public Integer getReadinessScore() {
        return readinessScore;
    }

    public void setReadinessScore(Integer readinessScore) {
        this.readinessScore = readinessScore;
    }

    public List<RoadmapItem> getItems() {
        return items;
    }

    public void setItems(List<RoadmapItem> items) {
        this.items = items != null ? items : new ArrayList<>();
    }

    public Map<String, String> getSkillLevels() {
        return skillLevels;
    }

    public void setSkillLevels(Map<String, String> skillLevels) {
        this.skillLevels = skillLevels != null ? skillLevels : new HashMap<>();
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public static class RoadmapItem {
        private String itemId;
        private String skill;
        private String priority = "MEDIUM"; // HIGH, MEDIUM, LOW
        private Integer week = 1;
        private String title;
        private String description;
        private List<String> learningObjectives = new ArrayList<>();
        private String practiceTask;
        private Integer requiredByCount = 0;
        private String roleImportance = "MEDIUM";
        private Integer potentialOpportunity = 0;
        private String priorityReason;
        private String status = "NOT_STARTED"; // NOT_STARTED, IN_PROGRESS, COMPLETED
        private Integer progress = 0; // 0 to 100
        private String skillLevel = "UNKNOWN"; // BEGINNER, INTERMEDIATE, ADVANCED, UNKNOWN
        private List<LearningResource> resources = new ArrayList<>();

        public RoadmapItem() {
        }

        public String getItemId() {
            return itemId;
        }

        public void setItemId(String itemId) {
            this.itemId = itemId;
        }

        public String getSkill() {
            return skill;
        }

        public void setSkill(String skill) {
            this.skill = skill;
        }

        public String getPriority() {
            return priority;
        }

        public void setPriority(String priority) {
            this.priority = priority;
        }

        public Integer getWeek() {
            return week;
        }

        public void setWeek(Integer week) {
            this.week = week;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public List<String> getLearningObjectives() {
            return learningObjectives;
        }

        public void setLearningObjectives(List<String> learningObjectives) {
            this.learningObjectives = learningObjectives != null ? learningObjectives : new ArrayList<>();
        }

        public String getPracticeTask() {
            return practiceTask;
        }

        public void setPracticeTask(String practiceTask) {
            this.practiceTask = practiceTask;
        }

        public Integer getRequiredByCount() {
            return requiredByCount;
        }

        public void setRequiredByCount(Integer requiredByCount) {
            this.requiredByCount = requiredByCount;
        }

        public String getRoleImportance() {
            return roleImportance;
        }

        public void setRoleImportance(String roleImportance) {
            this.roleImportance = roleImportance;
        }

        public Integer getPotentialOpportunity() {
            return potentialOpportunity;
        }

        public void setPotentialOpportunity(Integer potentialOpportunity) {
            this.potentialOpportunity = potentialOpportunity;
        }

        public String getPriorityReason() {
            return priorityReason;
        }

        public void setPriorityReason(String priorityReason) {
            this.priorityReason = priorityReason;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public Integer getProgress() {
            return progress;
        }

        public void setProgress(Integer progress) {
            this.progress = progress;
        }

        public String getSkillLevel() {
            return skillLevel;
        }

        public void setSkillLevel(String skillLevel) {
            this.skillLevel = skillLevel;
        }

        public List<LearningResource> getResources() {
            return resources;
        }

        public void setResources(List<LearningResource> resources) {
            this.resources = resources != null ? resources : new ArrayList<>();
        }
    }

    public static class LearningResource {
        private String title;
        private String provider;
        private String url;
        private String difficulty = "BEGINNER"; // BEGINNER, INTERMEDIATE, ADVANCED

        public LearningResource() {
        }

        public LearningResource(String title, String provider, String url, String difficulty) {
            this.title = title;
            this.provider = provider;
            this.url = url;
            this.difficulty = difficulty;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getProvider() {
            return provider;
        }

        public void setProvider(String provider) {
            this.provider = provider;
        }

        public String getUrl() {
            return url;
        }

        public void setUrl(String url) {
            this.url = url;
        }

        public String getDifficulty() {
            return difficulty;
        }

        public void setDifficulty(String difficulty) {
            this.difficulty = difficulty;
        }
    }
}
