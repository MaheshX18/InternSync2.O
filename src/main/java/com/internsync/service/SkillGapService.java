package com.internsync.service;

import com.internsync.exception.ResourceNotFoundException;
import com.internsync.model.*;
import com.internsync.repository.InternshipRepository;
import com.internsync.repository.LearningRoadmapRepository;
import com.internsync.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SkillGapService {

    private final UserRepository userRepository;
    private final InternshipRepository internshipRepository;
    private final LearningRoadmapRepository roadmapRepository;

    // Role -> Skill Requirements Catalog
    private static final Map<String, List<String>> ROLE_SKILLS_CATALOG = new LinkedHashMap<>();
    private static final Map<String, String> ROLE_DESCRIPTIONS = new HashMap<>();

    static {
        ROLE_SKILLS_CATALOG.put("Backend Developer", Arrays.asList("Java", "Spring Boot", "REST APIs", "SQL", "MongoDB", "Docker", "Redis", "AWS", "Git", "Testing"));
        ROLE_DESCRIPTIONS.put("Backend Developer", "Build robust server-side applications, APIs, database architectures, and cloud services.");

        ROLE_SKILLS_CATALOG.put("Frontend Developer", Arrays.asList("HTML", "CSS", "JavaScript", "React", "TypeScript", "Git", "REST APIs", "Tailwind CSS", "Redux"));
        ROLE_DESCRIPTIONS.put("Frontend Developer", "Create engaging, accessible, and high-performance user interfaces and web applications.");

        ROLE_SKILLS_CATALOG.put("Full Stack Developer", Arrays.asList("JavaScript", "TypeScript", "React", "Node.js", "Express", "MongoDB", "SQL", "REST APIs", "Docker", "Git"));
        ROLE_DESCRIPTIONS.put("Full Stack Developer", "Develop complete web applications covering frontend UI, backend APIs, and database design.");

        ROLE_SKILLS_CATALOG.put("Java Developer", Arrays.asList("Java", "Spring Boot", "Spring", "SQL", "PostgreSQL", "REST APIs", "Git", "JUnit", "Microservices"));
        ROLE_DESCRIPTIONS.put("Java Developer", "Specialize in enterprise Java applications, microservices, Spring ecosystem, and data layers.");

        ROLE_SKILLS_CATALOG.put("Python Developer", Arrays.asList("Python", "Django", "Flask", "FastAPI", "SQL", "PostgreSQL", "REST APIs", "Git", "Docker"));
        ROLE_DESCRIPTIONS.put("Python Developer", "Construct scalable web APIs, automation scripts, and backend integrations using Python.");

        ROLE_SKILLS_CATALOG.put("Data Analyst", Arrays.asList("Python", "SQL", "Pandas", "NumPy", "Data Visualization", "Excel", "Statistics", "R"));
        ROLE_DESCRIPTIONS.put("Data Analyst", "Extract insights, analyze data trends, create dashboards, and solve business intelligence questions.");

        ROLE_SKILLS_CATALOG.put("Data Scientist", Arrays.asList("Python", "NumPy", "Pandas", "Scikit-learn", "Statistics", "SQL", "Machine Learning", "Data Visualization"));
        ROLE_DESCRIPTIONS.put("Data Scientist", "Build predictive statistical models, machine learning pipelines, and analyze complex datasets.");

        ROLE_SKILLS_CATALOG.put("ML Engineer", Arrays.asList("Python", "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Scikit-learn", "SQL", "Docker", "Git"));
        ROLE_DESCRIPTIONS.put("ML Engineer", "Deploy, optimize, and maintain machine learning models in production environments.");

        ROLE_SKILLS_CATALOG.put("AI Engineer", Arrays.asList("Python", "AI", "NLP", "Deep Learning", "PyTorch", "TensorFlow", "REST APIs", "Docker", "Git"));
        ROLE_DESCRIPTIONS.put("AI Engineer", "Implement generative AI, natural language processing, and neural network solutions.");

        ROLE_SKILLS_CATALOG.put("DevOps Engineer", Arrays.asList("Docker", "Kubernetes", "AWS", "Linux", "CI/CD", "Terraform", "Git", "GCP"));
        ROLE_DESCRIPTIONS.put("DevOps Engineer", "Automate deployment pipelines, cloud infrastructure, container orchestration, and monitoring.");
    }

    public SkillGapService(UserRepository userRepository,
                           InternshipRepository internshipRepository,
                           LearningRoadmapRepository roadmapRepository) {
        this.userRepository = userRepository;
        this.internshipRepository = internshipRepository;
        this.roadmapRepository = roadmapRepository;
    }

    public List<Map<String, Object>> getAvailableRoles() {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<String, List<String>> entry : ROLE_SKILLS_CATALOG.entrySet()) {
            Map<String, Object> item = new HashMap<>();
            item.put("role", entry.getKey());
            item.put("description", ROLE_DESCRIPTIONS.getOrDefault(entry.getKey(), "Target career path"));
            item.put("keySkills", entry.getValue());
            result.add(item);
        }
        return result;
    }

    public List<String> getRoleSkills(String targetRole) {
        if (targetRole != null && ROLE_SKILLS_CATALOG.containsKey(targetRole)) {
            return ROLE_SKILLS_CATALOG.get(targetRole);
        }
        return ROLE_SKILLS_CATALOG.getOrDefault("Backend Developer", Arrays.asList("Java", "Spring Boot", "REST APIs", "SQL"));
    }

    public LearningRoadmap getOrCreateRoadmap(String userId, String requestedRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        String targetRole = (requestedRole != null && !requestedRole.trim().isEmpty() && ROLE_SKILLS_CATALOG.containsKey(requestedRole.trim()))
                ? requestedRole.trim()
                : (user.getPreferredRole() != null ? user.getPreferredRole() : "Backend Developer");

        // Save target role preference to user profile
        if (!targetRole.equals(user.getPreferredRole())) {
            user.setPreferredRole(targetRole);
            userRepository.save(user);
        }

        LearningRoadmap roadmap = roadmapRepository.findByUserId(userId)
                .orElseGet(() -> new LearningRoadmap(userId, targetRole));

        roadmap.setTargetRole(targetRole);

        // Generate / Update Roadmap items dynamically
        return generateOrUpdateRoadmap(user, roadmap);
    }

    public LearningRoadmap generateOrUpdateRoadmap(User user, LearningRoadmap roadmap) {
        String targetRole = roadmap.getTargetRole();
        List<String> roleSkills = ROLE_SKILLS_CATALOG.getOrDefault(targetRole, ROLE_SKILLS_CATALOG.get("Backend Developer"));

        List<String> studentSkills = user.getSkills() != null ? user.getSkills() : new ArrayList<>();
        List<String> studentSkillsLower = studentSkills.stream().map(String::toLowerCase).collect(Collectors.toList());

        List<Internship> published = internshipRepository.findByStatus(InternshipStatus.PUBLISHED);

        // Map existing item status by skill to preserve completed progress
        Map<String, LearningRoadmap.RoadmapItem> existingItemsMap = new HashMap<>();
        if (roadmap.getItems() != null) {
            for (LearningRoadmap.RoadmapItem item : roadmap.getItems()) {
                if (item.getSkill() != null) {
                    existingItemsMap.put(item.getSkill().toLowerCase(), item);
                }
            }
        }

        List<LearningRoadmap.RoadmapItem> updatedItems = new ArrayList<>();
        List<String> missingRoleSkills = new ArrayList<>();
        int matchedSkillsCount = 0;

        for (String roleSkill : roleSkills) {
            boolean hasSkill = studentSkillsLower.stream().anyMatch(s ->
                    s.equalsIgnoreCase(roleSkill) || s.contains(roleSkill.toLowerCase()) || roleSkill.toLowerCase().contains(s));

            if (hasSkill) {
                matchedSkillsCount++;
            } else {
                missingRoleSkills.add(roleSkill);
            }
        }

        // Readiness score formula based on role skills matched + current profile
        int readinessScore = (int) Math.round(((double) matchedSkillsCount / roleSkills.size()) * 100);

        // Calculate metrics for missing skills
        int currentMatchingCount = countMatchingInternships(published, studentSkills);

        for (int i = 0; i < roleSkills.size(); i++) {
            String skill = roleSkills.get(i);
            String skillLower = skill.toLowerCase();

            boolean hasUserSkill = studentSkillsLower.stream().anyMatch(s -> s.equalsIgnoreCase(skillLower) || s.contains(skillLower) || skillLower.contains(s));

            // 1. Internship requirement count
            int requiredByCount = (int) published.stream().filter(j ->
                    j.getRequiredSkills() != null && j.getRequiredSkills().stream().anyMatch(s -> s.equalsIgnoreCase(skill) || s.toLowerCase().contains(skillLower))
            ).count();

            // 2. Role importance (first 4 skills are HIGH, next 3 MEDIUM, rest LOW)
            int skillIndex = roleSkills.indexOf(skill);
            String importance = (skillIndex >= 0 && skillIndex < 4) ? "HIGH" : (skillIndex < 7 ? "MEDIUM" : "LOW");

            // 3. Potential Opportunity (+ additional internship matches)
            List<String> simulatedSkills = new ArrayList<>(studentSkills);
            simulatedSkills.add(skill);
            int simulatedMatchingCount = countMatchingInternships(published, simulatedSkills);
            int potentialOpportunity = Math.max(0, simulatedMatchingCount - currentMatchingCount);

            // 4. Explainable Priority Calculation
            String priority = "MEDIUM";
            if (requiredByCount >= 5 || potentialOpportunity >= 4 || ("HIGH".equals(importance) && requiredByCount >= 2)) {
                priority = "HIGH";
            } else if (requiredByCount < 2 && !"HIGH".equals(importance) && potentialOpportunity < 2) {
                priority = "LOW";
            }

            String priorityReason = "Required by " + requiredByCount + " active internships for " + targetRole +
                    (potentialOpportunity > 0 ? " (+" + potentialOpportunity + " potential matches)" : "");

            // Reuse or build new roadmap item
            LearningRoadmap.RoadmapItem existingItem = existingItemsMap.get(skillLower);

            String status = "NOT_STARTED";
            int progress = 0;
            String skillLevel = "UNKNOWN";

            if (existingItem != null) {
                status = existingItem.getStatus() != null ? existingItem.getStatus() : "NOT_STARTED";
                progress = existingItem.getProgress();
                skillLevel = existingItem.getSkillLevel() != null ? existingItem.getSkillLevel() : "UNKNOWN";
            }

            if (hasUserSkill || "COMPLETED".equals(status)) {
                status = "COMPLETED";
                progress = 100;
                if ("UNKNOWN".equals(skillLevel)) {
                    skillLevel = "INTERMEDIATE";
                }
            }

            LearningRoadmap.RoadmapItem item = new LearningRoadmap.RoadmapItem();
            item.setItemId(existingItem != null ? existingItem.getItemId() : "item-" + UUID.randomUUID().toString().substring(0, 8));
            item.setSkill(skill);
            item.setPriority(priority);
            item.setWeek(Math.min(i + 1, 4)); // Map to week 1..4
            item.setTitle("Master " + skill + " for " + targetRole);
            item.setDescription(getSkillDescription(skill, targetRole));
            item.setLearningObjectives(getSkillObjectives(skill));
            item.setPracticeTask(getPracticeTask(skill, targetRole));
            item.setRequiredByCount(requiredByCount);
            item.setRoleImportance(importance);
            item.setPotentialOpportunity(potentialOpportunity);
            item.setPriorityReason(priorityReason);
            item.setStatus(status);
            item.setProgress(progress);
            item.setSkillLevel(skillLevel);
            item.setResources(getSkillResources(skill));

            updatedItems.add(item);
        }

        // Sort items by priority (HIGH, MEDIUM, LOW) then by requiredByCount desc
        updatedItems.sort((a, b) -> {
            int pA = "HIGH".equals(a.getPriority()) ? 3 : ("MEDIUM".equals(a.getPriority()) ? 2 : 1);
            int pB = "HIGH".equals(b.getPriority()) ? 3 : ("MEDIUM".equals(b.getPriority()) ? 2 : 1);
            if (pA != pB) return Integer.compare(pB, pA);
            return Integer.compare(b.getRequiredByCount(), a.getRequiredByCount());
        });

        // Re-assign weeks sequentially
        for (int idx = 0; idx < updatedItems.size(); idx++) {
            updatedItems.get(idx).setWeek(Math.min(idx + 1, 4));
        }

        roadmap.setReadinessScore(readinessScore);
        roadmap.setItems(updatedItems);
        roadmap.setUpdatedAt(Instant.now());

        return roadmapRepository.save(roadmap);
    }

    public LearningRoadmap updateItemStatus(String userId, String itemId, String status, Integer progress) {
        LearningRoadmap roadmap = roadmapRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Roadmap", "userId", userId));

        LearningRoadmap.RoadmapItem targetItem = null;
        for (LearningRoadmap.RoadmapItem item : roadmap.getItems()) {
            if (itemId.equals(item.getItemId()) || (item.getSkill() != null && itemId.equalsIgnoreCase(item.getSkill()))) {
                targetItem = item;
                break;
            }
        }

        if (targetItem == null) {
            throw new ResourceNotFoundException("RoadmapItem", "itemId", itemId);
        }

        String newStatus = status != null ? status.toUpperCase() : targetItem.getStatus();
        targetItem.setStatus(newStatus);

        if ("COMPLETED".equals(newStatus)) {
            targetItem.setProgress(100);
            targetItem.setSkillLevel("INTERMEDIATE");

            // Sync skill to User.skills
            User user = userRepository.findById(userId).orElse(null);
            if (user != null) {
                List<String> skills = user.getSkills() != null ? new ArrayList<>(user.getSkills()) : new ArrayList<>();
                final String targetSkill = targetItem.getSkill();
                boolean exists = targetSkill != null && skills.stream().anyMatch(s -> s.equalsIgnoreCase(targetSkill));
                if (!exists && targetSkill != null) {
                    skills.add(targetSkill);
                    user.setSkills(skills);
                    userRepository.save(user);
                }
            }
        } else if ("IN_PROGRESS".equals(newStatus)) {
            targetItem.setProgress(progress != null ? progress : 50);
            if ("UNKNOWN".equals(targetItem.getSkillLevel())) {
                targetItem.setSkillLevel("BEGINNER");
            }
        } else {
            targetItem.setProgress(0);
        }

        roadmap.setUpdatedAt(Instant.now());
        roadmapRepository.save(roadmap);

        // Recalculate roadmap & readiness
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return generateOrUpdateRoadmap(user, roadmap);
    }

    public LearningRoadmap updateSkillLevel(String userId, String skill, String level) {
        LearningRoadmap roadmap = roadmapRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Roadmap", "userId", userId));

        if (roadmap.getSkillLevels() == null) {
            roadmap.setSkillLevels(new HashMap<>());
        }

        String cleanLevel = level != null ? level.toUpperCase() : "INTERMEDIATE";
        roadmap.getSkillLevels().put(skill, cleanLevel);

        for (LearningRoadmap.RoadmapItem item : roadmap.getItems()) {
            if (skill.equalsIgnoreCase(item.getSkill())) {
                item.setSkillLevel(cleanLevel);
            }
        }

        roadmap.setUpdatedAt(Instant.now());
        roadmapRepository.save(roadmap);

        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return generateOrUpdateRoadmap(user, roadmap);
    }

    public Map<String, Object> getSkillGapAnalysis(String userId, String requestedRole) {
        LearningRoadmap roadmap = getOrCreateRoadmap(userId, requestedRole);
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        List<String> studentSkills = user.getSkills() != null ? user.getSkills() : new ArrayList<>();
        List<Internship> published = internshipRepository.findByStatus(InternshipStatus.PUBLISHED);
        int totalMatching = countMatchingInternships(published, studentSkills);

        Map<String, Object> response = new HashMap<>();
        response.put("userId", userId);
        response.put("targetRole", roadmap.getTargetRole());
        response.put("readinessScore", roadmap.getReadinessScore());
        response.put("currentSkills", studentSkills);
        response.put("totalMatchingInternships", totalMatching);
        response.put("gaps", roadmap.getItems());

        return response;
    }

    private int countMatchingInternships(List<Internship> internships, List<String> studentSkills) {
        int count = 0;
        List<String> lowerSkills = studentSkills.stream().map(String::toLowerCase).collect(Collectors.toList());

        for (Internship job : internships) {
            List<String> reqs = job.getRequiredSkills() != null ? job.getRequiredSkills() : new ArrayList<>();
            if (reqs.isEmpty()) {
                count++;
                continue;
            }
            long matched = reqs.stream().filter(r -> lowerSkills.stream().anyMatch(s -> s.equalsIgnoreCase(r) || s.contains(r.toLowerCase()) || r.toLowerCase().contains(s))).count();
            if ((double) matched / reqs.size() >= 0.5) {
                count++;
            }
        }
        return count;
    }

    private String getSkillDescription(String skill, String role) {
        return "Core technical requirement for " + role + ". Master " + skill + " to pass company technical screens and build industry-grade projects.";
    }

    private List<String> getSkillObjectives(String skill) {
        return Arrays.asList(
                "Understand fundamental concepts and core syntax of " + skill,
                "Implement hands-on architecture patterns and integration workflows",
                "Apply best practices for production deployment, debugging, and performance"
        );
    }

    private String getPracticeTask(String skill, String role) {
        return "Build and deploy a feature module using " + skill + " integrated into a full-stack " + role + " project.";
    }

    private List<LearningRoadmap.LearningResource> getSkillResources(String skill) {
        List<LearningRoadmap.LearningResource> resources = new ArrayList<>();
        String s = skill.toLowerCase();

        if (s.contains("docker")) {
            resources.add(new LearningRoadmap.LearningResource("Docker Official Documentation", "Docker Docs", "https://docs.docker.com/get-started/", "BEGINNER"));
            resources.add(new LearningRoadmap.LearningResource("Containerizing Spring Boot Apps", "Spring Guides", "https://spring.io/guides/gs/spring-boot-docker/", "INTERMEDIATE"));
        } else if (s.contains("redis")) {
            resources.add(new LearningRoadmap.LearningResource("Redis Official Documentation", "Redis Docs", "https://redis.io/docs/", "BEGINNER"));
            resources.add(new LearningRoadmap.LearningResource("Caching with Spring Boot & Redis", "Baeldung", "https://www.baeldung.com/spring-boot-redis-cache", "INTERMEDIATE"));
        } else if (s.contains("aws")) {
            resources.add(new LearningRoadmap.LearningResource("AWS Cloud Practitioner Essentials", "AWS Training", "https://aws.amazon.com/getting-started/", "BEGINNER"));
            resources.add(new LearningRoadmap.LearningResource("Deploying Spring Boot to AWS EC2", "AWS Docs", "https://aws.amazon.com/developer/language/java/", "INTERMEDIATE"));
        } else if (s.contains("react")) {
            resources.add(new LearningRoadmap.LearningResource("React Official Documentation", "React Docs", "https://react.dev", "BEGINNER"));
            resources.add(new LearningRoadmap.LearningResource("Full Stack React & TypeScript", "MDN", "https://developer.mozilla.org/en-US/docs/Learn/JavaScript", "INTERMEDIATE"));
        } else {
            resources.add(new LearningRoadmap.LearningResource(skill + " Official Guide & Best Practices", "Official Docs", "https://developer.mozilla.org", "BEGINNER"));
            resources.add(new LearningRoadmap.LearningResource("Hands-on " + skill + " Project Tutorial", "FreeCodeCamp", "https://www.freecodecamp.org", "INTERMEDIATE"));
        }
        return resources;
    }
}
