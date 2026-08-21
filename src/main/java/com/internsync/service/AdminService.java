package com.internsync.service;

import com.internsync.dto.request.AdminUpdateUserRequest;
import com.internsync.dto.response.PagedResponse;
import com.internsync.dto.response.UserProfileResponse;
import com.internsync.model.Role;
import com.internsync.model.User;
import com.internsync.model.UserStatus;
import com.internsync.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;

    public AdminService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public PagedResponse<UserProfileResponse> getAllUsers(int page, int size, Role role, UserStatus status, String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<User> userPage;

        if (role != null && status != null) {
            userPage = userRepository.findByRoleAndStatus(role, status, pageable);
        } else if (role != null) {
            userPage = userRepository.findByRole(role, pageable);
        } else if (status != null) {
            userPage = userRepository.findByStatus(status, pageable);
        } else {
            userPage = userRepository.findAll(pageable);
        }

        List<User> userList = userPage.getContent();
        if (search != null && !search.trim().isEmpty()) {
            String lowerSearch = search.trim().toLowerCase();
            userList = userList.stream().filter(u ->
                    (u.getEmail() != null && u.getEmail().toLowerCase().contains(lowerSearch)) ||
                    (u.getFirstName() != null && u.getFirstName().toLowerCase().contains(lowerSearch)) ||
                    (u.getLastName() != null && u.getLastName().toLowerCase().contains(lowerSearch)) ||
                    (u.getCompanyName() != null && u.getCompanyName().toLowerCase().contains(lowerSearch))
            ).collect(Collectors.toList());
        }

        List<UserProfileResponse> content = userList.stream()
                .map(UserProfileResponse::fromUser)
                .collect(Collectors.toList());

        return PagedResponse.fromPage(userPage, content);
    }

    public UserProfileResponse getUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        return UserProfileResponse.fromUser(user);
    }

    public UserProfileResponse updateUserStatus(String id, UserStatus newStatus) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        user.setStatus(newStatus);
        User updated = userRepository.save(user);
        return UserProfileResponse.fromUser(updated);
    }

    public UserProfileResponse updateUserByAdmin(String id, AdminUpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getRole() != null) user.setRole(request.getRole());
        if (request.getStatus() != null) user.setStatus(request.getStatus());

        // General Profile
        if (request.getBio() != null) user.setBio(request.getBio());
        if (request.getLocation() != null) user.setLocation(request.getLocation());
        if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl());
        if (request.getWebsiteUrl() != null) user.setWebsiteUrl(request.getWebsiteUrl());
        if (request.getLinkedinUrl() != null) user.setLinkedinUrl(request.getLinkedinUrl());
        if (request.getGithubUrl() != null) user.setGithubUrl(request.getGithubUrl());

        // Student fields
        if (request.getInstitutionId() != null) user.setInstitutionId(request.getInstitutionId());
        if (request.getDepartment() != null) user.setDepartment(request.getDepartment());
        if (request.getRollNumber() != null) user.setRollNumber(request.getRollNumber());
        if (request.getBatch() != null) user.setBatch(request.getBatch());
        if (request.getSkills() != null) user.setSkills(request.getSkills());
        if (request.getResumeUrl() != null) user.setResumeUrl(request.getResumeUrl());
        if (request.getGpa() != null) user.setGpa(request.getGpa());

        // Company fields
        if (request.getCompanyName() != null) user.setCompanyName(request.getCompanyName());
        if (request.getCompanyWebsite() != null) user.setCompanyWebsite(request.getCompanyWebsite());
        if (request.getCompanyLogoUrl() != null) user.setCompanyLogoUrl(request.getCompanyLogoUrl());
        if (request.getCompanyDescription() != null) user.setCompanyDescription(request.getCompanyDescription());
        if (request.getIndustry() != null) user.setIndustry(request.getIndustry());

        User updated = userRepository.save(user);
        return UserProfileResponse.fromUser(updated);
    }

    public void deleteUser(String id, String currentAdminEmail) {
        User userToDelete = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        if (userToDelete.getEmail().equalsIgnoreCase(currentAdminEmail)) {
            throw new IllegalArgumentException("Administrators cannot delete their own active account");
        }

        userRepository.delete(userToDelete);
    }
}
