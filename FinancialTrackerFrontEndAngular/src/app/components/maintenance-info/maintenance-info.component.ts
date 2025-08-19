import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { MaintenanceInfo } from '../../models/maintenance-info/maintenance-info.model';

@Component({
  selector: 'app-maintenance-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './maintenance-info.component.html',
  styleUrls: ['./maintenance-info.component.css']
})
export class MaintenanceInfoComponent implements OnInit, OnDestroy {
  maintenanceInfo: MaintenanceInfo | null = null;
  isLoading = true; 
  error = false;
  private interval: any;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadMaintenanceInfo();
    // Actualizar cada 3 minutos (más eficiente que 5 minutos)
    this.interval = setInterval(() => this.loadMaintenanceInfo(), 180000);
  }

  ngOnDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  loadMaintenanceInfo() {
    this.isLoading = true;
    this.error = false;

    this.http.get(`${environment.apiUrl}/api/system/status`)
      .subscribe({
        next: (response: any) => {
          this.maintenanceInfo = {
            status: response.active ? 'UP' : 'DOWN',
            schedule: `Lun-Vie ${response.fromHour}:00-${response.toHour}:00`,
            nextStart: this.getNextStartTime(response),
            scheduleStatus: response.active ? 'ACTIVO' : 'INACTIVO',
            message: this.generateMessage(response)
          };
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading maintenance info:', err);
          this.error = true;
          this.isLoading = false;
        }
      });
  }

  private getNextStartTime(response: any): string {
    if (response.active) {
      return 'Disponible ahora';
    }
    
    // Si es fin de semana, próximo lunes
    const currentDay = response.currentDay;
    if (currentDay === 'SATURDAY' || currentDay === 'SUNDAY') {
      return 'Lunes 10:00';
    }
    
    // Si es fuera de horario, próximo día laboral
    return 'Próximo día laboral 10:00';
  }

  private generateMessage(response: any): string {
    if (response.active) {
      return 'La aplicación está funcionando normalmente.';
    }

    if (response.currentDay === 'SATURDAY' || response.currentDay === 'SUNDAY') {
      return 'La aplicación está cerrada durante el fin de semana.';
    }

    if (!response.active && response.currentTime) {
      const currentHour = parseInt(response.currentTime.split(':')[0]);
      if (currentHour < response.fromHour) {
        return `La aplicación estará disponible hoy a las ${response.fromHour}:00.`;
      } else if (currentHour >= response.toHour) {
        return 'La aplicación estará disponible mañana a las 10:00.';
      }
    }

    return 'La aplicación está temporalmente no disponible.';
  }

  refreshInfo() {
    this.loadMaintenanceInfo();
  }
}