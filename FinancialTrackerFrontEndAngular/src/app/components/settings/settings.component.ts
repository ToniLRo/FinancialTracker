import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { UsersService } from 'src/app/services/users/users.service';

@Component({
    selector: 'settings', 
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.css'],
    standalone: false
})
export class SettingsComponent implements OnInit {
    notificationSettings = {
        emailNotificationsEnabled: false,
        weeklyReportEnabled: false,
        monthlyReportEnabled: false,
        emailAddress: ''
    };

    constructor(
        private authService: AuthService,
        private userService: UsersService
    ) {}

    ngOnInit() {
        // Cargar configuración actual
        this.loadUserSettings();
    }
    
    loadUserSettings() {
        const userId = this.authService.getCurrentUser()?.userId;
        if (!userId) {
            console.error('User ID is undefined');
            return;
        }
        this.userService.getUserSettings(userId).subscribe({
            next: (settings) => {
                this.notificationSettings = settings;
            },
            error: (err) => console.error('Error loading settings:', err)
        });
    }

    saveSettings() {
        const userId = this.authService.getCurrentUser()?.userId;
        if (!userId) {
            console.error('User ID is undefined');
            return;
        }
        this.userService.updateUserSettings(userId, this.notificationSettings).subscribe({
            next: () => {
                console.log('Settings saved successfully');
                // Mostrar mensaje de éxito
            },
            error: (err) => console.error('Error saving settings:', err)
        });
    }
}
