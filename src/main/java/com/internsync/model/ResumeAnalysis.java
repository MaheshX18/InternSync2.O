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

@Document(collection = "resume_analyses")
public class ResumeAnalysis {

    @Id
    private String id;

    @Indexed(unique = true)
    private String userId;

    private String fileName;
    private String fileType;
    private Long fileSize;

    private Integer resumeScore = 0;
    private Map<String, Integer> scoreBreakdown = new HashMap<>();

    private List<String> extractedSkills = new ArrayList<>();
    private String educationSummary;
    private List<String> extractedProjects = new ArrayList<>();
    private List<String> extractedExperience = new ArrayList<>();
    private List<String> extractedCertifications = new ArrayList<>();

    private List<String> matchedSkills = new ArrayList<>();
    private List<String> missingSkills = new ArrayList<>();
    private List<String> improvements = new ArrayList<>();

    private Integer matchingInternshipsCount = 0;
    private Integer potentialUnlockedInternshipsCount = 0;

    private String rawTextContent;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    public ResumeAnalysis() {
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

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public Integer getResumeScore() {
        return resumeScore;
    }

    public void setResumeScore(Integer resumeScore) {
        this.resumeScore = resumeScore;
    }

    public Map<String, Integer> getScoreBreakdown() {
        return scoreBreakdown;
    }

    public void setScoreBreakdown(Map<String, Integer> scoreBreakdown) {
        this.scoreBreakdown = scoreBreakdown != null ? scoreBreakdown : new HashMap<>();
    }

    public List<String> getExtractedSkills() {
        return extractedSkills;
    }

    public void setExtractedSkills(List<String> extractedSkills) {
        this.extractedSkills = extractedSkills != null ? extractedSkills : new ArrayList<>();
    }

    public String getEducationSummary() {
        return educationSummary;
    }

    public void setEducationSummary(String educationSummary) {
        this.educationSummary = educationSummary;
    }

    public List<String> getExtractedProjects() {
        return extractedProjects;
    }

    public void setExtractedProjects(List<String> extractedProjects) {
        this.extractedProjects = extractedProjects != null ? extractedProjects : new ArrayList<>();
    }

    public List<String> getExtractedExperience() {
        return extractedExperience;
    }

    public void setExtractedExperience(List<String> extractedExperience) {
        this.extractedExperience = extractedExperience != null ? extractedExperience : new ArrayList<>();
    }

    public List<String> getExtractedCertifications() {
        return extractedCertifications;
    }

    public void setExtractedCertifications(List<String> extractedCertifications) {
        this.extractedCertifications = extractedCertifications != null ? extractedCertifications : new ArrayList<>();
    }

    public List<String> getMatchedSkills() {
        return matchedSkills;
    }

    public void setMatchedSkills(List<String> matchedSkills) {
        this.matchedSkills = matchedSkills != null ? matchedSkills : new ArrayList<>();
    }

    public List<String> getMissingSkills() {
        return missingSkills;
    }

    public void setMissingSkills(List<String> missingSkills) {
        this.missingSkills = missingSkills != null ? missingSkills : new ArrayList<>();
    }

    public List<String> getImprovements() {
        return improvements;
    }

    public void setImprovements(List<String> improvements) {
        this.improvements = improvements != null ? improvements : new ArrayList<>();
    }

    public Integer getMatchingInternshipsCount() {
        return matchingInternshipsCount;
    }

    public void setMatchingInternshipsCount(Integer matchingInternshipsCount) {
        this.matchingInternshipsCount = matchingInternshipsCount;
    }

    public Integer getPotentialUnlockedInternshipsCount() {
        return potentialUnlockedInternshipsCount;
    }

    public void setPotentialUnlockedInternshipsCount(Integer potentialUnlockedInternshipsCount) {
        this.potentialUnlockedInternshipsCount = potentialUnlockedInternshipsCount;
    }

    public String getRawTextContent() {
        return rawTextContent;
    }

    public void setRawTextContent(String rawTextContent) {
        this.rawTextContent = rawTextContent;
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
}
