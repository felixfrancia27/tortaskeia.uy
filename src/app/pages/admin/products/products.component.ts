import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminLayoutComponent } from '../admin-layout/admin-layout.component';
import { ApiService } from '@app/core/services/api.service';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  stock: number;
  is_active: boolean;
  is_featured: boolean;
  main_image?: string;
  category?: { name: string };
}

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, RouterLink, AdminLayoutComponent, CurrencyPipe],
  template: `
    <app-admin-layout>
      <div class="products-page">
        <header class="page-header">
          <div>
            <h1>Productos</h1>
            <p>Gestiona el catálogo de productos</p>
          </div>
          <a routerLink="/admin/productos/nuevo" class="btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14"/><path d="M12 5v14"/>
            </svg>
            Nuevo Producto
          </a>
        </header>

        @if (loading()) {
          <div class="loading">Cargando productos...</div>
        } @else {
          <div class="products-table-container">
            <table class="products-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (product of products(); track product.id) {
                  <tr>
                    <td>
                      <div class="product-cell">
                        <img 
                          [src]="product.main_image || 'assets/images/placeholder.jpg'" 
                          [alt]="product.name"
                        />
                        <div>
                          <span class="product-name">{{ product.name }}</span>
                          @if (product.is_featured) {
                            <span class="badge featured">Destacado</span>
                          }
                        </div>
                      </div>
                    </td>
                    <td>{{ product.price | currency:'UYU':'$':'1.0-0' }}</td>
                    <td>
                      <span [class.low-stock]="product.stock < 5">{{ product.stock }}</span>
                    </td>
                    <td>
                      <span class="badge" [class.active]="product.is_active" [class.inactive]="!product.is_active">
                        {{ product.is_active ? 'Activo' : 'Inactivo' }}
                      </span>
                    </td>
                    <td>
                      <div class="actions">
                        <a [routerLink]="['/admin/productos', product.id]" class="action-btn edit" title="Editar">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                          </svg>
                        </a>
                        <button class="action-btn delete" title="Eliminar" (click)="deleteProduct(product)">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="5" class="empty-state">
                      No hay productos. <a routerLink="/admin/productos/nuevo">Crear el primero</a>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </app-admin-layout>
  `,
  styles: [`
    .products-page {
      max-width: 1200px;
    }

    .page-header {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: var(--space-4);
      margin-bottom: var(--space-6);

      h1 {
        font-family: var(--font-display);
        font-size: var(--text-2xl);
        color: var(--ink);
        margin-bottom: var(--space-1);
      }

      p {
        color: var(--ink-light);
        font-size: var(--text-sm);
      }
    }

    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-3) var(--space-5);
      min-height: 44px;
      background-color: var(--brand);
      color: white;
      border-radius: var(--radius-md);
      font-weight: 600;
      font-size: var(--text-sm);
      text-decoration: none;

      &:hover {
        background-color: var(--brand-dark);
        color: white;
      }
    }

    .loading {
      text-align: center;
      padding: var(--space-8);
      color: var(--ink-light);
    }

    .products-table-container {
      background: white;
      border-radius: var(--radius-xl);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }

    .products-table {
      width: 100%;
      min-width: 480px;
      border-collapse: collapse;

      th, td {
        padding: var(--space-4);
        text-align: left;
        border-bottom: 1px solid #E5E7EB;
      }

      @media (max-width: 768px) {
        th, td {
          padding: var(--space-2) var(--space-3);
          font-size: var(--text-sm);
        }
      }

      th {
        background-color: #F9FAFB;
        font-size: var(--text-sm);
        font-weight: 600;
        color: var(--ink-light);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      tbody tr:hover {
        background-color: #F9FAFB;
      }
    }

    .product-cell {
      display: flex;
      align-items: center;
      gap: var(--space-3);

      img {
        width: 48px;
        height: 48px;
        border-radius: var(--radius-md);
        object-fit: cover;
      }

      .product-name {
        font-weight: 500;
        color: var(--ink);
        display: block;
      }
    }

    .badge {
      display: inline-block;
      padding: var(--space-1) var(--space-2);
      border-radius: var(--radius-sm);
      font-size: var(--text-xs);
      font-weight: 500;

      &.active {
        background-color: #D1FAE5;
        color: #065F46;
      }

      &.inactive {
        background-color: #FEE2E2;
        color: #991B1B;
      }

      &.featured {
        background-color: #FEF3C7;
        color: #92400E;
        margin-left: var(--space-2);
      }
    }

    .low-stock {
      color: #DC2626;
      font-weight: 600;
    }

    .actions {
      display: flex;
      gap: var(--space-2);
    }

    .action-btn {
      width: 44px;
      height: 44px;
      min-width: 44px;
      min-height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-md);
      border: none;
      cursor: pointer;
      transition: all var(--transition-fast);
      -webkit-tap-highlight-color: transparent;

      &.edit {
        background-color: #DBEAFE;
        color: #2563EB;

        &:hover {
          background-color: #BFDBFE;
        }
      }

      &.delete {
        background-color: #FEE2E2;
        color: #DC2626;

        &:hover {
          background-color: #FECACA;
        }
      }
    }

    .empty-state {
      text-align: center;
      color: var(--ink-light);
      padding: var(--space-8) !important;

      a {
        color: var(--brand);
        font-weight: 500;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  `],
})
export class AdminProductsComponent implements OnInit {
  private api = inject(ApiService);

  products = signal<Product[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading.set(true);
    
    this.api.get<Product[]>('/admin/products').subscribe({
      next: (products) => {
        this.products.set(products);
        this.loading.set(false);
      },
      error: () => {
        // Load mock data
        this.products.set([
          { id: 1, name: 'Torta de Chocolate', slug: 'torta-chocolate', price: 1200, stock: 10, is_active: true, is_featured: true, main_image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=100' },
          { id: 2, name: 'Torta de Vainilla', slug: 'torta-vainilla', price: 1350, stock: 8, is_active: true, is_featured: true, main_image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=100' },
          { id: 3, name: 'Torta Red Velvet', slug: 'torta-red-velvet', price: 1400, stock: 2, is_active: true, is_featured: false, main_image: 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?w=100' },
          { id: 4, name: 'Box Dulce Sorpresa', slug: 'box-dulce-sorpresa', price: 950, stock: 15, is_active: true, is_featured: true, main_image: 'https://images.unsplash.com/photo-1558326567-98ae2405596b?w=100' },
        ]);
        this.loading.set(false);
      },
    });
  }

  deleteProduct(product: Product) {
    if (confirm(`¿Estás seguro de eliminar "${product.name}"?`)) {
      this.api.delete(`/admin/products/${product.id}`).subscribe({
        next: () => {
          this.products.update(list => list.filter(p => p.id !== product.id));
        },
        error: () => {
          alert('Error al eliminar el producto');
        },
      });
    }
  }
}
