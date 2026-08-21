package com.internsync.dto.response;

public class StudentDashboardResponse {

    private int profileCompleteness;
    private int skillsCount;
    private boolean hasResume;
    private Double gpa;
    private String department;
    private String institutionId;
    private String batch;
    private long applicationsCount = 0;
    private long savedInternshipsCount = 0;
    private UserProfileResponse userProfile;

    public StudentDashboardResponse() {
    }

    public int getProfileCompleteness() {
        return profileCompleteness;
    }

    public void setProfileCompleteness(int profileCompleteness) {
        this.profileCompleteness = profileCompleteness;
    }

    public int getSkillsCount() {
        return skillsCount;
    }

    public void setSkillsCount(int skillsCount) {
        this.skillsCount = skillsCount;
    }

    public boolean isHasResume() {
        return hasResume;
    }

    public void setHasResume(boolean hasResume) {
        this.hasResume = hasResume;
    }

    public Double getGpa() {
        return gpa;
    }

    public void setGpa(Double gpa) {
        this.gpa = gpa;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getInstitutionId() {
        return institutionId;
    }

    public void setInstitutionId(String institutionId) {
        this.institutionId = institutionId;
    }

    public String getBatch() {
        return batch;
    }

    public void setBatch(String batch) {
        this.batch = batch;
    }

    public long getApplicationsCount() {
        return applicationsCount;
    }

    public void setApplicationsCount(long applicationsCount) {
        this.applicationsCount = applicationsCount;
    }

    public long getSavedInternshipsCount() {
        return savedInternshipsCount;
    }

    public void setSavedInternshipsCount(long savedInternshipsCount) {
        this.savedInternshipsCount = savedInternshipsCount;
    }

    public UserProfileResponse getUserProfile() {
        return userProfile;
    }

    public void setUserProfile(UserProfileResponse userProfile) {
        this.userProfile = userProfile;
    }
}
