import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { UsersService } from 'src/app/services/users/users.service';
import { EmailService } from 'src/app/services/email/email.service'; // Crear este servicio
import { ToastrService } from 'ngx-toastr';

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
        private emailService: EmailService,
        private toastr: ToastrService
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
            this.toastr.error('Activa los reportes semanales primero', 'Error');
            return;
        }

        this.isTestingWeekly = true;
        try {
            await this.emailService.testWeeklyReport(this.authService.getCurrentUser()?.userId!).toPromise();
            this.toastr.success('Reporte semanal enviado correctamente', 'Éxito');
        } catch (error) {
            this.toastr.error('Error al enviar el reporte de prueba', 'Error');
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

    testSuccessNotification() {
        console.log('Testing success notification');
        this.toastr.success('¡Operación completada!', 'Éxito');
    }

    testErrorNotification() {
        console.log('Testing error notification');
        this.toastr.error('Algo salió mal', 'Error');
    }

    testWarningNotification() {
        console.log('Testing warning notification');
        this.toastr.warning('Ten cuidado', 'Advertencia');
    }

    testInfoNotification() {
        console.log('Testing info notification');
        this.toastr.info('Información importante', 'Info');
    }
}
