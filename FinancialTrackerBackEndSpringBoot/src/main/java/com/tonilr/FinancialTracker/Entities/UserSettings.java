package com.tonilr.FinancialTracker.Entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

@Entity
@Table(name = "user_settings")
public class UserSettings {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long settings_id; // Cambiado de id a settings_id para evitar confusión
    
    @JsonBackReference
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "user_Id")
    private Users user;
    
    private boolean emailNotificationsEnabled;
    private boolean weeklyReportEnabled;
    private boolean monthlyReportEnabled;
    private String emailAddress;

    // Getters y Setters
    public Long getSettings_id() { return settings_id; }
    public void setSettings_id(Long settings_id) { this.settings_id = settings_id; }
    
    public Users getUser() { return user; }
    public void setUser(Users user) { this.user = user; }
    
    public boolean isEmailNotificationsEnabled() { return emailNotificationsEnabled; }
    public void setEmailNotificationsEnabled(boolean value) { this.emailNotificationsEnabled = value; }
    
    public boolean isWeeklyReportEnabled() { return weeklyReportEnabled; }
    public void setWeeklyReportEnabled(boolean value) { this.weeklyReportEnabled = value; }
    
    public boolean isMonthlyReportEnabled() { return monthlyReportEnabled; }
    public void setMonthlyReportEnabled(boolean value) { this.monthlyReportEnabled = value; }
    
    public String getEmailAddress() { return emailAddress; }
    public void setEmailAddress(String value) { this.emailAddress = value; }
} 