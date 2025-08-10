import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { UsersService } from 'src/app/services/users/users.service';
import { EmailService } from 'src/app/services/email/email.service'; // Crear este servicio
import { ToastrService } from 'ngx-toastr';
import { NotificationService } from 'src/app/services/notification/notification.service';

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
        emailAddress: ''
    };

    isTestingWeekly = false;
    isTestingMonthly = false;

    constructor(
        private authService: AuthService,
        private userService: UsersService,
        private emailService: EmailService,
        private toastr: ToastrService,
        private notificationService: NotificationService
    ) {}

    ngOnInit() {
        const cached = localStorage.getItem('userSettings');
        if (cached) {
            //console.log('[Settings] Cargando settings desde CACHE (localStorage)');
            this.notificationSettings = JSON.parse(cached);
        } else {
            //console.log('[Settings] Cargando settings desde BDD (petición al backend)');
            const userId = this.authService.getCurrentUser()?.userId;
            if (userId) {
                this.userService.getUserSettings(userId).subscribe({
                    next: (settings) => {
                        this.notificationSettings = settings;
                        localStorage.setItem('userSettings', JSON.stringify(settings));
                        //console.log('[Settings] Settings guardados en cache tras cargar de BDD');
                    },
                    error: (error) => {
                        console.error('[Settings] Error al cargar configuraciones desde BDD:', error);
                    }
                });
            }
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
                localStorage.setItem('userSettings', JSON.stringify(this.notificationSettings));
                //console.log('[Settings] Settings guardados en cache tras actualizar en BDD');
                this.notificationService.showSuccess('Configuración guardada correctamente');
                // Mostrar mensaje de éxito
            },
            error: (err) => {
                console.error('Error saving settings:', err);
                this.notificationService.showError('Error al guardar la configuración');
            }
        });
    }

    testWeeklyReport() {
        const userId = this.authService.getCurrentUser()?.userId;
        if (!userId) return;
        this.isTestingWeekly = true;
        this.emailService.testWeeklyReport(userId).subscribe({
            next: (res) => {
                this.notificationService.showSuccess('Reporte semanal de prueba enviado correctamente');
                //console.log('[Settings] Reporte semanal de prueba enviado:', res);
            },
            error: (err) => {
                this.notificationService.showError('Error al enviar el reporte semanal de prueba');
                console.error('[Settings] Error al enviar reporte semanal de prueba:', err);
            },
            complete: () => {
                this.isTestingWeekly = false;
            }
        });
    }

    testMonthlyReport() {
        const userId = this.authService.getCurrentUser()?.userId;
        if (!userId) return;
        this.isTestingMonthly = true;
        this.emailService.testMonthlyReport(userId).subscribe({
            next: (res) => {
                this.notificationService.showSuccess('Reporte mensual de prueba enviado correctamente');
                //console.log('[Settings] Reporte mensual de prueba enviado:', res);
            },
            error: (err) => {
                this.notificationService.showError('Error al enviar el reporte mensual de prueba');
                console.error('[Settings] Error al enviar reporte mensual de prueba:', err);
            },
            complete: () => {
                this.isTestingMonthly = false;
            }
        });
    }

    testSuccessNotification() {
        //console.log('Testing success notification');
        this.toastr.success('¡Operación completada!', 'Éxito');
    }

    testErrorNotification() {
        //console.log('Testing error notification');
        this.toastr.error('Algo salió mal', 'Error');
    }

    testWarningNotification() {
        //console.log('Testing warning notification');
        this.toastr.warning('Ten cuidado', 'Advertencia');
    }

    testInfoNotification() {
        //console.log('Testing info notification');
        this.toastr.info('Información importante', 'Info');
    }
}
