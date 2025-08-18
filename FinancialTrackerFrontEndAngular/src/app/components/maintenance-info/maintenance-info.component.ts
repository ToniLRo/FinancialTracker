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
    // Actualizar cada 5 minutos
    this.interval = setInterval(() => this.loadMaintenanceInfo(), 300000);
  }

  ngOnDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  loadMaintenanceInfo() {
    this.isLoading = true;
    this.error = false;

    this.http.get(`${environment.apiUrl}/api/app-status/status`)
      .subscribe({
        next: (response: any) => {
          this.maintenanceInfo = {
            status: response.status || 'UNKNOWN',
            schedule: response.schedule || 'N/A',
            nextStart: response.nextStart || 'N/A',
            scheduleStatus: response.scheduleStatus || 'UNKNOWN',
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

  private generateMessage(response: any): string {
    if (response.status === 'UP' && response.scheduleStatus === 'ACTIVO') {
      return 'La aplicación está funcionando normalmente.';
    }

    if (response.scheduleStatus === 'INACTIVO') {
      return 'La aplicación está temporalmente cerrada por horario de trabajo.';
    }

    if (response.schedule && response.schedule.includes('Fin de semana')) {
      return 'La aplicación está cerrada durante el fin de semana.';
    }

    if (response.nextStart && response.nextStart.includes('Lunes')) {
      return 'La aplicación estará disponible el próximo lunes a las 10:00.';
    }

    return 'La aplicación está temporalmente no disponible.';
  }

  getStatusClass(): string {
    if (!this.maintenanceInfo) return '';
    
    if (this.maintenanceInfo.status === 'UP' && this.maintenanceInfo.scheduleStatus === 'ACTIVO') {
      return 'status-active';
    }
    
    return 'status-maintenance';
  }

  getCurrentTime(): string {
    return new Date().toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  refreshInfo() {
    this.loadMaintenanceInfo();
  }
}