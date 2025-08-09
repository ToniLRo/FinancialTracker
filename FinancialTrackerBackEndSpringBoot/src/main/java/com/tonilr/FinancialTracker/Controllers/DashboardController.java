package com.tonilr.FinancialTracker.Controllers;

import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.tonilr.FinancialTracker.Services.DashboardServices;
import com.tonilr.FinancialTracker.Services.UsersServices;
import com.tonilr.FinancialTracker.Entities.Users;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    @Autowired
    private DashboardServices dashboardService;
    
    @Autowired
    private UsersServices usersService;

    @GetMapping("/data")
    public ResponseEntity<Map<String, Object>> getDashboardData() {
        try {
            //Obtener usuario autenticado
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            Users user = usersService.findUserByUsername(username);
            
            Map<String, Object> dashboardData = dashboardService.getDashboardData(user.getUser_Id());
            return new ResponseEntity<>(dashboardData, HttpStatus.OK);
            
        } catch (Exception e) {
            System.err.println("Error getting dashboard data: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
