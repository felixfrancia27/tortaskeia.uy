import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductsService, Product, ProductFilters } from '@app/core/services/products.service';
import { CartService } from '@app/core/services/cart.service';

interface Category {
  id: number;
  name: string;
  slug: string;
}

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, CurrencyPipe],
  template: `
    <section class="shop-page">
      <!-- Hero: franja contenida, compacta -->
      <div class="shop-hero">
        <div class="shop-hero-strip">
          <div class="shop-hero-bg" aria-hidden="true"></div>
          <div class="shop-hero-inner">
            <h1>Nuestra Tienda</h1>
            <p>Tortas artesanales, cupcakes y boxes dulces para tus celebraciones</p>
          </div>
        </div>
      </div>

      <div class="container">
        <div class="shop-layout">
          <!-- Sidebar Filters -->
          <aside class="filters-sidebar">
            <div class="filter-section">
              <h3>Buscar</h3>
              <div class="search-box">
                <input 
                  type="text" 
                  placeholder="Buscar productos..."
                  [ngModel]="searchQuery()"
                  (ngModelChange)="onSearchChange($event)"
                  class="input"
                />
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                </svg>
              </div>
            </div>

            <div class="filter-section">
              <h3>Categorías</h3>
              <ul class="category-list">
                <li>
                  <button 
                    [class.active]="!selectedCategory()"
                    (click)="selectCategory(null)"
                  >
                    Todas las categorías
                  </button>
                </li>
                @for (cat of categories(); track cat.id) {
                  <li>
                    <button 
                      [class.active]="selectedCategory() === cat.slug"
                      (click)="selectCategory(cat.slug)"
                    >
                      {{ cat.name }}
                    </button>
                  </li>
                }
              </ul>
            </div>

            <div class="filter-section">
              <h3>Ordenar por</h3>
              <select 
                class="input" 
                [ngModel]="sortBy()"
                (ngModelChange)="onSortChange($event)"
              >
                <option value="sort_order">Destacados</option>
                <option value="price_asc">Precio: Menor a Mayor</option>
                <option value="price_desc">Precio: Mayor a Menor</option>
                <option value="name">Nombre A-Z</option>
                <option value="created_at">Más Recientes</option>
              </select>
            </div>
          </aside>

          <!-- Products Grid -->
          <main class="products-main">
            @if (loading()) {
              <div class="loading-state">
                <div class="spinner-large"></div>
                <p>Cargando productos...</p>
              </div>
            } @else if (products().length === 0) {
              <div class="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                </svg>
                <h3>No encontramos productos</h3>
                <p>Probá con otra búsqueda o categoría</p>
                <button class="btn-secondary" (click)="clearFilters()">Limpiar filtros</button>
              </div>
            } @else {
              <div class="results-info">
                <p>{{ totalProducts() }} productos encontrados</p>
              </div>

              <div class="products-grid">
                @for (product of products(); track product.id; let i = $index) {
                  <article class="product-card">
                    <a [routerLink]="['/tortas', product.slug]" class="product-image">
                      <img 
                        [src]="product.main_image || (product.images && product.images.length ? product.images[0].url : 'assets/images/placeholder.jpg')" 
                        [alt]="product.name"
                        [attr.loading]="i === 0 ? 'eager' : 'lazy'"
                        [attr.fetchpriority]="i === 0 ? 'high' : null"
                      />
                      @if (product.compare_price) {
                        <span class="badge-sale">Oferta</span>
                      }
                    </a>
                    <div class="product-info">
                      <a [routerLink]="['/tortas', product.slug]">
                        <h3 class="product-name">{{ product.name }}</h3>
                      </a>
                      @if (product.short_description) {
                        <p class="product-desc">{{ product.short_description }}</p>
                      }
                      <div class="product-price">
                        @if (product.compare_price) {
                          <span class="price-old">{{ product.compare_price | currency:'UYU':'$':'1.0-0' }}</span>
                        }
                        <span class="price-current">{{ product.price | currency:'UYU':'$':'1.0-0' }}</span>
                      </div>
                      <div class="product-actions">
                        <a [routerLink]="['/tortas', product.slug]" class="btn-secondary-sm">Ver detalles</a>
                        <button 
                          class="btn-primary-sm"
                          (click)="addToCart(product)"
                          [disabled]="product.stock <= 0"
                        >
                          @if (product.stock <= 0) {
                            Agotado
                          } @else {
                            Agregar
                          }
                        </button>
                      </div>
                    </div>
                  </article>
                }
              </div>

              <!-- Pagination -->
              @if (totalPages() > 1) {
                <div class="pagination">
                  <button 
                    class="page-btn"
                    [disabled]="currentPage() === 1"
                    (click)="goToPage(currentPage() - 1)"
                  >
                    ← Anterior
                  </button>
                  
                  <div class="page-numbers">
                    @for (page of paginationRange(); track page) {
                      @if (page === '...') {
                        <span class="page-ellipsis">...</span>
                      } @else {
                        <button 
                          class="page-num"
                          [class.active]="currentPage() === page"
                          (click)="goToPage(+page)"
                        >
                          {{ page }}
                        </button>
                      }
                    }
                  </div>
                  
                  <button 
                    class="page-btn"
                    [disabled]="currentPage() === totalPages()"
                    (click)="goToPage(currentPage() + 1)"
                  >
                    Siguiente →
                  </button>
                </div>
              }
            }
          </main>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .shop-page {
      padding-bottom: var(--space-16);
    }

    .shop-hero {
      margin-top: var(--space-8);
      padding: var(--space-6) var(--space-4) var(--space-6);
      margin-bottom: var(--space-8);
      background: var(--surface);

      @media (max-width: 480px) {
        padding: var(--space-4) var(--space-3);
        margin-top: var(--space-4);
        margin-bottom: var(--space-6);
      }

      @media (min-width: 768px) {
        margin-top: var(--space-10);
        padding: var(--space-8) var(--space-6) var(--space-8);
        margin-bottom: var(--space-10);
      }
    }

    .shop-hero-strip {
      position: relative;
      max-width: 720px;
      margin: 0 auto;
      border-radius: var(--radius-xl);
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(239, 108, 0, 0.2);
    }

    .shop-hero-bg {
      position: absolute;
      inset: 0;
      background: var(--brand);
      z-index: 0;
    }

    .shop-hero-inner {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: var(--space-5) var(--space-6);
      min-height: 0;

      @media (min-width: 768px) {
        padding: var(--space-6) var(--space-8);
        min-height: 0;
      }
    }

    .shop-hero h1 {
      font-family: var(--font-display);
      font-size: var(--text-xl);
      font-weight: 700;
      margin: 0 0 var(--space-2);
      letter-spacing: 0.03em;
      color: #fff;

      @media (min-width: 768px) {
        font-size: var(--text-2xl);
        margin-bottom: var(--space-3);
      }
    }

    .shop-hero p {
      margin: 0;
      font-size: var(--text-sm);
      line-height: 1.45;
      color: rgba(255, 255, 255, 0.95);
      max-width: 380px;

      @media (min-width: 768px) {
        font-size: var(--text-base);
      }
    }

    .shop-layout {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--space-8);
      padding-top: var(--space-4);

      @media (min-width: 768px) {
        grid-template-columns: 260px 1fr;
        padding-top: var(--space-6);
      }
    }

    .filters-sidebar {
      @media (max-width: 767px) {
        order: -1;
      }
    }

    .filter-section {
      margin-bottom: var(--space-6);

      h3 {
        font-size: var(--text-sm);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--ink);
        margin-bottom: var(--space-3);
      }
    }

    .search-box {
      position: relative;

      .input {
        padding-right: 40px;
      }

      svg {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--ink-muted);
      }
    }

    .input {
      width: 100%;
      padding: var(--space-3) var(--space-4);
      font-size: var(--text-sm);
      border: 1px solid #E0D5C8;
      border-radius: var(--radius-md);
      background-color: white;

      &:focus {
        outline: none;
        border-color: var(--brand);
      }
    }

    .category-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);

      button {
        display: block;
        width: 100%;
        text-align: left;
        padding: var(--space-2) var(--space-3);
        min-height: 44px;
        font-size: var(--text-sm);
        color: var(--ink-light);
        background: none;
        border: none;
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: all var(--transition-fast);
        -webkit-tap-highlight-color: transparent;

        &:hover {
          background-color: var(--surface);
          color: var(--ink);
        }

        &.active {
          background-color: var(--brand);
          color: white;
        }
      }
    }

    .products-main {
      min-height: 400px;
    }

    .loading-state,
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--space-16) var(--space-4);
      text-align: center;
      color: var(--ink-light);

      svg {
        margin-bottom: var(--space-4);
        opacity: 0.5;
      }

      h3 {
        font-size: var(--text-lg);
        color: var(--ink);
        margin-bottom: var(--space-2);
      }

      p {
        margin-bottom: var(--space-4);
      }
    }

    .spinner-large {
      width: 40px;
      height: 40px;
      border: 3px solid var(--surface);
      border-top-color: var(--brand);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: var(--space-4);
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .results-info {
      margin-bottom: var(--space-4);
      
      p {
        font-size: var(--text-sm);
        color: var(--ink-light);
      }
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-4);

      @media (max-width: 480px) {
        gap: var(--space-3);
      }

      @media (min-width: 640px) {
        gap: var(--space-6);
      }

      @media (min-width: 1024px) {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    .product-card {
      background: white;
      border-radius: var(--radius-xl);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
      transition: transform var(--transition-base), box-shadow var(--transition-base);

      &:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-lg);
      }
    }

    .product-image {
      display: block;
      position: relative;
      aspect-ratio: 1;
      overflow: hidden;
      background-color: var(--surface);

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform var(--transition-slow);
      }

      &:hover img {
        transform: scale(1.05);
      }

      .badge-sale {
        position: absolute;
        top: 12px;
        left: 12px;
        padding: var(--space-1) var(--space-2);
        background-color: var(--brand);
        color: white;
        font-size: var(--text-xs);
        font-weight: 600;
        border-radius: var(--radius-sm);
      }
    }

    .product-info {
      padding: var(--space-4);
    }

    .product-name {
      font-family: var(--font-display);
      font-size: var(--text-base);
      font-weight: 600;
      color: var(--ink);
      margin-bottom: var(--space-1);
      line-height: 1.3;

      @media (min-width: 768px) {
        font-size: var(--text-lg);
      }
    }

    .product-desc {
      font-size: var(--text-xs);
      color: var(--ink-light);
      margin-bottom: var(--space-2);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;

      @media (min-width: 768px) {
        font-size: var(--text-sm);
      }
    }

    .product-price {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      margin-bottom: var(--space-3);

      .price-old {
        font-size: var(--text-sm);
        color: var(--ink-muted);
        text-decoration: line-through;
      }

      .price-current {
        font-size: var(--text-base);
        font-weight: 600;
        color: var(--brand);

        @media (min-width: 768px) {
          font-size: var(--text-lg);
        }
      }
    }

    .product-actions {
      display: flex;
      gap: var(--space-2);
    }

    .btn-primary-sm,
    .btn-secondary-sm {
      flex: 1;
      padding: var(--space-2);
      min-height: 44px;
      font-size: var(--text-xs);
      font-weight: 600;
      border-radius: var(--radius-md);
      border: none;
      cursor: pointer;
      transition: all var(--transition-fast);
      text-align: center;
      text-decoration: none;
      -webkit-tap-highlight-color: transparent;

      @media (min-width: 768px) {
        font-size: var(--text-sm);
        padding: var(--space-2) var(--space-3);
      }
    }

    .btn-primary-sm {
      background-color: var(--brand);
      color: white;

      &:hover:not(:disabled) {
        background-color: var(--brand-dark);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .btn-secondary-sm {
      background-color: var(--surface);
      color: var(--ink);

      &:hover {
        background-color: var(--surface-alt);
        color: var(--ink);
      }
    }

    .btn-secondary {
      padding: var(--space-2) var(--space-4);
      background: transparent;
      border: 2px solid var(--brand);
      color: var(--brand);
      border-radius: var(--radius-md);
      font-weight: 600;
      cursor: pointer;

      &:hover {
        background-color: var(--brand);
        color: white;
      }
    }

    .pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      margin-top: var(--space-8);
      flex-wrap: wrap;
    }

    .page-btn {
      padding: var(--space-2) var(--space-4);
      min-height: 44px;
      font-size: var(--text-sm);
      color: var(--ink);
      background: white;
      border: 1px solid #E0D5C8;
      border-radius: var(--radius-md);
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;

      &:hover:not(:disabled) {
        border-color: var(--brand);
        color: var(--brand);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .page-numbers {
      display: flex;
      align-items: center;
      gap: var(--space-1);
    }

    .page-num {
      width: 44px;
      height: 44px;
      min-width: 44px;
      min-height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--text-sm);
      color: var(--ink);
      background: white;
      border: 1px solid #E0D5C8;
      border-radius: var(--radius-md);
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;

      &:hover {
        border-color: var(--brand);
        color: var(--brand);
      }

      &.active {
        background-color: var(--brand);
        border-color: var(--brand);
        color: white;
      }
    }

    .page-ellipsis {
      padding: 0 var(--space-2);
      color: var(--ink-muted);
    }
  `],
})
export class ShopComponent implements OnInit {
  private productsService = inject(ProductsService);
  private cartService = inject(CartService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // State
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  loading = signal(true);
  
  // Filters
  searchQuery = signal('');
  selectedCategory = signal<string | null>(null);
  sortBy = signal('sort_order');
  currentPage = signal(1);
  totalProducts = signal(0);
  pageSize = 12;

  // Computed
  totalPages = computed(() => Math.ceil(this.totalProducts() / this.pageSize));
  
  paginationRange = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const range: (number | string)[] = [];
    
    if (total <= 7) {
      for (let i = 1; i <= total; i++) range.push(i);
    } else {
      range.push(1);
      if (current > 3) range.push('...');
      
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      
      for (let i = start; i <= end; i++) range.push(i);
      
      if (current < total - 2) range.push('...');
      range.push(total);
    }
    
    return range;
  });

  ngOnInit() {
    this.loadCategories();
    
    // Read query params
    this.route.queryParams.subscribe(params => {
      if (params['categoria']) {
        this.selectedCategory.set(params['categoria']);
      }
      if (params['buscar']) {
        this.searchQuery.set(params['buscar']);
      }
      if (params['pagina']) {
        this.currentPage.set(+params['pagina']);
      }
      this.loadProducts();
    });
  }

  loadCategories() {
    // Static for now - will connect to API
    this.categories.set([
      { id: 1, name: 'Tortas Clásicas', slug: 'tortas-clasicas' },
      { id: 2, name: 'Tortas Personalizadas', slug: 'tortas-personalizadas' },
      { id: 3, name: 'Boxes y Combos', slug: 'boxes-combos' },
      { id: 4, name: 'Cupcakes', slug: 'cupcakes' },
    ]);
  }

  loadProducts() {
    this.loading.set(true);

    const [sortField, sortDir] = this.parseSortBy(this.sortBy());
    
    const filters: ProductFilters = {
      page: this.currentPage(),
      page_size: this.pageSize,
      sort_by: sortField as ProductFilters['sort_by'],
      sort_order: sortDir as ProductFilters['sort_order'],
    };

    if (this.selectedCategory()) {
      filters.category_slug = this.selectedCategory()!;
    }

    if (this.searchQuery()) {
      filters.search = this.searchQuery();
    }

    this.productsService.getProducts(filters).subscribe({
      next: (response) => {
        this.products.set(response.items);
        this.totalProducts.set(response.total);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        // Load mock data on error
        this.loadMockProducts();
      },
    });
  }

  loadMockProducts() {
    // Fallback mock data
    const mockProducts: Product[] = [
      { id: 1, name: 'Torta de Chocolate', slug: 'torta-chocolate', price: 1200, stock: 10, is_featured: true, images: [], main_image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400', short_description: 'Deliciosa torta de chocolate con ganache' },
      { id: 2, name: 'Torta de Vainilla con Frutos Rojos', slug: 'torta-vainilla-frutos-rojos', price: 1350, stock: 8, is_featured: true, images: [], main_image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400', short_description: 'Suave vainilla con crema y frutos rojos' },
      { id: 3, name: 'Torta Red Velvet', slug: 'torta-red-velvet', price: 1400, stock: 6, is_featured: true, images: [], main_image: 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?w=400', short_description: 'Clásica red velvet con frosting de queso crema' },
      { id: 4, name: 'Torta de Dulce de Leche', slug: 'torta-dulce-leche', price: 1300, stock: 10, is_featured: true, images: [], main_image: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400', short_description: 'Irresistible dulce de leche uruguayo' },
      { id: 5, name: 'Torta Personalizada Floral', slug: 'torta-personalizada-floral', price: 1800, compare_price: 2000, stock: 5, is_featured: false, images: [], main_image: 'https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?w=400', short_description: 'Decoración con flores de buttercream' },
      { id: 6, name: 'Box Dulce Sorpresa', slug: 'box-dulce-sorpresa', price: 950, stock: 15, is_featured: true, images: [], main_image: 'https://images.unsplash.com/photo-1558326567-98ae2405596b?w=400', short_description: 'Caja con variedad de mini postres' },
    ];
    this.products.set(mockProducts);
    this.totalProducts.set(mockProducts.length);
  }

  parseSortBy(value: string): [string, string] {
    switch (value) {
      case 'price_asc': return ['price', 'asc'];
      case 'price_desc': return ['price', 'desc'];
      case 'name': return ['name', 'asc'];
      case 'created_at': return ['created_at', 'desc'];
      default: return ['sort_order', 'asc'];
    }
  }

  onSearchChange(query: string) {
    this.searchQuery.set(query);
    this.currentPage.set(1);
    this.updateUrl();
    this.debounceSearch();
  }

  private searchTimeout: ReturnType<typeof setTimeout> | null = null;
  
  debounceSearch() {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.loadProducts();
    }, 300);
  }

  selectCategory(slug: string | null) {
    this.selectedCategory.set(slug);
    this.currentPage.set(1);
    this.updateUrl();
    this.loadProducts();
  }

  onSortChange(value: string) {
    this.sortBy.set(value);
    this.loadProducts();
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.updateUrl();
    this.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  clearFilters() {
    this.searchQuery.set('');
    this.selectedCategory.set(null);
    this.sortBy.set('sort_order');
    this.currentPage.set(1);
    this.updateUrl();
    this.loadProducts();
  }

  updateUrl() {
    const queryParams: Record<string, string> = {};
    
    if (this.selectedCategory()) {
      queryParams['categoria'] = this.selectedCategory()!;
    }
    if (this.searchQuery()) {
      queryParams['buscar'] = this.searchQuery();
    }
    if (this.currentPage() > 1) {
      queryParams['pagina'] = String(this.currentPage());
    }
    
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: '',
    });
  }

  addToCart(product: Product) {
    this.cartService.addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      main_image: product.main_image,
    }).subscribe({
      next: () => {
        // Opcional: mostrar toast "Agregado al carrito"
      },
      error: () => {
        // El carrito se refresca en catchError del servicio; se puede mostrar mensaje de error
      },
    });
  }
}
