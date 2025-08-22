import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { ScheduleService } from '../services/schedule.service';

@Injectable({
  providedIn: 'root'
})
export class MaintenanceGuard implements CanActivate {

  constructor(
    private scheduleService: ScheduleService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    // Verificar si la aplicación está en modo mantenimiento
    if (this.scheduleService.isMaintenanceMode()) {
      // Redirigir inmediatamente a mantenimiento
              this.router.navigate(['/info']);
      return of(false);
    }
    
    // La aplicación está activa, permitir acceso
    return of(true);
  }
}
