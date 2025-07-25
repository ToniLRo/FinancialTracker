package com.tonilr.FinancialTracker.Services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.tonilr.FinancialTracker.Entities.Users;

import java.util.List;

@Service
public class ReportSchedulerService {
    @Autowired
    private UsersServices usersService;
    
    @Autowired
    private EmailService emailService;

    @Scheduled(cron = "0 0 20 * * SUN")
    public void scheduleWeeklyReports() {
        List<Users> users = usersService.findUsersWithWeeklyReportsEnabled();
        users.forEach(user -> {
            if (user.getUserSettings() != null) {
                emailService.sendWeeklyReport(user.getUserSettings().getEmailAddress(), user.getUser_Id());
            }
        });
    }

    @Scheduled(cron = "0 0 9 1 * *")
    public void scheduleMonthlyReports() {
        List<Users> users = usersService.findUsersWithMonthlyReportsEnabled();
        users.forEach(user -> {
            if (user.getUserSettings() != null) {
                emailService.sendMonthlyReport(user.getUserSettings().getEmailAddress(), user.getUser_Id());
            }
        });
    }
}