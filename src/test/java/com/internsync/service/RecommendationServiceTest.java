package com.internsync.service;

import com.internsync.dto.response.RecommendationResponse;
import com.internsync.model.Internship;
import com.internsync.model.InternshipStatus;
import com.internsync.model.User;
import com.internsync.model.WorkplaceType;
import com.internsync.repository.InternshipRepository;
import com.internsync.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.Arrays;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;

public class RecommendationServiceTest {

    private UserRepository userRepository;
    private InternshipRepository internshipRepository;
    private RecommendationService recommendationService;

    @BeforeEach
    public void setUp() {
        userRepository = Mockito.mock(UserRepository.class);
        internshipRepository = Mockito.mock(InternshipRepository.class);
        recommendationService = new RecommendationService(userRepository, internshipRepository);
    }

    @Test
    public void testHighMatchScoreForMatchingStudent() {
        User student = new User();
        student.setId("std_100");
        student.setSkills(Arrays.asList("Java", "Spring Boot", "React", "MongoDB"));
        student.setDepartment("Computer Science");
        student.setLocation("New York");
        student.setGpa(3.8);

        Internship internship = new Internship();
        internship.setId("int_200");
        internship.setTitle("Java Backend Developer Intern");
        internship.setRequiredSkills(Arrays.asList("Java", "Spring Boot"));
        internship.setLocation("New York");
        internship.setWorkplaceType(WorkplaceType.HYBRID);
        internship.setStatus(InternshipStatus.PUBLISHED);

        RecommendationResponse response = recommendationService.calculateRecommendation(student, internship);

        assertNotNull(response);
        assertTrue(response.getMatchScore() >= 80, "Expected match score >= 80 for strong match, got " + response.getMatchScore());
        assertEquals(100, response.getSkillMatchPercentage());
        assertEquals(2, response.getMatchedSkills().size());
        assertTrue(response.getMissingSkills().isEmpty());
        assertTrue(response.getWhyMatches().size() > 0);
    }

    @Test
    public void testPartialMatchScore() {
        User student = new User();
        student.setId("std_101");
        student.setSkills(Collections.singletonList("Python"));

        Internship internship = new Internship();
        internship.setId("int_201");
        internship.setTitle("Full Stack Engineer Intern");
        internship.setRequiredSkills(Arrays.asList("Java", "Spring Boot", "React", "Python"));
        internship.setStatus(InternshipStatus.PUBLISHED);

        RecommendationResponse response = recommendationService.calculateRecommendation(student, internship);

        assertNotNull(response);
        assertEquals(25, response.getSkillMatchPercentage());
        assertEquals(1, response.getMatchedSkills().size());
        assertEquals(3, response.getMissingSkills().size());
    }
}
