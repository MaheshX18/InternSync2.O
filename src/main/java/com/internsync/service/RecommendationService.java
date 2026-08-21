package com.internsync.service;

import com.internsync.dto.response.RecommendationResponse;
import com.internsync.model.ExperienceLevel;
import com.internsync.model.Internship;
import com.internsync.model.InternshipStatus;
import com.internsync.model.User;
import com.internsync.model.WorkplaceType;
import com.internsync.repository.InternshipRepository;
import com.internsync.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    private final UserRepository userRepository;
    private final InternshipRepository internshipRepository;

    // Configurable weights (sum = 1.0)
    private double skillWeight = 0.50;
    private double roleWeight = 0.20;
    private double experienceWeight = 0.15;
    private double locationWeight = 0.10;
    private double educationWeight = 0.05;

    public RecommendationService(UserRepository userRepository, InternshipRepository internshipRepository) {
        this.userRepository = userRepository;
        this.internshipRepository = internshipRepository;
    }

    public Page<RecommendationResponse> getRecommendationsForUser(
            String userId,
            String roleFilter,
            String locationFilter,
            Integer minMatchScore,
            Pageable pageable
    ) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User profile not found"));

        List<Internship> published = internshipRepository.findByStatus(InternshipStatus.PUBLISHED, Pageable.unpaged()).getContent();

        List<RecommendationResponse> recommendations = new ArrayList<>();

        for (Internship internship : published) {
            RecommendationResponse rec = calculateRecommendation(user, internship);

            // Filter checks
            if (minMatchScore != null && rec.getMatchScore() < minMatchScore) {
                continue;
            }

            if (roleFilter != null && !roleFilter.trim().isEmpty()) {
                String rf = roleFilter.toLowerCase().trim();
                boolean matchesRole = (internship.getTitle() != null && internship.getTitle().toLowerCase().contains(rf)) ||
                        (internship.getDescription() != null && internship.getDescription().toLowerCase().contains(rf));
                if (!matchesRole) continue;
            }

            if (locationFilter != null && !locationFilter.trim().isEmpty()) {
                String lf = locationFilter.toLowerCase().trim();
                boolean matchesLoc = (internship.getLocation() != null && internship.getLocation().toLowerCase().contains(lf)) ||
                        (internship.getWorkplaceType() != null && internship.getWorkplaceType().name().toLowerCase().contains(lf));
                if (!matchesLoc) continue;
            }

            recommendations.add(rec);
        }

        // Sort by match score descending
        recommendations.sort((a, b) -> Integer.compare(b.getMatchScore(), a.getMatchScore()));

        // Pagination
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), recommendations.size());

        List<RecommendationResponse> pagedContent = (start <= end && start < recommendations.size())
                ? recommendations.subList(start, end)
                : Collections.emptyList();

        return new PageImpl<>(pagedContent, pageable, recommendations.size());
    }

    public RecommendationResponse calculateRecommendation(User user, Internship internship) {
        List<String> studentSkills = user.getSkills() != null ? user.getSkills() : Collections.emptyList();
        List<String> studentSkillsLower = studentSkills.stream().map(String::toLowerCase).collect(Collectors.toList());

        List<String> requiredSkills = internship.getRequiredSkills() != null ? internship.getRequiredSkills() : Collections.emptyList();

        List<String> matchedSkills = new ArrayList<>();
        List<String> missingSkills = new ArrayList<>();

        // 1. SKILL MATCH (50%)
        double skillMatchPct = 0;
        if (!requiredSkills.isEmpty()) {
            for (String req : requiredSkills) {
                String reqLower = req.toLowerCase().trim();
                boolean match = studentSkillsLower.stream().anyMatch(s -> s.contains(reqLower) || reqLower.contains(s));
                if (match) {
                    matchedSkills.add(req);
                } else {
                    missingSkills.add(req);
                }
            }
            skillMatchPct = ((double) matchedSkills.size() / requiredSkills.size()) * 100.0;
        } else {
            skillMatchPct = studentSkills.isEmpty() ? 50.0 : 80.0;
        }

        // 2. ROLE MATCH (20%)
        double roleMatchPct = 70.0;
        String titleLower = internship.getTitle() != null ? internship.getTitle().toLowerCase() : "";
        String deptLower = user.getDepartment() != null ? user.getDepartment().toLowerCase() : "";
        String bioLower = user.getBio() != null ? user.getBio().toLowerCase() : "";

        if (!deptLower.isEmpty() && titleLower.contains(deptLower)) {
            roleMatchPct = 100.0;
        } else if (!studentSkillsLower.isEmpty() && studentSkillsLower.stream().anyMatch(s -> titleLower.contains(s))) {
            roleMatchPct = 90.0;
        } else if (!bioLower.isEmpty() && titleLower.split(" ").length > 0 && Arrays.stream(titleLower.split(" ")).anyMatch(bioLower::contains)) {
            roleMatchPct = 85.0;
        }

        // 3. EXPERIENCE MATCH (15%)
        double expMatchPct = 90.0;
        if (internship.getExperienceLevel() == ExperienceLevel.ENTRY_LEVEL) {
            expMatchPct = 100.0;
        } else if (internship.getExperienceLevel() == ExperienceLevel.JUNIOR) {
            expMatchPct = 85.0;
        } else if (internship.getExperienceLevel() == ExperienceLevel.MID_LEVEL) {
            expMatchPct = studentSkills.size() >= 4 ? 80.0 : 60.0;
        }

        // 4. LOCATION MATCH (10%)
        double locMatchPct = 60.0;
        if (internship.getWorkplaceType() == WorkplaceType.REMOTE) {
            locMatchPct = 100.0;
        } else if (user.getLocation() != null && internship.getLocation() != null) {
            if (internship.getLocation().toLowerCase().contains(user.getLocation().toLowerCase()) ||
                    user.getLocation().toLowerCase().contains(internship.getLocation().toLowerCase())) {
                locMatchPct = 100.0;
            }
        } else {
            locMatchPct = 75.0;
        }

        // 5. EDUCATION MATCH (5%)
        double eduMatchPct = 75.0;
        if (user.getGpa() != null) {
            if (user.getGpa() >= 3.5) eduMatchPct = 100.0;
            else if (user.getGpa() >= 3.0) eduMatchPct = 85.0;
            else eduMatchPct = 70.0;
        }

        double totalScore = (skillMatchPct * skillWeight) +
                (roleMatchPct * roleWeight) +
                (expMatchPct * experienceWeight) +
                (locMatchPct * locationWeight) +
                (eduMatchPct * educationWeight);

        int finalScore = Math.min(100, Math.max(0, (int) Math.round(totalScore)));

        List<String> whyMatches = new ArrayList<>();
        if (!matchedSkills.isEmpty()) {
            whyMatches.add("✓ Skills match: " + String.join(", ", matchedSkills));
        }
        if (roleMatchPct >= 80) {
            whyMatches.add("✓ Role aligns with your study/profile background");
        }
        if (internship.getWorkplaceType() == WorkplaceType.REMOTE) {
            whyMatches.add("✓ Flexible remote workspace option");
        } else if (locMatchPct >= 90) {
            whyMatches.add("✓ Preferred location match: " + internship.getLocation());
        }
        if (user.getGpa() != null && user.getGpa() >= 3.2) {
            whyMatches.add("✓ Strong academic performance (GPA: " + String.format("%.2f", user.getGpa()) + ")");
        }
        if (whyMatches.isEmpty()) {
            whyMatches.add("✓ Open entry-level position matching university students");
        }

        return new RecommendationResponse(
                internship,
                finalScore,
                (int) Math.round(skillMatchPct),
                (int) Math.round(roleMatchPct),
                (int) Math.round(expMatchPct),
                (int) Math.round(locMatchPct),
                (int) Math.round(eduMatchPct),
                matchedSkills,
                missingSkills,
                whyMatches
        );
    }
}
