import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TransactionService } from 'src/app/services/transaction/transaction.service';
import { AccountService } from 'src/app/services/account/account.service';
import { Transaction } from 'src/app/models/Transaction/transaction.model';
import { Account } from 'src/app/models/account/account.model';
import { NotificationService } from '../../services/notification/notification.service';

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

  public editingTransaction: Transaction | null = null;
  public deletingTransaction: Transaction | null = null;
  public editTransactionForm!: FormGroup;
  public isSaving: boolean = false;
  public isDeleting: boolean = false;

  constructor(
    private transactionService: TransactionService,
    private accountService: AccountService,
    private formBuilder: FormBuilder, // NUEVO: FormBuilder para reactive forms
    private notificationService: NotificationService
  ) {
    this.initializeEditForm();
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  private initializeEditForm(): void {
    this.editTransactionForm = this.formBuilder.group({
      date: ['', Validators.required],
      type: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(3)]],
      accountId: ['', Validators.required],
      amount: ['', [Validators.required, this.validateAmount]], // CAMBIO: Validación personalizada
      referenceId: ['']
    });
  }

  private validateAmount(control: any) {
    const value = control.value;
    
    // Debe ser un número y no puede ser 0
    if (value === null || value === undefined || value === '' || value === 0) {
      return { required: true };
    }
    
    // Debe ser un número válido
    if (isNaN(value)) {
      return { invalid: true };
    }
    
    // Puede ser positivo o negativo, pero no 0
    if (Math.abs(value) < 0.01) {
      return { tooSmall: true };
    }
    
    return null; // Válido
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
      
      //console.log('Loaded accounts:', this.accounts.length);
      //console.log('Loaded transactions:', this.allTransactions.length);
      
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
    //console.log('Applying filters:', this.filters);
    
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
    
    //console.log('Filtered transactions:', this.filteredTransactions.length);
    
    // Recalcular paginación
    this.calculatePages();
    this.currentPage = 1; // Resetear a primera página
    this.displayPage(1);
  }

  clearFilters(): void {
    //console.log('Clearing all filters...');
    
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
    
    //console.log('All form inputs reset to default values');
    
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
      this.changePage(page);
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
    const icons: { [key: string]: string } = {
      // Iconos para tipos de gasto
      'Food': 'bi-cup-straw',
      'Transport': 'bi-car-front',
      'Shopping': 'bi-bag-fill',
      'Entertainment': 'bi-controller',
      'Bills': 'bi-receipt',
      'Healthcare': 'bi-heart-pulse',
      'Education': 'bi-book',
      'Gift': 'bi-gift',
      
      // Iconos para tipos de ingreso/movimientos
      'Income': 'bi-cash-coin',
      'Deposit': 'bi-arrow-up-circle-fill',
      'Withdraw': 'bi-arrow-down-circle-fill',
      
      // Iconos adicionales
      'Transfer': 'bi-arrow-left-right',
      'Investment': 'bi-graph-up-arrow',
      'Salary': 'bi-briefcase',
      'Freelance': 'bi-laptop',
      'Bonus': 'bi-star-fill',
      'Refund': 'bi-arrow-clockwise',
      'Other': 'bi-question-circle'
    };
    
    return icons[type] || 'bi-circle-fill'; // Icono por defecto
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

  editTransaction(transaction: Transaction): void {
    //console.log('Editing transaction:', transaction);
    
    this.editingTransaction = { ...transaction }; // Clone to avoid reference issues
    
    // Populate form with transaction data - MANTENER SIGNO ORIGINAL
    this.editTransactionForm.patchValue({
      date: transaction.date,
      type: transaction.type,
      description: transaction.description,
      accountId: transaction.accountId,
      amount: transaction.amount, // CAMBIO: Remover Math.abs() para mantener negativo
      referenceId: transaction.referenceId || ''
    });

    this.showEditModal();
  }

  async saveTransaction(): Promise<void> {
    if (this.editTransactionForm.invalid || !this.editingTransaction) {
      //console.log('Form is invalid or no transaction selected');
      return;
    }

    // Validación adicional
    const amount = this.editTransactionForm.value.amount;
    if (amount === 0 || Math.abs(amount) < 0.01) {
      //console.log('Amount cannot be zero or too small');
      return;
    }

    this.isSaving = true;
    this.error = null; // Clear previous errors
    
    try {
      const formValue = this.editTransactionForm.value;
      
      const originalAmount = this.editingTransaction.amount;
      const newAmount = formValue.amount;
      const balanceDifference = newAmount - originalAmount;
      
      const affectedAccount = this.accounts.find(acc => acc.account_Id === formValue.accountId);
      if (!affectedAccount) {
        this.error = 'Account not found for this transaction.';
        this.isSaving = false;
        return;
      }
      
      // Preparar objeto para actualización
      const updateRequest = {
        id: this.editingTransaction.id,
        date: formValue.date,
        type: formValue.type,
        description: formValue.description,
        accountId: formValue.accountId,
        amount: formValue.amount,
        referenceId: formValue.referenceId || null
      };

      //console.log('Sending update request:', updateRequest);

      const updatedTransaction = await this.transactionService.updateTransaction(updateRequest).toPromise();
      
      //console.log('Transaction updated successfully:', updatedTransaction);
      
      affectedAccount.balance += balanceDifference;
      
      await this.accountService.updateAccount(affectedAccount).toPromise();
      //console.log('✅ Account balance updated in database');
      
      // Actualizar la transacción en la lista local
      const index = this.allTransactions.findIndex(t => t.id === this.editingTransaction!.id);
      if (index !== -1) {
        this.allTransactions[index] = updatedTransaction!;
        this.applyFilters(); // Refresh filtered data
      }

      this.closeEditModal();
      
      //console.log(`✅ Transaction updated successfully. Balance adjusted: ${balanceDifference > 0 ? '+' : ''}${balanceDifference.toFixed(2)} ${affectedAccount.currency}`);
      this.notificationService.showSuccess(
        `${balanceDifference > 0 ? '+' : ''}${balanceDifference.toFixed(2)} ${affectedAccount.currency}`,
        updatedTransaction!.type
      );
      
    } catch (error: any) {
      console.error('❌ Error updating transaction:', error);
      
      // Manejar diferentes tipos de error
      if (error.status === 403) {
        this.error = 'You do not have permission to edit this transaction.';
      } else if (error.status === 404) {
        this.error = 'Transaction not found.';
      } else if (error.status === 400) {
        this.error = 'Invalid transaction data. Please check your inputs.';
      } else {
        this.error = 'Failed to update transaction. Please try again.';
      }
      this.notificationService.showError('Failed to update transaction. Please try again.');
    } finally {
      this.isSaving = false;
    }
  }

  deleteTransaction(transaction: Transaction): void {
    //console.log('Requesting to delete transaction:', transaction);
    this.deletingTransaction = transaction;
    this.showDeleteModal();
  }

  async confirmDelete(): Promise<void> {
    if (!this.deletingTransaction) return;

    this.isDeleting = true;
    this.error = null; // Clear previous errors
    
    try {
      //console.log('Deleting transaction:', this.deletingTransaction.id);

      const balanceImpact = -this.deletingTransaction.amount;
      
      const affectedAccount = this.accounts.find(acc => acc.account_Id === this.deletingTransaction!.accountId);
      if (!affectedAccount) {
        this.error = 'Account not found for this transaction.';
        this.isDeleting = false;
        return;
      }

      await this.transactionService.deleteTransaction(this.deletingTransaction.id).toPromise();
      
      //console.log('Transaction deleted successfully from database');
      
      affectedAccount.balance += balanceImpact;
      
      await this.accountService.updateAccount(affectedAccount).toPromise();
      //console.log('✅ Account balance updated in database');
      
      // Remover de la lista local
      this.allTransactions = this.allTransactions.filter(t => t.id !== this.deletingTransaction!.id);
      this.applyFilters(); // Refresh filtered data

      this.closeDeleteModal();
      
      // Mostrar mensaje de éxito con información del balance
      //console.log(`✅ Transaction deleted successfully. Balance adjusted: ${balanceImpact > 0 ? '+' : ''}${balanceImpact.toFixed(2)} ${affectedAccount.currency}`);
      this.notificationService.showSuccess(
        `${balanceImpact > 0 ? '+' : ''}${balanceImpact.toFixed(2)} ${affectedAccount.currency}`,
        this.deletingTransaction!.type
      );
      
    } catch (error: any) {
      console.error('❌ Error deleting transaction:', error);
      
      if (error.status === 403) {
        this.error = 'You do not have permission to delete this transaction.';
      } else if (error.status === 404) {
        this.error = 'Transaction not found.';
      } else {
        this.error = 'Failed to delete transaction. Please try again.';
      }
      this.notificationService.showError('Failed to delete transaction. Please try again.');
    } finally {
      this.isDeleting = false;
    }
  }

  private showEditModal(): void {
    // Using Bootstrap modal
    const modal = new (window as any).bootstrap.Modal(document.getElementById('editTransactionModal'));
    modal.show();
  }

  closeEditModal(): void {
    this.editingTransaction = null;
    this.editTransactionForm.reset();
    
    const modal = (window as any).bootstrap.Modal.getInstance(document.getElementById('editTransactionModal'));
    if (modal) {
      modal.hide();
    }
  }

  private showDeleteModal(): void {
    const modal = new (window as any).bootstrap.Modal(document.getElementById('deleteTransactionModal'));
    modal.show();
  }

  closeDeleteModal(): void {
    this.deletingTransaction = null;
    
    const modal = (window as any).bootstrap.Modal.getInstance(document.getElementById('deleteTransactionModal'));
    if (modal) {
      modal.hide();
    }
  }

  getEditableTransactionTypes(): string[] {
    return this.transactionTypes.filter(type => type !== 'All');
  }

  onTransactionSuccess(transaction: any) {
    this.notificationService.showSuccess(
      transaction.amount,
      transaction.type
    );
  }

  onTransactionError(error: any) {
    this.notificationService.showError('Error al procesar la transacción: ' + error.message);
  }
}
