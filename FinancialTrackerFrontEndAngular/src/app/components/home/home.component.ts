import { Component, ElementRef, AfterViewInit, ViewChild, OnInit, Renderer2, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, LineController, DoughnutController, ArcElement } from 'chart.js';
import { AccountService } from 'src/app/services/account/account.service';
import { Account } from 'src/app/models/account/account.model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MarketDataService } from 'src/app/services/marketData/marketData.service';
import { ApiUpdateControlService } from 'src/app/services/api-update-control/api-update-control.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Router } from '@angular/router';
import { HttpInterceptor, HttpHandler, HttpEvent, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { MarketTimerService } from 'src/app/services/market-timer.service';

@Component({
    selector: 'home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
    standalone: false
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('myChart', { static: false }) myChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('categoriesChart', { static: false }) categoriesChart!: ElementRef<HTMLCanvasElement>;
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

  // Loading states
  isLoadingDashboard = false;
  isLoadingChart = false;
  isLoadingCategories = false;
  chartError = false;
  categoriesError = false;
  
  // Categories data
  topCategories: any[] = [];

  private firstCardWidth!: number;
  private isDragging = false;
  private startX!: number;
  private startScrollLeft!: number;
  private timeoutId: any;
  private chart: Chart | null = null;
  private categoriesChartInstance: any = null;
  private chartInitialized = false;
  public categoriesChartInitialized = false;
  private dataLoaded = false;

  constructor(
    private renderer: Renderer2,
    private accountService: AccountService,
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    private marketDataService: MarketDataService,
    private apiUpdateControlService: ApiUpdateControlService,
    private authService: AuthService,
    private router: Router,
    private marketTimerService: MarketTimerService
  ) {
    Chart.register(
      CategoryScale, 
      LinearScale, 
      PointElement, 
      LineElement, 
      Title, 
      Tooltip, 
      Legend, 
      LineController,
      DoughnutController,
      ArcElement
    );
  }
  
  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/LogIn']);
      return;
    }
    this.loadDashboardData();
    this.loadMarketData();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.tryInitializeChart();
      
      this.forceInitializeCategories();
      
      this.initTableScrollDetection();
    }, 300);
  }

  ngOnDestroy(): void {
    this.destroyChart();
    this.destroyCategoriesChart();
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    
    // Limpiar timers de mercado usando el servicio
    this.marketTimerService.cleanup();
  }

  //loadDashboardData: NO usar fallback nunca
  loadDashboardData(): void {
    this.isLoadingDashboard = true;
    this.isLoadingCategories = true;
    
    console.log('🔄 Loading dashboard data...');
    
    this.accountService.getDashboardData().subscribe({
      next: (data) => {
        console.log('✅ Dashboard data received:', data);
        console.log('�� monthlyIncomeChart:', data.monthlyIncomeChart);
        console.log('📊 monthlyExpenseChart:', data.monthlyExpenseChart);
        
        // DEBUG: Mostrar información de transacciones si está disponible
        if (data.transactions) {
          console.log('📊 Raw transactions from backend:', data.transactions);
          console.log('📊 Transaction count:', data.transactions.length);
          if (data.transactions.length > 0) {
            console.log('�� Sample transaction:', data.transactions[0]);
          }
        }
        
        this.dashboardData = {
          ...this.dashboardData,
          ...data
        };
        this.dataLoaded = true;
        this.isLoadingDashboard = false;
        
        // SOLO procesar datos reales
        this.processCategoryData();
        
        this.tryInitializeChart();
        this.tryInitializeCategoriesChart();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ Error loading dashboard data:', error);
        this.isLoadingDashboard = false;
        this.isLoadingCategories = false;
        this.chartError = true;
        this.categoriesError = true;
        
        // NO usar fallback para categorías
        this.topCategories = [];
        this.dashboardData.categoryBreakdown = {};
        
        // Solo fallback para income/expenses chart
        this.tryInitializeChart();
        this.cdr.detectChanges();
      }
    });
  }

  loadFallbackData(): void {
    const currentDate = new Date();
    const fallbackIncomeData: { [key: string]: number } = {};
    const fallbackExpenseData: { [key: string]: number } = {};
    
    // Generar datos de ejemplo para los últimos 12 meses con formato YYYY-MM
    for (let i = 11; i >= 0; i--) {
      const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const yearMonth = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;
      
      fallbackIncomeData[yearMonth] = Math.random() * 5000 + 2000; // 2000-7000
      fallbackExpenseData[yearMonth] = Math.random() * 4000 + 1500; // 1500-5500
    }
    
    this.dashboardData = {
      ...this.dashboardData,
      totalBalance: 20000,
      monthlyIncome: 4500,
      monthlyExpenses: 3200,
      savings: 1300,
      monthlyIncomeChart: fallbackIncomeData,
      monthlyExpenseChart: fallbackExpenseData
    };
    
    this.dataLoaded = true;
  }

  tryInitializeChart(): void {
    console.log('🎯 TRY INIT CHART - dataLoaded:', this.dataLoaded, 'myChart:', !!this.myChart, 'chartInitialized:', this.chartInitialized);
    
    if (this.dataLoaded && this.myChart && !this.chartInitialized) {
      console.log('🎯 TRY INIT CHART - Calling initChart()');
      this.initChart();
    } else {
      console.log('🎯 TRY INIT CHART - Conditions not met for chart initialization');
    }
  }

  initChart(): void {
    console.log('🎯 INIT CHART - Starting chart initialization');
    console.log('🎯 INIT CHART - Month labels:', this.getMonthLabels());
    console.log('🎯 INIT CHART - Income data:', this.getIncomeData());
    console.log('🎯 INIT CHART - Expense data:', this.getExpenseData());
    
    if (!this.myChart?.nativeElement) {
      console.error('❌ Chart canvas element not available');
      return;
    }

    // Ajustar tamaño del canvas
    const canvas = this.myChart.nativeElement;
    canvas.width = canvas.parentElement ? canvas.parentElement.clientWidth : 400;
    canvas.height = 240; // Aumentado de 220px a 240px

    this.isLoadingChart = true;
    this.chartError = false;

    try {
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get 2D context from canvas');
      }

      // Destruir gráfico existente si existe
      this.destroyChart();

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
              borderWidth: 3,
              fill: false,
              pointBackgroundColor: 'rgba(33, 190, 114, 1)',
              pointBorderColor: 'rgba(33, 190, 114, 1)',
              pointBorderWidth: 2,
              pointRadius: 5,
              pointHoverRadius: 7,
              tension: 0.4
          },
          {
            label: 'Expenses',
              data: this.getExpenseData(),
              borderColor: 'rgba(255, 71, 87, 1)',
              backgroundColor: 'rgba(255, 71, 87, 0.1)',
              borderWidth: 3,
              fill: false,
              pointBackgroundColor: 'rgba(255, 71, 87, 1)',
              pointBorderColor: 'rgba(255, 71, 87, 1)',
              pointBorderWidth: 2,
              pointRadius: 5,
              pointHoverRadius: 7,
              tension: 0.4
            }
        ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            intersect: false,
            mode: 'index'
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                color: 'rgb(255, 255, 255)',
                font: {
                  size: 11 // Un poco más grande
                },
                callback: function(value: any) {
                  return '$' + value.toLocaleString();
                }
              },
              grid: {
                color: 'rgba(255, 255, 255, 0.1)',
                lineWidth: 1
              }
            },
            x: {
              ticks: {
                color: 'rgb(255, 255, 255)',
                font: {
                  size: 11
                }
              },
              grid: {
                color: 'rgba(255, 255, 255, 0.1)',
                lineWidth: 1
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
                  size: 13,
                  family: 'Arial',
                  weight: 'bold'
                },
                boxWidth: 18,
                padding: 14,
                usePointStyle: true
              }
            },
            tooltip: {
              enabled: true,
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              titleColor: 'white',
              bodyColor: 'white',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              borderWidth: 1,
              cornerRadius: 8,
              displayColors: true,
              callbacks: {
                title: function(context: any) {
                  return context[0].label;
                },
                label: function(context: any) {
                  const label = context.dataset.label || '';
                  const value = '$' + context.parsed.y.toLocaleString();
                  return `${label}: ${value}`;
                }
              }
            }
          },
          animation: {
            duration: 1000,
            easing: 'easeInOutQuart'
          }
        }
      });

      console.log('🎯 INIT CHART - Chart created successfully');
      this.chartInitialized = true;
      this.isLoadingChart = false;
      
    } catch (error) {
      console.error('❌ Error initializing chart:', error);
      this.chartError = true;
      this.isLoadingChart = false;
    }
  }

  updateChart(): void {
    if (!this.chart) {
      this.tryInitializeChart();
      return;
    }

    try {
      this.chart.data.labels = this.getMonthLabels();
      this.chart.data.datasets[0].data = this.getIncomeData();
      this.chart.data.datasets[1].data = this.getExpenseData();
      this.chart.update('active');
    } catch (error) {
      console.error('❌ Error updating chart:', error);
      this.chartError = true;
    }
  }

  destroyChart(): void {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
      this.chartInitialized = false;
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

  // getIncomeData: manejar el formato correcto del backend
  getIncomeData(): number[] {
    const monthlyData = this.dashboardData.monthlyIncomeChart || {};
    const labels = this.getMonthLabels();
    
    
    // El backend envía datos con formato "YYYY-MM", convierto de "YYYY-MM" a nombres de mes
    const data = labels.map((month, index) => {
      // Calcular la fecha correspondiente al mes
      const currentDate = new Date();
      const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - (11 - index), 1);
      const yearMonth = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;
      
      const value = monthlyData[yearMonth];
      // Usar valor absoluto para income
      const result = typeof value === 'number' ? Math.abs(value) : 0;
      
      
      return result;
    });
    
    // Verificar si todos los datos son 0 (problema del backend)
    const allZero = data.every(val => val === 0);
    if (allZero) {
      console.warn('⚠️ BACKEND ISSUE: All income data is 0 - check backend logs');
    }
    
    console.log('📊 Final Income Data:', data);
    return data;
  }

  // getExpenseData: manejar el formato correcto del backend  
  getExpenseData(): number[] {
    const monthlyData = this.dashboardData.monthlyExpenseChart || {};
    const labels = this.getMonthLabels();
    
    
    // El backend envía datos con formato "YYYY-MM", convierto de "YYYY-MM" a nombres de mes
    const data = labels.map((month, index) => {
      // Calcular la fecha correspondiente al mes
      const currentDate = new Date();
      const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - (11 - index), 1);
      const yearMonth = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;
      
      const value = monthlyData[yearMonth];
      const result = typeof value === 'number' ? Math.abs(value) : 0;
      
      
      return result;
    });
    
    // Verificar si todos los datos son 0 (problema del backend)
    const allZero = data.every(val => val === 0);
    if (allZero) {
      console.warn('⚠️ BACKEND ISSUE: All expense data is 0 - check backend logs');
    }
    
    console.log('📊 Final Expense Data:', data);
    return data;
  }

  // Método para reinicializar el gráfico manualmente
  reinitializeChart(): void {
    this.destroyChart();
    this.chartInitialized = false;
    this.tryInitializeChart();
  }



  
  // tryInitializeCategoriesChart: SIEMPRE inicializar
  tryInitializeCategoriesChart(): void {
    
    if (this.categoriesChart && !this.categoriesChartInitialized) {
      this.initCategoriesChart();
    }
  }

  // initCategoriesChart: manejar datos vacíos
  initCategoriesChart(): void {
    if (!this.categoriesChart?.nativeElement) {
      return;
    }

    this.isLoadingCategories = true;
    this.categoriesError = false;

    try {
      const canvas = this.categoriesChart.nativeElement;
      canvas.width = canvas.parentElement ? canvas.parentElement.clientWidth : 400;
      canvas.height = 240;
      
      // Destruir gráfico existente
      const existingChart = Chart.getChart(canvas);
      if (existingChart) {
        existingChart.destroy();
      }
      
      if (this.categoriesChartInstance) {
        try {
          this.categoriesChartInstance.destroy();
        } catch (error) {
        }
        this.categoriesChartInstance = null;
      }
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get 2D context from categories canvas');
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Obtener datos con colores dinámicos
      const categoryData = this.getCategoryChartData();
      
      this.categoriesChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: categoryData.labels,
          datasets: [{
            label: 'Amount ($)',
            data: categoryData.values,
            backgroundColor: categoryData.colors,
            borderColor: categoryData.borderColors,
            borderWidth: 1.5
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            title: {
              display: true,
              text: categoryData.labels.length > 0 ? 'Transactions by Category' : 'No Category Data Available',
              color: '#ffffff',
              font: {
                size: 14
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                color: '#ffffff',
                callback: function(value: any) {
                  return '$' + value.toLocaleString();
                }
              },
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              }
            },
            x: {
              ticks: {
                color: '#ffffff'
              },
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              }
            }
          }
        }
      });

      this.categoriesChartInitialized = true;
      this.isLoadingCategories = false;

    } catch (error) {
      console.error('❌ Error initializing categories chart:', error);
      this.categoriesError = true;
      this.isLoadingCategories = false;
    }
  }

  // getCategoryChartData: manejar datos vacíos
  getCategoryChartData(): any {
    // Si no hay categorías, mostrar mensaje de "No Data"
    if (!this.topCategories || this.topCategories.length === 0) {
      return { 
        labels: ['No Data'], 
        values: [0], 
        total: 0, 
        colors: ['rgba(128, 128, 128, 0.8)'],
        borderColors: ['rgba(128, 128, 128, 1)']
      };
    }

    // Mostrar todas las categorías (gastos e ingresos)
    const labels = this.topCategories.map(cat => {
      const isIncome = this.isIncomeCategory(cat.name);
      const type = isIncome ? ' (Income)' : ' (Expense)';
      return (cat.name || 'Unknown') + type;
    });
    
    const values = this.topCategories.map(cat => Math.abs(cat.amount || 0));
    const total = values.reduce((sum, val) => sum + val, 0);
    
    // Generar colores dinámicos basados en el tipo de categoría
    const colors = this.topCategories.map(cat => {
      const isIncome = this.isIncomeCategory(cat.name);
      if (isIncome) {
        return 'rgba(34, 197, 94, 0.8)'; // Verde más puro
      } else {
        return 'rgba(255, 99, 132, 0.8)';
      }
    });
    
    const borderColors = this.topCategories.map(cat => {
      const isIncome = this.isIncomeCategory(cat.name);
      if (isIncome) {
        return 'rgba(34, 197, 94, 1)'; // Verde más puro
      } else {
        return 'rgba(255, 99, 132, 1)';
      }
    });
    
    return { labels, values, total, colors, borderColors };
  }

  // Determinar si una categoría es de ingresos
  isIncomeCategory(categoryName: string): boolean {
    const incomeCategories = [
      'INCOME', 'SALARY', 'DEPOSIT', 'REVENUE', 'PROFIT', 'GAIN',
      'Income', 'Salary', 'Deposit', 'Revenue', 'Profit', 'Gain'
    ];
    
    return incomeCategories.includes(categoryName);
  }

  destroyCategoriesChart(): void {
    if (this.categoriesChart?.nativeElement) {
      const existingChart = Chart.getChart(this.categoriesChart.nativeElement);
      if (existingChart) {
        existingChart.destroy();
      }
    }
    
    if (this.categoriesChartInstance) {
      try {
        this.categoriesChartInstance.destroy();
      } catch (error) {
      }
      this.categoriesChartInstance = null;
    }
    
    this.categoriesChartInitialized = false;
    
    // Limpiar canvas manualmente
    if (this.categoriesChart?.nativeElement) {
      const canvas = this.categoriesChart.nativeElement;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }

  // Reinicializar gráfico de categorías
  reinitializeCategoriesChart(): void {
    this.destroyCategoriesChart();
    this.categoriesChartInitialized = false;
    this.tryInitializeCategoriesChart();
  }

  // Obtener icono por categoría
  getCategoryIcon(categoryName: string): string {
    const icons: { [key: string]: string } = {
      'EXPENSE': '💸',
      'FOOD': '🍽️',
      'TRANSPORT': '🚗',
      'SHOPPING': '🛍️',
      'ENTERTAINMENT': '🎬',
      'UTILITIES': '💡',
      'INCOME': '💰',
      'SALARY': '💼',
      'DEPOSIT': '📈',
      'WITHDRAW': '📉',
      'TRANSFER': '🔄',
      // Mantener algunos iconos de categorías específicas
      'Food & Dining': '🍽️',
      'Transportation': '🚗',
      'Bills & Utilities': '💡',
      'Healthcare': '🏥',
      'Groceries': '🛒',
      'Gas': '⛽',
      'Education': '📚',
      'Travel': '✈️'
    };
    
    return icons[categoryName] || '📊';
  }

  // Resto de métodos del carrusel y utilidades
  loadMarketData(): void {
    this.loadCryptoPrices();
    this.loadStockData();
    this.loadCurrencyPrices();

    // Configurar actualizaciones periódicas usando el servicio optimizado
    this.marketTimerService.startTimer('CRYPTO', () => this.loadCryptoPrices());
    this.marketTimerService.startTimer('FOREX', () => this.loadCurrencyPrices());
    this.marketTimerService.startTimer('STOCKS', () => this.loadStockData());
  }

  // Cargar divisas
loadCurrencyPrices(): void {
    this.apiUpdateControlService.checkUpdateStatus('FOREX').subscribe({
        next: (response) => {
            if (response.shouldUpdate) {
                this.makeForexApiCall();
            } else {
                this.loadForexFromDatabase();
            }
        },
        error: (error) => {
            console.error('❌ Error verificando estado de actualización:', error);
            this.loadForexFromDatabase();
        }
    });
}

private makeForexApiCall(): void {
    const apiKey = environment.exchangerateApiKey;
    const baseUrl = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`;
    
    this.accountService.getDataFromAPI(baseUrl).subscribe({
        next: (data: any) => {
            // Usar Date.now() con validación
            const saveTime = Date.now();
            if (saveTime < new Date('2025-01-01').getTime()) {
                localStorage.setItem('lastForexUpdate', saveTime.toString());
            }
            
            const mainCurrencies = ['EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'NZD'];
            
            this.currencyPrices = mainCurrencies.map(currency => {
                const rate = data.conversion_rates[currency];

                const previousRate = rate * (1 + (Math.random() * 0.02 - 0.01));
                
                const marketData = {
                    symbol: `USD/${currency}`,
                    assetType: 'FOREX',
                    date: new Date().toISOString().split('T')[0],
                    open: previousRate,
                    high: Math.max(rate, previousRate),
                    low: Math.min(rate, previousRate),
                    close: rate,
                    volume: 0,
                    market: 'FOREX'
                };

                this.marketDataService.saveMarketData(marketData).subscribe({
                    next: () => {
                    },
                    error: (err) => console.error(`❌ Error guardando ${currency} en BD:`, err)
                });

                return {
                    symbol: `USD/${currency}`,
                    price: this.formatPrice(rate),
                    change: this.calculateChange(previousRate, rate),
                    name: this.getCurrencyName(currency)
                };
            });
            
            // Registrar la actualización exitosa
            this.apiUpdateControlService.recordUpdate('FOREX').subscribe({
                next: () => {
                },
                error: (err) => console.error('❌ Error actualizando timestamp:', err)
            });
            
        },
        error: (error) => {
            console.error('❌ Error cargando divisas desde API:', {
                error,
                status: error?.status,
                message: error?.message,
                response: error?.error
            });
            this.loadForexFromDatabase();
        }
    });
}

private loadForexFromDatabase(): void {
    
    this.marketDataService.getLastMarketData('FOREX').subscribe({
        next: (data) => {


            if (!data || data.length === 0) {
                return;
            }
            
            this.currencyPrices = data.map((forex: any) => {
                const currencyData = {
                    symbol: forex.symbol,
                    price: this.formatPrice(forex.close),
                    change: this.calculateChange(forex.open, forex.close),
                    name: this.getCurrencyName(forex.symbol.split('/')[1])
                };
                


                return currencyData;
            });


        },
        error: (err) => {
            console.error('❌ Error cargando divisas desde BD:', {
                error: err,
                message: err?.message,
                status: err?.status
            });
        }
    });
}

private getCurrencyName(code: string): string {
    const currencyNames: { [key: string]: string } = {
        'EUR': 'Euro',
        'GBP': 'British Pound',
        'JPY': 'Japanese Yen',
        'CAD': 'Canadian Dollar',
        'AUD': 'Australian Dollar',
        'CHF': 'Swiss Franc',
        'CNY': 'Chinese Yuan',
        'NZD': 'New Zealand Dollar'
    };
    return currencyNames[code] || code;
}

  loadCryptoPrices(): void {
    const cryptoUrl = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h';
    
    this.accountService.getDataFromAPI(cryptoUrl).subscribe({
      next: (data: any[]) => {
        
        this.cryptoPrices = data.map(coin => ({
          symbol: coin.symbol.toUpperCase(),
          price: this.formatPrice(coin.current_price),
          change: this.formatChange(coin.price_change_percentage_24h),
          name: coin.name
        }));

        // Guardar/Actualizar en backend
        data.forEach(coin => {
          const marketData = {
            symbol: coin.symbol.toUpperCase(),
            assetType: 'CRYPTO',
            date: new Date().toISOString().split('T')[0],
            open: coin.current_price,
            high: coin.high_24h || coin.current_price,
            low: coin.low_24h || coin.current_price,
            close: coin.current_price,
            volume: coin.total_volume || 0,
            market: 'USD'
          };


          // El backend ahora actualizará en lugar de crear nuevo
          this.marketDataService.saveMarketData(marketData).subscribe({
            //next: (response) => console.log(`✅ Updated/Saved ${coin.symbol} data`, response),
            error: (err) => console.error(`❌ Error updating ${coin.symbol}:`, err)
          });
        });
      },
      error: (error) => {
        console.error('❌ Error loading crypto prices:', error);
        this.loadFallbackCryptoData();
      }
    });
  }

  loadStockData(): void {
    this.apiUpdateControlService.checkUpdateStatus('STOCK').subscribe({
        next: (response) => {

            if (response.shouldUpdate) {
                this.makeStockApiCall();
            } else {
                this.loadStocksFromDatabase();
            }
        },
        error: (error) => {
            console.error('❌ Error verificando estado de actualización de stocks:', error);
            this.loadStocksFromDatabase();
        }
    });
}

private makeStockApiCall(): void {
    const apiKey = environment.twelvedataApiKey;
    const url = `https://api.twelvedata.com/time_series?symbol=${this.STOCK_SYMBOLS.join(',')}&interval=1min&outputsize=1&apikey=${apiKey}`;

    this.accountService.getDataFromAPI(url).subscribe({
        next: (data: any) => {

            // Para cada símbolo
            Object.entries(data).forEach(([symbol, stockData]: [string, any]) => {
                if (stockData.status === 'ok' && stockData.values?.length > 0) {
                    const latestData = stockData.values[0];  // Último dato


                    const marketData = {
                        symbol: symbol,
                        assetType: 'STOCK',
                        date: new Date().toISOString().split('T')[0],
                        open: parseFloat(latestData.open),
                        high: parseFloat(latestData.high),
                        low: parseFloat(latestData.low),
                        close: parseFloat(latestData.close),
                        volume: parseFloat(latestData.volume),
                        market: 'USD'
                    };

                    // Actualizar UI
                    const stockPrice = {
                        symbol: symbol,
                        price: this.formatPrice(parseFloat(latestData.close)),
                        change: this.calculateChange(
                            parseFloat(latestData.open),
                            parseFloat(latestData.close)
                        ),
                        name: this.getCompanyName(symbol)
                    };

                    // Actualizar el array de precios
                    const index = this.stockPrices.findIndex(s => s.symbol === symbol);
                    if (index !== -1) {
                        this.stockPrices[index] = stockPrice;
                    } else {
                        this.stockPrices.push(stockPrice);
                    }

                    // Guardar en BD
                    this.marketDataService.saveMarketData(marketData).subscribe({
                        //next: () => console.log(`💾 ${symbol} guardado en BD`),
                        error: (err) => console.error(`❌ Error guardando ${symbol}:`, err)
                    });
                }
            });
        },
        error: (error) => {
            console.error('❌ Error cargando stocks:', error);
            this.loadStocksFromDatabase();
        }
    });
}

private loadStocksFromDatabase(): void {
    this.marketDataService.getLastMarketData('STOCK').subscribe({
        next: (data) => {
            if (!data || data.length === 0) {
                return;
            }

            this.stockPrices = data.map((stock: any) => ({
                symbol: stock.symbol,
                price: this.formatPrice(stock.close),
                change: this.calculateChange(stock.open, stock.close),
                name: this.getCompanyName(stock.symbol)
            }));
        },
        error: (err) => console.error('❌ Error loading stocks from database:', err)
    });
}

private updateStockPrice(marketData: any): void {
    
    const index = this.stockPrices.findIndex(s => s.symbol === marketData.symbol);
    const stockPrice = {
        symbol: marketData.symbol,
        price: this.formatPrice(marketData.close),
        change: this.calculateChange(marketData.open, marketData.close),
        name: this.getCompanyName(marketData.symbol)
    };


    if (index === -1) {
        this.stockPrices.push(stockPrice);
    } else {
        this.stockPrices[index] = stockPrice;
    }

}

private loadFallbackStockData(symbol: string): void {
    
    this.marketDataService.getLastMarketData('STOCK').subscribe({
        next: (data) => {
            if (!data || data.length === 0) {
                return;
            }

            // Si no se especifica símbolo, cargar todos los disponibles
            if (!symbol) {
                data.forEach((stockData: any) => {
                    this.updateStockPrice(stockData);
                });
            } else {
                const stockData = data.find((s: any) => s.symbol === symbol);
                if (stockData) {
                    this.updateStockPrice(stockData);
                }
            }
        },
        error: (err) => {
        }
    });
}

private getStaticStockData(symbol: string): any {
    // Datos estáticos como último recurso
    const staticPrices: {[key: string]: any} = {
        'AAPL': { close: 192.53, open: 190.12 },
        'GOOGL': { close: 2875.10, open: 2860.20 },
        'MSFT': { close: 378.85, open: 375.90 },
        'AMZN': { close: 146.80, open: 145.50 },
        'TSLA': { close: 248.50, open: 245.30 }
    };

    return {
        symbol: symbol,
        assetType: 'STOCK',
        date: new Date().toISOString().split('T')[0],
        open: staticPrices[symbol]?.open || 100,
        close: staticPrices[symbol]?.close || 100,
        high: staticPrices[symbol]?.close * 1.02,
        low: staticPrices[symbol]?.open * 0.98,
        volume: 1000000,
        market: 'USD'
    };
}

  calculateChange(open: number, close: number): string {
    const change = ((close - open) / open) * 100;
    return this.formatChange(change);
  }

  formatChange(changePercent: number): string {
    const sign = changePercent >= 0 ? '+' : '';
    return `${sign}${changePercent.toFixed(2)}%`;
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

  formatPrice(price: number): string {
    if (price >= 1000) {
      return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else if (price >= 1) {
      return price.toFixed(2);
    } else {
      return price.toFixed(4);
    }
  }

  // Detectar scroll en tablas para efectos visuales
  initTableScrollDetection(): void {
    const tableContainers = document.querySelectorAll('.table-container');
    
    tableContainers.forEach(container => {
      container.addEventListener('scroll', () => {
        if (container.scrollTop > 10) {
          container.classList.add('scrolled');
        } else {
          container.classList.remove('scrolled');
        }
      });
    });
  }

  processCategoryData(): void {
    const categoryData = this.dashboardData.categoryBreakdown || {};
    
    if (Object.keys(categoryData).length === 0) {
      console.warn('❌ NO REAL CATEGORY DATA FROM BACKEND');
      this.topCategories = [];
      this.categoriesError = true;
      return;
    }

    // Procesar datos reales del backend
    this.topCategories = Object.entries(categoryData)
      .map(([name, amount]) => {
        return { 
          name: name,
          amount: typeof amount === 'number' ? amount : 0 
        };
      })
      .filter(cat => {
        // CORREGIR: Incluir tanto gastos (negativos) como ingresos (positivos)
        const isValid = cat.amount !== 0; // Cambiar de > 0 a !== 0
        return isValid;
      })
      .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount)); // Ordenar por valor absoluto
  
    if (this.topCategories.length === 0) {
      console.warn('❌ NO VALID CATEGORIES AFTER PROCESSING');
      this.categoriesError = true;
    } else {
      this.categoriesError = false;
    }
  }
  // Formatear nombres de categorías para mejor visualización
  formatCategoryName(categoryName: string): string {
    const nameMap: { [key: string]: string } = {
      'EXPENSE': 'General',
      'FOOD': 'Food',
      'TRANSPORT': 'Transport',
      'SHOPPING': 'Shopping',
      'ENTERTAINMENT': 'Entertainment',
      'UTILITIES': 'Utilities',
      'HEALTHCARE': 'Healthcare',
      'EDUCATION': 'Education'
    };
    
    return nameMap[categoryName] || categoryName;
  }

  // forceInitializeCategories para NO usar fallback
  forceInitializeCategories(): void {
    
    // NO usar datos de fallback
    // this.loadFallbackCategoryData(); // ELIMINAR ESTA LÍNEA
    
    // Resetear estados
    this.categoriesChartInitialized = false;
    this.categoriesError = false;
    this.isLoadingCategories = false;
    
    // Solo intentar si tenemos datos reales
    setTimeout(() => {
      if (this.topCategories && this.topCategories.length > 0) {
        this.tryInitializeCategoriesChart();
      } else {
        this.categoriesError = true;
      }
    }, 100);
  }

  getCompanyName(symbol: string): string {
    const companies: { [key: string]: string } = {
        'AAPL': 'Apple Inc.',
        'GOOGL': 'Alphabet Inc.',
        'MSFT': 'Microsoft Corp.',
        'AMZN': 'Amazon.com Inc.',
        'TSLA': 'Tesla Inc.',
        'META': 'Meta Platforms',
        'NVDA': 'NVIDIA Corp.',
        'JPM': 'JPMorgan Chase',
        'V': 'Visa Inc.',
        'WMT': 'Walmart Inc.'
    };
    return companies[symbol] || symbol;
  }

  private loadFallbackCryptoData(): void {
    
    this.marketDataService.getLastMarketData('CRYPTO').subscribe({
        next: (data) => {
            if (!data || data.length === 0) {
                return;
            }
            
            this.cryptoPrices = data.map((crypto: any) => ({
                symbol: crypto.symbol,
                price: this.formatPrice(crypto.close),
                change: this.calculateChange(crypto.open, crypto.close),
                name: crypto.symbol
            }));
        },
        error: (err) => {
        }
    });
}

private readonly STOCK_SYMBOLS = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'JPM'];

// Los intervalos ahora se manejan en MarketTimerService

}