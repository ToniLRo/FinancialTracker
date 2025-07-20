import { Component, ElementRef, AfterViewInit, ViewChild, OnInit, Renderer2 } from '@angular/core';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, LineController } from 'chart.js';
import { AccountService } from 'src/app/services/account/account.service';
import { Account } from 'src/app/models/account/account.model';

@Component({
    selector: 'home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
    standalone: false
})
export class HomeComponent implements OnInit, AfterViewInit {
  @ViewChild('myChart', { static: false }) myChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('carousel', { static: false }) carousel!: ElementRef<HTMLDivElement>;
  @ViewChild('wrapper', { static: false }) wrapper!: ElementRef<HTMLDivElement>;
  @ViewChild('arrowLeft', { static: false }) arrowLeft!: ElementRef<HTMLDivElement>;
  @ViewChild('arrowRight', { static: false }) arrowRight!: ElementRef<HTMLDivElement>;

  // Dashboard data
  dashboardData: any = {
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    savings: 0,
    accounts: [],
    monthlyIncomeChart: {},
    monthlyExpenseChart: {},
    categoryBreakdown: {}
  };

  // Market data
  cryptoPrices: any[] = [];
  stockPrices: any[] = [];
  currencyPrices: any[] = [];

  private firstCardWidth!: number;
  private isDragging = false;
  private startX!: number;
  private startScrollLeft!: number;
  private timeoutId: any;
  private chart: any;

  constructor(
    private renderer: Renderer2,
    private accountService: AccountService
  ) {
    Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, LineController);
  }
  
  ngOnInit(): void {
    this.loadDashboardData();
    this.loadMarketData();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initCarousel();
      this.initChart();
    }, 100);
  }

  loadDashboardData(): void {
    this.accountService.getDashboardData().subscribe({
      next: (data) => {
        console.log('Dashboard data loaded:', data);
        this.dashboardData = data;
        this.updateChart();
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
      }
    });
  }

  loadMarketData(): void {
    // Load crypto prices
    this.accountService.getCryptoPrices().subscribe({
      next: (data) => {
        this.cryptoPrices = data.slice(0, 10);
      },
      error: (error) => {
        console.error('Error loading crypto prices:', error);
        // Fallback data
        this.cryptoPrices = [
          { symbol: 'BTC', price: '45,250.00', change: '+2.5%' },
          { symbol: 'ETH', price: '3,125.50', change: '+1.8%' },
          { symbol: 'BNB', price: '425.30', change: '-0.5%' },
          { symbol: 'ADA', price: '1.25', change: '+3.2%' },
          { symbol: 'XRP', price: '0.65', change: '+1.1%' }
        ];
      }
    });

    // Load stock prices (mock data for now)
    this.stockPrices = [
      { symbol: 'AAPL', price: '175.25', change: '+0.8%' },
      { symbol: 'GOOGL', price: '2,890.50', change: '+1.2%' },
      { symbol: 'MSFT', price: '310.75', change: '+0.5%' },
      { symbol: 'AMZN', price: '135.20', change: '-0.3%' },
      { symbol: 'TSLA', price: '245.80', change: '+2.1%' }
    ];

    // Load currency prices (mock data for now)
    this.currencyPrices = [
      { symbol: 'EUR/USD', price: '1.0850', change: '+0.2%' },
      { symbol: 'GBP/USD', price: '1.2750', change: '-0.1%' },
      { symbol: 'USD/JPY', price: '149.85', change: '+0.3%' },
      { symbol: 'USD/CAD', price: '1.3625', change: '+0.1%' },
      { symbol: 'AUD/USD', price: '0.6580', change: '-0.4%' }
    ];
  }

  initCarousel(): void {
    if (this.dashboardData.accounts.length > 0) {
      const carousel = this.carousel.nativeElement;
      const wrapper = this.wrapper.nativeElement;
      const firstCard = carousel.querySelector(".card") as HTMLElement;
      
      if (firstCard) {
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
      }
    }
  }

  initChart(): void {
    const canvas = this.myChart.nativeElement;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.getMonthLabels(),
          datasets: [
            {
              label: 'Income',
              data: this.getIncomeData(),
              borderColor: 'rgba(33, 190, 114, 1)',
              backgroundColor: 'rgba(33, 190, 114, 0.1)',
              borderWidth: 2,
              fill: false,
              pointBackgroundColor: 'rgba(33, 190, 114, 1)',
              tension: 0.4
            },
            {
              label: 'Expenses',
              data: this.getExpenseData(),
              borderColor: 'rgba(255, 71, 87, 1)',
              backgroundColor: 'rgba(255, 71, 87, 0.1)',
              borderWidth: 2,
              fill: false,
              pointBackgroundColor: 'rgba(255, 71, 87, 1)',
              tension: 0.4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                color: 'rgb(255, 255, 255)'
              },
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              }
            },
            x: {
              ticks: {
                color: 'rgb(255, 255, 255)'
              },
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              }
            }
          },
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: {
                color: 'rgb(255, 255, 255)',
                font: {
                  size: 14,
                  family: 'Arial',
                  style: 'normal'
                },
                boxWidth: 20,
                padding: 15
              }
            },
            tooltip: {
              enabled: true,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: 'white',
              bodyColor: 'white',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              borderWidth: 1
            }
          }
        }
      });
    } else {
      console.error('No se pudo obtener el contexto 2D del canvas');
    }
  }

  updateChart(): void {
    if (this.chart) {
      this.chart.data.labels = this.getMonthLabels();
      this.chart.data.datasets[0].data = this.getIncomeData();
      this.chart.data.datasets[1].data = this.getExpenseData();
      this.chart.update();
    }
  }

  getMonthLabels(): string[] {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const labels = [];
    
    for (let i = 11; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      labels.push(months[monthIndex]);
    }
    
    return labels;
  }

  getIncomeData(): number[] {
    const monthlyData = this.dashboardData.monthlyIncomeChart || {};
    return Object.values(monthlyData) as number[];
  }

  getExpenseData(): number[] {
    const monthlyData = this.dashboardData.monthlyExpenseChart || {};
    return Object.values(monthlyData) as number[];
  }

  // Carousel methods
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

  // Utility methods
  formatBalance(balance: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(balance);
  }

  formatCardNumber(accountNumber: string): string {
    if (!accountNumber) return '**** **** **** ****';
    return accountNumber.replace(/(\d{4})(?=\d)/g, '$1 ');
  }

  truncateText(text: string, maxLength: number): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  getChangeClass(change: string): string {
    return change.startsWith('+') ? 'positive' : 'negative';
  }
}