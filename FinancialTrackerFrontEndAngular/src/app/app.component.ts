import { Component, ElementRef, QueryList, Renderer2, ViewChildren } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: false
})
export class AppComponent {
  title = 'FinancialTracker';

  @ViewChildren('navLink') navLinks!: QueryList<ElementRef>;

  constructor(private renderer: Renderer2) {}

  // Método para manejar el click en un enlace
  onLinkClick(event: Event) {
    console.log('ViewChild:', this.navLinks); // Debería mostrar información sobre el canvas

    this.navLinks.forEach(link => {
      this.renderer.removeClass(link.nativeElement, 'active');
    });

    // Añade la clase 'active' al enlace clicado
    const clickedLink = event.target as HTMLAnchorElement;
    this.renderer.addClass(clickedLink, 'active');
  }
}
