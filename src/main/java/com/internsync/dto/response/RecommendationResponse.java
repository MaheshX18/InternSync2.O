package com.internsync.dto.response;

import com.internsync.model.Internship;
import java.util.ArrayList;
import java.util.List;

public class RecommendationResponse {

    private Internship internship;
    private int matchScore;
    private int skillMatchPercentage;
    private int roleMatchPercentage;
    private int experienceMatchPercentage;
    private int locationMatchPercentage;
    private int educationMatchPercentage;
    private List<String> matchedSkills = new ArrayList<>();
    private List<String> missingSkills = new ArrayList<>();
    private List<String> whyMatches = new ArrayList<>();

    public RecommendationResponse() {}

    public RecommendationResponse(
            Internship internship,
            int matchScore,
            int skillMatchPercentage,
            int roleMatchPercentage,
            int experienceMatchPercentage,
            int locationMatchPercentage,
            int educationMatchPercentage,
            List<String> matchedSkills,
            List<String> missingSkills,
            List<String> whyMatches
    ) {
        this.internship = internship;
        this.matchScore = matchScore;
        this.skillMatchPercentage = skillMatchPercentage;
        this.roleMatchPercentage = roleMatchPercentage;
        this.experienceMatchPercentage = experienceMatchPercentage;
        this.locationMatchPercentage = locationMatchPercentage;
        this.educationMatchPercentage = educationMatchPercentage;
        this.matchedSkills = matchedSkills != null ? matchedSkills : new ArrayList<>();
        this.missingSkills = missingSkills != null ? missingSkills : new ArrayList<>();
        this.whyMatches = whyMatches != null ? whyMatches : new ArrayList<>();
    }

    public Internship getInternship() {
        return internship;
    }

    public void setInternship(Internship internship) {
        this.internship = internship;
    }

    public int getMatchScore() {
        return matchScore;
    }

    public void setMatchScore(int matchScore) {
        this.matchScore = matchScore;
    }

    public int getSkillMatchPercentage() {
        return skillMatchPercentage;
    }

    public void setSkillMatchPercentage(int skillMatchPercentage) {
        this.skillMatchPercentage = skillMatchPercentage;
    }

    public int getRoleMatchPercentage() {
        return roleMatchPercentage;
    }

    public void setRoleMatchPercentage(int roleMatchPercentage) {
        this.roleMatchPercentage = roleMatchPercentage;
    }

    public int getExperienceMatchPercentage() {
        return experienceMatchPercentage;
    }

    public void setExperienceMatchPercentage(int experienceMatchPercentage) {
        this.experienceMatchPercentage = experienceMatchPercentage;
    }

    public int getLocationMatchPercentage() {
        return locationMatchPercentage;
    }

    public void setLocationMatchPercentage(int locationMatchPercentage) {
        this.locationMatchPercentage = locationMatchPercentage;
    }

    public int getEducationMatchPercentage() {
        return educationMatchPercentage;
    }

    public void setEducationMatchPercentage(int educationMatchPercentage) {
        this.educationMatchPercentage = educationMatchPercentage;
    }

    public List<String> getMatchedSkills() {
        return matchedSkills;
    }

    public void setMatchedSkills(List<String> matchedSkills) {
        this.matchedSkills = matchedSkills;
    }

    public List<String> getMissingSkills() {
        return missingSkills;
    }

    public void setMissingSkills(List<String> missingSkills) {
        this.missingSkills = missingSkills;
    }

    public List<String> getWhyMatches() {
        return whyMatches;
    }

    public void setWhyMatches(List<String> whyMatches) {
        this.whyMatches = whyMatches;
    }
}
