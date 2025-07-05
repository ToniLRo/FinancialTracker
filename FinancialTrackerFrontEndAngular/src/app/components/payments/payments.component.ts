import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'payments',
    templateUrl: './payments.component.html',
    styleUrls: ['./payments.component.css'],
    standalone: false
})
export class PaymentsComponent implements OnInit {
  rows: string[][] = []; // Array de filas de la tabla
  paginatedRows: string[][] = []; // Filas mostradas en la página actual
  rowsPerPage: number = 5; // Número de filas por página
  currentPage: number = 1; // Página actual
  pages: number[] = []; // Número de páginas
  maxVisiblePages: number = 5; // Máximo número de botones de página visibles

  constructor() { }

  ngOnInit(): void {
    this.rows = this.getTableData(); // Cargar datos en las filas
    this.calculatePages(); // Calcular el número de páginas
    this.displayTable(this.currentPage); // Mostrar la primera página
  }

  getTableData(): string[][] {
    // Añadimos más filas para probar la paginación
    return Array.from({ length: 50 }, (_, i) => [
      `Content ${i + 1}`,
      `Content ${i + 1}`,
      `Content ${i + 1}`,
      `Content ${i + 1}`,
      `Content ${i + 1}`
    ]);
  }

  /*getTableData(): string[][] {
    return [
      ['Content 1', 'Content 1', 'Content 1', 'Content 1', 'Content 1'],
      ['Content 2', 'Content 2', 'Content 2', 'Content 2', 'Content 2'],
      ['Content 3', 'Content 3', 'Content 3', 'Content 3', 'Content 3'],
      ['Content 4', 'Content 4', 'Content 4', 'Content 4', 'Content 4'],
      ['Content 5', 'Content 5', 'Content 5', 'Content 5', 'Content 5'],
      ['Content 6', 'Content 6', 'Content 6', 'Content 6', 'Content 6'],
      // Agrega más filas según sea necesario
    ];
  }*/

  calculatePages(): void {
    const totalPages = Math.ceil(this.rows.length / this.rowsPerPage);
    this.pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  displayTable(page: number): void {
    this.currentPage = page;
    const startIndex = (page - 1) * this.rowsPerPage;
    const endIndex = startIndex + this.rowsPerPage;
    this.paginatedRows = this.rows.slice(startIndex, endIndex);
  }

  changePage(page: number): void {
    this.displayTable(page);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.changePage(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.pages.length) {
      this.changePage(this.currentPage + 1);
    }
  }

  // Método para obtener las páginas visibles en la paginación
  getVisiblePages(): number[] {
    const halfRange = Math.floor(this.maxVisiblePages / 2);
    let start = Math.max(this.currentPage - halfRange, 1);
    let end = Math.min(start + this.maxVisiblePages - 1, this.pages.length);

    if (end - start < this.maxVisiblePages - 1) {
      start = Math.max(end - this.maxVisiblePages + 1, 1);
    }

    return this.pages.slice(start - 1, end);
  }
}
