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
  cards: Card[] = []; // tu array de tarjetas
  selectedCard: Card | null = null; // <--- Añade esta línea


  constructor(private renderer: Renderer2, private accountService: AccountService ) { }

  
  ngAfterViewInit(): void {
    new Swiper('.slide-content', {
      slidesPerView: 3,
      spaceBetween: 25,
      loop: true,
      centeredSlides: true,
      fadeEffect: { crossFade: true },  // Se usa 'fadeEffect' en lugar de 'fade'
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
    });
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

  saveCard(card: Card) {
    if (this.isEdit) {
      // Update existing card
      const index = this.cards.findIndex(c => c.id === card.id);
      if (index !== -1) {
        this.cards[index] = { ...card };
      }
    } else {
      // Add new card
      card.id = this.cards.length + 1;
      this.cards.push({ ...card });
    }
    this.showForm = false;
    this.selectedCard = null;
  }
  
selectCard(card: Card) {
  this.selectedCard = card;
}

deleteCard(id: number) {
  if (confirm('Are you sure you want to delete this card?')) {
    this.cards = this.cards.filter(card => card.id !== id);
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

}


