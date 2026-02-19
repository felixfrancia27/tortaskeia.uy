import { Component, inject, signal, OnInit, OnDestroy, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductsService, Product } from '@app/core/services/products.service';
import { CartService } from '@app/core/services/cart.service';
import { SeoService } from '@app/core/services/seo.service';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, CurrencyPipe],
  template: `
    <section class="product-page">
      @if (loading()) {
        <div class="container">
          <div class="loading-state">
            <div class="spinner-large"></div>
            <p>Cargando producto...</p>
          </div>
        </div>
      } @else if (!product()) {
        <div class="container">
          <div class="not-found">
            <h1>Producto no encontrado</h1>
            <p>El producto que buscás no existe o fue eliminado.</p>
            <a routerLink="/tienda" class="btn-primary">Ver todos los productos</a>
          </div>
        </div>
      } @else {
        <!-- Breadcrumb -->
        <div class="breadcrumb-bar">
          <div class="container">
            <nav class="breadcrumb">
              <a routerLink="/">Inicio</a>
              <span>/</span>
              <a routerLink="/tienda">Tienda</a>
              <span>/</span>
              <span class="current">{{ product()!.name }}</span>
            </nav>
          </div>
        </div>

        <div class="container">
          <div class="product-layout">
            <!-- Gallery -->
            <div class="product-gallery">
              <div class="main-image">
                <img
                  [src]="selectedImage()"
                  [alt]="product()!.name"
                  loading="eager"
                  fetchpriority="high"
                />
                @if (product()!.compare_price) {
                  <span class="badge-sale">Oferta</span>
                }
              </div>
              @if (product()!.images.length > 1) {
                <div class="thumbnails">
                  @for (image of product()!.images; track image.id) {
                    <button 
                      class="thumbnail"
                      [class.active]="selectedImage() === image.url"
                      (click)="selectImage(image.url)"
                    >
                      <img [src]="image.url" [alt]="image.alt_text || product()!.name" />
                    </button>
                  }
                </div>
              }
            </div>

            <!-- Details -->
            <div class="product-details">
              <h1 class="product-title">{{ product()!.name }}</h1>
              
              <div class="product-price">
                @if (product()!.compare_price) {
                  <span class="price-old">{{ product()!.compare_price | currency:'UYU':'$':'1.0-0' }}</span>
                }
                <span class="price-current">{{ product()!.price | currency:'UYU':'$':'1.0-0' }}</span>
              </div>

              @if (product()!.short_description) {
                <p class="product-short-desc">{{ product()!.short_description }}</p>
              }

              <!-- Stock Status -->
              <div class="stock-status" [class.out-of-stock]="product()!.stock <= 0">
                @if (product()!.stock > 0) {
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  <span>En stock - Disponible</span>
                } @else {
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                  <span>Agotado - Consultá disponibilidad</span>
                }
              </div>

              <!-- Quantity & Add to Cart -->
              <div class="add-to-cart">
                <div class="quantity-selector">
                  <button (click)="decrementQuantity()" [disabled]="quantity() <= 1">−</button>
                  <input 
                    type="number" 
                    [ngModel]="quantity()"
                    (ngModelChange)="setQuantity($event)"
                    min="1"
                    max="10"
                  />
                  <button (click)="incrementQuantity()" [disabled]="quantity() >= 10">+</button>
                </div>
                <button 
                  class="btn-add-cart"
                  (click)="addToCart()"
                  [disabled]="product()!.stock <= 0"
                >
                  @if (addedToCart()) {
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    ¡Agregado!
                  } @else {
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="m1 1 4 4 2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
                    Agregar al Carrito
                  }
                </button>
              </div>

              <!-- Notes -->
              <div class="product-notes">
                <label for="notes">Notas especiales (opcional)</label>
                <textarea 
                  id="notes" 
                  [ngModel]="notes()"
                  (ngModelChange)="notes.set($event)"
                  placeholder="Ej: Sin gluten, mensaje personalizado, etc."
                  rows="3"
                ></textarea>
              </div>

              <!-- WhatsApp -->
              <a 
                [href]="whatsappUrl()" 
                target="_blank" 
                rel="noopener" 
                class="btn-whatsapp"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Consultá por WhatsApp
              </a>

              <!-- Description -->
              @if (product()!.description) {
                <div class="product-description">
                  <h2>Descripción</h2>
                  <div class="description-content" [innerHTML]="product()!.description"></div>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </section>
  `,
  styles: [`
    .product-page {
      padding-bottom: var(--space-16);
    }

    .breadcrumb-bar {
      background-color: var(--surface);
      padding: var(--space-4) 0;
      margin-bottom: var(--space-8);
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--space-2);
      font-size: var(--text-sm);
      color: var(--ink-light);

      a {
        color: var(--ink-light);

        &:hover {
          color: var(--brand);
        }
      }

      .current {
        color: var(--ink);
        font-weight: 500;
      }
    }

    .loading-state,
    .not-found {
      text-align: center;
      padding: var(--space-16) var(--space-4);
      min-height: 50vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      h1 {
        margin-bottom: var(--space-4);
      }

      p {
        color: var(--ink-light);
        margin-bottom: var(--space-6);
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

    .btn-primary {
      display: inline-block;
      padding: var(--space-3) var(--space-6);
      background-color: var(--brand);
      color: white;
      border-radius: var(--radius-md);
      font-weight: 600;
      text-decoration: none;

      &:hover {
        background-color: var(--brand-dark);
        color: white;
      }
    }

    .product-layout {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--space-8);

      @media (min-width: 768px) {
        grid-template-columns: 1fr 1fr;
        gap: var(--space-12);
      }
    }

    .product-gallery {
      .main-image {
        position: relative;
        aspect-ratio: 1;
        border-radius: var(--radius-xl);
        overflow: hidden;
        background-color: var(--surface);
        margin-bottom: var(--space-4);

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .badge-sale {
          position: absolute;
          top: 16px;
          left: 16px;
          padding: var(--space-2) var(--space-3);
          background-color: var(--brand);
          color: white;
          font-size: var(--text-sm);
          font-weight: 600;
          border-radius: var(--radius-md);
        }
      }

      .thumbnails {
        display: flex;
        gap: var(--space-3);
        overflow-x: auto;
        padding-bottom: var(--space-2);
      }

      .thumbnail {
        width: 70px;
        height: 70px;
        flex-shrink: 0;
        border-radius: var(--radius-md);
        overflow: hidden;
        border: 2px solid transparent;
        cursor: pointer;
        padding: 0;
        background: none;

        &.active {
          border-color: var(--brand);
        }

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }

    .product-details {
      .product-title {
        font-family: var(--font-display);
        font-size: var(--text-2xl);
        color: var(--ink);
        margin-bottom: var(--space-4);

        @media (min-width: 768px) {
          font-size: var(--text-3xl);
        }
      }

      .product-price {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        margin-bottom: var(--space-4);

        .price-old {
          font-size: var(--text-lg);
          color: var(--ink-muted);
          text-decoration: line-through;
        }

        .price-current {
          font-size: var(--text-2xl);
          font-weight: 700;
          color: var(--brand);

          @media (min-width: 768px) {
            font-size: var(--text-3xl);
          }
        }
      }

      .product-short-desc {
        color: var(--ink-light);
        font-size: var(--text-base);
        line-height: 1.6;
        margin-bottom: var(--space-4);
      }

      .stock-status {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        padding: var(--space-3);
        background-color: #D1FAE5;
        color: #065F46;
        border-radius: var(--radius-md);
        font-size: var(--text-sm);
        font-weight: 500;
        margin-bottom: var(--space-6);

        &.out-of-stock {
          background-color: #FEE2E2;
          color: #991B1B;
        }
      }

      .add-to-cart {
        display: flex;
        gap: var(--space-3);
        margin-bottom: var(--space-4);
      }

      .quantity-selector {
        display: flex;
        align-items: center;
        border: 1px solid #E0D5C8;
        border-radius: var(--radius-md);
        overflow: hidden;

        button {
          width: 40px;
          height: 44px;
          background: var(--surface);
          border: none;
          font-size: var(--text-lg);
          cursor: pointer;
          transition: background-color var(--transition-fast);

          &:hover:not(:disabled) {
            background-color: #E0D5C8;
          }

          &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        }

        input {
          width: 50px;
          height: 44px;
          text-align: center;
          border: none;
          font-size: var(--text-base);
          font-weight: 500;

          &::-webkit-inner-spin-button,
          &::-webkit-outer-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
        }
      }

      .btn-add-cart {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-2);
        padding: var(--space-3) var(--space-6);
        min-height: 44px;
        background-color: var(--brand);
        color: white;
        border: none;
        border-radius: var(--radius-md);
        font-size: var(--text-base);
        font-weight: 600;
        cursor: pointer;
        transition: all var(--transition-fast);
        -webkit-tap-highlight-color: transparent;

        &:hover:not(:disabled) {
          background-color: var(--brand-dark);
        }

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }

      .product-notes {
        margin-bottom: var(--space-4);

        label {
          display: block;
          font-size: var(--text-sm);
          font-weight: 500;
          color: var(--ink);
          margin-bottom: var(--space-2);
        }

        textarea {
          width: 100%;
          padding: var(--space-3);
          border: 1px solid #E0D5C8;
          border-radius: var(--radius-md);
          font-size: var(--text-sm);
          resize: vertical;

          &:focus {
            outline: none;
            border-color: var(--brand);
          }
        }
      }

      .btn-whatsapp {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-2);
        width: 100%;
        padding: var(--space-3);
        min-height: 44px;
        background-color: var(--whatsapp);
        color: white;
        border-radius: var(--radius-md);
        font-weight: 600;
        margin-bottom: var(--space-6);
        transition: opacity var(--transition-fast);
        -webkit-tap-highlight-color: transparent;

        &:hover {
          opacity: 0.9;
          color: white;
        }
      }

      .product-description {
        padding-top: var(--space-6);
        border-top: 1px solid #E0D5C8;

        h2 {
          font-size: var(--text-lg);
          margin-bottom: var(--space-4);
        }

        .description-content {
          color: var(--ink-light);
          line-height: 1.7;

          p {
            margin-bottom: var(--space-3);
          }
        }
      }
    }
  `],
})
export class ProductComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productsService = inject(ProductsService);
  private cartService = inject(CartService);
  private seo = inject(SeoService);

  product = signal<Product | null>(null);
  loading = signal(true);
  selectedImage = signal('');
  quantity = signal(1);
  notes = signal('');
  addedToCart = signal(false);

  whatsappUrl = computed(() => {
    const p = this.product();
    if (!p) return '';
    const text = encodeURIComponent(`Hola! Me interesa el producto: ${p.name} ($${p.price})`);
    return `https://wa.me/59899123456?text=${text}`;
  });

  ngOnInit() {
    this.route.params.subscribe(params => {
      const slug = params['slug'];
      if (slug) {
        this.loadProduct(slug);
      }
    });
  }

  loadProduct(slug: string) {
    this.loading.set(true);
    
    this.productsService.getProduct(slug).subscribe({
      next: (product) => {
        this.product.set(product);
        this.selectedImage.set(product.main_image || product.images[0]?.url || '');
        this.updateMeta(product);
        this.loading.set(false);
      },
      error: () => {
        // Try mock data
        this.loadMockProduct(slug);
      },
    });
  }

  loadMockProduct(slug: string) {
    const mockProducts: Record<string, Product> = {
      'torta-chocolate': {
        id: 1,
        name: 'Torta de Chocolate',
        slug: 'torta-chocolate',
        price: 1200,
        stock: 10,
        is_featured: true,
        images: [
          { id: 1, url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600', is_main: true },
        ],
        main_image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600',
        short_description: 'Deliciosa torta de chocolate con ganache',
        description: '<p>Nuestra clásica torta de chocolate, elaborada con cacao premium y cubierta con una suave ganache de chocolate negro. Ideal para los amantes del chocolate.</p><p>Perfecta para cumpleaños, aniversarios o cualquier celebración especial.</p>',
      },
      'torta-vainilla-frutos-rojos': {
        id: 2,
        name: 'Torta de Vainilla con Frutos Rojos',
        slug: 'torta-vainilla-frutos-rojos',
        price: 1350,
        stock: 8,
        is_featured: true,
        images: [
          { id: 2, url: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600', is_main: true },
        ],
        main_image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600',
        short_description: 'Suave vainilla con crema y frutos rojos frescos',
        description: '<p>Bizcochuelo de vainilla esponjoso, relleno de crema diplomática y coronado con fresas, arándanos y frambuesas frescas.</p>',
      },
    };

    const product = mockProducts[slug];
    if (product) {
      this.product.set(product);
      this.selectedImage.set(product.main_image || '');
      this.updateMeta(product);
    }
    this.loading.set(false);
  }

  updateMeta(product: Product) {
    // Update meta tags
    this.seo.updateMeta({
      title: product.name,
      description: product.short_description || product.meta_description || `${product.name} - Repostería artesanal Tortaskeia`,
      image: product.main_image,
      url: `https://tortaskeia.uy/tortas/${product.slug}`,
      type: 'product',
      price: product.price,
      currency: 'UYU',
      availability: product.stock > 0 ? 'InStock' : 'OutOfStock',
      brand: 'Tortaskeia',
      category: 'Tortas',
    });

    // Add Product JSON-LD schema
    this.seo.addProductSchema({
      name: product.name,
      description: product.short_description || product.description || '',
      image: product.main_image || '',
      price: product.price,
      currency: 'UYU',
      availability: product.stock > 0 ? 'InStock' : 'OutOfStock',
      sku: product.slug,
      brand: 'Tortaskeia',
      category: 'Tortas',
      url: `https://tortaskeia.uy/tortas/${product.slug}`,
    });

    // Add Breadcrumb JSON-LD schema
    this.seo.addBreadcrumbSchema([
      { name: 'Inicio', url: '/' },
      { name: 'Tienda', url: '/tienda' },
      { name: product.name, url: `/tortas/${product.slug}` },
    ]);
  }

  ngOnDestroy() {
    // Clean up JSON-LD when leaving the page
    this.seo.removeJsonLd('product-schema');
    this.seo.removeJsonLd('breadcrumb-schema');
  }

  selectImage(url: string) {
    this.selectedImage.set(url);
  }

  incrementQuantity() {
    if (this.quantity() < 10) {
      this.quantity.update(q => q + 1);
    }
  }

  decrementQuantity() {
    if (this.quantity() > 1) {
      this.quantity.update(q => q - 1);
    }
  }

  setQuantity(value: number) {
    if (value >= 1 && value <= 10) {
      this.quantity.set(value);
    }
  }

  addToCart() {
    const p = this.product();
    if (!p) return;

    this.cartService.addItem(
      {
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        main_image: p.main_image,
      },
      this.quantity(),
      this.notes() || undefined
    ).subscribe({
      next: () => {
        this.addedToCart.set(true);
        setTimeout(() => this.addedToCart.set(false), 2000);
      },
      error: () => {
        // El servicio ya hace fetchCartFromApi en error; opcional: mostrar mensaje
      },
    });
  }
}
