import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { UsersService } from 'src/app/services/users/users.service';

@Component({
    selector: 'settings', 
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.css'],
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class SettingsComponent implements OnInit {
    notificationSettings = {
        emailNotificationsEnabled: false,
        weeklyReportEnabled: false,
        monthlyReportEnabled: false,
        emailAddress: ''  // Este campo debería inicializarse con el email del usuario
    };

    constructor(
        private authService: AuthService,
        private userService: UsersService
    ) {}

    ngOnInit() {
        // Obtener el email del usuario actual
        const userId = this.authService.getCurrentUser()?.userId;
        if (userId) {
            this.userService.getUserById(userId).subscribe({
                next: (user: any) => {
                    this.notificationSettings.emailAddress = user.email;
                    // Cargar otras configuraciones de notificación
                    this.loadNotificationSettings(userId);
                },
                error: (error: any) => {
                    console.error('Error al cargar datos del usuario:', error);
                }
            });
        }
    }

    loadNotificationSettings(userId: number) {
        this.userService.getUserSettings(userId).subscribe({
            next: (settings) => {
                this.notificationSettings = {
                    ...this.notificationSettings,
                    emailNotificationsEnabled: settings.emailNotificationsEnabled,
                    weeklyReportEnabled: settings.weeklyReportEnabled,
                    monthlyReportEnabled: settings.monthlyReportEnabled
                };
            },
            error: (error) => {
                console.error('Error al cargar configuraciones:', error);
            }
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
