package com.internsync.service;

import com.internsync.dto.request.UpdateProfileRequest;
import com.internsync.dto.response.UserProfileResponse;
import com.internsync.model.User;
import com.internsync.repository.UserRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserProfileResponse getUserProfileByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        return UserProfileResponse.fromUser(user);
    }

    public UserProfileResponse updateUserProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());

        // General Profile
        if (request.getBio() != null) user.setBio(request.getBio());
        if (request.getLocation() != null) user.setLocation(request.getLocation());
        if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl());
        if (request.getWebsiteUrl() != null) user.setWebsiteUrl(request.getWebsiteUrl());
        if (request.getLinkedinUrl() != null) user.setLinkedinUrl(request.getLinkedinUrl());
        if (request.getGithubUrl() != null) user.setGithubUrl(request.getGithubUrl());

        // Student specific
        if (request.getInstitutionId() != null) user.setInstitutionId(request.getInstitutionId());
        if (request.getDepartment() != null) user.setDepartment(request.getDepartment());
        if (request.getRollNumber() != null) user.setRollNumber(request.getRollNumber());
        if (request.getBatch() != null) user.setBatch(request.getBatch());
        if (request.getSkills() != null) user.setSkills(request.getSkills());
        if (request.getResumeUrl() != null) user.setResumeUrl(request.getResumeUrl());
        if (request.getGpa() != null) user.setGpa(request.getGpa());

        // Company specific
        if (request.getCompanyName() != null) user.setCompanyName(request.getCompanyName());
        if (request.getCompanyWebsite() != null) user.setCompanyWebsite(request.getCompanyWebsite());
        if (request.getCompanyLogoUrl() != null) user.setCompanyLogoUrl(request.getCompanyLogoUrl());
        if (request.getCompanyDescription() != null) user.setCompanyDescription(request.getCompanyDescription());
        if (request.getIndustry() != null) user.setIndustry(request.getIndustry());

        User updatedUser = userRepository.save(user);
        return UserProfileResponse.fromUser(updatedUser);
    }
}
