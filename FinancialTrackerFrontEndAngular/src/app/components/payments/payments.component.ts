import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { TransactionService } from 'src/app/services/transaction/transaction.service';
import { AccountService } from 'src/app/services/account/account.service';
import { Transaction } from 'src/app/models/Transaction/transaction.model';
import { Account } from 'src/app/models/account/account.model';

export interface FilterCriteria {
  accountId?: number;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  searchDescription?: string;
}

@Component({
    selector: 'payments',
    templateUrl: './payments.component.html',
    styleUrls: ['./payments.component.css'],
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class PaymentsComponent implements OnInit {
  // ViewChild references for form inputs
  @ViewChild('searchInput') searchInput!: ElementRef;
  @ViewChild('accountSelect') accountSelect!: ElementRef;
  @ViewChild('typeSelect') typeSelect!: ElementRef;
  @ViewChild('dateFromInput') dateFromInput!: ElementRef;
  @ViewChild('dateToInput') dateToInput!: ElementRef;
  @ViewChild('amountMinInput') amountMinInput!: ElementRef;
  @ViewChild('amountMaxInput') amountMaxInput!: ElementRef;

  // Data properties
  public allTransactions: Transaction[] = [];
  public filteredTransactions: Transaction[] = [];
  public paginatedTransactions: Transaction[] = [];
  public accounts: Account[] = [];
  
  // Filter properties
  public filters: FilterCriteria = {};
  public transactionTypes = ['All', 'Withdraw', 'Deposit', 'Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Other'];
  
  // Pagination properties
  public rowsPerPage: number = 10;
  public currentPage: number = 1;
  public totalPages: number = 0;
  public pages: number[] = [];
  public maxVisiblePages: number = 5;
  
  // Loading state
  public isLoading: boolean = false;
  public error: string | null = null;

  constructor(
    private transactionService: TransactionService,
    private accountService: AccountService
  ) { }

  ngOnInit(): void {
    this.loadInitialData();
  }

  async loadInitialData(): Promise<void> {
    this.isLoading = true;
    this.error = null;
    
    try {
      // Cargar cuentas y transacciones en paralelo
      const [accounts, transactions] = await Promise.all([
        this.accountService.getAccounts().toPromise(),
        this.transactionService.getAllUserTransactions().toPromise()
      ]);
      
      this.accounts = accounts || [];
      this.allTransactions = transactions || [];
      
      console.log('Loaded accounts:', this.accounts.length);
      console.log('Loaded transactions:', this.allTransactions.length);
      
      // Aplicar filtros iniciales
      this.applyFilters();
      
    } catch (error) {
      console.error('Error loading data:', error);
      this.error = 'Error loading data. Please try again.';
      this.allTransactions = [];
      this.accounts = [];
    } finally {
      this.isLoading = false;
    }
  }

  applyFilters(): void {
    console.log('Applying filters:', this.filters);
    
    this.filteredTransactions = this.allTransactions.filter(transaction => {
      // Filtro por cuenta
      if (this.filters.accountId && transaction.accountId !== this.filters.accountId) {
        return false;
      }
      
      // Filtro por tipo
      if (this.filters.type && this.filters.type !== 'All' && transaction.type !== this.filters.type) {
        return false;
      }
      
      // Filtro por descripción (búsqueda)
      if (this.filters.searchDescription) {
        const searchTerm = this.filters.searchDescription.toLowerCase();
        if (!transaction.description.toLowerCase().includes(searchTerm)) {
          return false;
        }
      }
      
      // Filtro por fecha desde
      if (this.filters.dateFrom) {
        const transactionDate = new Date(transaction.registerDate || transaction.date);
        const filterDateFrom = new Date(this.filters.dateFrom);
        if (transactionDate < filterDateFrom) {
          return false;
        }
      }
      
      // Filtro por fecha hasta
      if (this.filters.dateTo) {
        const transactionDate = new Date(transaction.registerDate || transaction.date);
        const filterDateTo = new Date(this.filters.dateTo);
        if (transactionDate > filterDateTo) {
          return false;
        }
      }
      
      // Filtro por cantidad mínima
      if (this.filters.amountMin !== undefined && Math.abs(transaction.amount) < this.filters.amountMin) {
        return false;
      }
      
      // Filtro por cantidad máxima
      if (this.filters.amountMax !== undefined && Math.abs(transaction.amount) > this.filters.amountMax) {
        return false;
      }
      
      return true;
    });
    
    console.log('Filtered transactions:', this.filteredTransactions.length);
    
    // Recalcular paginación
    this.calculatePages();
    this.currentPage = 1; // Resetear a primera página
    this.displayPage(1);
  }

  clearFilters(): void {
    console.log('Clearing all filters...');
    
    // Reset filters object
    this.filters = {};
    
    // Reset all form inputs to their default values
    if (this.searchInput) {
      this.searchInput.nativeElement.value = '';
    }
    
    if (this.accountSelect) {
      this.accountSelect.nativeElement.value = '';
    }
    
    if (this.typeSelect) {
      this.typeSelect.nativeElement.value = '';
    }
    
    if (this.dateFromInput) {
      this.dateFromInput.nativeElement.value = '';
    }
    
    if (this.dateToInput) {
      this.dateToInput.nativeElement.value = '';
    }
    
    if (this.amountMinInput) {
      this.amountMinInput.nativeElement.value = '';
    }
    
    if (this.amountMaxInput) {
      this.amountMaxInput.nativeElement.value = '';
    }
    
    console.log('All form inputs reset to default values');
    
    // Apply filters (which will show all transactions now)
    this.applyFilters();
  }

  calculatePages(): void {
    this.totalPages = Math.ceil(this.filteredTransactions.length / this.rowsPerPage);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  displayPage(page: number): void {
    this.currentPage = page;
    const startIndex = (page - 1) * this.rowsPerPage;
    const endIndex = startIndex + this.rowsPerPage;
    this.paginatedTransactions = this.filteredTransactions.slice(startIndex, endIndex);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.displayPage(page);
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.changePage(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.changePage(this.currentPage + 1);
    }
  }

  getVisiblePages(): number[] {
    const halfRange = Math.floor(this.maxVisiblePages / 2);
    let start = Math.max(this.currentPage - halfRange, 1);
    let end = Math.min(start + this.maxVisiblePages - 1, this.totalPages);

    if (end - start < this.maxVisiblePages - 1) {
      start = Math.max(end - this.maxVisiblePages + 1, 1);
    }

    return this.pages.slice(start - 1, end);
  }

  // Utility methods
  getAccountName(accountId: number): string {
    const account = this.accounts.find(acc => acc.account_Id === accountId);
    return account ? account.holder_name : 'Unknown Account';
  }

  getAccountNumber(accountId: number): string {
    const account = this.accounts.find(acc => acc.account_Id === accountId);
    return account ? account.account_number : 'N/A';
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES');
  }

  getTransactionIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'Withdraw': 'fa-arrow-down text-danger',
      'Deposit': 'fa-arrow-up text-success',
      'Food': 'fa-utensils text-warning',
      'Transport': 'fa-car text-info',
      'Entertainment': 'fa-gamepad text-purple',
      'Shopping': 'fa-shopping-cart text-primary',
      'Bills': 'fa-file-invoice text-secondary',
      'Other': 'fa-question-circle text-muted'
    };
    return iconMap[type] || 'fa-circle text-muted';
  }

  getAmountClass(amount: number): string {
    return amount >= 0 ? 'text-success' : 'text-danger';
  }

  // Event handlers for filters
  onAccountFilterChange(event: any): void {
    this.filters.accountId = event.target.value ? Number(event.target.value) : undefined;
    this.applyFilters();
  }

  onTypeFilterChange(event: any): void {
    this.filters.type = event.target.value || undefined;
    this.applyFilters();
  }

  onSearchChange(event: any): void {
    this.filters.searchDescription = event.target.value || undefined;
    this.applyFilters();
  }

  onDateFromChange(event: any): void {
    this.filters.dateFrom = event.target.value || undefined;
    this.applyFilters();
  }

  onDateToChange(event: any): void {
    this.filters.dateTo = event.target.value || undefined;
    this.applyFilters();
  }

  onAmountMinChange(event: any): void {
    this.filters.amountMin = event.target.value ? Number(event.target.value) : undefined;
    this.applyFilters();
  }

  onAmountMaxChange(event: any): void {
    this.filters.amountMax = event.target.value ? Number(event.target.value) : undefined;
    this.applyFilters();
  }

  // Track by function for ngFor performance
  trackByTransactionId(index: number, transaction: Transaction): number {
    return transaction.id;
  }
}
