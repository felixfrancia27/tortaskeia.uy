import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrdersService, Order } from '@app/core/services/orders.service';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe, DatePipe],
  template: `
    <section class="orders-page">
      <div class="container">
        <header class="page-header">
          <h1>Mis Pedidos</h1>
          <p>Historial de todos tus pedidos</p>
        </header>

        @if (loading()) {
          <div class="loading">
            <div class="spinner"></div>
            <p>Cargando pedidos...</p>
          </div>
        } @else if (orders().length === 0) {
          <div class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
              <path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            <h2>No tenés pedidos todavía</h2>
            <p>Cuando hagas tu primer pedido, aparecerá acá.</p>
            <a routerLink="/tienda" class="btn-primary">Ver Productos</a>
          </div>
        } @else {
          <div class="orders-list">
            @for (order of orders(); track order.id) {
              <div class="order-card">
                <div class="order-header">
                  <div class="order-info">
                    <span class="order-number">{{ order.order_number }}</span>
                    <span class="order-date">{{ order.created_at | date:'dd/MM/yyyy HH:mm' }}</span>
                  </div>
                  <span class="status-badge" [style.background-color]="ordersService.getStatusColor(order.status)">
                    {{ ordersService.getStatusLabel(order.status) }}
                  </span>
                </div>

                <div class="order-items">
                  @for (item of order.items.slice(0, 3); track item.id) {
                    <div class="order-item">
                      @if (item.product_image) {
                        <img [src]="item.product_image" [alt]="item.product_name" />
                      }
                      <span class="item-name">{{ item.quantity }}x {{ item.product_name }}</span>
                    </div>
                  }
                  @if (order.items.length > 3) {
                    <span class="more-items">+{{ order.items.length - 3 }} más</span>
                  }
                </div>

                <div class="order-footer">
                  <div class="order-total">
                    <span class="delivery-type">{{ order.delivery_type === 'delivery' ? 'Delivery' : 'Retiro' }}</span>
                    <strong>{{ order.total | currency:'UYU':'$':'1.0-0' }}</strong>
                  </div>
                  <a [routerLink]="['/checkout/success']" [queryParams]="{order: order.order_number}" class="btn-details">
                    Ver Detalles →
                  </a>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </section>
  `,
  styles: [`
    .orders-page {
      padding: var(--space-24) 0 var(--space-16);
      background-color: var(--surface);
      min-height: 70vh;
    }

    .page-header {
      margin-bottom: var(--space-8);

      h1 {
        font-family: var(--font-display);
        font-size: var(--text-2xl);
        margin-bottom: var(--space-2);

        @media (min-width: 768px) {
          font-size: var(--text-3xl);
        }
      }

      p {
        color: var(--ink-light);
      }
    }

    .loading {
      text-align: center;
      padding: var(--space-16);

      .spinner {
        width: 40px;
        height: 40px;
        border: 3px solid white;
        border-top-color: var(--brand);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        margin: 0 auto var(--space-4);
      }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .empty-state {
      text-align: center;
      padding: var(--space-16);
      background: white;
      border-radius: var(--radius-xl);

      svg {
        color: var(--ink-muted);
        margin-bottom: var(--space-4);
      }

      h2 {
        font-size: var(--text-xl);
        margin-bottom: var(--space-2);
      }

      p {
        color: var(--ink-light);
        margin-bottom: var(--space-6);
      }

      .btn-primary {
        display: inline-block;
        padding: var(--space-3) var(--space-6);
        background-color: var(--brand);
        color: white;
        border-radius: var(--radius-md);
        font-weight: 600;

        &:hover {
          background-color: var(--brand-dark);
          color: white;
        }
      }
    }

    .orders-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
      max-width: 800px;
    }

    .order-card {
      background: white;
      border-radius: var(--radius-xl);
      overflow: hidden;
    }

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-4);
      background: var(--surface);
      border-bottom: 1px solid #E0D5C8;
    }

    .order-info {
      .order-number {
        display: block;
        font-weight: 600;
        color: var(--ink);
      }

      .order-date {
        font-size: var(--text-xs);
        color: var(--ink-muted);
      }
    }

    .status-badge {
      padding: var(--space-1) var(--space-3);
      border-radius: var(--radius-full);
      color: white;
      font-size: var(--text-xs);
      font-weight: 600;
    }

    .order-items {
      padding: var(--space-4);
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-3);
      align-items: center;
    }

    .order-item {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-2) var(--space-3);
      background: var(--surface);
      border-radius: var(--radius-md);
      font-size: var(--text-sm);

      img {
        width: 32px;
        height: 32px;
        border-radius: var(--radius-sm);
        object-fit: cover;
      }
    }

    .more-items {
      font-size: var(--text-sm);
      color: var(--ink-muted);
    }

    .order-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-4);
      border-top: 1px solid #E0D5C8;
    }

    .order-total {
      .delivery-type {
        display: block;
        font-size: var(--text-xs);
        color: var(--ink-muted);
      }

      strong {
        font-size: var(--text-lg);
        color: var(--brand);
      }
    }

    .btn-details {
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--brand);

      &:hover {
        text-decoration: underline;
      }
    }
  `],
})
export class MyOrdersComponent implements OnInit {
  ordersService = inject(OrdersService);

  orders = signal<Order[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.ordersService.getMyOrders().subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}
