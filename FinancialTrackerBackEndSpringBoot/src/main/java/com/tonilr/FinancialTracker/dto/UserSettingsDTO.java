package com.tonilr.FinancialTracker.dto;

public class UserSettingsDTO {
    private Long settings_id;
    private Long userId;
    private boolean emailNotificationsEnabled;
    private boolean weeklyReportEnabled;
    private boolean monthlyReportEnabled;
    private String emailAddress;

    // Constructor
    public UserSettingsDTO() {}

    // Getters y Setters
    public Long getSettings_id() { return settings_id; }
    public void setSettings_id(Long settings_id) { this.settings_id = settings_id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public boolean isEmailNotificationsEnabled() { return emailNotificationsEnabled; }
    public void setEmailNotificationsEnabled(boolean value) { this.emailNotificationsEnabled = value; }

    public boolean isWeeklyReportEnabled() { return weeklyReportEnabled; }
    public void setWeeklyReportEnabled(boolean value) { this.weeklyReportEnabled = value; }

    public boolean isMonthlyReportEnabled() { return monthlyReportEnabled; }
    public void setMonthlyReportEnabled(boolean value) { this.monthlyReportEnabled = value; }

    public String getEmailAddress() { return emailAddress; }
    public void setEmailAddress(String value) { this.emailAddress = value; }
}
