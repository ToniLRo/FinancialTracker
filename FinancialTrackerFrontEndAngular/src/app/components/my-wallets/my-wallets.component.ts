import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
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

  showInspectModal = false;
  inspectingAccount: Account | null = null;

  
  // NUEVA: Variable para guardar el reference ID fijo para cada transacción
  currentReferenceId = '';
  router: any;

  // NUEVO: Propiedad directa para las transacciones activas
  activeAccountTransactions: any[] = [];

  // AÑADIR esta propiedad
  accountError: string = '';

  // NUEVAS propiedades para withdraw/deposit
  showWithdrawModal = false;
  showDepositModal = false;
  withdrawForm = { amount: 0, description: '' };
  depositForm = { amount: 0, description: '' };

  // NUEVAS propiedades para edición de transacciones
  showEditTransactionModal = false;
  showDeleteTransactionModal = false;
  editingTransaction: any = {};
  transactionToDelete: any = null;
  transactionEditError = '';
  transactionDeleteError = '';

  constructor(private renderer: Renderer2, private accountService: AccountService, private cdr: ChangeDetectorRef) { }

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
    console.log('Loading accounts');
    this.accountService.getAccounts().subscribe({
      next: (accounts) => {
        console.log('✅ Loaded user accounts:', accounts);
        this.accounts = accounts;
        
        // Debug cada cuenta individualmente
        this.accounts.forEach((account, index) => {
          console.log(`Account ${index}:`, account);
          console.log(`Account ${index} ID:`, account.account_Id);
          console.log(`Account ${index} ID type:`, typeof account.account_Id);
        });
        
        if (this.accounts.length > 0) {
          this.selectedAccount = this.accounts[0];
          this.activeAccountIndex = 0;
          
          // Mapear cuentas y cargar transacciones para la primera cuenta
          this.accounts = this.accounts.map(account => ({
            ...account,
            frozen: false,
            transactions: []
          }));
          
          // Cargar transacciones para la cuenta activa
          //console.log('Selected account:', this.selectedAccount);
          if (this.selectedAccount) {
            console.log('Loading transactions for selected account:', this.selectedAccount);
            this.loadTransactionsForAccount(this.selectedAccount);
          }
        }
        
        setTimeout(() => this.initSwiper(), 100);
      },
      error: (error) => {
        console.error('❌ Error loading accounts:', error);
      }
    });
  }

  loadTransactionsForAccount(account: Account) {
    console.log('Loading transactions for account:', account.account_Id);
    if (account.account_Id != null && account.account_Id !== undefined) {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        this.transactionError = 'Please login again to view transactions';
        return;
      }

      this.accountService.getAccountTransactions(account.account_Id).subscribe({
        next: (transactions) => {
          console.log('✅ API Response received:', transactions);
          
          // Guardar en la cuenta
          account.transactions = transactions;
          
          // NUEVO: Si es la cuenta activa, actualizar la lista visible
          if (this.selectedAccount && this.selectedAccount.account_Id === account.account_Id) {
            this.activeAccountTransactions = transactions;
            console.log('✅ Updated activeAccountTransactions:', this.activeAccountTransactions);
          }
          
          console.log(`✅ Loaded ${transactions.length} transactions for account ${account.account_Id}`);
        },
        error: (error) => {
          console.error('❌ API Error:', error);
          account.transactions = [];
          
          // NUEVO: También limpiar la lista activa si es necesario
          if (this.selectedAccount && this.selectedAccount.account_Id === account.account_Id) {
            this.activeAccountTransactions = [];
          }
        }
      });
    }
  }

  updateActiveAccount() {
    console.log('=== UPDATE ACTIVE ACCOUNT ===');
    if (this.swiper && this.accounts.length > 0) {
      const realIndex = this.swiper.realIndex || this.swiper.activeIndex;
      console.log('Swiper realIndex:', realIndex);
      console.log('Current activeAccountIndex:', this.activeAccountIndex);
      
      this.activeAccountIndex = realIndex;
      this.selectedAccount = this.accounts[realIndex];
      
      console.log('New selectedAccount:', this.selectedAccount);
      console.log('Selected account has transactions?', !!this.selectedAccount?.transactions);
      
      // NUEVO: Actualizar inmediatamente las transacciones visibles
      this.activeAccountTransactions = this.selectedAccount?.transactions || [];
      console.log('✅ Updated activeAccountTransactions:', this.activeAccountTransactions);
      
      // Cargar transacciones si no existen
      if (this.selectedAccount && (!this.selectedAccount.transactions || this.selectedAccount.transactions.length === 0)) {
        console.log('🔄 Loading transactions for account...');
        this.loadTransactionsForAccount(this.selectedAccount);
      }
    } else {
      console.log('❌ No swiper or no accounts');
    }
  }

  getActiveAccount(): Account | null {
    return this.accounts[this.activeAccountIndex] || null;
  }

  selectAccount(account: Account, index: number) {
    console.log('=== SELECT ACCOUNT ===');
    console.log('Selected account:', account);
    
    this.selectedAccount = account;
    this.activeAccountIndex = index;
    
    // NUEVO: Actualizar inmediatamente las transacciones visibles
    this.activeAccountTransactions = account.transactions || [];
    console.log('✅ Set activeAccountTransactions:', this.activeAccountTransactions);
    
    // Cargar transacciones si no existen
    if (!account.transactions || account.transactions.length === 0) {
      console.log('🔄 Loading transactions...');
      this.loadTransactionsForAccount(account);
    }
    
    if (this.swiper) {
      this.swiper.slideTo(index);
    }
  }

  openAddForm() {
    this.selectedAccount = {
      holder_name: '',
      account_number: '',
      account_type: 'CreditCard',
      balance: 0,
      currency: 'USD',
      good_thru: this.generateGoodThru() // NUEVO: Generar automáticamente
    };
    this.isEdit = false;
    this.showForm = true;
    this.accountError = '';
  }

  openEditFormForActiveAccount() {
    const activeAccount = this.getActiveAccount();
    if (!activeAccount) {
      alert('No hay cuenta seleccionada para editar.');
      return;
    }
    
    if (!activeAccount.account_Id) {
      alert('Error: La cuenta no tiene un ID válido.');
      return;
    }

    // Crear una copia profunda para editar
    this.selectedAccount = {
      ...activeAccount,
      holder_name: activeAccount.holder_name || 'John Doe' // Valor por defecto si no existe
    };
    
    this.isEdit = true;
    this.showForm = true;
    console.log('📝 Opening edit form for account:', this.selectedAccount);
  }

  saveAccount(account: Account) {
    if (!this.validateAccountForm(account)) {
      return;
    }

    this.isProcessing = true;
    this.clearErrors();

    if (this.isEdit && account.account_Id) {
      // EDITAR cuenta existente
      this.accountService.updateAccount(account).subscribe({
        next: (updatedAccount) => {
          console.log('✅ Account updated successfully:', updatedAccount);
          
          // Actualizar la cuenta en la lista local
          const index = this.accounts.findIndex(a => a.account_Id === account.account_Id);
          if (index !== -1) {
            // Mantener las transacciones existentes
            const existingTransactions = this.accounts[index].transactions;
            this.accounts[index] = { ...updatedAccount, transactions: existingTransactions };
            
            // Si es la cuenta activa, actualizarla también
            if (this.selectedAccount?.account_Id === account.account_Id) {
              this.selectedAccount = this.accounts[index];
            }
          }
          
          this.closeForm();
          this.isProcessing = false;
          alert('Cuenta actualizada exitosamente.');
        },
        error: (error) => {
          console.error('Error updating account:', error);
          this.handleAccountError(error);
        }
      });
    } else {
      // CREAR nueva cuenta
      this.accountService.addAccount(account).subscribe({
        next: (newAccount) => {
          console.log('✅ Account created successfully:', newAccount);
          
          // Añadir la nueva cuenta con propiedades adicionales
          const accountWithExtras = {
            ...newAccount,
            frozen: false,
            transactions: []
          };
          
          this.accounts.push(accountWithExtras);
          this.closeForm();
          this.isProcessing = false;
          
          // Seleccionar la nueva cuenta automáticamente
          this.activeAccountIndex = this.accounts.length - 1;
          this.selectedAccount = accountWithExtras;
          this.activeAccountTransactions = [];
          
          // Reinicializar Swiper para incluir la nueva cuenta
          setTimeout(() => this.initSwiper(), 100);
          
          alert('Cuenta creada exitosamente.');
        },
        error: (error) => {
          console.error('Error adding account:', error);
          this.handleAccountError(error);
        }
      });
    }
  }

  deleteActiveAccount() {
    const activeAccount = this.getActiveAccount();
    if (!activeAccount || !activeAccount.account_Id) {
      alert('No hay cuenta seleccionada para eliminar.');
      return;
    }

    // Verificar si tiene transacciones
    const hasTransactions = activeAccount.transactions && activeAccount.transactions.length > 0;
    const warningMessage = hasTransactions 
      ? `¿Estás seguro de que quieres eliminar esta cuenta?\n\nTiene ${activeAccount.transactions!.length} transacciones que también se eliminarán.\n\nEsta acción no se puede deshacer.`
      : `¿Estás seguro de que quieres eliminar la cuenta "${activeAccount.holder_name}"?\n\nEsta acción no se puede deshacer.`;

    if (confirm(warningMessage)) {
      this.isProcessing = true;
      
      this.accountService.deleteAccount(activeAccount.account_Id).subscribe({
        next: () => {
          console.log('✅ Account deleted successfully');
          
          // Eliminar cuenta de la lista local
          this.accounts = this.accounts.filter(a => a.account_Id !== activeAccount.account_Id);
          
          // Limpiar transacciones activas
          this.activeAccountTransactions = [];
          
          // Manejar navegación después de eliminar
          if (this.accounts.length > 0) {
            // Si hay más cuentas, seleccionar la más cercana
            this.activeAccountIndex = Math.min(this.activeAccountIndex, this.accounts.length - 1);
            this.selectedAccount = this.accounts[this.activeAccountIndex];
            this.loadTransactionsForAccount(this.selectedAccount);
            
            // Reinicializar Swiper
            setTimeout(() => this.initSwiper(), 100);
          } else {
            // No hay más cuentas
            this.selectedAccount = null;
            this.activeAccountIndex = 0;
          }
          
          this.isProcessing = false;
          alert('Cuenta eliminada exitosamente.');
        },
        error: (error) => {
          console.error('Error deleting account:', error);
          this.isProcessing = false;
          
          if (error.status === 403) {
            alert('Error de autenticación. Por favor, inicia sesión nuevamente.');
          } else if (error.status === 404) {
            alert('La cuenta no existe o ya fue eliminada.');
          } else {
            alert('Error al eliminar la cuenta. Por favor, intenta nuevamente.');
          }
        }
      });
    }
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
      if (amount > this.selectedAccount!.balance) {
        this.setError(`Insufficient funds. Available balance: ${this.selectedAccount!.balance.toFixed(2)} ${this.selectedAccount!.currency}`);
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
    console.log('Saving transaction:', this.transactionForm);
    if (!this.validateTransaction() || this.isProcessing) return;

    this.isProcessing = true;
    this.clearErrors();

    // NUEVO: Verificar token antes de enviar
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      this.setError('No authentication token found. Please login again.');
      this.isProcessing = false;
      return;
    }

    console.log('Token length:', token.length); // Debug
    console.log('Sending transaction data:', this.transactionForm); // Debug

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
          console.log('Transaction created successfully:', newTransaction); // Debug
          // Actualizar balance de la cuenta
          this.selectedAccount!.balance += finalAmount;
          
          // Añadir transacción a la lista
          if (!this.selectedAccount!.transactions) {
            this.selectedAccount!.transactions = [];
          }
          this.selectedAccount!.transactions.unshift(newTransaction);
          
          // Actualizar la cuenta en el backend
          this.updateAccountBalance(this.selectedAccount!);
          
          // NUEVO: Actualizar inmediatamente la lista visible
          this.activeAccountTransactions = [...this.selectedAccount!.transactions];
          console.log('✅ Updated activeAccountTransactions with new transaction');
          
          this.closeAllForms();
          this.isProcessing = false;
        },
        error: (error) => {
          console.error('Error adding transaction:', error);
          console.error('Error status:', error.status); // Debug
          console.error('Error body:', error.error); // Debug
          
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
    this.showWithdrawModal = false; // NUEVO
    this.showDepositModal = false;  // NUEVO
    this.transactionForm = { date: '', description: '', amount: 0, type: '', transactionType: 'expense' };
    this.withdrawForm = { amount: 0, description: '' }; // NUEVO
    this.depositForm = { amount: 0, description: '' };  // NUEVO
    this.currentReferenceId = '';
    this.clearErrors();
    this.isProcessing = false;
  }

  closeForm() {
    this.showForm = false;
    this.selectedAccount = null;
  }

  // Métodos de formateo (mantener existentes pero simplificados)
  formatCardNumber(accountNumber: string, accountType?: string): string {
    if (!accountNumber) {
      // Si no hay número, generar uno de ejemplo basado en el tipo
      const prefixes = {
        'CreditCard': '4567',
        'BankAccount': '1234',
        'Cash': '9999'
      };
      const prefix = prefixes[accountNumber as keyof typeof prefixes];
      return `${prefix} **** **** ${accountNumber.slice(-4)}`;
    }

    // Si hay número real, formatearlo según el tipo
    const cleanNumber = accountNumber.replace(/\D/g, '');
    
    if (accountType === 'CreditCard') {
      // Formato: 1234 5678 9012 3456
      if (cleanNumber.length >= 16) {
        return cleanNumber.replace(/(\d{4})(?=\d)/g, '$1 ');
      } else {
        // Mostrar parcialmente con asteriscos
        return `${cleanNumber.substring(0, 4)} **** **** ${cleanNumber.slice(-4)}`;
      }
    } else if (accountType === 'BankAccount') {
      // Formato: 1234-5678-9012
      if (cleanNumber.length >= 10) {
        return cleanNumber.replace(/(\d{4})(?=\d)/g, '$1-');
      } else {
        return `${cleanNumber.substring(0, 4)}-****-${cleanNumber.slice(-4)}`;
      }
    } else if (accountType === 'Cash') {
      // Formato: CASH-1234
      return accountNumber; // Ya viene formateado como CASH-1234
    }

    // Fallback
    return accountNumber;
  }

  truncateText(text: string, maxLength: number): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  // NUEVO: Método para obtener el icono según el tipo de transacción
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
      'Refund': 'bi-arrow-clockwise'
    };
    
    return icons[type] || 'bi-circle-fill'; // Icono por defecto
  }

  // ACTUALIZAR: Método para obtener clase CSS según el tipo
  getTransactionIconClass(type: string): string {
    const positiveTypes = ['Income', 'Deposit', 'Salary', 'Freelance', 'Bonus', 'Refund', 'Gift'];
    const negativeTypes = ['Withdraw'];
    
    if (positiveTypes.includes(type)) {
      return 'transaction-icon positive';
    } else if (negativeTypes.includes(type)) {
      return 'transaction-icon negative';
    } else {
      return 'transaction-icon neutral';
    }
  }

  // MEJORAR: El método existente de color de icono
  getTransactionIconColor(type: string): string {
    const colors: { [key: string]: string } = {
      // Colores específicos por tipo
      'Food': '#FF6B6B',           // Rojo suave
      'Transport': '#4ECDC4',      // Azul turquesa
      'Shopping': '#45B7D1',       // Azul
      'Entertainment': '#96CEB4',   // Verde menta
      'Bills': '#FECA57',          // Amarillo
      'Healthcare': '#FF9FF3',     // Rosa
      'Education': '#54A0FF',      // Azul claro
      'Gift': '#5F27CD',           // Morado
      
      // Colores para ingresos/movimientos
      'Income': '#21be72',         // Verde principal
      'Deposit': '#21be72',        // Verde
      'Withdraw': '#ff4757',       // Rojo
      'Salary': '#2ed573',         // Verde claro
      'Freelance': '#3742fa',      // Azul oscuro
      'Bonus': '#ffa502',          // Naranja
      'Transfer': '#747d8c',       // Gris
      'Investment': '#7bed9f',     // Verde agua
      'Refund': '#70a1ff'          // Azul suave
    };
    
    return colors[type] || '#666'; // Color por defecto
  }

  generateReferenceId(): string {
    return Math.random().toString(36).substring(2, 15).toUpperCase();
  }

  // Métodos helper para el template
  getFormattedBalance(account: Account): string {
    return `${account.balance.toFixed(2)} ${account.currency}`;
  }

  getBalanceColor(account: Account): string {
    return account.balance >= 0 ? '#21be72' : '#ff4757';
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

  trackByTransactionId(index: number, transaction: any): any {
    return transaction.id || index;
  }

  // Mantener solo para debug si necesitas
  getActiveAccountTransactions() {
    console.log('⚠️ getActiveAccountTransactions called - should use activeAccountTransactions property instead');
    return this.activeAccountTransactions;
  }

  // NUEVO: Validación del formulario de cuenta
  private validateAccountForm(account: Account): boolean {
    if (!account.holder_name || account.holder_name.trim() === '') {
      alert('El nombre de la cuenta es obligatorio.');
      return false;
    }

      if (account.holder_name.length > 50) {
      alert('El nombre de la cuenta no puede tener más de 50 caracteres.');
      return false;
    }

    if (!account.account_type) {
      alert('Debe seleccionar un tipo de cuenta.');
      return false;
    }

    if (account.balance === null || account.balance === undefined) {
      this.accountError = 'El balance es obligatorio.';
      return false;
    }

    if (account.balance < 0) {
      this.accountError = 'El balance no puede ser negativo.';
      return false;
    }

    if (!account.currency || account.currency.trim() === '') {
      alert('La moneda es obligatoria.');
      return false;
    }

    if (!account.holder_name || account.holder_name.trim() === '') {
      alert('El nombre del titular es obligatorio.');
      return false;
    }

    // NUEVA: Validación para good_thru
    if ((account.account_type === 'CreditCard' || account.account_type === 'BankAccount')) {
      if (!account.good_thru || account.good_thru.trim() === '') {
        this.accountError = 'La fecha de vencimiento es obligatoria para tarjetas de crédito y cuentas bancarias.';
        return false;
      }

      if (!this.validateGoodThru(account.good_thru)) {
        this.accountError = 'Formato de fecha de vencimiento inválido o fecha expirada (use MM/AA).';
        return false;
      }
    }

    return true;
  }

  // NUEVO: Manejo centralizado de errores de cuenta
  private handleAccountError(error: any) {
    this.isProcessing = false;
    
    if (error.status === 403) {
      this.accountError = 'Error de autenticación. Por favor, inicia sesión nuevamente.';
    } else if (error.status === 400) {
      this.accountError = 'Datos inválidos. Verifica la información e intenta nuevamente.';
    } else if (error.status === 409) {
      this.accountError = 'Ya existe una cuenta con ese nombre.';
    } else {
      this.accountError = 'Error al procesar la cuenta. Por favor, intenta nuevamente.';
    }
  }

  /**
   * Formatear número de cuenta según el tipo
   */
  formatAccountNumber(value: string, accountType: string): string {
    if (!value) return '';
    
    // Remover todo lo que no sean números
    const numbers = value.replace(/\D/g, '');
    
    switch (accountType) {
      case 'CreditCard':
        // Formato: 1234 5678 9012 3456 (16 dígitos)
        return numbers.replace(/(\d{4})(?=\d)/g, '$1 ').substring(0, 19);
        
      case 'BankAccount':
        // Formato: 1234-5678-9012 (12 dígitos)
        return numbers.replace(/(\d{4})(?=\d)/g, '$1-').substring(0, 14);
        
      case 'Cash':
        // Formato: CASH-1234 (4 dígitos)
        return `CASH-${numbers.substring(0, 4)}`;
        
      default:
        return numbers.substring(0, 16);
    }
  }

  /**
   * Manejar input del número de cuenta con formato automático
   */
  onAccountNumberInput(event: any): void {
    const input = event.target;
    const accountType = this.selectedAccount?.account_type || 'CreditCard';
    const formattedValue = this.formatAccountNumber(input.value, accountType);
    
    // Actualizar el valor en el modelo y en el input
    if (this.selectedAccount) {
      this.selectedAccount.account_number = formattedValue;
    }
    input.value = formattedValue;
  }

  /**
   * Validar número de cuenta según el tipo
   */
  validateAccountNumber(accountNumber: string, accountType: string): boolean {
    if (!accountNumber) return false;
    
    const numbers = accountNumber.replace(/\D/g, '');
    
    switch (accountType) {
      case 'CreditCard':
        return numbers.length === 16;
      case 'BankAccount':
        return numbers.length >= 10 && numbers.length <= 12;
      case 'Cash':
        return numbers.length === 4;
      default:
        return false;
    }
  }

  /**
   * Obtener placeholder según el tipo de cuenta
   */
  getAccountNumberPlaceholder(accountType: string): string {
    switch (accountType) {
      case 'CreditCard':
        return '1234 5678 9012 3456';
      case 'BankAccount':
        return '1234-5678-9012';
      case 'Cash':
        return 'CASH-1234';
      default:
        return 'Enter account number';
    }
  }

  /**
   * Obtener longitud máxima según el tipo
   */
  getAccountNumberMaxLength(accountType: string): number {
    switch (accountType) {
      case 'CreditCard':
        return 19; // 16 dígitos + 3 espacios
      case 'BankAccount':
        return 14; // 12 dígitos + 2 guiones
      case 'Cash':
        return 9;  // CASH- + 4 dígitos
      default:
        return 20;
    }
  }

  /**
   * Generar número de cuenta automático
   */
  generateAccountNumber(accountType: string): string {
    const randomNumbers = () => Math.floor(Math.random() * 10);
    
    switch (accountType) {
      case 'CreditCard':
        const ccNumber = Array.from({length: 16}, randomNumbers).join('');
        return this.formatAccountNumber(ccNumber, accountType);
        
      case 'BankAccount':
        const bankNumber = Array.from({length: 12}, randomNumbers).join('');
        return this.formatAccountNumber(bankNumber, accountType);
        
      case 'Cash':
        const cashNumber = Array.from({length: 4}, randomNumbers).join('');
        return this.formatAccountNumber(cashNumber, accountType);
        
      default:
        return '';
    }
  }

  /**
   * Formatear fecha de vencimiento MM/YY
   */
  formatGoodThru(value: string): string {
    if (!value) return '';
    
    // Remover todo lo que no sean números
    const numbers = value.replace(/\D/g, '');
    
    // Formatear como MM/YY
    if (numbers.length >= 2) {
      const month = numbers.substring(0, 2);
      const year = numbers.substring(2, 4);
      return year ? `${month}/${year}` : month;
    }
    
    return numbers;
  }

  /**
   * Manejar input del good_thru con formato automático
   */
  onGoodThruInput(event: any): void {
    const input = event.target;
    const formattedValue = this.formatGoodThru(input.value);
    
    // Actualizar el valor en el modelo y en el input
    if (this.selectedAccount) {
      this.selectedAccount.good_thru = formattedValue;
    }
    input.value = formattedValue;
  }

  /**
   * Validar fecha de vencimiento MM/YY
   */
  validateGoodThru(goodThru: string): boolean {
    if (!goodThru) return false;
    
    const regex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!regex.test(goodThru)) return false;
    
    const [month, year] = goodThru.split('/');
    const monthNum = parseInt(month);
    const yearNum = parseInt(`20${year}`);
    
    // Verificar que el mes sea válido
    if (monthNum < 1 || monthNum > 12) return false;
    
    // Verificar que la fecha no sea pasada
    const now = new Date();
    const expiry = new Date(yearNum, monthNum - 1);
    
    return expiry > now;
  }

  /**
   * Generar good_thru automático (3 años en el futuro)
   */
  generateGoodThru(): string {
    const now = new Date();
    const futureDate = new Date(now.getFullYear() + 3, now.getMonth());
    const month = (futureDate.getMonth() + 1).toString().padStart(2, '0');
    const year = futureDate.getFullYear().toString().slice(-2);
    return `${month}/${year}`;
  }

  onAccountTypeChange(): void {
    if (this.selectedAccount && !this.isEdit) {
      // Auto-generar número cuando cambia el tipo (solo en modo añadir)
      this.selectedAccount.account_number = this.generateAccountNumber(this.selectedAccount.account_type);
      
      // Auto-generar good_thru solo para CreditCard y BankAccount
      if (this.selectedAccount.account_type === 'CreditCard' || this.selectedAccount.account_type === 'BankAccount') {
        this.selectedAccount.good_thru = this.generateGoodThru();
      } else {
        this.selectedAccount.good_thru = '';
      }
    }
  }

  formatValidThru(account?: Account): string {
    if (account && account.good_thru) {
      return account.good_thru;
    }
    
    // Fallback al valor generado automáticamente
    const now = new Date();
    const futureDate = new Date(now.getFullYear() + 3, now.getMonth());
    const month = (futureDate.getMonth() + 1).toString().padStart(2, '0');
    const year = futureDate.getFullYear().toString().slice(-2);
    return `${month}/${year}`;
  }

  // NUEVOS métodos para Withdraw
  openWithdrawModal() {
    const activeAccount = this.getActiveAccount();
    if (!activeAccount) {
      alert('Por favor selecciona una cuenta para retirar dinero.');
      return;
    }
    
    this.withdrawForm = { amount: 0, description: '' };
    this.showWithdrawModal = true;
    this.clearErrors();
  }

  closeWithdrawModal() {
    this.showWithdrawModal = false;
    this.withdrawForm = { amount: 0, description: '' };
    this.clearErrors();
    this.isProcessing = false;
  }

  processWithdraw() {
    if (!this.validateWithdraw()) return;

    this.isProcessing = true;
    this.clearErrors();

    const activeAccount = this.getActiveAccount();
    if (!activeAccount || !activeAccount.account_Id) {
      this.setError('Error: No se pudo identificar la cuenta.');
      this.isProcessing = false;
      return;
    }

    // Verificar si hay suficiente balance
    if (activeAccount.balance < this.withdrawForm.amount) {
      this.setError('Fondos insuficientes para realizar este retiro.');
      this.isProcessing = false;
      return;
    }

    // Crear transacción de retiro (amount negativo)
    const withdrawTransaction = {
      date: new Date().toISOString().split('T')[0],
      description: this.withdrawForm.description || 'ATM Withdrawal',
      amount: -Math.abs(this.withdrawForm.amount), // Siempre negativo
      type: 'Withdraw',
      referenceId: this.generateReferenceId(),
      accountId: activeAccount.account_Id
    };

    console.log('Processing withdraw:', withdrawTransaction);

    this.accountService.addTransaction(withdrawTransaction).subscribe({
      next: (savedTransaction) => {
        console.log('✅ Withdraw transaction saved:', savedTransaction);

        // Actualizar balance local
        activeAccount.balance -= this.withdrawForm.amount;

        // Añadir transacción a la lista local
        if (!activeAccount.transactions) {
          activeAccount.transactions = [];
        }
        const newTransaction = {
          ...savedTransaction,
          referenceId: withdrawTransaction.referenceId
        };
        activeAccount.transactions.unshift(newTransaction);

        // Actualizar balance en backend
        this.updateAccountBalance(activeAccount);

        // Actualizar la lista visible
        this.activeAccountTransactions = [...activeAccount.transactions];

        this.closeWithdrawModal();
        alert(`Retiro exitoso: ${this.withdrawForm.amount} ${activeAccount.currency}`);
      },
      error: (error) => {
        console.error('Error processing withdraw:', error);
        this.handleTransactionError(error);
      }
    });
  }

  validateWithdraw(): boolean {
    if (!this.withdrawForm.amount || this.withdrawForm.amount <= 0) {
      this.setError('Debe ingresar un monto válido mayor a 0.');
      return false;
    }

    if (this.withdrawForm.amount > 999999) {
      this.setError('El monto no puede exceder 999,999.');
      return false;
    }

    return true;
  }

  // NUEVOS métodos para Deposit
  openDepositModal() {
    const activeAccount = this.getActiveAccount();
    if (!activeAccount) {
      alert('Por favor selecciona una cuenta para depositar dinero.');
      return;
    }
    
    this.depositForm = { amount: 0, description: '' };
    this.showDepositModal = true;
    this.clearErrors();
  }

  closeDepositModal() {
    this.showDepositModal = false;
    this.depositForm = { amount: 0, description: '' };
    this.clearErrors();
    this.isProcessing = false;
  }

  processDeposit() {
    if (!this.validateDeposit()) return;

    this.isProcessing = true;
    this.clearErrors();

    const activeAccount = this.getActiveAccount();
    if (!activeAccount || !activeAccount.account_Id) {
      this.setError('Error: No se pudo identificar la cuenta.');
      this.isProcessing = false;
      return;
    }

    // Crear transacción de depósito (amount positivo)
    const depositTransaction = {
      date: new Date().toISOString().split('T')[0],
      description: this.depositForm.description || 'Cash Deposit',
      amount: Math.abs(this.depositForm.amount), // Siempre positivo
      type: 'Deposit',
      referenceId: this.generateReferenceId(),
      accountId: activeAccount.account_Id
    };

    console.log('Processing deposit:', depositTransaction);

    this.accountService.addTransaction(depositTransaction).subscribe({
      next: (savedTransaction) => {
        console.log('✅ Deposit transaction saved:', savedTransaction);

        // Actualizar balance local
        activeAccount.balance += this.depositForm.amount;

        // Añadir transacción a la lista local
        if (!activeAccount.transactions) {
          activeAccount.transactions = [];
        }
        const newTransaction = {
          ...savedTransaction,
          referenceId: depositTransaction.referenceId
        };
        activeAccount.transactions.unshift(newTransaction);

        // Actualizar balance en backend
        this.updateAccountBalance(activeAccount);

        // Actualizar la lista visible
        this.activeAccountTransactions = [...activeAccount.transactions];

        this.closeDepositModal();
        alert(`Depósito exitoso: +${this.depositForm.amount} ${activeAccount.currency}`);
      },
      error: (error) => {
        console.error('Error processing deposit:', error);
        this.handleTransactionError(error);
      }
    });
  }

  validateDeposit(): boolean {
    if (!this.depositForm.amount || this.depositForm.amount <= 0) {
      this.setError('Debe ingresar un monto válido mayor a 0.');
      return false;
    }

    if (this.depositForm.amount > 999999) {
      this.setError('El monto no puede exceder 999,999.');
      return false;
    }

    return true;
  }

  // NUEVO método helper para manejar errores de transacciones
  private handleTransactionError(error: any): string { // Añadir return type
    this.isProcessing = false;
    
    if (error.status === 403) {
      return 'Error de autenticación. Por favor, inicia sesión nuevamente.';
    } else if (error.status === 400) {
      return 'Datos inválidos. Verifica la información e intenta nuevamente.';
    } else {
      return 'Error al procesar la transacción. Por favor, intenta nuevamente.';
    }
  }

  // NUEVO: Abrir modal de edición de transacción
  openEditTransactionModal(transaction: any, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    
    this.editingTransaction = {
      id: transaction.id, // Cambiar de transaction_Id a id
      date: transaction.date,
      description: transaction.description,
      amount: transaction.amount,
      type: transaction.type,
      accountId: transaction.accountId // Cambiar de account_Id a accountId
    };
    
    this.showEditTransactionModal = true;
    this.transactionEditError = '';
  }

  // NUEVO: Cerrar modal de edición de transacción
  closeEditTransactionModal() {
    this.showEditTransactionModal = false;
    this.editingTransaction = {};
    this.transactionEditError = '';
  }

  // NUEVO: Guardar transacción editada
  saveEditedTransaction() {
    if (!this.validateTransactionEdit()) {
      return;
    }

    this.isProcessing = true;
    this.transactionEditError = '';

    // NUEVO: Calcular la diferencia en el balance
    const originalTransaction = this.activeAccountTransactions.find(t => t.id === this.editingTransaction.id);
    if (!originalTransaction) {
      this.transactionEditError = 'No se encontró la transacción original';
      this.isProcessing = false;
      return;
    }

    const balanceDifference = this.editingTransaction.amount - originalTransaction.amount;

    this.accountService.updateTransaction(this.editingTransaction).subscribe({
      next: (updatedTransaction) => {
        console.log('✅ Transaction updated successfully:', updatedTransaction);
        
        // NUEVO: Actualizar el balance de la cuenta
        if (this.selectedAccount) {
          this.selectedAccount.balance += balanceDifference;
          
          // Actualizar también en la lista de cuentas
          const accountIndex = this.accounts.findIndex(a => a.account_Id === this.selectedAccount?.account_Id);
          if (accountIndex !== -1) {
            this.accounts[accountIndex].balance = this.selectedAccount.balance;
          }
          
          // NUEVO: Guardar el balance actualizado en la base de datos
          this.updateAccountBalance(this.selectedAccount);
        }
        
        // Actualizar la transacción en la lista local
        const index = this.activeAccountTransactions.findIndex(t => t.id === updatedTransaction.id);
        if (index !== -1) {
          this.activeAccountTransactions[index] = updatedTransaction;
        }
        
        // Actualizar también en la cuenta seleccionada
        if (this.selectedAccount && this.selectedAccount.transactions) {
          const accountIndex = this.selectedAccount.transactions.findIndex(t => t.id === updatedTransaction.id);
          if (accountIndex !== -1) {
            this.selectedAccount.transactions[accountIndex] = updatedTransaction;
          }
        }
        
        this.closeEditTransactionModal();
        this.isProcessing = false;
        
        // Mostrar mensaje de éxito
        this.showSuccessMessage(`Transacción actualizada. Balance ajustado: ${balanceDifference > 0 ? '+' : ''}${balanceDifference.toFixed(2)} ${this.selectedAccount?.currency}`);
      },
      error: (error) => {
        console.error('❌ Error updating transaction:', error);
        this.transactionEditError = this.handleTransactionError(error);
        this.isProcessing = false;
      }
    });
  }

  // NUEVO: Validar edición de transacción
  private validateTransactionEdit(): boolean {
    if (!this.editingTransaction.description || this.editingTransaction.description.trim() === '') {
      this.transactionEditError = 'Description is required';
      return false;
    }
    
    if (!this.editingTransaction.amount || this.editingTransaction.amount === 0) {
      this.transactionEditError = 'Amount must be greater than 0';
      return false;
    }
    
    if (!this.editingTransaction.type) {
      this.transactionEditError = 'Transaction type is required';
      return false;
    }
    
    if (!this.editingTransaction.date) {
      this.transactionEditError = 'Date is required';
      return false;
    }
    
    return true;
  }

  // NUEVO: Abrir modal de confirmación para eliminar transacción
  deleteTransaction(transaction: any, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    
    this.transactionToDelete = transaction;
    this.showDeleteTransactionModal = true;
    this.transactionDeleteError = '';
  }

  // NUEVO: Cerrar modal de confirmación para eliminar transacción
  closeDeleteTransactionModal() {
    this.showDeleteTransactionModal = false;
    this.transactionToDelete = null;
    this.transactionDeleteError = '';
  }

  // NUEVO: Confirmar eliminación de transacción
  confirmDeleteTransaction() {
    if (!this.transactionToDelete) {
      return;
    }

    this.isProcessing = true;
    this.transactionDeleteError = '';

    // NUEVO: Calcular el impacto en el balance (revertir la transacción)
    const balanceImpact = -this.transactionToDelete.amount; // Revertir el monto

    this.accountService.deleteTransaction(this.transactionToDelete.id).subscribe({
      next: () => {
        console.log('✅ Transaction deleted successfully');
        
        // NUEVO: Actualizar el balance de la cuenta
        if (this.selectedAccount) {
          this.selectedAccount.balance += balanceImpact;
          
          // Actualizar también en la lista de cuentas
          const accountIndex = this.accounts.findIndex(a => a.account_Id === this.selectedAccount?.account_Id);
          if (accountIndex !== -1) {
            this.accounts[accountIndex].balance = this.selectedAccount.balance;
          }
          
          // NUEVO: Guardar el balance actualizado en la base de datos
          this.updateAccountBalance(this.selectedAccount);
        }
        
        // Remover la transacción de la lista local
        this.activeAccountTransactions = this.activeAccountTransactions.filter(
          t => t.id !== this.transactionToDelete.id
        );
        
        // Remover también de la cuenta seleccionada
        if (this.selectedAccount && this.selectedAccount.transactions) {
          this.selectedAccount.transactions = this.selectedAccount.transactions.filter(
            t => t.id !== this.transactionToDelete.id
          );
        }
        
        this.closeDeleteTransactionModal();
        this.isProcessing = false;
        
        // Mostrar mensaje de éxito
        this.showSuccessMessage(`Transacción eliminada. Balance ajustado: ${balanceImpact > 0 ? '+' : ''}${balanceImpact.toFixed(2)} ${this.selectedAccount?.currency}`);
      },
      error: (error) => {
        console.error('❌ Error deleting transaction:', error);
        this.transactionDeleteError = this.handleTransactionError(error);
        this.isProcessing = false;
      }
    });
  }

  // NUEVO: Mostrar mensaje de éxito
  private showSuccessMessage(message: string) {
    // Puedes implementar un toast o notificación aquí
    console.log('✅ Success:', message);
    // Ejemplo con alert temporal:
    // alert(message);
  }

  openInspectModal() {
    const activeAccount = this.getActiveAccount();
    if (!activeAccount) {
      alert('No hay cuenta seleccionada para inspeccionar.');
      return;
    }
    
    this.showInspectModal = true;
  }

    // NUEVO: Cerrar modal de inspección
    closeInspectModal() {
      this.showInspectModal = false;
    }
  
    // NUEVO: Obtener total de ingresos
    getTotalIncome(): number {
      const account = this.getActiveAccount();
      if (!account?.transactions) return 0;
      
      return account.transactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);
    }
  
    // NUEVO: Obtener total de gastos
    getTotalExpenses(): number {
      const account = this.getActiveAccount();
      if (!account?.transactions) return 0;
      
      return Math.abs(account.transactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + t.amount, 0));
    }

  // NUEVO: Obtener transacciones recientes (últimas 5)
  getRecentTransactions(): any[] {
    const account = this.getActiveAccount();
    if (!account?.transactions) return [];
    
    return account.transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }

  // NUEVO: Calcular días desde la creación
  getDaysSinceCreation(): number {
    const account = this.getActiveAccount();
    if (!account?.creation_date) return 0;
    
    const creationDate = new Date(account.creation_date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - creationDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }
}


