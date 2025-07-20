import { Component, ElementRef, AfterViewInit, ViewChild, OnInit, Renderer2, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, LineController, DoughnutController, ArcElement } from 'chart.js';
import { AccountService } from 'src/app/services/account/account.service';
import { Account } from 'src/app/models/account/account.model';

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
    private cdr: ChangeDetectorRef
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
    console.log('🚀 HomeComponent initialized');
    this.loadDashboardData();
    this.loadMarketData();
  }

  ngAfterViewInit(): void {
    console.log('📊 AfterViewInit - DOM elements available');
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
    console.log('📈 Loading REAL dashboard data from backend...');
    this.isLoadingDashboard = true;
    this.isLoadingCategories = true;
    
    this.accountService.getDashboardData().subscribe({
      next: (data) => {
        console.log('✅ Raw dashboard data from backend:', data);
        console.log('🔍 Category breakdown keys:', Object.keys(data.categoryBreakdown || {}));
        console.log('🔍 Category breakdown values:', Object.values(data.categoryBreakdown || {}));
        
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
    console.log('🔄 Loading fallback data...');
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
    console.log('✅ Fallback data loaded:', this.dashboardData);
  }

  tryInitializeChart(): void {
    // Solo intentar inicializar si:
    // 1. Los datos están cargados
    // 2. El ViewChild está disponible
    // 3. El gráfico no ha sido inicializado aún
    if (this.dataLoaded && this.myChart && !this.chartInitialized) {
      console.log('🎯 Attempting to initialize chart...');
      this.initChart();
    } else {
      console.log('⏳ Chart initialization pending:', {
        dataLoaded: this.dataLoaded,
        myChartAvailable: !!this.myChart,
        chartInitialized: this.chartInitialized
      });
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

      console.log('📊 Creating new chart with data:', {
        labels: this.getMonthLabels(),
        incomeData: this.getIncomeData(),
        expenseData: this.getExpenseData()
      });

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
      console.log('✅ Chart initialized successfully');
      
    } catch (error) {
      console.error('❌ Error initializing chart:', error);
      this.chartError = true;
      this.isLoadingChart = false;
    }
  }

  updateChart(): void {
    if (!this.chart) {
      console.log('⚠️ Chart not initialized, attempting to initialize...');
      this.tryInitializeChart();
      return;
    }

    try {
      console.log('🔄 Updating chart with new data...');
      this.chart.data.labels = this.getMonthLabels();
      this.chart.data.datasets[0].data = this.getIncomeData();
      this.chart.data.datasets[1].data = this.getExpenseData();
      this.chart.update('active');
      console.log('✅ Chart updated successfully');
    } catch (error) {
      console.error('❌ Error updating chart:', error);
      this.chartError = true;
    }
  }

  destroyChart(): void {
    if (this.chart) {
      console.log('🗑️ Destroying existing chart...');
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
    
    console.log('📊 Raw monthly income data from backend:', monthlyData);
    
    // El backend envía datos con formato "YYYY-MM", necesitamos convertir a nombres de mes
    const data = labels.map((month, index) => {
      // Calcular la fecha correspondiente al mes
      const currentDate = new Date();
      const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - (11 - index), 1);
      const yearMonth = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;
      
      const value = monthlyData[yearMonth];
      const result = typeof value === 'number' ? value : 0;
      
      console.log(`Income for ${month} (${yearMonth}):`, result);
      return result;
    });
    
    console.log('📊 Processed income data:', data);
    return data;
  }

  // CORREGIR: getExpenseData para manejar el formato correcto del backend  
  getExpenseData(): number[] {
    const monthlyData = this.dashboardData.monthlyExpenseChart || {};
    const labels = this.getMonthLabels();
    
    console.log('📊 Raw monthly expense data from backend:', monthlyData);
    
    // El backend envía datos con formato "YYYY-MM", necesitamos convertir a nombres de mes
    const data = labels.map((month, index) => {
      // Calcular la fecha correspondiente al mes
      const currentDate = new Date();
      const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - (11 - index), 1);
      const yearMonth = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;
      
      const value = monthlyData[yearMonth];
      const result = typeof value === 'number' ? Math.abs(value) : 0; // Expenses as positive values
      
      console.log(`Expense for ${month} (${yearMonth}):`, result);
      return result;
    });
    
    console.log('📊 Processed expense data:', data);
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
    console.log('🎯 Trying to initialize categories chart...');
    console.log('📊 Categories available:', this.topCategories?.length || 0);
    console.log('📊 Categories data:', this.topCategories);
    
    if (this.categoriesChart && !this.categoriesChartInitialized) {
      // SOLO inicializar si tenemos datos reales
      if (this.topCategories && this.topCategories.length > 0) {
        console.log('🎯 Initializing with REAL data...');
        this.initCategoriesChart();
      } else {
        console.log('⏳ Waiting for real category data...');
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
      
      console.log('📊 Creating chart with REAL data:', categoryData);

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
      console.log('✅ Categories chart initialized with REAL data');
      
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
      console.warn('⚠️ No categories available for chart');
      return { labels: [], values: [], total: 0 };
    }

    // CAMBIO: Incluir todas las categorías, tanto gastos como ingresos
    // Pero para el gráfico de dona, mostrar solo gastos
    const expenses = this.topCategories.filter(cat => cat.amount < 0);
    
    console.log('📊 Expense categories found:', expenses.length);
    console.log('📊 Expense categories:', expenses);
    
    // Si no hay gastos, usar todas las categorías pero convertir a valores absolutos
    let categoriesToShow = expenses;
    if (expenses.length === 0) {
      console.log('📊 No expenses found, using all categories as absolute values');
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
      console.log('🗑️ Destroying our chart instance...');
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
    console.log('🔄 Manual categories chart reinitialization requested...');
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
    
    console.log('🔍 PROCESSING CATEGORY DATA FROM BACKEND');
    console.log('🔍 Raw categoryBreakdown:', categoryData);
    console.log('🔍 Is empty?', Object.keys(categoryData).length === 0);
    
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
        console.log(`🔍 Processing category: ${name} = ${amount}`);
        return { 
          name: name, // Entertainment, Deposit, Withdraw
          amount: typeof amount === 'number' ? amount : 0 
        };
      })
      .filter(cat => {
        const isValid = cat.amount > 0;
        console.log(`🔍 Category ${cat.name}: ${cat.amount} - Valid: ${isValid}`);
        return isValid;
      })
      .sort((a, b) => b.amount - a.amount);
    
    console.log('✅ FINAL REAL CATEGORIES:', this.topCategories);
    console.log('✅ Categories count:', this.topCategories.length);
    
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
    console.log('🚀 FORCING CATEGORIES INITIALIZATION');
    
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

  // AÑADIR: Método para debug completo
  debugAllData(): void {
    console.log('🐛 COMPLETE DEBUG');
    console.log('=================');
    console.log('Dashboard data full:', this.dashboardData);
    console.log('Category breakdown:', this.dashboardData.categoryBreakdown);
    console.log('Top categories:', this.topCategories);
    console.log('Categories error:', this.categoriesError);
    console.log('Categories initialized:', this.categoriesChartInitialized);
    console.log('Loading categories:', this.isLoadingCategories);
    
    // Verificar si estamos usando datos de fallback por error
    if (this.topCategories.some(cat => cat.name === 'TRANSPORT' && cat.amount === 420)) {
      console.error('🚨 DETECTED FALLBACK DATA! THIS IS THE PROBLEM!');
    }
  }
}