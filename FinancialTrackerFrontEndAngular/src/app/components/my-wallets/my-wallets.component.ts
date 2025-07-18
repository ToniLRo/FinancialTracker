import { AfterViewInit, Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { AccountService, Transaction } from 'src/app/services/account/account.service';
import { Account } from 'src/app/models/account/account.model';
import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';

Swiper.use([Navigation, Pagination]);

@Component({
    selector: 'my-wallets',
    templateUrl: './my-wallets.component.html',
    styleUrls: ['./my-wallets.component.css'],
    standalone: false
})
export class MyWalletsComponent implements OnInit, AfterViewInit {
  accounts: Account[] = [];
  selectedAccount: Account | null = null;
  isEdit = false;
  showForm = false;
  transactionForm = { date: '', description: '', amount: 0, type: '', transactionType: 'expense' };
  showTransactionForm = false;
  showWithdrawForm = false;
  showDepositForm = false;
  private swiper: any;
  activeAccountIndex: number = 0;
  
  // Nuevas propiedades para validaciones y errores
  transactionError = '';
  withdrawError = '';
  depositError = '';
  isProcessing = false;
  
  // NUEVA: Variable para guardar el reference ID fijo para cada transacción
  currentReferenceId = '';

  constructor(private renderer: Renderer2, private accountService: AccountService) { }

  ngOnInit() {
    this.loadAccounts();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initSwiper();
    }, 100);
  }

  initSwiper() {
    if (this.accounts.length > 0) {
      this.swiper = new Swiper('.slide-content', {
        slidesPerView: 3,
        spaceBetween: 25,
        loop: this.accounts.length > 3,
        centeredSlides: true,
        grabCursor: true,
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
          dynamicBullets: true,
        },
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
        breakpoints: {
          0: { slidesPerView: 1 },
          520: { slidesPerView: 2 },
          950: { slidesPerView: 3 },
        },
        on: {
          slideChange: () => {
            this.updateActiveAccount();
          }
        }
      });
    }
  }

  loadAccounts() {
    this.accountService.getAccounts().subscribe({
      next: (accounts) => {
        this.accounts = accounts;
        
        if (this.accounts.length > 0) {
          this.selectedAccount = this.accounts[0];
          // Cargar transacciones de la primera cuenta
          this.loadTransactionsForAccount(this.accounts[0]);
        }
        
        this.initSwiper();
      },
      error: (error) => {
        console.error('Error loading accounts:', error);
      }
    });
  }

  loadTransactionsForAccount(account: Account) {
    if (account.account_Id) {
      // NUEVO: Verificar token antes de hacer la petición
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        this.transactionError = 'Please login again to view transactions';
        return;
      }

      this.accountService.getAccountTransactions(account.account_Id).subscribe({
        next: (transactions) => {
          account.transactions = transactions;
          console.log(`Loaded ${transactions.length} transactions for account ${account.account_Id}`);
        },
        error: (error) => {
          console.error('Error loading transactions:', error);
          
          if (error.status === 403) {
            this.transactionError = 'Authentication error. Please login again.';
            // Opcional: redirigir al login
            // this.router.navigate(['/login']);
          } else {
            this.transactionError = 'Error loading transactions. Please try again.';
          }
          
          // Inicializar array vacío para evitar errores en el template
          account.transactions = [];
        }
      });
    }
  }

  updateActiveAccount() {
    if (this.swiper && this.accounts.length > 0) {
      const realIndex = this.swiper.realIndex || this.swiper.activeIndex;
      this.activeAccountIndex = realIndex;
      this.selectedAccount = this.accounts[realIndex];
      
      // Cargar transacciones de la cuenta activa si no están cargadas
      if (this.selectedAccount && !this.selectedAccount.transactions) {
        this.loadTransactionsForAccount(this.selectedAccount);
      }
    }
  }

  getActiveAccount(): Account | null {
    return this.accounts[this.activeAccountIndex] || null;
  }

  getActiveAccountTransactions() {
    const activeAccount = this.getActiveAccount();
    return activeAccount?.transactions || [];
  }

  selectAccount(account: Account, index: number) {
    this.selectedAccount = account;
    this.activeAccountIndex = index;
    
    // Cargar transacciones si no están cargadas
    if (!account.transactions) {
      this.loadTransactionsForAccount(account);
    }
  }

  openAddForm() {
    this.selectedAccount = {
      account_name: '',
      account_type: 'CreditCard',
      initial_balance: 0,
      currency: 'USD'
    };
    this.isEdit = false;
    this.showForm = true;
  }

  openEditFormForActiveAccount() {
    const activeAccount = this.getActiveAccount();
    if (activeAccount) {
      this.selectedAccount = { ...activeAccount };
      this.isEdit = true;
      this.showForm = true;
    }
  }

  saveAccount(account: Account) {
    if (this.isEdit && account.account_Id) {
      this.accountService.updateAccount(account).subscribe({
        next: (updatedAccount) => {
          const index = this.accounts.findIndex(a => a.account_Id === account.account_Id);
          if (index !== -1) {
            this.accounts[index] = updatedAccount;
          }
          this.closeForm();
        },
        error: (error) => console.error('Error updating account:', error)
      });
    } else {
      this.accountService.addAccount(account).subscribe({
        next: (newAccount) => {
          this.accounts.push(newAccount);
          this.closeForm();
          setTimeout(() => this.initSwiper(), 100);
        },
        error: (error) => console.error('Error adding account:', error)
      });
    }
  }

  deleteActiveAccount() {
    const activeAccount = this.getActiveAccount();
    if (activeAccount && activeAccount.account_Id && confirm('Are you sure you want to delete this account?')) {
      this.accountService.deleteAccount(activeAccount.account_Id).subscribe({
        next: () => {
          this.accounts = this.accounts.filter(a => a.account_Id !== activeAccount.account_Id);
          if (this.accounts.length > 0) {
            this.activeAccountIndex = Math.min(this.activeAccountIndex, this.accounts.length - 1);
            this.selectedAccount = this.accounts[this.activeAccountIndex];
          } else {
            this.selectedAccount = null;
            this.activeAccountIndex = 0;
          }
          setTimeout(() => this.initSwiper(), 100);
        },
        error: (error) => console.error('Error deleting account:', error)
      });
    }
  }

  freezeAccount(account: Account) {
    account.frozen = !account.frozen;
    // Aquí puedes añadir una llamada al backend para actualizar el estado
    console.log(`Account ${account.frozen ? 'frozen' : 'unfrozen'}`);
  }

  openTransactionForm(account: Account) {
    this.selectedAccount = account;
    this.transactionForm = { 
      date: new Date().toISOString().split('T')[0], 
      description: '', 
      amount: 0, 
      type: 'Food',
      transactionType: 'expense'
    };
    this.transactionError = '';
    this.currentReferenceId = this.generateReferenceId(); // Generar una sola vez
    this.showTransactionForm = true;
  }

  openWithdrawForm(account: Account) {
    this.selectedAccount = account;
    this.transactionForm = { 
      date: new Date().toISOString().split('T')[0], 
      description: 'Withdrawal', 
      amount: 0, 
      type: 'Cash',
      transactionType: 'withdraw'
    };
    this.withdrawError = '';
    this.currentReferenceId = this.generateReferenceId(); // Generar una sola vez
    this.showWithdrawForm = true;
  }

  openDepositForm(account: Account) {
    this.selectedAccount = account;
    this.transactionForm = { 
      date: new Date().toISOString().split('T')[0], 
      description: 'Deposit', 
      amount: 0, 
      type: 'Income',
      transactionType: 'deposit'
    };
    this.depositError = '';
    this.currentReferenceId = this.generateReferenceId(); // Generar una sola vez
    this.showDepositForm = true;
  }

  validateTransaction(): boolean {
    const amount = this.transactionForm.amount;
    
    // Validaciones generales
    if (amount <= 0) {
      this.setError('Amount must be greater than 0');
      return false;
    }

    if (!this.transactionForm.description.trim()) {
      this.setError('Description is required');
      return false;
    }

    // Validación específica para retiros y gastos
    if (this.transactionForm.transactionType === 'withdraw' || this.transactionForm.transactionType === 'expense') {
      if (amount > this.selectedAccount!.initial_balance) {
        this.setError(`Insufficient funds. Available balance: ${this.selectedAccount!.initial_balance.toFixed(2)} ${this.selectedAccount!.currency}`);
        return false;
      }
    }

    return true;
  }

  setError(message: string) {
    if (this.showTransactionForm) this.transactionError = message;
    if (this.showWithdrawForm) this.withdrawError = message;
    if (this.showDepositForm) this.depositError = message;
  }

  clearErrors() {
    this.transactionError = '';
    this.withdrawError = '';
    this.depositError = '';
  }

  saveTransaction() {
    if (!this.validateTransaction() || this.isProcessing) return;

    this.isProcessing = true;
    this.clearErrors();

    if (this.selectedAccount && this.selectedAccount.account_Id) {
      // Calcular el monto final (negativo para gastos/retiros, positivo para ingresos/depósitos)
      let finalAmount = this.transactionForm.amount;
      if (this.transactionForm.transactionType === 'expense' || this.transactionForm.transactionType === 'withdraw') {
        finalAmount = -Math.abs(finalAmount);
      } else {
        finalAmount = Math.abs(finalAmount);
      }

      const transactionData = {
        date: this.transactionForm.date,
        description: this.transactionForm.description,
        amount: finalAmount,
        type: this.transactionForm.type,
        referenceId: this.currentReferenceId, // Usar el ID generado al abrir el modal
        accountId: this.selectedAccount.account_Id
      };
      
      this.accountService.addTransaction(transactionData).subscribe({
        next: (newTransaction) => {
          // Actualizar balance de la cuenta
          this.selectedAccount!.initial_balance += finalAmount;
          
          // Añadir transacción a la lista
          if (!this.selectedAccount!.transactions) {
            this.selectedAccount!.transactions = [];
          }
          this.selectedAccount!.transactions.unshift(newTransaction);
          
          // Actualizar la cuenta en el backend
          this.updateAccountBalance(this.selectedAccount!);
          
          this.closeAllForms();
          this.isProcessing = false;
        },
        error: (error) => {
          console.error('Error adding transaction:', error);
          
          if (error.status === 403) {
            this.setError('Authentication error. Please login again.');
          } else {
            this.setError('Error processing transaction. Please try again.');
          }
          
          this.isProcessing = false;
        }
      });
    }
  }

  updateAccountBalance(account: Account) {
    this.accountService.updateAccount(account).subscribe({
      next: (updatedAccount) => {
        // Actualizar la cuenta en la lista local
        const index = this.accounts.findIndex(a => a.account_Id === updatedAccount.account_Id);
        if (index !== -1) {
          this.accounts[index] = { ...updatedAccount, transactions: account.transactions };
        }
      },
      error: (error) => {
        console.error('Error updating account balance:', error);
      }
    });
  }

  closeAllForms() {
    this.showTransactionForm = false;
    this.showWithdrawForm = false;
    this.showDepositForm = false;
    this.transactionForm = { date: '', description: '', amount: 0, type: '', transactionType: 'expense' };
    this.currentReferenceId = ''; // Limpiar el reference ID
    this.clearErrors();
    this.isProcessing = false;
  }

  closeForm() {
    this.showForm = false;
    this.selectedAccount = null;
  }

  // Métodos de formateo (mantener existentes pero simplificados)
  formatCardNumber(accountType: string): string {
    // Generar número basado en el tipo de cuenta
    const prefixes = {
      'CreditCard': '4567',
      'BankAccount': '1234',
      'Cash': '9999'
    };
    const prefix = prefixes[accountType as keyof typeof prefixes] || '0000';
    return `${prefix} **** **** 3456`;
  }

  formatValidThru(): string {
    const now = new Date();
    const futureDate = new Date(now.getFullYear() + 3, now.getMonth());
    const month = (futureDate.getMonth() + 1).toString().padStart(2, '0');
    const year = futureDate.getFullYear().toString().slice(-2);
    return `${month}/${year}`;
  }

  truncateText(text: string, maxLength: number): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  getTransactionIconColor(type: string): string {
    const colors: { [key: string]: string } = {
      'Food': '#FF6B6B',
      'Transport': '#4ECDC4',
      'Shopping': '#45B7D1',
      'Entertainment': '#96CEB4',
      'Income': '#21be72',
      'Cash': '#FFA07A'
    };
    return colors[type] || '#666';
  }

  generateReferenceId(): string {
    return Math.random().toString(36).substring(2, 15).toUpperCase();
  }

  // Métodos helper para el template
  getFormattedBalance(account: Account): string {
    return `${account.initial_balance.toFixed(2)} ${account.currency}`;
  }

  getBalanceColor(account: Account): string {
    return account.initial_balance >= 0 ? '#21be72' : '#ff4757';
  }

  getTransactionColor(transaction: Transaction): string {
    return transaction.amount >= 0 ? '#21be72' : '#ff4757';
  }

  getTransactionSign(transaction: Transaction): string {
    return transaction.amount >= 0 ? '+' : '';
  }

  // NUEVA: Método para obtener reference ID para mostrar en el template
  getCurrentReferenceId(): string {
    return this.currentReferenceId || 'N/A';
  }
}


