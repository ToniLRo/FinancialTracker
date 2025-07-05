import { Component, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { Chart, CategoryScale, LinearScale, BarController, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Router } from '@angular/router';
import { UsersService } from '../../services/users/users.service';

@Component({
    selector: 'navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.css'],
    standalone: false
})
export class NavbarComponent implements AfterViewInit {

  @ViewChild('myChart', { static: false }) myChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('navLink') navLink!: ElementRef;

  constructor(
    public usersService: UsersService,
    private router: Router
  ) { 
    Chart.register(CategoryScale, LinearScale, BarController, BarElement, Title, Tooltip, Legend);
  }

  ngAfterViewInit(){
    const canvas = this.myChart.nativeElement;
    const ctx = canvas.getContext('2d');

    console.log('ViewChild:', this.myChart, ctx); // Debería mostrar información sobre el canvas

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
      console.error('No se pudo obtener el contexto 2D del canvas');
    }
  }

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
    this.usersService.logout();
    this.router.navigate(['/log-in']);
  }
}
