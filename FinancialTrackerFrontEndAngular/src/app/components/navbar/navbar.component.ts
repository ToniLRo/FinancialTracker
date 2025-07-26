import { Component, ElementRef, AfterViewInit, ViewChild, OnInit, HostListener } from '@angular/core';
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

  // Variable para controlar el estado del sidebar en móvil
  isSidebarOpen: boolean = false;

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
      this.updateActiveNavOnRouteChange();
    });
  }

  ngAfterViewInit(){
    if (this.myChart && this.myChart.nativeElement) {
      const canvas = this.myChart.nativeElement;
      const ctx = canvas.getContext('2d');

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
      }
    }
  }

  /**
   * Toggle del sidebar en móvil
   */
  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
    
    // Prevenir scroll del body cuando el sidebar está abierto
    if (this.isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  /**
   * Cerrar sidebar en móvil
   */
  closeSidebar(): void {
    this.isSidebarOpen = false;
    document.body.style.overflow = '';
  }

  /**
   * Escuchar clics fuera del sidebar para cerrarlo
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    
    // Si el clic es fuera del sidebar y el sidebar está abierto, cerrarlo
    if (this.isSidebarOpen && 
        !target.closest('.sidebar') && 
        !target.closest('.mobile-toggle')) {
      this.closeSidebar();
    }
  }

  /**
   * Escuchar tecla Escape para cerrar sidebar
   */
  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isSidebarOpen) {
      this.closeSidebar();
    }
  }

  /**
   * Actualiza la clase 'active' en los enlaces de navegación basándose en la ruta actual
   */
  private updateActiveNavOnRouteChange(): void {
    const currentRoute = this.router.url;
    
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
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/LogIn']);
  } 
}
