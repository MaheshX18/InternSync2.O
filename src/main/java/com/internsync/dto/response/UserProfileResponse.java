package com.internsync.dto.response;

import com.internsync.model.Role;
import com.internsync.model.User;
import com.internsync.model.UserStatus;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class UserProfileResponse {

    private String id;
    private String email;
    private String firstName;
    private String lastName;
    private Role role;
    private UserStatus status;
    private String phone;

    // General Profile Fields
    private String bio;
    private String location;
    private String avatarUrl;
    private String websiteUrl;
    private String linkedinUrl;
    private String githubUrl;

    // Student specific fields
    private String institutionId;
    private String department;
    private String rollNumber;
    private String batch;
    private List<String> skills = new ArrayList<>();
    private String resumeUrl;
    private Double gpa;

    // Company specific fields
    private String companyId;
    private String companyName;
    private String companyWebsite;
    private String companyLogoUrl;
    private String companyDescription;
    private String industry;

    private int profileCompleteness;
    private Instant createdAt;

    public UserProfileResponse() {
    }

    public static UserProfileResponse fromUser(User user) {
        UserProfileResponse response = new UserProfileResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setRole(user.getRole());
        response.setStatus(user.getStatus());
        response.setPhone(user.getPhone());

        response.setBio(user.getBio());
        response.setLocation(user.getLocation());
        response.setAvatarUrl(user.getAvatarUrl());
        response.setWebsiteUrl(user.getWebsiteUrl());
        response.setLinkedinUrl(user.getLinkedinUrl());
        response.setGithubUrl(user.getGithubUrl());

        response.setInstitutionId(user.getInstitutionId());
        response.setDepartment(user.getDepartment());
        response.setRollNumber(user.getRollNumber());
        response.setBatch(user.getBatch());
        response.setSkills(user.getSkills() != null ? user.getSkills() : new ArrayList<>());
        response.setResumeUrl(user.getResumeUrl());
        response.setGpa(user.getGpa());

        response.setCompanyId(user.getCompanyId());
        response.setCompanyName(user.getCompanyName());
        response.setCompanyWebsite(user.getCompanyWebsite());
        response.setCompanyLogoUrl(user.getCompanyLogoUrl());
        response.setCompanyDescription(user.getCompanyDescription());
        response.setIndustry(user.getIndustry());

        response.setProfileCompleteness(calculateProfileCompleteness(user));
        response.setCreatedAt(user.getCreatedAt());
        return response;
    }

    private static int calculateProfileCompleteness(User user) {
        if (user == null) return 0;
        int filled = 0;
        int total = 0;

        if (user.getRole() == Role.STUDENT) {
            total = 13;
            if (isFilled(user.getFirstName())) filled++;
            if (isFilled(user.getLastName())) filled++;
            if (isFilled(user.getPhone())) filled++;
            if (isFilled(user.getBio())) filled++;
            if (isFilled(user.getLocation())) filled++;
            if (user.getSkills() != null && !user.getSkills().isEmpty()) filled++;
            if (isFilled(user.getResumeUrl())) filled++;
            if (user.getGpa() != null && user.getGpa() > 0) filled++;
            if (isFilled(user.getDepartment())) filled++;
            if (isFilled(user.getRollNumber())) filled++;
            if (isFilled(user.getBatch())) filled++;
            if (isFilled(user.getLinkedinUrl())) filled++;
            if (isFilled(user.getGithubUrl())) filled++;
        } else if (user.getRole() == Role.COMPANY) {
            total = 9;
            if (isFilled(user.getCompanyName())) filled++;
            if (isFilled(user.getCompanyWebsite())) filled++;
            if (isFilled(user.getCompanyLogoUrl())) filled++;
            if (isFilled(user.getCompanyDescription())) filled++;
            if (isFilled(user.getIndustry())) filled++;
            if (isFilled(user.getPhone())) filled++;
            if (isFilled(user.getLocation())) filled++;
            if (isFilled(user.getWebsiteUrl())) filled++;
            if (isFilled(user.getLinkedinUrl())) filled++;
        } else {
            total = 6;
            if (isFilled(user.getFirstName())) filled++;
            if (isFilled(user.getLastName())) filled++;
            if (isFilled(user.getPhone())) filled++;
            if (isFilled(user.getBio())) filled++;
            if (isFilled(user.getLocation())) filled++;
            if (isFilled(user.getAvatarUrl())) filled++;
        }

        if (total == 0) return 100;
        return Math.min(100, (int) Math.round(((double) filled / total) * 100.0));
    }

    private static boolean isFilled(String str) {
        return str != null && !str.trim().isEmpty();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public UserStatus getStatus() {
        return status;
    }

    public void setStatus(UserStatus status) {
        this.status = status;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getInstitutionId() {
        return institutionId;
    }

    public void setInstitutionId(String institutionId) {
        this.institutionId = institutionId;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getRollNumber() {
        return rollNumber;
    }

    public void setRollNumber(String rollNumber) {
        this.rollNumber = rollNumber;
    }

    public String getBatch() {
        return batch;
    }

    public void setBatch(String batch) {
        this.batch = batch;
    }

    public String getCompanyId() {
        return companyId;
    }

    public void setCompanyId(String companyId) {
        this.companyId = companyId;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getWebsiteUrl() {
        return websiteUrl;
    }

    public void setWebsiteUrl(String websiteUrl) {
        this.websiteUrl = websiteUrl;
    }

    public String getLinkedinUrl() {
        return linkedinUrl;
    }

    public void setLinkedinUrl(String linkedinUrl) {
        this.linkedinUrl = linkedinUrl;
    }

    public String getGithubUrl() {
        return githubUrl;
    }

    public void setGithubUrl(String githubUrl) {
        this.githubUrl = githubUrl;
    }

    public List<String> getSkills() {
        return skills;
    }

    public void setSkills(List<String> skills) {
        this.skills = skills;
    }

    public String getResumeUrl() {
        return resumeUrl;
    }

    public void setResumeUrl(String resumeUrl) {
        this.resumeUrl = resumeUrl;
    }

    public Double getGpa() {
        return gpa;
    }

    public void setGpa(Double gpa) {
        this.gpa = gpa;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getCompanyWebsite() {
        return companyWebsite;
    }

    public void setCompanyWebsite(String companyWebsite) {
        this.companyWebsite = companyWebsite;
    }

    public String getCompanyLogoUrl() {
        return companyLogoUrl;
    }

    public void setCompanyLogoUrl(String companyLogoUrl) {
        this.companyLogoUrl = companyLogoUrl;
    }

    public String getCompanyDescription() {
        return companyDescription;
    }

    public void setCompanyDescription(String companyDescription) {
        this.companyDescription = companyDescription;
    }

    public String getIndustry() {
        return industry;
    }

    public void setIndustry(String industry) {
        this.industry = industry;
    }

    public int getProfileCompleteness() {
        return profileCompleteness;
    }

    public void setProfileCompleteness(int profileCompleteness) {
        this.profileCompleteness = profileCompleteness;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
