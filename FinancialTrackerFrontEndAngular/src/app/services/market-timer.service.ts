import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface TimerConfig {
  id: string;
  interval: number;
  maxCallsPerDay: number;
  lastCall: number;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MarketTimerService implements OnDestroy {
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private timerConfigs: Map<string, TimerConfig> = new Map();
  private destroy$ = new Subject<void>();
  
  // Configuración de APIs según límites gratuitos
  private readonly API_LIMITS = {
    CRYPTO: { interval: 5 * 60 * 1000, maxCallsPerDay: 288 },      // 5 min = 288 calls/day
    FOREX: { interval: 32 * 60 * 1000, maxCallsPerDay: 45 },       // 32 min = 45 calls/day  
    STOCKS: { interval: 16 * 60 * 1000, maxCallsPerDay: 90 }       // 16 min = 90 calls/day
  };

  constructor() {
    this.initializeTimers();
  }

  private initializeTimers(): void {
    Object.entries(this.API_LIMITS).forEach(([type, config]) => {
      this.timerConfigs.set(type, {
        id: type,
        interval: config.interval,
        maxCallsPerDay: config.maxCallsPerDay,
        lastCall: this.getLastCallTime(type),
        isActive: true
      });
    });
  }

  /**
   * Iniciar timer para un tipo específico de mercado
   */
  startTimer(type: string, callback: () => void): void {
    const config = this.timerConfigs.get(type);
    if (!config || !config.isActive) return;

    // Verificar si podemos hacer la llamada
    if (!this.canMakeCall(type)) {
      console.log(`⏰ ${type}: Límite diario alcanzado, esperando hasta mañana`);
      this.scheduleNextDayCall(type, callback);
      return;
    }

    // Crear timer
    const timer = setInterval(() => {
      if (this.canMakeCall(type)) {
        callback();
        this.saveLastCallTime(type, Date.now());
      } else {
        console.log(`⏰ ${type}: Pausando timer hasta mañana`);
        this.pauseTimer(type);
        this.scheduleNextDayCall(type, callback);
      }
    }, config.interval);

    this.timers.set(type, timer);
    //console.log(`✅ Timer iniciado para ${type} cada ${config.interval / 60000} minutos`);
  }

  /**
   * Pausar timer específico
   */
  pauseTimer(type: string): void {
    const timer = this.timers.get(type);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(type);
      
      const config = this.timerConfigs.get(type);
      if (config) {
        config.isActive = false;
      }
      
      //console.log(`⏸️ Timer pausado para ${type}`);
    }
  }

  /**
   * Reanudar timer específico
   */
  resumeTimer(type: string, callback: () => void): void {
    const config = this.timerConfigs.get(type);
    if (config) {
      config.isActive = true;
      this.startTimer(type, callback);
    }
  }

  /**
   * Verificar si se puede hacer una llamada
   */
  private canMakeCall(type: string): boolean {
    const config = this.timerConfigs.get(type);
    if (!config) return false;

    const now = Date.now();
    const lastCall = config.lastCall;
    const oneDay = 24 * 60 * 60 * 1000;

    // Si es un nuevo día, resetear contador
    if (now - lastCall >= oneDay) {
      config.lastCall = now;
      this.saveLastCallTime(type, now);
      return true;
    }

    // Verificar límite diario
    const callsToday = Math.floor((now - lastCall) / config.interval);
    return callsToday < config.maxCallsPerDay;
  }

  /**
   * Programar llamada para el próximo día
   */
  private scheduleNextDayCall(type: string, callback: () => void): void {
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const timeUntilTomorrow = tomorrow.getTime() - now.getTime();

    setTimeout(() => {
      //console.log(`🌅 ${type}: Reiniciando timer para nuevo día`);
      this.resumeTimer(type, callback);
    }, timeUntilTomorrow);
  }

  /**
   * Obtener tiempo de última llamada desde localStorage
   */
  private getLastCallTime(type: string): number {
    const stored = localStorage.getItem(`lastCall_${type}`);
    return stored ? parseInt(stored) : 0;
  }

  /**
   * Guardar tiempo de última llamada en localStorage
   */
  private saveLastCallTime(type: string, timestamp: number): void {
    localStorage.setItem(`lastCall_${type}`, timestamp.toString());
  }

  /**
   * Obtener estadísticas de uso
   */
  getUsageStats(): Observable<{[key: string]: any}> {
    const stats: {[key: string]: any} = {};
    
    this.timerConfigs.forEach((config, type) => {
      const now = Date.now();
      const lastCall = config.lastCall;
      const oneDay = 24 * 60 * 60 * 1000;
      
      if (now - lastCall < oneDay) {
        const callsToday = Math.floor((now - lastCall) / config.interval);
        const remainingCalls = Math.max(0, config.maxCallsPerDay - callsToday);
        
        stats[type] = {
          callsToday,
          remainingCalls,
          maxCallsPerDay: config.maxCallsPerDay,
          nextReset: new Date(lastCall + oneDay).toLocaleString(),
          isActive: config.isActive
        };
      } else {
        stats[type] = {
          callsToday: 0,
          remainingCalls: config.maxCallsPerDay,
          maxCallsPerDay: config.maxCallsPerDay,
          nextReset: 'Disponible ahora',
          isActive: config.isActive
        };
      }
    });
    
    return new BehaviorSubject(stats).asObservable();
  }

  /**
   * Limpiar todos los timers
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    this.timers.forEach((timer, type) => {
      clearInterval(timer);
      //console.log(`🧹 Timer limpiado para ${type}`);
    });
    
    this.timers.clear();
  }

  /**
   * Limpiar timers manualmente (para componentes)
   */
  cleanup(): void {
    this.ngOnDestroy();
  }
}
