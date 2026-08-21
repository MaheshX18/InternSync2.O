package com.internsync.dto.response;

public class DepartmentAnalytics {

    private String department;
    private long totalStudents;
    private double averageGpa;
    private double averageReadiness;
    private long placedCount;
    private double placementRate;
    private long atRiskCount;

    public DepartmentAnalytics() {}

    public DepartmentAnalytics(String department, long totalStudents, double averageGpa, double averageReadiness, long placedCount, double placementRate, long atRiskCount) {
        this.department = department;
        this.totalStudents = totalStudents;
        this.averageGpa = averageGpa;
        this.averageReadiness = averageReadiness;
        this.placedCount = placedCount;
        this.placementRate = placementRate;
        this.atRiskCount = atRiskCount;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public long getTotalStudents() {
        return totalStudents;
    }

    public void setTotalStudents(long totalStudents) {
        this.totalStudents = totalStudents;
    }

    public double getAverageGpa() {
        return averageGpa;
    }

    public void setAverageGpa(double averageGpa) {
        this.averageGpa = averageGpa;
    }

    public double getAverageReadiness() {
        return averageReadiness;
    }

    public void setAverageReadiness(double averageReadiness) {
        this.averageReadiness = averageReadiness;
    }

    public long getPlacedCount() {
        return placedCount;
    }

    public void setPlacedCount(long placedCount) {
        this.placedCount = placedCount;
    }

    public double getPlacementRate() {
        return placementRate;
    }

    public void setPlacementRate(double placementRate) {
        this.placementRate = placementRate;
    }

    public long getAtRiskCount() {
        return atRiskCount;
    }

    public void setAtRiskCount(long atRiskCount) {
        this.atRiskCount = atRiskCount;
    }
}
