import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { UsersService } from './services/users/users.service';
import { AuthService } from './services/auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: false
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'FinancialTracker';
  currentRoute: string = '';
  isMaintenanceRoute = false;
  private subscription: Subscription = new Subscription();

  constructor(
    private router: Router,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    // Suscribirse a cambios de ruta
    this.subscription.add(
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe((event: NavigationEnd) => {
        this.currentRoute = event.urlAfterRedirects;
        this.isMaintenanceRoute = event.url === '/info';
        //console.log('Ruta actual:', this.currentRoute);
      })
    );

    // Suscribirse a cambios en el usuario actual
    this.subscription.add(
      this.authService.currentUser$.subscribe(user => {
        //console.log('Usuario actual:', user);
        this.forceChangeDetection();
      })
    );

    // Verificar estado del sistema al iniciar
    this.checkMaintenanceStatus();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  shouldShowNavbar(): boolean {
    // No mostrar navbar en rutas públicas o mantenimiento
    const publicRoutes = ['/LogIn', '/SignUp', '/info'];
    
    if (publicRoutes.some(route => this.currentRoute.includes(route))) {
      //console.log('No mostrar navbar - ruta pública:', this.currentRoute);
      return false;
    }
    
    // No mostrar navbar si no está logueado
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      //console.log('No mostrar navbar - no logueado');
      return false;
    }
    
    //console.log('Mostrar navbar - usuario logueado:', currentUser.username);
    return true;
  }

  private checkMaintenanceStatus() {
    // Solo verificar en producción
    if (environment.production) {
      this.http.get(`${environment.apiUrl}/api/system/status`).subscribe({
        next: (response: any) => {
          const isActive = response.active;
                if (!isActive && this.router.url !== '/info') {
        this.router.navigate(['/info']);
          }
        },
        error: (error) => {
          console.error('Error checking maintenance status:', error);
          // No redirigir por error del endpoint; mantener experiencia si estamos en horario
        }
      });
    }
  }

  private forceChangeDetection() {
    // Forzar detección de cambios
    setTimeout(() => {
      // Esto fuerza a Angular a detectar cambios
    }, 0);
  }
}
  