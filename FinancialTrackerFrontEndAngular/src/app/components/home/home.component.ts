import { Component, ElementRef, AfterViewInit, ViewChild, OnInit, Renderer2, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, LineController, DoughnutController, ArcElement } from 'chart.js';
import { AccountService } from 'src/app/services/account/account.service';
import { Account } from 'src/app/models/account/account.model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MarketDataService } from 'src/app/services/marketData/marketData.service';

@Component({
    selector: 'home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
    standalone: false
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('myChart', { static: false }) myChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('categoriesChart', { static: false }) categoriesChart!: ElementRef<HTMLCanvasElement>; // NUEVO
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
    categoryBreakdown: {} // NUEVO: datos por categoría
  };

  // Market data
  cryptoPrices: any[] = [];
  stockPrices: any[] = [];
  currencyPrices: any[] = [];

  // Loading states
  isLoadingDashboard = false;
  isLoadingChart = false;
  isLoadingCategories = false; // NUEVO
  chartError = false;
  categoriesError = false; // NUEVO
  
  // Categories data
  topCategories: any[] = []; // NUEVO

  private firstCardWidth!: number;
  private isDragging = false;
  private startX!: number;
  private startScrollLeft!: number;
  private timeoutId: any;
  private chart: Chart | null = null;
  private categoriesChartInstance: any = null; // Cambiar de Chart | null a any
  private chartInitialized = false;
  public categoriesChartInitialized = false; // NUEVO
  private dataLoaded = false;

  constructor(
    private renderer: Renderer2,
    private accountService: AccountService,
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    private marketDataService: MarketDataService
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
      DoughnutController,  // NUEVO
      ArcElement          // NUEVO
    );
  }
  
  ngOnInit(): void {
    this.loadDashboardData();
    this.loadMarketData();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.tryInitializeChart();
      
      // NUEVO: Forzar inicialización de categorías
      this.forceInitializeCategories();
      
      this.initTableScrollDetection();
    }, 300); // Aumentar timeout
  }

  ngOnDestroy(): void {
    this.destroyChart();
    this.destroyCategoriesChart(); // NUEVO
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  // CORREGIR: loadDashboardData para NO usar fallback nunca
  loadDashboardData(): void {
    this.isLoadingDashboard = true;
    this.isLoadingCategories = true;
    
    this.accountService.getDashboardData().subscribe({
      next: (data) => {
        //console.log('✅ Raw dashboard data from backend:', data);
        //console.log('🔍 Category breakdown keys:', Object.keys(data.categoryBreakdown || {}));
        //console.log('🔍 Category breakdown values:', Object.values(data.categoryBreakdown || {}));
        
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
    //console.log('🔄 Loading fallback data...');
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
    //console.log('✅ Fallback data loaded:', this.dashboardData);
  }

  tryInitializeChart(): void {
    // Solo intentar inicializar si:
    // 1. Los datos están cargados
    // 2. El ViewChild está disponible
    // 3. El gráfico no ha sido inicializado aún
    if (this.dataLoaded && this.myChart && !this.chartInitialized) {
      //console.log('🎯 Attempting to initialize chart...');
      this.initChart();
    } else {
      //console.log('⏳ Chart initialization pending:', {
      //  dataLoaded: this.dataLoaded,
      //  myChartAvailable: !!this.myChart,
      //  chartInitialized: this.chartInitialized
      //});
    }
  }

  initChart(): void {
    if (!this.myChart?.nativeElement) {
      console.error('❌ Chart canvas element not available');
      return;
    }

    this.isLoadingChart = true;
    this.chartError = false;

    try {
      const canvas = this.myChart.nativeElement;
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
                  size: 12
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
                  size: 12
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
                  size: 14,
                  family: 'Arial',
                  weight: 'bold'
                },
                boxWidth: 20,
                padding: 20,
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
      //console.log('⚠️ Chart not initialized, attempting to initialize...');
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

  // CORREGIR: getIncomeData para manejar el formato correcto del backend
  getIncomeData(): number[] {
    const monthlyData = this.dashboardData.monthlyIncomeChart || {};
    const labels = this.getMonthLabels();
    
    //console.log('📊 Raw monthly income data from backend:', monthlyData);
    
    // El backend envía datos con formato "YYYY-MM", necesitamos convertir a nombres de mes
    const data = labels.map((month, index) => {
      // Calcular la fecha correspondiente al mes
      const currentDate = new Date();
      const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - (11 - index), 1);
      const yearMonth = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;
      
      const value = monthlyData[yearMonth];
      const result = typeof value === 'number' ? value : 0;
      
      //console.log(`Income for ${month} (${yearMonth}):`, result);
      return result;
    });
    
    //console.log('📊 Processed income data:', data);
    return data;
  }

  // CORREGIR: getExpenseData para manejar el formato correcto del backend  
  getExpenseData(): number[] {
    const monthlyData = this.dashboardData.monthlyExpenseChart || {};
    const labels = this.getMonthLabels();
    
    //console.log('📊 Raw monthly expense data from backend:', monthlyData);
    
    // El backend envía datos con formato "YYYY-MM", necesitamos convertir a nombres de mes
    const data = labels.map((month, index) => {
      // Calcular la fecha correspondiente al mes
      const currentDate = new Date();
      const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - (11 - index), 1);
      const yearMonth = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;
      
      const value = monthlyData[yearMonth];
      const result = typeof value === 'number' ? Math.abs(value) : 0; // Expenses as positive values
      
      //console.log(`Expense for ${month} (${yearMonth}):`, result);
      return result;
    });
    
    //console.log('📊 Processed expense data:', data);
    return data;
  }

  // Método para reinicializar el gráfico manualmente
  reinitializeChart(): void {
    console.log('🔄 Manual chart reinitialization requested...');
    this.destroyChart();
    this.chartInitialized = false;
    this.tryInitializeChart();
  }



  // MEJORAR: loadFallbackCategoryData con más variedad y valores más realistas
  // ELIMINAR COMPLETAMENTE: loadFallbackCategoryData
  // Comentar o eliminar este método completo porque está generando datos falsos

  // CORREGIR: tryInitializeCategoriesChart para verificar datos reales
  tryInitializeCategoriesChart(): void {
    //console.log('🎯 Trying to initialize categories chart...');
    //console.log('📊 Categories available:', this.topCategories?.length || 0);
    //console.log('📊 Categories data:', this.topCategories);
    
    if (this.categoriesChart && !this.categoriesChartInitialized) {
      // SOLO inicializar si tenemos datos reales
      if (this.topCategories && this.topCategories.length > 0) {
        //console.log('🎯 Initializing with REAL data...');
        this.initCategoriesChart();
      } else {
        //console.log('⏳ Waiting for real category data...');
        this.categoriesError = true;
        this.isLoadingCategories = false;
      }
    }
  }

  // CORREGIR: initCategoriesChart para garantizar datos reales
  initCategoriesChart(): void {
    if (!this.categoriesChart?.nativeElement) {
      return;
    }

    this.isLoadingCategories = true;
    this.categoriesError = false;

    try {
      const canvas = this.categoriesChart.nativeElement;
      
      // Destruir gráfico existente
      const existingChart = Chart.getChart(canvas);
      if (existingChart) {
        existingChart.destroy();
      }
      
      if (this.categoriesChartInstance) {
        try {
          this.categoriesChartInstance.destroy();
        } catch (error) {
          console.log('Warning destroying our chart instance:', error);
        }
        this.categoriesChartInstance = null;
      }
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get 2D context from categories canvas');
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // USAR SOLO datos reales, NO fallback
      const categoryData = this.getCategoryChartData();
      
      if (categoryData.labels.length === 0) {
        console.warn('⚠️ No real category data available for chart');
        this.categoriesError = true;
        this.isLoadingCategories = false;
        return;
      }
      
      //console.log('📊 Creating chart with REAL data:', categoryData);

      // Crear gráfico con datos reales
      this.categoriesChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: categoryData.labels,
          datasets: [{
            label: 'Amount ($)',
            data: categoryData.values,
            backgroundColor: [
              'rgba(255, 99, 132, 0.8)',
              'rgba(54, 162, 235, 0.8)',
              'rgba(255, 205, 86, 0.8)',
              'rgba(75, 192, 192, 0.8)',
              'rgba(153, 102, 255, 0.8)',
              'rgba(255, 159, 64, 0.8)',
              'rgba(33, 190, 114, 0.8)',
              'rgba(255, 71, 87, 0.8)'
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 205, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
              'rgba(33, 190, 114, 1)',
              'rgba(255, 71, 87, 1)'
            ],
            borderWidth: 1.5
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              ticks: {
                color: 'white',
                font: { size: 8 },
                maxRotation: 45,
                minRotation: 0
              },
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              }
            },
            y: {
              beginAtZero: true,
              ticks: {
                color: 'white',
                font: { size: 8 },
                callback: function(value: any) {
                  if (value >= 1000) {
                    return '$' + (value / 1000).toFixed(1) + 'K';
                  }
                  return '$' + value.toLocaleString();
                }
              },
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              }
            }
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              enabled: true,
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              titleColor: 'white',
              bodyColor: 'white',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              borderWidth: 1,
              cornerRadius: 6,
              titleFont: { size: 9 },
              bodyFont: { size: 8 },
              callbacks: {
                title: function(context: any) {
                  return context[0].label;
                },
                label: function(context: any) {
                  const value = '$' + context.parsed.y.toLocaleString();
                  return `Amount: ${value}`;
                }
              }
            }
          },
          animation: {
            duration: 800,
            easing: 'easeInOutQuart'
          }
        }
      });

      this.categoriesChartInitialized = true;
      this.isLoadingCategories = false;
      //console.log('✅ Categories chart initialized with REAL data');
      
      this.cdr.detectChanges();
      
    } catch (error) {
      console.error('❌ Error initializing categories chart:', error);
      this.categoriesError = true;
      this.isLoadingCategories = false;
      this.cdr.detectChanges();
    }
  }

  // MEJORAR: Obtener datos para el gráfico de categorías
  getCategoryChartData(): any {
    
    // Validar que tenemos categorías
    if (!this.topCategories || this.topCategories.length === 0) {
      return { labels: [], values: [], total: 0 };
    }

    // CAMBIO: Incluir todas las categorías, tanto gastos como ingresos
    // Pero para el gráfico de dona, mostrar solo gastos
    const expenses = this.topCategories.filter(cat => cat.amount < 0);
    
    // Si no hay gastos, usar todas las categorías pero convertir a valores absolutos
    let categoriesToShow = expenses;
    if (expenses.length === 0) {
      categoriesToShow = this.topCategories.map(cat => ({
        ...cat,
        amount: Math.abs(cat.amount)
      }));
    }

    const labels = categoriesToShow.map(cat => cat.name || 'Unknown');
    const values = categoriesToShow.map(cat => Math.abs(cat.amount || 0));
    const total = values.reduce((sum, val) => sum + val, 0);
    
    
    return { labels, values, total };
  }

  // MEJORAR: destroyCategoriesChart usando Chart.getChart
  destroyCategoriesChart(): void {
    // Método 1: Destruir usando Chart.getChart
    if (this.categoriesChart?.nativeElement) {
      const existingChart = Chart.getChart(this.categoriesChart.nativeElement);
      if (existingChart) {
        console.log('🗑️ Destroying chart via Chart.getChart, ID:', existingChart.id);
        existingChart.destroy();
      }
    }
    
    // Método 2: Destruir nuestra instancia
    if (this.categoriesChartInstance) {
      try {
        this.categoriesChartInstance.destroy();
      } catch (error) {
        console.log('Warning destroying chart:', error);
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

  // NUEVO: Reinicializar gráfico de categorías
  reinitializeCategoriesChart(): void {
    //console.log('🔄 Manual categories chart reinitialization requested...');
    this.destroyCategoriesChart();
    this.categoriesChartInitialized = false;
    this.tryInitializeCategoriesChart();
  }

  // NUEVO: Obtener icono por categoría
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

  // Resto de métodos del carrusel y utilidades permanecen igual...
  loadMarketData(): void {
    this.loadCryptoPrices();
    this.loadStockData(); // Cambiamos loadStockPrices por loadStockData
    this.loadCurrencyPrices(); // Añadimos esta línea

    // Configurar actualizaciones periódicas
    this.cryptoUpdateTimers = setInterval(() => this.loadCryptoPrices(), this.UPDATE_INTERVALS.CRYPTO);
    this.forexUpdateTimers = setInterval(() => this.loadCurrencyPrices(), this.UPDATE_INTERVALS.FOREX);
    this.stockUpdateTimers = setInterval(() => this.loadStockData(), this.UPDATE_INTERVALS.STOCKS);

}

// Añadimos el nuevo método para cargar divisas
loadCurrencyPrices(): void {
    const lastUpdate = localStorage.getItem('lastForexUpdate');
    const now = Date.now();
    
    if (lastUpdate && (now - parseInt(lastUpdate)) < this.UPDATE_INTERVALS.FOREX) {
        this.loadForexFromDatabase();
        return;
    }

    const apiKey = environment.exchangerateApiKey;
    const baseUrl = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`;
    
    console.log('🔄 Iniciando actualización de divisas...');
    
    this.accountService.getDataFromAPI(baseUrl).subscribe({
        next: (data: any) => {
            console.log('✅ Currency data loaded:', data);
            localStorage.setItem('lastForexUpdate', now.toString());
            
            const mainCurrencies = ['EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'NZD'];
            
            this.currencyPrices = mainCurrencies.map(currency => {
                const rate = data.conversion_rates[currency];
                const previousRate = rate * (1 + (Math.random() * 0.02 - 0.01));
                
                const marketData = {
                    symbol: `USD/${currency}`, // Cambiado el orden aquí
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
                    next: () => console.log(`✅ Saved ${currency} data to database`),
                    error: (err) => console.error(`❌ Error saving ${currency}:`, err)
                });

                return {
                    symbol: `USD/${currency}`, // Cambiado el orden aquí
                    price: this.formatPrice(rate),
                    change: this.calculateChange(previousRate, rate),
                    name: this.getCurrencyName(currency)
                };
            });
        },
        error: (error) => {
            console.error('❌ Error loading currency prices:', error);
            this.loadForexFromDatabase();
        }
    });
}

private loadForexFromDatabase(): void {
    this.marketDataService.getLastMarketData('FOREX').subscribe({
        next: (data) => {
            if (!data || data.length === 0) {
                console.log('ℹ️ No hay datos de divisas disponibles en base de datos');
                return;
            }
            
            this.currencyPrices = data.map((forex: any) => ({
                symbol: forex.symbol, // Ya estará en formato USD/XXX desde la base de datos
                price: this.formatPrice(forex.close),
                change: this.calculateChange(forex.open, forex.close),
                name: this.getCurrencyName(forex.symbol.split('/')[1]) // Cambiado para tomar la segunda parte del par
            }));
        },
        error: (err) => {
            console.error('❌ Error cargando divisas desde base de datos:', err);
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
        //console.log('✅ Crypto data loaded:', data);
        
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
          //console.log('✅ Crypto data going to save:', marketData);


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

  private loadStockData(): void {
    const lastUpdate = localStorage.getItem('lastStockUpdate');
    const now = Date.now();
    
    // Si no han pasado 16 minutos desde la última actualización, usar datos de la BD
    if (lastUpdate && (now - parseInt(lastUpdate)) < this.UPDATE_INTERVALS.STOCKS) {
        this.loadStocksFromDatabase();
        return;
    }

    const apiKey = environment.twelvedataApiKey;
    // Usar el endpoint de precio en tiempo real que es más eficiente para múltiples símbolos
    const url = `https://api.twelvedata.com/price?symbol=${this.STOCK_SYMBOLS.join(',')}&apikey=${apiKey}`;

    this.accountService.getDataFromAPI(url).subscribe({
        next: (data: any) => {
            console.log('✅ Stock data loaded:', data);
            localStorage.setItem('lastStockUpdate', now.toString());

            // Si solo hay un símbolo, la respuesta es un objeto, no un map
            const prices = this.STOCK_SYMBOLS.length === 1 ? { [this.STOCK_SYMBOLS[0]]: data } : data;

            this.stockPrices = Object.entries(prices).map(([symbol, priceData]: [string, any]) => {
                const currentPrice = parseFloat(priceData.price);
                const previousPrice = currentPrice * (1 + (Math.random() * 0.02 - 0.01)); // Simulamos precio anterior

                const marketData = {
                    symbol: symbol,
                    assetType: 'STOCK',
                    date: new Date().toISOString().split('T')[0],
                    open: previousPrice,
                    high: Math.max(currentPrice, previousPrice),
                    low: Math.min(currentPrice, previousPrice),
                    close: currentPrice,
                    volume: 0, // El endpoint de price no provee volumen
                    market: 'USD'
                };

                // Guardar en backend para fallback
                this.marketDataService.saveMarketData(marketData).subscribe({
                    //next: () => console.log(`✅ Saved ${symbol} data to database`),
                    error: (err) => console.error(`❌ Error saving ${symbol}:`, err)
                });

                return {
                    symbol: symbol,
                    price: this.formatPrice(currentPrice),
                    change: this.calculateChange(previousPrice, currentPrice),
                    name: this.getCompanyName(symbol)
                };
            });
        },
        error: (error) => {
            console.error('❌ Error loading stocks from API:', error);
            this.loadStocksFromDatabase();
        }
    });
}

private loadStocksFromDatabase(): void {
    this.marketDataService.getLastMarketData('STOCK').subscribe({
        next: (data) => {
            if (!data || data.length === 0) {
                console.log('ℹ️ No stock data available in database');
                return;
            }

            this.stockPrices = data.map((stock: any) => ({
                symbol: stock.symbol,
                price: this.formatPrice(stock.close),
                change: this.calculateChange(stock.open, stock.close),
                name: this.getCompanyName(stock.symbol)
            }));
            //console.log('✅ Loaded stock data from database');
        },
        error: (err) => console.error('❌ Error loading stocks from database:', err)
    });
}

private updateStockPrice(marketData: any): void {
    console.log(`🔄 Actualizando precio para ${marketData.symbol}`);
    
    const index = this.stockPrices.findIndex(s => s.symbol === marketData.symbol);
    const stockPrice = {
        symbol: marketData.symbol,
        price: this.formatPrice(marketData.close),
        change: this.calculateChange(marketData.open, marketData.close),
        name: this.getCompanyName(marketData.symbol)
    };

    console.log(`📊 Nuevo precio para ${marketData.symbol}:`, stockPrice);

    if (index === -1) {
        this.stockPrices.push(stockPrice);
        console.log(`➕ Añadido nuevo stock: ${marketData.symbol}`);
    } else {
        this.stockPrices[index] = stockPrice;
        console.log(`🔄 Actualizado stock existente: ${marketData.symbol}`);
    }

    console.log(`📈 Total stocks en UI: ${this.stockPrices.length}`);
}

private loadFallbackStockData(symbol: string): void {
    console.log('🔄 Cargando datos de fallback para stocks...');
    
    this.marketDataService.getLastMarketData('STOCK').subscribe({
        next: (data) => {
            if (!data || data.length === 0) {
                console.log('ℹ️ No hay datos de fallback disponibles');
                return;
            }

            // Si no se especifica símbolo, cargar todos los disponibles
            if (!symbol) {
                data.forEach((stockData: any) => {
                    this.updateStockPrice(stockData);
                });
                console.log(`✅ Cargados ${data.length} stocks de fallback`);
            } else {
                const stockData = data.find((s: any) => s.symbol === symbol);
                if (stockData) {
                    this.updateStockPrice(stockData);
                    console.log(`✅ Datos de fallback cargados para ${symbol}`);
                }
            }
        },
        error: (err) => {
            console.log('ℹ️ No se pudieron obtener datos de fallback');
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

  // NUEVO: Detectar scroll en tablas para efectos visuales
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

  // CORREGIR COMPLETAMENTE: processCategoryData para usar SOLO backend data
  processCategoryData(): void {
    const categoryData = this.dashboardData.categoryBreakdown || {};
    
    //console.log('🔍 PROCESSING CATEGORY DATA FROM BACKEND');
    //console.log('🔍 Raw categoryBreakdown:', categoryData);
    //console.log('🔍 Is empty?', Object.keys(categoryData).length === 0);
    
    // Si no hay datos del backend, NO usar fallback
    if (Object.keys(categoryData).length === 0) {
      console.warn('❌ NO REAL CATEGORY DATA FROM BACKEND');
      this.topCategories = [];
      this.categoriesError = true;
      return;
    }

    // Procesar SOLO datos reales del backend
    this.topCategories = Object.entries(categoryData)
      .map(([name, amount]) => {
        //console.log(`🔍 Processing category: ${name} = ${amount}`);
        return { 
          name: name, // Entertainment, Deposit, Withdraw
          amount: typeof amount === 'number' ? amount : 0 
        };
      })
      .filter(cat => {
        const isValid = cat.amount > 0;
        //console.log(`🔍 Category ${cat.name}: ${cat.amount} - Valid: ${isValid}`);
        return isValid;
      })
      .sort((a, b) => b.amount - a.amount);
    
    //console.log('✅ FINAL REAL CATEGORIES:', this.topCategories);
    //console.log('✅ Categories count:', this.topCategories.length);
    
    if (this.topCategories.length === 0) {
      console.warn('❌ NO VALID CATEGORIES AFTER PROCESSING');
      this.categoriesError = true;
    } else {
      this.categoriesError = false;
    }
  }
  // NUEVO: Formatear nombres de categorías para mejor visualización
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

  // CORREGIR COMPLETAMENTE: forceInitializeCategories para NO usar fallback
  forceInitializeCategories(): void {
    //console.log('🚀 FORCING CATEGORIES INITIALIZATION');
    
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
        console.log('⚠️ No real categories available for forced initialization');
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
    console.log('🔄 Intentando cargar datos de fallback para cryptos...');
    
    this.marketDataService.getLastMarketData('CRYPTO').subscribe({
        next: (data) => {
            if (!data || data.length === 0) {
                console.log('ℹ️ No hay datos de fallback disponibles para cryptos');
                return;
            }
            
            this.cryptoPrices = data.map((crypto: any) => ({
                symbol: crypto.symbol,
                price: this.formatPrice(crypto.close),
                change: this.calculateChange(crypto.open, crypto.close),
                name: crypto.symbol
            }));
            console.log('✅ Datos de fallback de crypto cargados');
        },
        error: (err) => {
            console.log('ℹ️ No se pudieron obtener datos de fallback para cryptos');
        }
    });
}

private readonly STOCK_SYMBOLS = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'JPM'];

private readonly UPDATE_INTERVALS = {
    CRYPTO: 5 * 60 * 1000,    // 5 minutos
    FOREX: 32 * 60 * 1000,    // 32 minutos (45 llamadas/día)
    STOCKS: 16 * 60 * 1000    // 16 minutos
};

private cryptoUpdateTimers: { [key: string]: any } = {};
private forexUpdateTimers: { [key: string]: any } = {};
private stockUpdateTimers: { [key: string]: any } = {};

}