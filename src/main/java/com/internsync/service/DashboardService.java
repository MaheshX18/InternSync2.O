package com.internsync.service;

import com.internsync.dto.response.AdminDashboardResponse;
import com.internsync.dto.response.CompanyDashboardResponse;
import com.internsync.dto.response.StudentDashboardResponse;
import com.internsync.dto.response.UserProfileResponse;
import com.internsync.model.Role;
import com.internsync.model.User;
import com.internsync.model.UserStatus;
import com.internsync.repository.UserRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final UserRepository userRepository;

    public DashboardService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public StudentDashboardResponse getStudentDashboard(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        UserProfileResponse profileResponse = UserProfileResponse.fromUser(user);

        StudentDashboardResponse response = new StudentDashboardResponse();
        response.setUserProfile(profileResponse);
        response.setProfileCompleteness(profileResponse.getProfileCompleteness());
        response.setSkillsCount(user.getSkills() != null ? user.getSkills().size() : 0);
        response.setHasResume(user.getResumeUrl() != null && !user.getResumeUrl().trim().isEmpty());
        response.setGpa(user.getGpa());
        response.setDepartment(user.getDepartment());
        response.setInstitutionId(user.getInstitutionId());
        response.setBatch(user.getBatch());
        response.setApplicationsCount(0);
        response.setSavedInternshipsCount(0);

        return response;
    }

    public CompanyDashboardResponse getCompanyDashboard(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        UserProfileResponse profileResponse = UserProfileResponse.fromUser(user);

        CompanyDashboardResponse response = new CompanyDashboardResponse();
        response.setUserProfile(profileResponse);
        response.setProfileCompleteness(profileResponse.getProfileCompleteness());
        response.setCompanyName(user.getCompanyName() != null ? user.getCompanyName() : user.getFirstName() + "'s Company");
        response.setIndustry(user.getIndustry());
        response.setActiveJobPostingsCount(0);
        response.setTotalApplicantsCount(0);
        response.setPendingReviewsCount(0);

        return response;
    }

    public AdminDashboardResponse getAdminDashboard() {
        AdminDashboardResponse response = new AdminDashboardResponse();

        response.setTotalUsers(userRepository.count());
        response.setTotalStudents(userRepository.countByRole(Role.STUDENT));
        response.setTotalCompanies(userRepository.countByRole(Role.COMPANY));
        response.setTotalAdmins(userRepository.countByRole(Role.ADMIN));

        response.setActiveUsers(userRepository.countByStatus(UserStatus.ACTIVE));
        response.setInactiveUsers(userRepository.countByStatus(UserStatus.INACTIVE));
        response.setSuspendedUsers(userRepository.countByStatus(UserStatus.SUSPENDED));

        List<UserProfileResponse> recent = userRepository.findTop5ByOrderByCreatedAtDesc()
                .stream()
                .map(UserProfileResponse::fromUser)
                .collect(Collectors.toList());

        response.setRecentRegistrations(recent);

        return response;
    }
}
