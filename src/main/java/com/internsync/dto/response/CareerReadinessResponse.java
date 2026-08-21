package com.internsync.dto.response;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class CareerReadinessResponse {

    private int score;
    private String level;
    private String targetRole;
    private String badgeColor;
    private String summary;

    private List<Component> components = new ArrayList<>();
    private List<String> strengths = new ArrayList<>();
    private List<String> weaknesses = new ArrayList<>();
    private List<Recommendation> recommendations = new ArrayList<>();
    private List<TrendPoint> trend = new ArrayList<>();
    private Integer pointImprovement;
    private Instant lastUpdated;

    public CareerReadinessResponse() {
    }

    public static class Component {
        private String name;
        private String key;
        private int score;
        private int weight;
        private double weightedScore;
        private String status; // AVAILABLE, UNAVAILABLE, PARTIAL
        private String explanation;

        public Component() {
        }

        public Component(String name, String key, int score, int weight, double weightedScore, String status, String explanation) {
            this.name = name;
            this.key = key;
            this.score = score;
            this.weight = weight;
            this.weightedScore = weightedScore;
            this.status = status;
            this.explanation = explanation;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getKey() {
            return key;
        }

        public void setKey(String key) {
            this.key = key;
        }

        public int getScore() {
            return score;
        }

        public void setScore(int score) {
            this.score = score;
        }

        public int getWeight() {
            return weight;
        }

        public void setWeight(int weight) {
            this.weight = weight;
        }

        public double getWeightedScore() {
            return weightedScore;
        }

        public void setWeightedScore(double weightedScore) {
            this.weightedScore = weightedScore;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public String getExplanation() {
            return explanation;
        }

        public void setExplanation(String explanation) {
            this.explanation = explanation;
        }
    }

    public static class Recommendation {
        private String id;
        private String title;
        private String description;
        private String actionText;
        private String actionRoute;
        private String category;
        private String priority; // HIGH, MEDIUM, LOW

        public Recommendation() {
        }

        public Recommendation(String id, String title, String description, String actionText, String actionRoute, String category, String priority) {
            this.id = id;
            this.title = title;
            this.description = description;
            this.actionText = actionText;
            this.actionRoute = actionRoute;
            this.category = category;
            this.priority = priority;
        }

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public String getActionText() {
            return actionText;
        }

        public void setActionText(String actionText) {
            this.actionText = actionText;
        }

        public String getActionRoute() {
            return actionRoute;
        }

        public void setActionRoute(String actionRoute) {
            this.actionRoute = actionRoute;
        }

        public String getCategory() {
            return category;
        }

        public void setCategory(String category) {
            this.category = category;
        }

        public String getPriority() {
            return priority;
        }

        public void setPriority(String priority) {
            this.priority = priority;
        }
    }

    public static class TrendPoint {
        private String date;
        private int score;
        private String level;

        public TrendPoint() {
        }

        public TrendPoint(String date, int score, String level) {
            this.date = date;
            this.score = score;
            this.level = level;
        }

        public String getDate() {
            return date;
        }

        public void setDate(String date) {
            this.date = date;
        }

        public int getScore() {
            return score;
        }

        public void setScore(int score) {
            this.score = score;
        }

        public String getLevel() {
            return level;
        }

        public void setLevel(String level) {
            this.level = level;
        }
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public String getTargetRole() {
        return targetRole;
    }

    public void setTargetRole(String targetRole) {
        this.targetRole = targetRole;
    }

    public String getBadgeColor() {
        return badgeColor;
    }

    public void setBadgeColor(String badgeColor) {
        this.badgeColor = badgeColor;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public List<Component> getComponents() {
        return components;
    }

    public void setComponents(List<Component> components) {
        this.components = components;
    }

    public List<String> getStrengths() {
        return strengths;
    }

    public void setStrengths(List<String> strengths) {
        this.strengths = strengths;
    }

    public List<String> getWeaknesses() {
        return weaknesses;
    }

    public void setWeaknesses(List<String> weaknesses) {
        this.weaknesses = weaknesses;
    }

    public List<Recommendation> getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(List<Recommendation> recommendations) {
        this.recommendations = recommendations;
    }

    public List<TrendPoint> getTrend() {
        return trend;
    }

    public void setTrend(List<TrendPoint> trend) {
        this.trend = trend;
    }

    public Integer getPointImprovement() {
        return pointImprovement;
    }

    public void setPointImprovement(Integer pointImprovement) {
        this.pointImprovement = pointImprovement;
    }

    public Instant getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(Instant lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
}
