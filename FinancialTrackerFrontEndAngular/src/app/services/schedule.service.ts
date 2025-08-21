import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export interface ScheduleStatus {
  active: boolean;
  isProduction: boolean;
  currentTime: string;
  currentDay: string;
  fromHour: number;
  toHour: number;
  isWeekday: boolean;
  isWithinHours: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  private readonly startHour = 10; // 10:00 AM
  private readonly endHour = 19;   // 7:00 PM

  constructor() { }

  /**
   * Verifica si la aplicación está activa según el horario
   * Solo aplica en producción
   */
  getSystemStatus(): ScheduleStatus {
    // En desarrollo, siempre activo
    if (!environment.production) {
      return {
        active: true,
        isProduction: false,
        currentTime: this.getCurrentTime(),
        currentDay: this.getCurrentDay(),
        fromHour: this.startHour,
        toHour: this.endHour,
        isWeekday: true,
        isWithinHours: true,
        message: 'Aplicación en modo desarrollo - siempre activa'
      };
    }

    // En producción, verificar horario
    const now = new Date();
    const currentTime = now.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'Europe/Madrid'
    });
    
    const currentDay = now.toLocaleDateString('es-ES', { 
      weekday: 'long',
      timeZone: 'Europe/Madrid'
    }).toUpperCase();
    
    const currentHour = now.getHours();
    const currentDayOfWeek = now.getDay(); // 0=Domingo, 1=Lunes, ..., 6=Sábado
    
    // Verificar si es día laboral (Lunes a Viernes)
    const isWeekday = currentDayOfWeek >= 1 && currentDayOfWeek <= 5;
    
    // Verificar si está dentro del horario
    const isWithinHours = currentHour >= this.startHour && currentHour < this.endHour;
    
    const isActive = isWeekday && isWithinHours;
    
    let message = '';
    if (isActive) {
      message = 'Aplicación activa y funcionando normalmente';
    } else {
      if (!isWeekday) {
        message = 'Aplicación cerrada durante el fin de semana';
      } else {
        message = 'Aplicación cerrada fuera del horario de funcionamiento';
      }
    }

    return {
      active: isActive,
      isProduction: true,
      currentTime,
      currentDay,
      fromHour: this.startHour,
      toHour: this.endHour,
      isWeekday,
      isWithinHours,
      message
    };
  }

  /**
   * Obtiene la hora actual en formato HH:mm
   */
  private getCurrentTime(): string {
    const now = new Date();
    return now.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'Europe/Madrid'
    });
  }

  /**
   * Obtiene el día actual en formato largo
   */
  private getCurrentDay(): string {
    const now = new Date();
    return now.toLocaleDateString('es-ES', { 
      weekday: 'long',
      timeZone: 'Europe/Madrid'
    }).toUpperCase();
  }

  /**
   * Verifica si la aplicación está en modo mantenimiento
   */
  isMaintenanceMode(): boolean {
    if (!environment.production) {
      return false;
    }
    
    const status = this.getSystemStatus();
    return !status.active;
  }

  /**
   * Obtiene el próximo horario de inicio
   */
  getNextStartTime(): string {
    const status = this.getSystemStatus();
    
    if (status.active) {
      return 'Disponible ahora';
    }
    
    // Si es fin de semana, próximo lunes
    if (!status.isWeekday) {
      return 'Lunes 10:00';
    }
    
    // Si es fuera de horario, próximo día laboral
    return 'Próximo día laboral 10:00';
  }

  /**
   * Genera el mensaje de mantenimiento
   */
  generateMaintenanceMessage(): string {
    const status = this.getSystemStatus();
    
    if (status.active) {
      return 'La aplicación está funcionando normalmente.';
    }

    if (!status.isWeekday) {
      return 'La aplicación está cerrada durante el fin de semana.';
    }

    if (!status.isWithinHours) {
      const currentHour = parseInt(status.currentTime.split(':')[0]);
      if (currentHour < status.fromHour) {
        return `La aplicación estará disponible hoy a las ${status.fromHour}:00.`;
      } else if (currentHour >= status.toHour) {
        return 'La aplicación estará disponible mañana a las 10:00.';
      }
    }

    return 'La aplicación está temporalmente no disponible.';
  }
}
