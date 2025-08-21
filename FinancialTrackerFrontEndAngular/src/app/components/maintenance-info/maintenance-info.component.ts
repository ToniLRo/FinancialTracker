import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScheduleService, ScheduleStatus } from '../../services/schedule.service';

@Component({
  selector: 'app-maintenance-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './maintenance-info.component.html',
  styleUrls: ['./maintenance-info.component.css']
})
export class MaintenanceInfoComponent implements OnInit, OnDestroy {
  maintenanceInfo: any = null;
  isLoading = false; 
  error = false;
  private interval: any;

  constructor(private scheduleService: ScheduleService) {}

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

    try {
      const status = this.scheduleService.getSystemStatus();
      
      this.maintenanceInfo = {
        status: status.active ? 'UP' : 'DOWN',
        schedule: `Lun-Vie ${status.fromHour}:00-${status.toHour}:00`,
        nextStart: this.scheduleService.getNextStartTime(),
        scheduleStatus: status.active ? 'ACTIVO' : 'INACTIVO',
        message: this.scheduleService.generateMaintenanceMessage()
      };
      
      this.isLoading = false;
    } catch (err) {
      console.error('Error loading maintenance info:', err);
      this.error = true;
      this.isLoading = false;
    }
  }

  refreshInfo() {
    this.loadMaintenanceInfo();
  }
}