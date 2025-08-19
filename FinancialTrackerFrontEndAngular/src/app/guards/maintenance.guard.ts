import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MaintenanceGuard implements CanActivate {

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {

    return this.http.get<{ active: boolean; maintenance: boolean; isProduction: boolean }>(`${environment.apiUrl}/api/system/status`).pipe(
      tap(response => {
      }),
      map(response => {
        
        if (response.active) {
          return true;
        } else {
          // Redirigir inmediatamente a mantenimiento
          this.router.navigate(['/maintenance']);
          return false;
        }
      }),
      catchError(error => {
        console.error('MaintenanceGuard: Error al verificar estado:', error);
        
        // Redirigir inmediatamente a mantenimiento en caso de error
        this.router.navigate(['/maintenance']);
        return of(false);
      })
    );
  }
}
