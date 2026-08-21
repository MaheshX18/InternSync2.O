package com.internsync.dto.response;

public class CompanyDashboardResponse {

    private int profileCompleteness;
    private String companyName;
    private String industry;
    private long activeJobPostingsCount = 0;
    private long totalApplicantsCount = 0;
    private long pendingReviewsCount = 0;
    private UserProfileResponse userProfile;

    public CompanyDashboardResponse() {
    }

    public int getProfileCompleteness() {
        return profileCompleteness;
    }

    public void setProfileCompleteness(int profileCompleteness) {
        this.profileCompleteness = profileCompleteness;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getIndustry() {
        return industry;
    }

    public void setIndustry(String industry) {
        this.industry = industry;
    }

    public long getActiveJobPostingsCount() {
        return activeJobPostingsCount;
    }

    public void setActiveJobPostingsCount(long activeJobPostingsCount) {
        this.activeJobPostingsCount = activeJobPostingsCount;
    }

    public long getTotalApplicantsCount() {
        return totalApplicantsCount;
    }

    public void setTotalApplicantsCount(long totalApplicantsCount) {
        this.totalApplicantsCount = totalApplicantsCount;
    }

    public long getPendingReviewsCount() {
        return pendingReviewsCount;
    }

    public void setPendingReviewsCount(long pendingReviewsCount) {
        this.pendingReviewsCount = pendingReviewsCount;
    }

    public UserProfileResponse getUserProfile() {
        return userProfile;
    }

    public void setUserProfile(UserProfileResponse userProfile) {
        this.userProfile = userProfile;
    }
}
