package com.internsync.dto.response;

import java.util.ArrayList;
import java.util.List;

public class TPODashboardOverview {

    private long totalStudents;
    private long internshipParticipants;
    private long internshipCompletionCount;
    private long placementReadyCount;
    private long studentsNeedingIntervention;
    private long atRiskCount;
    private long convertedToJobsCount;
    private long convertedToStartupsCount;
    private double conversionToJobRate;
    private double conversionToStartupRate;
    private long trainingCompletionCount;
    private long activeTrainingsCount;
    private long activeDrivesCount;
    private List<SkillGapCount> topSkillGaps = new ArrayList<>();

    public TPODashboardOverview() {}

    public static class SkillGapCount {
        private String skill;
        private long studentCount;

        public SkillGapCount() {}

        public SkillGapCount(String skill, long studentCount) {
            this.skill = skill;
            this.studentCount = studentCount;
        }

        public String getSkill() {
            return skill;
        }

        public void setSkill(String skill) {
            this.skill = skill;
        }

        public long getStudentCount() {
            return studentCount;
        }

        public void setStudentCount(long studentCount) {
            this.studentCount = studentCount;
        }
    }

    public long getTotalStudents() {
        return totalStudents;
    }

    public void setTotalStudents(long totalStudents) {
        this.totalStudents = totalStudents;
    }

    public long getInternshipParticipants() {
        return internshipParticipants;
    }

    public void setInternshipParticipants(long internshipParticipants) {
        this.internshipParticipants = internshipParticipants;
    }

    public long getInternshipCompletionCount() {
        return internshipCompletionCount;
    }

    public void setInternshipCompletionCount(long internshipCompletionCount) {
        this.internshipCompletionCount = internshipCompletionCount;
    }

    public long getPlacementReadyCount() {
        return placementReadyCount;
    }

    public void setPlacementReadyCount(long placementReadyCount) {
        this.placementReadyCount = placementReadyCount;
    }

    public long getStudentsNeedingIntervention() {
        return studentsNeedingIntervention;
    }

    public void setStudentsNeedingIntervention(long studentsNeedingIntervention) {
        this.studentsNeedingIntervention = studentsNeedingIntervention;
    }

    public long getAtRiskCount() {
        return atRiskCount;
    }

    public void setAtRiskCount(long atRiskCount) {
        this.atRiskCount = atRiskCount;
    }

    public long getConvertedToJobsCount() {
        return convertedToJobsCount;
    }

    public void setConvertedToJobsCount(long convertedToJobsCount) {
        this.convertedToJobsCount = convertedToJobsCount;
    }

    public long getConvertedToStartupsCount() {
        return convertedToStartupsCount;
    }

    public void setConvertedToStartupsCount(long convertedToStartupsCount) {
        this.convertedToStartupsCount = convertedToStartupsCount;
    }

    public double getConversionToJobRate() {
        return conversionToJobRate;
    }

    public void setConversionToJobRate(double conversionToJobRate) {
        this.conversionToJobRate = conversionToJobRate;
    }

    public double getConversionToStartupRate() {
        return conversionToStartupRate;
    }

    public void setConversionToStartupRate(double conversionToStartupRate) {
        this.conversionToStartupRate = conversionToStartupRate;
    }

    public long getTrainingCompletionCount() {
        return trainingCompletionCount;
    }

    public void setTrainingCompletionCount(long trainingCompletionCount) {
        this.trainingCompletionCount = trainingCompletionCount;
    }

    public long getActiveTrainingsCount() {
        return activeTrainingsCount;
    }

    public void setActiveTrainingsCount(long activeTrainingsCount) {
        this.activeTrainingsCount = activeTrainingsCount;
    }

    public long getActiveDrivesCount() {
        return activeDrivesCount;
    }

    public void setActiveDrivesCount(long activeDrivesCount) {
        this.activeDrivesCount = activeDrivesCount;
    }

    public List<SkillGapCount> getTopSkillGaps() {
        return topSkillGaps;
    }

    public void setTopSkillGaps(List<SkillGapCount> topSkillGaps) {
        this.topSkillGaps = topSkillGaps;
    }
}
