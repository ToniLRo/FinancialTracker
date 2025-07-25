import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { UsersService } from 'src/app/services/users/users.service';
import { EmailService } from 'src/app/services/email/email.service'; // Crear este servicio

@Component({
    selector: 'app-settings',
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

    isTestingWeekly = false;
    isTestingMonthly = false;

    constructor(
        private authService: AuthService,
        private userService: UsersService,
        private emailService: EmailService
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

    async testWeeklyReport() {
        if (!this.notificationSettings.weeklyReportEnabled) {
            alert('Activa los reportes semanales primero');
            return;
        }

        this.isTestingWeekly = true;
        try {
            await this.emailService.testWeeklyReport(this.authService.getCurrentUser()?.userId!).toPromise();
            alert('Reporte semanal de prueba enviado correctamente');
        } catch (error) {
            console.error('Error al enviar reporte de prueba:', error);
            alert('Error al enviar el reporte de prueba');
        } finally {
            this.isTestingWeekly = false;
        }
    }

    async testMonthlyReport() {
        if (!this.notificationSettings.monthlyReportEnabled) {
            alert('Activa los reportes mensuales primero');
            return;
        }

        this.isTestingMonthly = true;
        try {
            await this.emailService.testMonthlyReport(this.authService.getCurrentUser()?.userId!).toPromise();
            alert('Reporte mensual de prueba enviado correctamente');
        } catch (error) {
            console.error('Error al enviar reporte de prueba:', error);
            alert('Error al enviar el reporte de prueba');
        } finally {
            this.isTestingMonthly = false;
        }
    }
}
