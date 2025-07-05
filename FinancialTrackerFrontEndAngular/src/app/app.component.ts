import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { UsersService } from './services/users/users.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: false
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'FinancialTracker';
  currentRoute: string = '';
  private subscription: Subscription = new Subscription();

  constructor(
    private router: Router,
    private usersService: UsersService
  ) {}

  ngOnInit() {
    // Suscribirse a cambios de ruta
    this.subscription.add(
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe((event: NavigationEnd) => {
        this.currentRoute = event.urlAfterRedirects;
        console.log('Ruta actual:', this.currentRoute);
      })
    );

    // Suscribirse a cambios en el usuario actual
    this.subscription.add(
      this.usersService.currentUser$.subscribe(user => {
        console.log('Usuario actual:', user);
        // Forzar detección de cambios
        this.forceChangeDetection();
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  shouldShowNavbar(): boolean {
    // Rutas donde NO mostrar el navbar
    const publicRoutes = ['/LogIn', '/SignUp'];
    
    // No mostrar navbar si está en una ruta pública
    if (publicRoutes.some(route => this.currentRoute.includes(route))) {
      console.log('No mostrar navbar - ruta pública:', this.currentRoute);
      return false;
    }
    
    // No mostrar navbar si no está logueado
    const currentUser = this.usersService.getCurrentUser();
    if (!currentUser) {
      console.log('No mostrar navbar - no logueado');
      return false;
    }
    
    console.log('Mostrar navbar - usuario logueado:', currentUser.username);
    return true;
  }

  private forceChangeDetection() {
    // Forzar detección de cambios
    setTimeout(() => {
      // Esto fuerza a Angular a detectar cambios
    }, 0);
  }
}
  