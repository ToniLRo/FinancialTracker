import { AfterViewInit, Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Card } from 'src/app/models/card/card.model';
import { Account, AccountService } from 'src/app/services/account/account.service';
import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import { SwiperOptions } from 'swiper/types';


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
  cards: Card[] = [
    {
      id: 1,
      holder: 'John Doe',
      number: '1234 5678 9012 3456',
      type: 'Credit',
      balance: 2500.50,
      validThru: '12/25',
      frozen: false,
      transactions: [
        { id: 1, date: '2024-01-15', description: 'Starbucks', amount: -5.99, type: 'Food' },
        { id: 2, date: '2024-01-14', description: 'Gas Station', amount: -45.00, type: 'Transport' }
      ]
    },
    {
      id: 2,
      holder: 'John Doe',
      number: '9876 5432 1098 7654',
      type: 'Debit',
      balance: 1500.75,
      validThru: '08/26',
      frozen: false,
      transactions: [
        { id: 1, date: '2024-01-15', description: 'Salary', amount: 3000.00, type: 'Income' }
      ]
    },
    {
      id: 3,
      holder: 'John Doe',
      number: '1234 5678 9012 3456',
      type: 'Credit',
      balance: 2500.50,
      validThru: '12/25',
      frozen: false,
      transactions: [
        { id: 1, date: '2024-01-15', description: 'Starbucks', amount: -5.99, type: 'Food' },
        { id: 2, date: '2024-01-14', description: 'Gas Station', amount: -45.00, type: 'Transport' }
      ]
    },
    {
      id: 4,
      holder: 'John Doe',
      number: '1234 5678 9012 3456',
      type: 'Credit',
      balance: 2500.50,
      validThru: '12/25',
      frozen: false,
      transactions: [
        { id: 1, date: '2024-01-15', description: 'Starbucks', amount: -5.99, type: 'Food' },
        { id: 2, date: '2024-01-14', description: 'Gas Station', amount: -45.00, type: 'Transport' }
      ]
    }
  ];  
  selectedCard: Card | null = null; // <--- Añade esta línea
  transactionForm = { date: '', description: '', amount: 0, type: '' };
  showTransactionForm = false;
  private swiper: any;
  activeCardIndex: number = 0;
  cardWidth = 480; // Debe coincidir con el CSS de la tarjeta activa
  gap = 25; // Espacio entre tarjetas
  get translateX(): number {
    // Centra la tarjeta activa
    return -((this.cardWidth + this.gap) * this.activeCardIndex);
  }

  constructor(private renderer: Renderer2, private accountService: AccountService ) { }

  
  ngAfterViewInit(): void {
    this.swiper = new Swiper('.slide-content', {
      slidesPerView: 3,
      spaceBetween: 25,
      loop: true,
      centeredSlides: true,
      fadeEffect: { crossFade: true },
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
        0: {
          slidesPerView: 1,
        },
        520: {
          slidesPerView: 2,
        },
        950: {
          slidesPerView: 3,
        },
      },
      on: {
        slideChange: () => {
          this.updateActiveCard();
        }
      }
    });
  }

  updateActiveCard() {
    if (this.swiper) {
      // Obtener el índice real considerando el loop
      const realIndex = this.swiper.realIndex;
      this.activeCardIndex = realIndex;
      this.selectedCard = this.cards[realIndex];
    }
  }

  getActiveCard(): Card | null {
    return this.cards[this.activeCardIndex] || null;
  }

  getActiveCardTransactions() {
    const activeCard = this.getActiveCard();
    return activeCard?.transactions || [];
  }

  ngOnInit() {
    this.loadAccounts();
  }

  loadAccounts() {
    this.accountService.getAccounts().subscribe(accounts => this.accounts = accounts);
  }

  openAddForm() {
    this.selectedCard = {
      id: 0,
      holder: '',
      number: '',
      type: 'Credit',
      balance: 0,
      validThru: '',
      frozen: false,
      transactions: []
    };
    this.isEdit = false;
    this.showForm = true;
  }

  openEditForm(card: Card) {
    this.selectedCard = { ...card };
    this.isEdit = true;
    this.showForm = true;
  }

  saveAccount(account: Account) {
    if (this.isEdit) {
      this.accountService.updateAccount(account).subscribe(() => {
        this.loadAccounts();
        this.showForm = false;
      });
    } else {
      this.accountService.addAccount(account).subscribe(() => {
        this.loadAccounts();
        this.showForm = false;
      });
    }
  }

  deleteAccount(id: number) {
    if (confirm('¿Seguro que quieres eliminar esta cuenta?')) {
      this.accountService.deleteAccount(id).subscribe(() => this.loadAccounts());
    }
  }

  closeForm() {
    this.showForm = false;
    this.selectedAccount = null;
  }

  openTransactionForm(card: Card) {
    this.selectedCard = card;
    this.transactionForm = {
      date: new Date().toISOString().split('T')[0],
      description: '',
      amount: 0,
      type: 'Food'
    };
    this.showTransactionForm = true;
  }

  saveTransaction() {
    if (this.selectedCard) {
      const newTransaction = {
        ...this.transactionForm,
        id: Date.now() // Generar ID único
      };
      
      if (!this.selectedCard.transactions) {
        this.selectedCard.transactions = [];
      }
      
      this.selectedCard.transactions.unshift(newTransaction); // Agregar al inicio
      
      // Actualizar el balance si es necesario
      this.selectedCard.balance += newTransaction.amount;
    }
    this.showTransactionForm = false;
  }

  closeTransactionForm() {
    this.showTransactionForm = false;
  }

  // Funciones para máscaras
  formatCardNumber(number: string): string {
    if (!number) return '';
    // Remover espacios y caracteres no numéricos
    const cleanNumber = number.replace(/\D/g, '');
    // Aplicar máscara: XXXX XXXX XXXX XXXX
    return cleanNumber.replace(/(\d{4})(?=\d)/g, '$1 ').substring(0, 19);
  }

  formatValidThru(validThru: string): string {
    if (!validThru) return '';
    // Remover caracteres no numéricos
    const clean = validThru.replace(/\D/g, '');
    // Aplicar máscara: MM/YY
    if (clean.length >= 2) {
      return clean.substring(0, 2) + '/' + clean.substring(2, 4);
    }
    return clean;
  }

  // Función para truncar texto largo
  truncateText(text: string, maxLength: number = 20): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  // Función para obtener el texto completo para tooltip
  getFullText(text: string): string {
    return text || '';
  }

  // Actualizar el método saveCard para aplicar máscaras
  saveCard(card: Card) {
    // Aplicar máscaras antes de guardar
    card.number = card.number.replace(/\s/g, ''); // Remover espacios para guardar
    card.validThru = card.validThru.replace(/\//g, ''); // Remover / para guardar
    
    if (this.isEdit) {
      const index = this.cards.findIndex(c => c.id === card.id);
      if (index !== -1) {
        this.cards[index] = { ...card };
      }
    } else {
      card.id = Math.max(...this.cards.map(c => c.id)) + 1;
      this.cards.push({ ...card });
    }
    this.showForm = false;
    this.selectedCard = null;
  }
  
selectCard(card: Card, index: number) {
  this.selectedCard = card;
  this.activeCardIndex = index;
}

deleteCard(id: number) {
  if (confirm('Are you sure you want to delete this card?')) {
    this.cards = this.cards.filter(card => card.id !== id);
    // Si eliminamos la tarjeta activa, actualizar el índice
    if (this.activeCardIndex >= this.cards.length) {
      this.activeCardIndex = Math.max(0, this.cards.length - 1);
    }
    this.selectedCard = null;
  }
}


  freezeCard(card: Card) {
    card.frozen = !card.frozen;
  }
  
  deposit(card: Card) {
    // Implement deposit logic
    console.log('Deposit to card:', card.id);
  }
  
  withdraw(card: Card) {
    // Implement withdraw logic
    console.log('Withdraw from card:', card.id);
  }
  
  transfer(card: Card) {
    // Implement transfer logic
    console.log('Transfer from card:', card.id);
  }

  getTransactionIconColor(type: string): string {
    const colors: { [key: string]: string } = {
      'Food': '#f2dcbb',
      'Transport': '#e0ece4',
      'Shopping': '#ffebee',
      'Entertainment': '#e3f2fd',
      'Income': '#e8f5e8',
      'Gift': '#fff3e0',
      'default': '#f5f5f5'
    };
    return colors[type] || colors['default'];
  }

  generateReferenceId(): string {
    return Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  onCardNumberInput(event: any) {
    this.selectedCard!.number = this.formatCardNumber(event.target.value);
  }

  onValidThruInput(event: any) {
    this.selectedCard!.validThru = this.formatValidThru(event.target.value);
  }

  // Nuevo método para editar la tarjeta activa del swiper
  openEditFormForActiveCard() {
    const activeCard = this.getActiveCard();
    if (activeCard) {
      this.openEditForm(activeCard);
    }
  }

  // Nuevo método para eliminar la tarjeta activa del swiper
  deleteActiveCard() {
    const activeCard = this.getActiveCard();
    if (activeCard) {
      this.deleteCard(activeCard.id);
    }
  }

  prevCard() {
    if (this.activeCardIndex > 0) {
      this.activeCardIndex--;
    }
  }

  nextCard() {
    if (this.activeCardIndex < this.cards.length - 1) {
      this.activeCardIndex++;
    }
  }

  goToCard(index: number) {
    this.activeCardIndex = index;
  }

}


