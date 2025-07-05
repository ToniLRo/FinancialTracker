import { Component, ElementRef, AfterViewInit, ViewChild, OnInit, Renderer2 } from '@angular/core';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, LineController } from 'chart.js';



@Component({
    selector: 'home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
    standalone: false
})
export class HomeComponent  implements OnInit, AfterViewInit  {
  @ViewChild('myChart', { static: false }) myChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('carousel', { static: false }) carousel!: ElementRef<HTMLDivElement>;
  @ViewChild('wrapper', { static: false }) wrapper!: ElementRef<HTMLDivElement>;
  @ViewChild('arrowLeft', { static: false }) arrowLeft!: ElementRef<HTMLDivElement>;
  @ViewChild('arrowRight', { static: false }) arrowRight!: ElementRef<HTMLDivElement>;

  private firstCardWidth!: number;
  private isDragging = false;
  private startX!: number;
  private startScrollLeft!: number;
  private timeoutId: any;

  constructor(private renderer: Renderer2){
    Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, LineController);

  }
  
  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    const canvas = this.myChart.nativeElement;
    const ctx = canvas.getContext('2d');
    
    const carousel = this.carousel.nativeElement;
    const wrapper = this.wrapper.nativeElement;
    const firstCard = carousel.querySelector(".card") as HTMLElement;
    this.firstCardWidth = firstCard.offsetWidth;
    
    // Event listeners
    this.renderer.listen(carousel, 'mousedown', this.dragStart.bind(this));
    this.renderer.listen(carousel, 'mousemove', this.dragging.bind(this));
    this.renderer.listen(document, 'mouseup', this.dragStop.bind(this));
    this.renderer.listen(wrapper, 'mouseenter', () => clearTimeout(this.timeoutId));
    this.renderer.listen(wrapper, 'mouseleave', this.autoPlay.bind(this));

    // Arrow buttons event listeners
    this.renderer.listen(this.arrowLeft.nativeElement, 'click', () => this.scrollCarousel(-this.firstCardWidth));
    this.renderer.listen(this.arrowRight.nativeElement, 'click', () => this.scrollCarousel(this.firstCardWidth));

    

    if (ctx) {
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio','Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
          datasets: [{
            label: 'Income',
            data: [12, 19, 3, 5, 2, 3],
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            fill: false, // No llenar el área debajo de la línea
            pointBackgroundColor: 'rgba(75, 192, 192, 1)', // Color de los puntos
            tension: 0.1 // Suaviza la línea
          },
          {
            label: 'Expenses',
            data: [10, 22, 1, 4, 2, 0 ],
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            fill: false, // No llenar el área debajo de la línea
            pointBackgroundColor: 'rgba(75, 192, 192, 1)', // Color de los puntos
            tension: 0.1 // Suaviza la línea
          }
        
        ]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          },
          plugins: {
            legend: {  // Aquí se configura la leyenda
              display: true,  // Mostrar la leyenda
              position: 'top',  // Posición de la leyenda
              labels: {
                color: 'rgb(255, 255, 255)',  // Color del texto de la leyenda
                font: {
                  size: 14,  // Tamaño de la fuente de la leyenda
                  family: 'Arial',  // Familia de la fuente
                  style: 'italic'  // Estilo de la fuente
                },
                boxWidth: 20,  // Ancho de la caja de color de la leyenda
                padding: 10  // Espaciado entre elementos de la leyenda
              }
            },
            tooltip: {
              enabled: true  // Habilitar tooltips
            }
          }
        }
      });
    } else {
      console.error('No se pudo obtener el contexto 2D del canvas');
    }  
  
  
  
  
  }

  private dragStart(e: MouseEvent) {
    this.isDragging = true;
    this.renderer.addClass(this.carousel.nativeElement, 'dragging');
    this.startX = e.pageX;
    this.startScrollLeft = this.carousel.nativeElement.scrollLeft;
  }

  private dragging(e: MouseEvent) {
    if (!this.isDragging) return;

    const carousel = this.carousel.nativeElement;
    const newScrollLeft = this.startScrollLeft - (e.pageX - this.startX);

    if (newScrollLeft <= 0 || newScrollLeft >= carousel.scrollWidth - carousel.offsetWidth) {
      this.isDragging = false;
      return;
    }

    carousel.scrollLeft = newScrollLeft;
  }

  private dragStop() {
    this.isDragging = false;
    this.renderer.removeClass(this.carousel.nativeElement, 'dragging');
  }

  private autoPlay() {
    if (window.innerWidth < 800) return;

    const carousel = this.carousel.nativeElement;
    const totalCardWidth = carousel.scrollWidth;
    const maxScrollLeft = totalCardWidth - carousel.offsetWidth;

    if (carousel.scrollLeft >= maxScrollLeft) return;

    this.timeoutId = setTimeout(() => {
      carousel.scrollLeft += this.firstCardWidth;
      this.autoPlay();
    }, 2500);
  }

  private scrollCarousel(scrollAmount: number) {
    this.carousel.nativeElement.scrollLeft += scrollAmount;
  }

}