import { Component, ElementRef, AfterViewInit, ViewChild, OnInit } from '@angular/core';
import { Chart, CategoryScale, LinearScale, BarController, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Router, NavigationEnd } from '@angular/router';
import { UsersService } from '../../services/users/users.service';
import { AuthService } from '../../services/auth/auth.service';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.css'],
    standalone: false
})
export class NavbarComponent implements AfterViewInit, OnInit {

  @ViewChild('myChart', { static: false }) myChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('navLink') navLink!: ElementRef;

  // Mapa de rutas para identificar qué enlace debe estar activo
  private routeToNavMap: { [key: string]: string } = {
    '/Home': 'Dashboard',
    '/MyWallets': 'My Wallets', 
    '/Payments': 'Payments',
    '/Profile': 'Perfil'
  };

  constructor(
    public usersService: UsersService,
    public router: Router,
    public authService: AuthService
  ) { 
    Chart.register(CategoryScale, LinearScale, BarController, BarElement, Title, Tooltip, Legend);
  }

  ngOnInit(): void {
    // Detectar ruta actual al inicializar
    this.updateActiveNavOnRouteChange();
    
    // Escuchar cambios de ruta
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      console.log('Route changed to:', event.url);
      this.updateActiveNavOnRouteChange();
    });
  }

  ngAfterViewInit(){
    if (this.myChart && this.myChart.nativeElement) {
      const canvas = this.myChart.nativeElement;
      const ctx = canvas.getContext('2d');

      console.log('ViewChild:', this.myChart, ctx);

      if (ctx) {
        new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
            datasets: [{
              label: '# of Votes',
              data: [12, 19, 3, 5, 2, 3],
              borderWidth: 1
            }]
          },
          options: {
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });
      } else {
        //console.error('No se pudo obtener el contexto 2D del canvas');
      }
    } else {
      //console.warn('El elemento myChart no está disponible');
    }
  }

  /**
   * Actualiza la clase 'active' en los enlaces de navegación basándose en la ruta actual
   */
  private updateActiveNavOnRouteChange(): void {
    const currentRoute = this.router.url;
    console.log('Current route:', currentRoute);
    
    // Remover clase active de todos los enlaces
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.classList.remove('active');
    });
    
    // Encontrar y activar el enlace correspondiente a la ruta actual
    const activeNavText = this.routeToNavMap[currentRoute];
    if (activeNavText) {
      const activeLink = Array.from(navLinks).find(link => 
        link.textContent?.trim().includes(activeNavText)
      );
      
      if (activeLink) {
        activeLink.classList.add('active');
        console.log('Activated nav link for:', activeNavText);
      }
    }
    
    // Si no hay match exacto, intentar match parcial (para rutas con parámetros)
    if (!activeNavText) {
      if (currentRoute.startsWith('/Home')) {
        this.activateNavByText('Dashboard');
      } else if (currentRoute.startsWith('/MyWallets')) {
        this.activateNavByText('My Wallets');
      } else if (currentRoute.startsWith('/Payments')) {
        this.activateNavByText('Payments');
      } else if (currentRoute.startsWith('/Profile')) {
        this.activateNavByText('Perfil');
      }
    }
  }

  /**
   * Activa un enlace de navegación por su texto
   */
  private activateNavByText(navText: string): void {
    const navLinks = document.querySelectorAll('.nav-link');
    const targetLink = Array.from(navLinks).find(link => 
      link.textContent?.trim().includes(navText)
    );
    
    if (targetLink) {
      targetLink.classList.add('active');
      console.log('Activated nav link by text:', navText);
    }
  }

  /**
   * Maneja el clic en los enlaces de navegación
   */
  onLinkClick(event: Event) {
    // Remover clase active de todos los enlaces
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.classList.remove('active');
    });
    
    // Agregar clase active al enlace clickeado
    const clickedLink = event.target as HTMLElement;
    clickedLink.classList.add('active');
    
    console.log('Nav link clicked:', clickedLink.textContent?.trim());
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/LogIn']);
  } 
}
